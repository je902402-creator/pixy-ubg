# Proxy browser endpoints: /api/proxy/check and /api/proxy
import os
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')


@pytest.fixture(scope="module")
def s():
    return requests.Session()


class TestProxyCheck:
    def test_google_not_embeddable(self, s):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": "https://www.google.com"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["embeddable"] is False
        assert isinstance(d["status"], int)
        assert "final_url" in d

    def test_genizymath_embeddable(self, s):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": "https://genizymath.github.io"}, timeout=30)
        assert r.status_code == 200
        d = r.json()
        assert d["embeddable"] is True
        assert d["status"] == 200

    @pytest.mark.parametrize("u", ["http://127.0.0.1:8001", "http://localhost:8001", "http://169.254.169.254/", "http://10.0.0.1"])
    def test_private_blocked(self, s, u):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": u}, timeout=30)
        assert r.status_code == 400
        assert "Blocked host" in r.json()["detail"]

    @pytest.mark.parametrize("u", ["ftp://example.com", "file:///etc/passwd", "javascript:alert(1)", "example.com"])
    def test_bad_scheme(self, s, u):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": u}, timeout=30)
        assert r.status_code == 400

    def test_unknown_host(self, s):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": "https://nonexistent-host-xyz-123.invalid"}, timeout=30)
        assert r.status_code == 400

    def test_missing_param(self, s):
        r = s.get(f"{BASE_URL}/api/proxy/check", timeout=30)
        assert r.status_code == 422


class TestProxyFetch:
    def test_example_com(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "https://example.com"}, timeout=30)
        assert r.status_code == 200
        assert "text/html" in r.headers.get("content-type", "")
        assert '<base href="https://example.com' in r.text
        assert "pixyNav" in r.text
        assert "/api/proxy?url=" in r.text
        assert "x-frame-options" not in {k.lower() for k in r.headers}
        # iteration 3: proxy responses must carry a sandbox CSP
        assert r.headers.get("content-security-policy", "").startswith("sandbox")
        assert "allow-same-origin" not in r.headers.get("content-security-policy", "")

    def test_google_proxied_strips_xfo(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "https://www.google.com"}, timeout=30)
        assert r.status_code == 200
        assert "x-frame-options" not in {k.lower() for k in r.headers}

    def test_proxy_blocked_loopback(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "http://127.0.0.1:8001/api/"}, timeout=30)
        assert r.status_code == 400

    def test_proxy_bad_scheme(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "file:///etc/passwd"}, timeout=30)
        assert r.status_code == 400


# Iteration 3: SSRF via redirect regression
class TestProxyRedirectSSRF:
    REDIR = "https://httpbin.org/redirect-to?url=http://127.0.0.1:8001/api/"

    def test_proxy_redirect_to_loopback_blocked(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": self.REDIR}, timeout=40)
        assert r.status_code == 400
        assert "Blocked host" in r.text
        assert "Hello World" not in r.text

    def test_check_redirect_to_loopback_blocked(self, s):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": self.REDIR}, timeout=40)
        assert r.status_code == 400
        assert "Blocked host" in r.text

    def test_proxy_redirect_to_metadata_blocked(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "https://httpbin.org/redirect-to?url=http://169.254.169.254/latest/meta-data/"}, timeout=40)
        assert r.status_code == 400

    def test_normal_redirect_followed(self, s):
        r = s.get(f"{BASE_URL}/api/proxy/check", params={"url": "http://github.com"}, timeout=40)
        assert r.status_code == 200
        d = r.json()
        assert d["final_url"].startswith("https://github.com")
        assert d["embeddable"] is False

    def test_proxy_normal_redirect_content(self, s):
        r = s.get(f"{BASE_URL}/api/proxy", params={"url": "http://github.com"}, timeout=40)
        assert r.status_code == 200
        assert '<base href="https://github.com/' in r.text
        assert "location" not in {k.lower() for k in r.headers}
