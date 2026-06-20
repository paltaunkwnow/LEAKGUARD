import pytest


@pytest.mark.asyncio
async def test_health_smoke(client):
    response = await client.get("/health")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_threats_list_smoke(client):
    response = await client.get("/api/v1/threats")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_dashboard_kpis_smoke(client):
    response = await client.get("/api/v1/dashboard/kpis")
    assert response.status_code == 200
    assert "threatsToday" in response.json()


@pytest.mark.asyncio
async def test_dashboard_charts_smoke(client):
    response = await client.get("/api/v1/dashboard/charts")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_exposure_scan_responds(client):
    response = await client.post("/api/v1/exposure/scan", json={"request": "test.com"})
    assert response.status_code != 404
