# PIXY V2 state persistence API tests (/api/state/{device_id})
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL').rstrip('/')


@pytest.fixture
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


def test_root(client):
    r = client.get(f"{BASE_URL}/api/")
    assert r.status_code == 200


def test_new_device_not_exists(client):
    r = client.get(f"{BASE_URL}/api/state/TEST-{uuid.uuid4()}")
    assert r.status_code == 200
    assert r.json() == {"exists": False, "state": None}


def test_put_then_get(client):
    did = f"TEST-{uuid.uuid4()}"
    body = {"favorites": ["beez"], "installed": ["beez", "unblockedzone"], "pending": {"unblockedzone": 123.5},
            "bgId": "bg5", "order": ["beez", "t9-os"], "dashboard": "wave",
            "widgets": [{"id": "w-1", "type": "time", "x": 10, "y": 20}], "theme": "red"}
    r = client.put(f"{BASE_URL}/api/state/{did}", json=body)
    assert r.status_code == 200 and r.json() == {"ok": True}
    g = client.get(f"{BASE_URL}/api/state/{did}").json()
    assert g["exists"] is True
    # widgets normalized by Widget model (appId default None, floats)
    expected = dict(body, widgets=[{"id": "w-1", "type": "time", "appId": None, "x": 10.0, "y": 20.0}])
    assert g["state"] == expected


def test_put_upsert_overwrites(client):
    did = f"TEST-{uuid.uuid4()}"
    client.put(f"{BASE_URL}/api/state/{did}", json={"dashboard": "wave"})
    client.put(f"{BASE_URL}/api/state/{did}", json={"dashboard": "dock", "favorites": ["x"]})
    s = client.get(f"{BASE_URL}/api/state/{did}").json()["state"]
    assert s["dashboard"] == "dock" and s["favorites"] == ["x"]
    assert s["bgId"] == "default" and s["widgets"] == []


def test_extra_fields_ignored(client):
    did = f"TEST-{uuid.uuid4()}"
    r = client.put(f"{BASE_URL}/api/state/{did}", json={"dashboard": "dock", "hacker": 1})
    assert r.status_code == 200
    s = client.get(f"{BASE_URL}/api/state/{did}").json()["state"]
    assert "hacker" not in s


@pytest.mark.parametrize("bad", ["short", "a" * 65, "bad$id!!xx", "bad_id_under"])
def test_invalid_ids(client, bad):
    assert client.get(f"{BASE_URL}/api/state/{bad}").status_code == 400
    assert client.put(f"{BASE_URL}/api/state/{bad}", json={}).status_code == 400


def test_invalid_body_type(client):
    did = f"TEST-{uuid.uuid4()}"
    r = client.put(f"{BASE_URL}/api/state/{did}", json={"favorites": "notalist"})
    assert r.status_code == 422
