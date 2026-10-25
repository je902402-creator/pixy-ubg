# Security audit fix verification: SEC-001 (SSRF DNS rebinding / IP pinning), SEC-002 (body cap + rate limit),
# SEC-003 (state payload bounds), CORS credentials
import os
import sys
import uuid
import socket
import asyncio
import pytest
import requests
import httpx
from fastapi import HTTPException

sys.path.insert(0, "/app/backend")
import proxy  # noqa: E402

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')


def xff():
    return {"X-Forwarded-For": f"10.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}.{uuid.uuid4().int % 250}"}


@pytest.fixture
def s():
    return requests.Session()


# ---------- SEC-001 live ----------
class TestSSRFLive:
    def test_example_base_is_hostname(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "https://example.com"}, headers=xff(), timeout=30)
        assert r.status_code == 200
        assert '<base href="https://example.com">' in r.text
        assert "Example Domain" in r.text

    def test_httpbin_host_header(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "https://httpbin.org/headers"}, headers=xff(), timeout=30)
        assert r.status_code == 200
        assert r.json()["headers"]["Host"] == "httpbin.org"

    @pytest.mark.parametrize("u", ["https://cineosweb.github.io/", "https://genizymath.github.io/"])
    def test_tls_sites(self, s, u):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": u}, headers=xff(), timeout=30)
        assert r.status_code == 200
        assert "<base href=" in r.text

    def test_redirect_followed(self, s):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": "http://github.com"}, headers=xff(), timeout=30)
        assert r.status_code == 200
        assert r.json()["final_url"] == "https://github.com/"

    @pytest.mark.parametrize("target", ["http://127.0.0.1:8001/api/", "http://169.254.169.254/latest/meta-data/"])
    def test_redirect_to_internal_blocked(self, s, target):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": f"https://httpbin.org/redirect-to?url={target}"},
                  headers=xff(), timeout=30)
        assert r.status_code == 400
        assert r.json()["detail"] == "Blocked host"

    @pytest.mark.parametrize("u", ["http://localtest.me:8001/api/", "http://[::1]:8001/", "http://0.0.0.0:8001/",
                                   "http://2130706433:8001/", "http://[::ffff:127.0.0.1]:8001/"])
    def test_loopback_variants_blocked(self, s, u):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": u}, headers=xff(), timeout=30)
        assert r.status_code == 400, r.text


# ---------- SEC-001 unit ----------
class TestSSRFUnit:
    def test_validate_private_mocked(self, monkeypatch):
        monkeypatch.setattr(socket, "getaddrinfo", lambda *a, **k: [(2, 1, 6, "", ("10.0.0.5", 80))])
        with pytest.raises(HTTPException) as e:
            proxy._validate("http://evil.example")
        assert e.value.status_code == 400

    def test_validate_mixed_public_private(self, monkeypatch):
        monkeypatch.setattr(socket, "getaddrinfo", lambda *a, **k: [(2, 1, 6, "", ("93.184.216.34", 80)),
                                                                     (2, 1, 6, "", ("127.0.0.1", 80))])
        with pytest.raises(HTTPException):
            proxy._validate("http://evil.example")

    def test_validate_returns_public_ip(self, monkeypatch):
        monkeypatch.setattr(socket, "getaddrinfo", lambda *a, **k: [(2, 1, 6, "", ("93.184.216.34", 443))])
        assert proxy._validate("https://x.example") == "93.184.216.34"

    def test_pinned_request_shape(self):
        c = httpx.AsyncClient()
        req = proxy._pinned_request(c, "https://example.com:8443/a?b=1", "93.184.216.34")
        assert req.url.host == "93.184.216.34" and req.url.port == 8443
        assert req.headers["host"] == "example.com:8443"
        assert req.extensions["sni_hostname"] == "example.com"
        req6 = proxy._pinned_request(c, "http://example.com/", "2606:2800::1")
        assert req6.url.host == "2606:2800::1" and "sni_hostname" not in req6.extensions

    def test_rebinding_pinned_connect(self, monkeypatch):
        """After validation, the request must go to validated IP, not re-resolved one."""
        calls = []

        def fake_gai(host, *a, **k):
            calls.append(host)
            return [(2, 1, 6, "", ("93.184.216.34", 80))]
        monkeypatch.setattr(socket, "getaddrinfo", fake_gai)
        seen = {}

        async def handler(request):
            seen["host"] = request.url.host
            seen["hdr"] = request.headers["host"]
            return httpx.Response(200, text="ok")

        async def run():
            async with httpx.AsyncClient(transport=httpx.MockTransport(handler)) as c:
                r, final = await proxy._fetch(c, "http://rebind.example/")
                await r.aclose()
                return final
        final = asyncio.run(run())
        assert seen["host"] == "93.184.216.34" and seen["hdr"] == "rebind.example"
        assert final == "http://rebind.example/"


