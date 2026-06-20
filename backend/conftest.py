import os

# Must be set before importing app modules (engine reads settings at import time).
os.environ.setdefault(
    "DATABASE_URL",
    "postgresql+asyncpg://leakguard:leakguard@localhost:5432/leakguard",
)
os.environ.setdefault("REDIS_URL", "redis://localhost:6379/0")
os.environ.setdefault("SECRET_KEY", "test-secret-key")
os.environ.setdefault("OSINT_TOKEN", "")

import pytest
from httpx import ASGITransport, AsyncClient

from app.core.database import init_db
from app.main import app


@pytest.fixture
async def client():
    try:
        await init_db()
    except OSError as exc:
        pytest.skip(f"PostgreSQL no disponible: {exc}")
    except Exception as exc:
        pytest.skip(f"No se pudo inicializar la BD: {exc}")

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
