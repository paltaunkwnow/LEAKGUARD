import pytest


@pytest.mark.asyncio
async def test_scan_missing_request(client):
    response = await client.post("/api/v1/exposure/scan", json={})
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_scan_empty_request(client):
    response = await client.post("/api/v1/exposure/scan", json={"request": " "})
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


@pytest.mark.asyncio
async def test_scan_no_token_returns_503(client):
    response = await client.post(
        "/api/v1/exposure/scan",
        json={"request": "test.com", "mode": "domain"},
    )
    assert response.status_code in (502, 503)