# ---------- SEC-002 ----------
class TestBodyCapAndRateLimit:
    def test_read_capped_413(self, monkeypatch):
        monkeypatch.setattr(proxy, "MAX_BYTES", 100)

        async def run():
            r = httpx.Response(200, content=b"x" * 500)
            return await proxy._read_capped(r)
        with pytest.raises(HTTPException) as e:
            asyncio.run(run())
        assert e.value.status_code == 413 and e.value.detail == "Page too large to proxy"

    def test_read_capped_ok(self):
        async def run():
            return await proxy._read_capped(httpx.Response(200, content=b"hello"))
        assert asyncio.run(run()) == b"hello"

    def test_rate_limit_live(self, s):
        h = xff()
        codes = [s.get(f"{BASE_URL}/api/proxy/check", params={"url": "http://127.0.0.1/"}, headers=h, timeout=15).status_code
                 for _ in range(92)]
        assert codes[:90].count(400) == 90, codes
        assert codes[90] == 429 and codes[91] == 429
        # /api/proxy shares the same bucket
        assert s.get(f"{BASE_URL}/api/proxy", params={"url": "http://127.0.0.1/"}, headers=h, timeout=15).status_code == 429


# ---------- SEC-003 ----------
class TestStateBounds:
    def did(self):
        return f"TEST-{uuid.uuid4()}"

    def put(self, s, body, did=None):
        return s.put(f"{BASE_URL}/api/state/{did or self.did()}", json=body, timeout=15)

    @pytest.mark.parametrize("field", ["favorites", "installed", "order"])
    def test_list_over_200(self, s, field):
        assert self.put(s, {field: [f"a{i}" for i in range(201)]}).status_code == 422
        assert self.put(s, {field: [f"a{i}" for i in range(200)]}).status_code == 200

    def test_pending_over_200(self, s):
        assert self.put(s, {"pending": {f"a{i}": 1.0 for i in range(201)}}).status_code == 422

    def test_widgets_over_50(self, s):
        w = [{"id": f"w{i}", "type": "time", "x": 1, "y": 1} for i in range(51)]
        assert self.put(s, {"widgets": w}).status_code == 422

    def test_bad_dashboard(self, s):
        assert self.put(s, {"dashboard": "evil"}).status_code == 422

    def test_long_id(self, s):
        assert self.put(s, {"favorites": ["a" * 65]}).status_code == 422
        assert self.put(s, {"theme": "a" * 65}).status_code == 422

    def test_bad_widget_type(self, s):
        assert self.put(s, {"widgets": [{"id": "w", "type": "script", "x": 1, "y": 1}]}).status_code == 422

    def test_body_too_large(self, s):
        r = self.put(s, {"junk": "x" * 70000})
        assert r.status_code == 413

    def test_valid_save_and_get(self, s):
        did = self.did()
        body = {"favorites": ["beez"], "dashboard": "dock", "theme": "red",
                "widgets": [{"id": "w-1", "type": "app", "appId": "beez", "x": 5.5, "y": 6}]}
        assert self.put(s, body, did).status_code == 200
        st = s.get(f"{BASE_URL}/api/state/{did}", timeout=15).json()["state"]
        assert st["widgets"] == [{"id": "w-1", "type": "app", "appId": "beez", "x": 5.5, "y": 6.0}]
        assert st["dashboard"] == "dock" and st["favorites"] == ["beez"]


# ---------- CORS ----------
def test_cors_no_credentials(s):
    r = s.options(f"{BASE_URL}/api/", headers={"Origin": "https://evil.example", "Access-Control-Request-Method": "GET"},
                  timeout=15)
    assert r.headers.get("access-control-allow-credentials") != "true"
    r2 = s.get(f"{BASE_URL}/api/", headers={"Origin": "https://evil.example"}, timeout=15)
    assert r2.headers.get("access-control-allow-credentials") != "true"
