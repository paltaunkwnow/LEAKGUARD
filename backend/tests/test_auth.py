import uuid

import pytest

from app.core.security import hash_password, verify_password


def test_hash_and_verify_password():
    hashed = hash_password("secret123")
    assert hashed.startswith("$2")
    assert verify_password("secret123", hashed)
    assert not verify_password("wrong", hashed)


@pytest.mark.asyncio
async def test_register_returns_token_and_breach_alert(client):
    email = f"test-{uuid.uuid4().hex[:8]}@example.com"
    response = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": "secret123", "name": "Test Analyst"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["user"]["email"] == email
    assert data["breach_alert"] is not None
    assert "message" in data["breach_alert"]


@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    email = f"dup-{uuid.uuid4().hex[:8]}@example.com"
    payload = {"email": email, "password": "secret123", "name": "Dup"}
    first = await client.post("/api/v1/auth/register", json=payload)
    assert first.status_code == 200
    second = await client.post("/api/v1/auth/register", json=payload)
    assert second.status_code == 400
    assert "registrado" in second.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_valid_credentials(client):
    email = f"login-{uuid.uuid4().hex[:8]}@example.com"
    password = "secret123"
    reg = await client.post(
        "/api/v1/auth/register",
        json={"email": email, "password": password, "name": "Login Test"},
    )
    assert reg.status_code == 200

    response = await client.post(
        "/api/v1/auth/login",
        json={"email": email, "password": password},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["access_token"]
    assert data["breach_alert"] is not None


@pytest.mark.asyncio
async def test_login_invalid_credentials(client):
    response = await client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "wrongpass"},
    )
    assert response.status_code == 401
