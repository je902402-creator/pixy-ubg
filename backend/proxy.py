import html as htmlmod
import ipaddress
import json
import re
import socket
import time
from collections import defaultdict, deque
from urllib.parse import urlparse, urljoin

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import Response

router = APIRouter(prefix="/proxy")

UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36"
MAX_BYTES = 15 * 1024 * 1024
DROP_HEADERS = {
    "x-frame-options", "content-security-policy", "content-security-policy-report-only",
    "content-encoding", "content-length", "transfer-encoding", "set-cookie", "connection",
    "strict-transport-security", "cross-origin-opener-policy", "cross-origin-embedder-policy",
    "cross-origin-resource-policy", "keep-alive", "location",
}
SANDBOX_CSP = "sandbox allow-scripts allow-forms allow-popups allow-pointer-lock allow-modals allow-presentation"
MAX_REDIRECTS = 8
RATE_LIMIT = 90
RATE_WINDOW = 60


def _validate(url: str) -> str:
    """Return one public IP for the URL host; reject non-http(s) and private targets."""
    p = urlparse(url)
    if p.scheme not in ("http", "https") or not p.hostname:
        raise HTTPException(status_code=400, detail="Only http(s) URLs are allowed")
    try:
        infos = socket.getaddrinfo(p.hostname, p.port or (443 if p.scheme == "https" else 80), proto=socket.IPPROTO_TCP)
    except (socket.gaierror, UnicodeError):
        raise HTTPException(status_code=400, detail="Host not found")
    ips = []
    for info in infos:
        ip = ipaddress.ip_address(info[4][0].split("%")[0])
        if not ip.is_global or ip.is_multicast:
            raise HTTPException(status_code=400, detail="Blocked host")
        ips.append(str(ip))
    if not ips:
        raise HTTPException(status_code=400, detail="Host not found")
    return ips[0]


def _pinned_request(client: httpx.AsyncClient, url: str, ip: str) -> httpx.Request:
    # Connect to the validated IP (prevents DNS rebinding) while keeping Host header + TLS SNI/cert check on the hostname
    p = urlparse(url)
    ip_host = f"[{ip}]" if ":" in ip else ip
    netloc = ip_host + (f":{p.port}" if p.port else "")
    host_header = p.hostname + (f":{p.port}" if p.port else "")
    target = p._replace(netloc=netloc).geturl()
    ext = {"sni_hostname": p.hostname} if p.scheme == "https" else {}
    return client.build_request("GET", target, headers={"Host": host_header}, extensions=ext)


async def _fetch(client: httpx.AsyncClient, url: str):
    """Follow redirects manually; every hop is validated and IP-pinned. Returns (streamed response, logical url)."""
    for _ in range(MAX_REDIRECTS + 1):
        ip = _validate(url)
        r = await client.send(_pinned_request(client, url, ip), stream=True)
        if r.is_redirect and r.headers.get("location"):
            await r.aclose()
            url = urljoin(url, r.headers["location"])
            continue
        return r, url
    raise HTTPException(status_code=508, detail="Too many redirects")


async def _read_capped(r: httpx.Response) -> bytes:
    chunks, size = [], 0
    async for chunk in r.aiter_bytes():
        size += len(chunk)
        if size > MAX_BYTES:
            raise HTTPException(status_code=413, detail="Page too large to proxy")
        chunks.append(chunk)
    return b"".join(chunks)


_hits = defaultdict(deque)


def _rate_limit(request: Request):
    ip = (request.headers.get("x-forwarded-for") or (request.client.host if request.client else "?")).split(",")[0].strip()
    now = time.monotonic()
    q = _hits[ip]
    while q and now - q[0] > RATE_WINDOW:
        q.popleft()
    if len(q) >= RATE_LIMIT:
        raise HTTPException(status_code=429, detail="Too many proxy requests, slow down")
    q.append(now)
    if len(_hits) > 10000:
        _hits.clear()


def _proxy_prefix(request: Request) -> str:
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    proto = (request.headers.get("x-forwarded-proto") or "https").split(",")[0]
    return f"{proto}://{host}/api/proxy?url="


def _blocks_framing(headers) -> bool:
    if headers.get("x-frame-options"):
        return True
    csp = headers.get("content-security-policy", "")
    m = re.search(r"frame-ancestors([^;]*)", csp, re.I)
    return bool(m and "*" not in m.group(1))


def _inject(html: str, final_url: str, prefix: str) -> str:
    js_url = json.dumps(final_url).replace("</", "<\\/")
    snippet = f"""<base href="{htmlmod.escape(final_url, quote=True)}"><script>(function(){{var P={json.dumps(prefix)},C={js_url};
try{{parent.postMessage({{pixyNav:C}},'*')}}catch(e){{}}
function go(u){{location.href=P+encodeURIComponent(u)}}
document.addEventListener('click',function(e){{var a=e.target.closest&&e.target.closest('a[href]');if(!a||a.target==='_blank')return;var h=a.getAttribute('href');if(!h||h[0]==='#'||/^(javascript|mailto|tel):/i.test(h))return;var u=new URL(h,document.baseURI).href;if(!/^https?:/.test(u))return;e.preventDefault();go(u)}},true);
document.addEventListener('submit',function(e){{var f=e.target;if((f.method||'get').toLowerCase()!=='get')return;e.preventDefault();var u=new URL(f.getAttribute('action')||C,document.baseURI);new FormData(f).forEach(function(v,k){{u.searchParams.set(k,v)}});go(u.href)}},true);
}})();</script>"""
    m = re.search(r"<head[^>]*>", html, re.I)
    if m:
        return html[: m.end()] + snippet + html[m.end():]
    return snippet + html


@router.get("/check")
async def check(url: str, request: Request):
    _rate_limit(request)
    _validate(url)
    try:
        async with httpx.AsyncClient(timeout=10, headers={"User-Agent": UA}) as c:
            r, final = await _fetch(c, url)
            await r.aclose()
            return {"embeddable": not _blocks_framing(r.headers), "status": r.status_code, "final_url": final}
    except httpx.HTTPError:
        return {"embeddable": False, "status": 0, "final_url": url}


@router.get("")
async def proxy(url: str, request: Request):
    _rate_limit(request)
    _validate(url)
    try:
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9", "Accept-Encoding": "identity"}) as c:
            r, final = await _fetch(c, url)
            try:
                body = await _read_capped(r)
            finally:
                await r.aclose()
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Could not load page: {type(e).__name__}")
    headers = {k: v for k, v in r.headers.items() if k.lower() not in DROP_HEADERS}
    headers["content-security-policy"] = SANDBOX_CSP
    ctype = r.headers.get("content-type", "")
    if "text/html" in ctype:
        html = body.decode(r.encoding or "utf-8", errors="replace")
        body = _inject(html, final, _proxy_prefix(request)).encode("utf-8")
        headers["content-type"] = "text/html; charset=utf-8"
    return Response(content=body, status_code=r.status_code, headers=headers)
