import html as htmlmod
import ipaddress
import json
import re
import socket
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


def _validate(url: str) -> str:
    p = urlparse(url)
    if p.scheme not in ("http", "https") or not p.hostname:
        raise HTTPException(status_code=400, detail="Only http(s) URLs are allowed")
    try:
        infos = socket.getaddrinfo(p.hostname, None)
    except socket.gaierror:
        raise HTTPException(status_code=400, detail="Host not found")
    for info in infos:
        ip = ipaddress.ip_address(info[4][0])
        if ip.is_private or ip.is_loopback or ip.is_link_local or ip.is_reserved or ip.is_multicast:
            raise HTTPException(status_code=400, detail="Blocked host")
    return url


async def _fetch(client: httpx.AsyncClient, url: str, stream: bool = False):
    # Follow redirects manually so every hop is validated against private hosts
    for _ in range(MAX_REDIRECTS + 1):
        _validate(url)
        req = client.build_request("GET", url)
        r = await client.send(req, stream=stream)
        if r.is_redirect and r.headers.get("location"):
            url = urljoin(str(r.url), r.headers["location"])
            await r.aclose()
            continue
        return r
    raise HTTPException(status_code=508, detail="Too many redirects")


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
async def check(url: str):
    _validate(url)
    try:
        async with httpx.AsyncClient(timeout=10, headers={"User-Agent": UA}) as c:
            r = await _fetch(c, url, stream=True)
            await r.aclose()
            return {"embeddable": not _blocks_framing(r.headers), "status": r.status_code, "final_url": str(r.url)}
    except httpx.HTTPError:
        return {"embeddable": False, "status": 0, "final_url": url}


@router.get("")
async def proxy(url: str, request: Request):
    _validate(url)
    try:
        async with httpx.AsyncClient(timeout=20, headers={"User-Agent": UA, "Accept-Language": "en-US,en;q=0.9"}) as c:
            r = await _fetch(c, url)
    except httpx.HTTPError as e:
        raise HTTPException(status_code=502, detail=f"Could not load page: {type(e).__name__}")
    body = r.content[:MAX_BYTES]
    headers = {k: v for k, v in r.headers.items() if k.lower() not in DROP_HEADERS}
    headers["content-security-policy"] = SANDBOX_CSP
    ctype = r.headers.get("content-type", "")
    if "text/html" in ctype:
        html = body.decode(r.encoding or "utf-8", errors="replace")
        body = _inject(html, str(r.url), _proxy_prefix(request)).encode("utf-8")
        headers["content-type"] = "text/html; charset=utf-8"
    return Response(content=body, status_code=r.status_code, headers=headers)

