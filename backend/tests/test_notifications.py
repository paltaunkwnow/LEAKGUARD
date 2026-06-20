import uuid

import pytest


@pytest.mark.asyncio
async def test_register_creates_notification(client):
    email = f"notif-{uuid.uuid4().hex[:8]}@example.com"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "secret123", "name": "Notif Test"},
    )
    assert reg.status_code == 200
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    unread = await client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread.status_code == 200
    assert unread.json()["count"] >= 1

    listing = await client.get("/api/v1/notifications", headers=headers)
    assert listing.status_code == 200
    items = listing.json()
    assert len(items) >= 1
    assert items[0]["category"] == "account-breach"
    assert items[0]["read"] is False

    mark = await client.patch(f"/api/v1/notifications/{items[0]['id']}/read", headers=headers)
    assert mark.status_code == 200

    unread_after = await client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread_after.json()["count"] == unread.json()["count"] - 1


@pytest.mark.asyncio
async def test_mark_all_read(client):
    email = f"allread-{uuid.uuid4().hex[:8]}@example.com"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "secret123", "name": "All Read"},
    )
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    mark_all = await client.post("/api/v1/notifications/mark-all-read", headers=headers)
    assert mark_all.status_code == 200
    assert mark_all.json()["updated"] >= 1

    unread = await client.get("/api/v1/notifications/unread-count", headers=headers)
    assert unread.json()["count"] == 0


@pytest.mark.asyncio
async def test_notifications_require_auth(client):
    response = await client.get("/api/v1/notifications")
    assert response.status_code == 401
