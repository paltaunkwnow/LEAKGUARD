# SDD Plan: Evolución de LeakGuard

**Estado:** Plan de alineación SDD ↔ código **COMPLETADO** (SDD v3.2 — 2026-06-20)  
**Documento vivo:** backlog y tareas pendientes para cerrar brechas entre SDD y producto  
**Fuente de verdad:** [SDD.md](SDD.md) · Historial: [CHANGELOG.md](CHANGELOG.md)

---

## 1. Resumen de fases

| Fase | Estado | Objetivo |
|------|--------|----------|
| **A — Alineación documentación** | ✅ Completada | SDD v3.2 refleja código real |
| **B — Calidad y tests** | ✅ Completada | pytest (28) + vitest (2) + CI (SDD §8) |
| **C — Privacidad y scraping** | ⚠️ En progreso | K-Anonymity ✅, scraper ransomware ✅, ingesta PG 🔜 |
| **D — Inteligencia avanzada** | 🔜 Pendiente | OTX/Ransomware.live, resúmenes ejecutivos, alertas push |
| **E — Producción** | 🔜 Pendiente | WebSockets, Tor pool, CI/CD, deploy |

---

## 2. Completado (no reabrir salvo regresión)

### Stack v2
- [x] Next.js 14 + Tailwind + shadcn/ui (`frontend/`)
- [x] FastAPI async + SQLAlchemy (`backend/`)
- [x] PostgreSQL: users, incidents, audit_logs, consulted_scans
- [x] Redis: cache de scraps (`backend/app/core/redis_client.py`)
- [x] Docker Compose: postgres, redis, backend, frontend

### Funcionalidad core
- [x] Proxy OSINT seguro — `backend/app/services/osint.py`
- [x] XposedOrNot merge — `backend/app/services/breach.py`
- [x] Censura server-side — `backend/app/services/censor.py`
- [x] Risk score 0–99 — `backend/app/services/exposure.py`
- [x] Exposure Check UI — `frontend/src/app/exposure/page.tsx`
- [x] Dashboard KPIs + Chart.js + Leaflet — `frontend/src/app/dashboard/`
- [x] Admin verify/reject + audit log — `frontend/src/app/admin/page.tsx`
- [x] JWT auth + demo bypass — `backend/app/api/routes/auth.py`
- [x] AI Safety metrics — `GET /api/v1/dashboard/ai-safety`
- [x] RAG básico + OpenAI fallback — `backend/app/services/ai_rag.py`
- [x] Scrape URL (BS4 + Playwright opcional) — `POST /api/v1/scrape`

### Documentación y tooling
- [x] SDD v3.2 con módulos 1–11 y tabla API (§1–10)
- [x] Legacy v1 en `legacy/` (`npm run dev:legacy`)
- [x] Cursor rules en `.cursor/rules/` (8 archivos)

---

## 3. Brechas conocidas (SDD vs código)

| Brecha | SDD dice | Código hoy | Prioridad |
|--------|----------|------------|-----------|
| Tests | 70% backend / 50% frontend | Sin suite implementada | **Alta** |
| K-Anonymity | Búsqueda anónima HIBP-style | Consulta directa + `consulted_scans` guarda query | Alta |
| Scrapers dark web | Blogs ransomware, foros, cron 15 min | Scrape genérico por URL; incidentes = seed DB | Alta |
| Verificación OSINT | OTX + Ransomware.live | No integrado | Media |
| Alertas push | Telegram/Slack/email | Solo alerta XposedOrNot en login/registro | Media |
| RAG completo | 50 casos + embeddings reales | 4 docs + vectores simplificados | Media |
| Live feed | WebSockets / SSE | REST polling manual | Baja |
| Tor pool | 5 circuitos .onion | No existe | Baja |
| Resumen ejecutivo | Prompt JSON 20 palabras + cache | Solo `/ai/analyze` genérico | Baja |

---

## 4. Plan de ejecución detallado

### Estado de ejecución (2026-06-20)

| Tarea | Estado |
|-------|--------|
| B1–B6 Tests y CI | ✅ Completado |
| C1 K-Anonymity | ✅ Completado |
| C2 Privacidad consulted_scans | ✅ Completado |
| C3 Scraper ransomware + scheduler | ✅ Completado |
| C4 Ingesta PostgreSQL | 🔜 Pendiente |
| D1–D4 Inteligencia | 🔜 Pendiente |
| E1–E4 Producción | 🔜 Pendiente |

---

### Fase B — Tests y calidad (PRIORIDAD INMEDIATA)

**Objetivo:** Cumplir SDD §8 (Testing) antes de añadir features.

---

#### B1. Unit tests para `exposure.py`

**Archivo a crear:** `backend/tests/test_exposure.py`

**Dependencias previas:** Crear `backend/tests/__init__.py` (archivo vacío).

**Qué testear y cómo:**

1. **`parse_osint_response(None)`** → debe retornar `([], stats)` con stats vacías.
2. **`parse_osint_response({})`** → mismo resultado.
3. **`parse_osint_response` con datos reales** → usar este input de ejemplo:

```python
MOCK_OSINT_RESPONSE = {
    "NumOfResults": 5,
    "NumOfDatabase": 2,
    "List": {
        "LeakedDB_2024": {
            "NumOfResults": 3,
            "InfoLeak": "LeakedDB_2024",
            "Data": [
                {"Email": "user@test.com", "Password": "abc123"},
                {"Email": "admin@test.com", "Password": "$2b$12$hashedvalue"},
                {"Email": "otro@test.com", "Pass": "secreto1"},
            ]
        },
        "AnotherDB": {
            "NumOfResults": 2,
            "InfoLeak": "AnotherDB",
            "Data": [
                {"Login": "user2@test.com", "Hash": "5f4dcc3b5aa765d61d8327deb882cf99"},
                {"email": "user3@test.com", "password": "pass"},
            ]
        }
    }
}
```

Verificar:
- `len(records)` == 5
- `stats["totalLogins"]` == 5
- `stats["totalDatabases"]` == 2
- `stats["plaintextPasswords"]` >= 2 (las que no empiezan con `$` ni superan 48 chars)
- `stats["hashedPasswords"]` >= 1
- Cada record tiene keys: `date`, `title`, `sourceName`, `login`, `credential`, `severity`
- `login` contiene `***` o `••` (está censurado)
- `credential` contiene `••` (está censurado)

4. **`calculate_real_risk_percent` sin records** → `{"score": 0, "level": "Sin Riesgo", ...}`
5. **`calculate_real_risk_percent` con muchos logins** → score alto:

```python
stats_high = {"apiTotalResults": 100, "databasesWithHits": 5, "plaintextPasswords": 4, "hashedPasswords": 2}
records_high = [{"dummy": True}] * 100
result = calculate_real_risk_percent(stats_high, records_high)
assert result["score"] >= 85
assert result["level"] == "Crítico"
```

6. **`calculate_real_risk_percent` con pocos logins** → score bajo:

```python
stats_low = {"apiTotalResults": 1, "databasesWithHits": 1, "plaintextPasswords": 0, "hashedPasswords": 1}
records_low = [{"dummy": True}]
result = calculate_real_risk_percent(stats_low, records_low)
assert result["score"] < 35
assert result["level"] == "Bajo"
```

7. **`detect_search_type`**:
   - `detect_search_type("test@mail.com", "email")` → `"Correo Electrónico (Email)"`
   - `detect_search_type("empresa.com", "domain")` → `"Dominio Corporativo"`
   - `detect_search_type("+59171234567", "phone")` → `"Número Telefónico"`

8. **`generate_recommendations`** — con risk score >= 70 debe incluir prioridad "Inmediato".

**Imports necesarios:**

```python
from app.services.exposure import (
    calculate_real_risk_percent,
    detect_search_type,
    generate_recommendations,
    parse_osint_response,
)
```

**Comando para ejecutar:** `cd backend && python -m pytest tests/test_exposure.py -v`

---

#### B2. Unit tests para `censor.py`

**Archivo a crear:** `backend/tests/test_censor.py`

**Qué testear y cómo:**

```python
from app.services.censor import (
    censor_email,
    censor_generic,
    censor_hash,
    censor_password,
    censor_phone,
    normalize_osint_entry,
    severity_from_record,
)
```

1. **`censor_password("abc12345")`** → debe contener `••` y NO ser `"abc12345"` (debe estar censurada).
2. **`censor_password(None)`** → `"[oculto]"`
3. **`censor_password("")`** → `"[oculto]"`
4. **`censor_password("ab")`** → `"••••"` (longitud <= 3)
5. **`censor_password("$2b$12$longhashedvalue")`** → debe llamar a `censor_hash` internamente (el resultado empieza con `$2b$12$l` y contiene `••`).
6. **`censor_hash("5f4dcc3b5aa765d61d8327deb882cf99")`** → empieza con `5f4dcc3b` y termina con `••••••`.
7. **`censor_hash(None)`** → `"[hash oculto]"`
8. **`censor_email("usuario@empresa.com")`** → contiene `@empresa.com` y contiene `*` en la parte local.
9. **`censor_email(None)`** → `"[oculto]"`
10. **`censor_phone("+59171234567")`** → empieza con `591`, contiene `••••`, termina en `67`.
11. **`censor_phone(None)`** → `"[oculto]"`
12. **`censor_generic("Juan Perez")`** → contiene `•••` (parte central oculta).
13. **`normalize_osint_entry({"Email": "a@b.com", "Password": "pass123"})`** → retorna dict con `email="a@b.com"` y `password="pass123"`.
14. **`normalize_osint_entry({"correo": "a@b.com"})`** → `email="a@b.com"` (por el field map).
15. **`severity_from_record({"password": "pass", "hash": None, ...})`** → `"Critical"` (plaintext).
16. **`severity_from_record({"password": None, "hash": "abc123", ...})`** → `"High"` (hash only).
17. **`severity_from_record({"password": None, "hash": None, "email": "a@b.com", ...})`** → `"Medium"`.

**Comando:** `cd backend && python -m pytest tests/test_censor.py -v`

---

#### B3. Unit tests para routes de exposure

**Archivo a crear:** `backend/tests/test_exposure_routes.py`

**Dependencias:** Necesitas `httpx` (ya está en `requirements.txt`) y `pytest-asyncio`.

**Paso 1:** Agregar `pytest` y `pytest-asyncio` a `backend/requirements.txt`:
```
pytest==8.3.4
pytest-asyncio==0.24.0
```

**Paso 2:** Crear `backend/conftest.py` con un cliente de test:

```python
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app

@pytest.fixture
async def client():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
```

**Paso 3:** Tests en `backend/tests/test_exposure_routes.py`:

```python
import pytest

@pytest.mark.asyncio
async def test_scan_missing_request(client):
    """POST /api/v1/exposure/scan sin body → 422 (validation error de Pydantic)."""
    r = await client.post("/api/v1/exposure/scan", json={})
    assert r.status_code == 422

@pytest.mark.asyncio
async def test_scan_empty_request(client):
    """POST /api/v1/exposure/scan con request vacío → 400."""
    r = await client.post("/api/v1/exposure/scan", json={"request": " "})
    assert r.status_code == 400

@pytest.mark.asyncio
async def test_health(client):
    """GET /health → 200."""
    r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"
```

**Nota:** Si `OSINT_TOKEN` no está configurado, el endpoint `/api/v1/exposure/scan` con un request válido devolverá 503 (`"Servicio de escaneo no configurado"` o similar). Esto es correcto y se puede testear:

```python
@pytest.mark.asyncio
async def test_scan_no_token_returns_503(client):
    """Sin OSINT_TOKEN configurado, scan debe devolver 503."""
    r = await client.post("/api/v1/exposure/scan", json={"request": "test.com", "mode": "domain"})
    assert r.status_code in (502, 503)
```

**Comando:** `cd backend && python -m pytest tests/test_exposure_routes.py -v`

---

#### B4. Smoke tests

**Archivo a crear:** `backend/tests/test_smoke.py`

**Propósito:** Verificar que la app arranca y los endpoints principales responden.

```python
import pytest

@pytest.mark.asyncio
async def test_health_smoke(client):
    r = await client.get("/health")
    assert r.status_code == 200

@pytest.mark.asyncio
async def test_threats_list_smoke(client):
    r = await client.get("/api/v1/threats")
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)

@pytest.mark.asyncio
async def test_dashboard_kpis_smoke(client):
    r = await client.get("/api/v1/dashboard/kpis")
    assert r.status_code == 200
    data = r.json()
    assert "threatsToday" in data

@pytest.mark.asyncio
async def test_dashboard_charts_smoke(client):
    r = await client.get("/api/v1/dashboard/charts")
    assert r.status_code == 200

@pytest.mark.asyncio
async def test_exposure_scan_responds(client):
    """No necesita token real; solo verifica que no da 404."""
    r = await client.post("/api/v1/exposure/scan", json={"request": "test.com"})
    assert r.status_code != 404
```

**Usa el mismo `conftest.py` de B3.**

**Comando:** `cd backend && python -m pytest tests/test_smoke.py -v`

---

#### B5. Frontend tests con Vitest

**Paso 1:** Instalar vitest en el frontend:

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Paso 2:** Agregar config vitest. Crear `frontend/vitest.config.ts`:

```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
```

**Paso 3:** Agregar script a `frontend/package.json` en la sección `"scripts"`:

```json
"test": "vitest run"
```

**Paso 4:** Crear `frontend/src/lib/__tests__/api.test.ts`:

```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";

describe("api module", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", {
      getItem: vi.fn(() => "fake-token"),
      setItem: vi.fn(),
      removeItem: vi.fn(),
    });
  });

  it("should export api object with expected methods", async () => {
    const { api } = await import("../api");
    expect(api).toBeDefined();
    expect(typeof api.login).toBe("function");
    expect(typeof api.scan).toBe("function");
    expect(typeof api.threats).toBe("function");
    expect(typeof api.dashboardKpis).toBe("function");
    expect(typeof api.demo).toBe("function");
    expect(typeof api.aiAnalyze).toBe("function");
  });

  it("should throw on failed request", async () => {
    vi.stubGlobal("fetch", vi.fn(() =>
      Promise.resolve({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ detail: "Server error" }),
      })
    ));

    const { api } = await import("../api");
    await expect(api.threats()).rejects.toThrow("Server error");
  });
});
```

**Comando:** `cd frontend && npm test`

---

#### B6. CI con GitHub Actions

**Archivo a crear:** `.github/workflows/ci.yml`

```yaml
name: CI
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_USER: leakguard
          POSTGRES_PASSWORD: leakguard
          POSTGRES_DB: leakguard
        ports: ["5432:5432"]
        options: >-
          --health-cmd "pg_isready -U leakguard"
          --health-interval 5s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ["6379:6379"]
    defaults:
      run:
        working-directory: backend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: "3.11"
      - run: pip install -r requirements.txt
      - run: python -m pytest tests/ -v
        env:
          DATABASE_URL: postgresql+asyncpg://leakguard:leakguard@localhost:5432/leakguard
          REDIS_URL: redis://localhost:6379/0
          SECRET_KEY: ci-test-key

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npm test
```

**Comando local para verificar:** Ejecutar los tests localmente antes de push.

---

### Fase C — Privacidad y recolección

**Objetivo:** Cerrar Módulos 1 y 6 del SDD.

**Ejecutar SOLO después de que Fase B esté completa (todos los tests pasan).**

---

#### C1. K-Anonymity endpoint

**Concepto:** El frontend hashea la query con SHA-256, envía solo los primeros 5 caracteres al backend, el backend devuelve todos los hashes que coinciden con ese prefijo, y el frontend filtra localmente.

**Paso 1:** Crear `frontend/src/lib/k-anonymity.ts`:

```typescript
export async function hashQuery(query: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(query.toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getPrefix(hash: string, length = 5): string {
  return hash.slice(0, length);
}

export function matchesFullHash(candidates: string[], fullHash: string): boolean {
  return candidates.includes(fullHash);
}
```

**Paso 2:** Agregar endpoint en `backend/app/api/routes/exposure.py`:

```python
@router.get("/k-anon/{prefix}")
async def k_anon_search(prefix: str, db: Annotated[AsyncSession, Depends(get_db)]):
    """Devuelve hashes completos de consultas que coinciden con el prefijo."""
    if len(prefix) < 5 or len(prefix) > 10:
        raise HTTPException(status_code=400, detail="Prefijo debe tener 5-10 caracteres")
    result = await db.execute(
        select(ConsultedScan.query_hash).where(ConsultedScan.query_hash.startswith(prefix))
    )
    return {"prefix": prefix, "hashes": [r[0] for r in result.all()]}
```

**Paso 3:** Agregar columna `query_hash` al modelo `ConsultedScan` en `backend/app/models/consulted_scan.py`:

```python
query_hash: Mapped[str] = mapped_column(String(64), index=True, default="")
```

**Paso 4:** Al guardar en la ruta `/scan`, calcular el hash SHA-256 de la query y guardarlo en `query_hash`:

```python
import hashlib
scan.query_hash = hashlib.sha256(query.lower().strip().encode()).hexdigest()
```

**Paso 5:** En el frontend `exposure/page.tsx`, antes de llamar a `api.scan()`, hashear la query y comparar contra el endpoint `/k-anon/`. Solo hacer el scan completo si hay match o si el usuario fuerza.

**Tests:** Agregar test en `backend/tests/test_exposure.py` para el endpoint k-anon.

---

#### C2. Dejar de guardar query en claro

**Archivo:** `backend/app/models/consulted_scan.py`

**Cambio:** Reemplazar `query: Mapped[str]` por almacenar solo el hash o una versión truncada. Opciones:
- **Opción A (recomendada):** Guardar el hash SHA-256 completo en `query_hash` y dejar `query` como string genérico (ej: `"dominio"`, `"email"`, `"teléfono"`) sin el valor real.
- **Opción B:** Eliminar `query` del modelo y usar solo `query_hash`.

**Si se elige Opción A**, cambiar la ruta de scan en `backend/app/api/routes/exposure.py` donde se guarda el `ConsultedScan`:
- `query` → poner solo el `search_type` (ej: `"Dominio Corporativo"`)
- `query_hash` → SHA-256 completo de la query original

---

#### C3. Scraper ransomware (1 fuente)

**Archivo a crear:** `backend/app/core/scheduler.py`

**Archivo a modificar:** `backend/app/services/scraping.py`

**Paso 1:** Elegir una fuente pública de ransomware (por ejemplo, `ransomware.live` que tiene API pública en `https://api.ransomware.live/recentvictims`).

**Paso 2:** Crear función en `scraping.py`:

```python
async def scrape_ransomware_feed() -> list[dict[str, Any]]:
    """Consulta ransomware.live API y retorna víctimas recientes."""
    url = "https://api.ransomware.live/recentvictims"
    cache_key = "scrape:ransomware:recent"
    cached = await cache_get(cache_key)
    if cached:
        return cached

    async with aiohttp.ClientSession() as session:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=30)) as resp:
            if resp.status != 200:
                return []
            data = await resp.json()

    # Extraer campos relevantes
    victims = []
    for item in (data if isinstance(data, list) else []):
        victims.append({
            "actor": item.get("group_name", "Unknown"),
            "victim": item.get("post_title", "Unknown"),
            "date": item.get("discovered", ""),
            "url": item.get("post_url", ""),
            "country": item.get("country", "Unknown"),
        })

    await cache_set(cache_key, victims[:50], ttl_seconds=900)  # 15 min
    return victims[:50]
```

**Paso 3:** Crear `scheduler.py` con un loop asyncio que ejecute `scrape_ransomware_feed` cada 15 minutos:

```python
import asyncio
from app.services.scraping import scrape_ransomware_feed

async def scraping_loop():
    while True:
        try:
            await scrape_ransomware_feed()
        except Exception:
            pass
        await asyncio.sleep(900)  # 15 minutos
```

**Paso 4:** Agregar el loop al lifespan de FastAPI en `backend/app/main.py`:

```python
@asynccontextmanager
async def lifespan(_app: FastAPI):
    await init_db()
    async with async_session() as session:
        await seed_database(session)
    task = asyncio.create_task(scraping_loop())
    yield
    task.cancel()
```

**Paso 5:** Agregar endpoint `GET /api/v1/dashboard/ransomware-feed` que lea del cache Redis.

**Tests:** Mock de la respuesta HTTP para verificar el parsing.

---

#### C4. Ingesta a PostgreSQL

**Archivo a modificar:** `backend/app/services/scraping.py` y `backend/app/data/seed.py`

**Concepto:** Cuando el scraper detecta una nueva víctima que no existe en la tabla `incidents`, crear un `Incident` con `verification_status = "Pending Review"`.

**Paso 1:** En `scrape_ransomware_feed`, después de obtener los datos, iterar y para cada víctima nueva:
- Buscar si ya existe un `Incident` con ese `actor` + `victim` + `date`
- Si no existe, crear uno con datos básicos y `verification_status = "Pending Review"`
- Guardar en PostgreSQL

**Paso 2:** El admin panel ya muestra incidentes "Pending Review", así que los nuevos scraps aparecerán automáticamente en la cola.

---

### Fase D — Inteligencia y alertas

**Ejecutar SOLO después de que Fase C esté completa.**

---

#### D1. Integración OTX (AlienVault)

**Archivo a crear:** `backend/app/services/osint_verify.py`

**API pública:** `https://otx.alienvault.com/api/v1/indicators/domain/{domain}/general` (no requiere API key para consultas básicas).

```python
import aiohttp
from typing import Any

async def verify_with_otx(domain: str) -> dict[str, Any]:
    url = f"https://otx.alienvault.com/api/v1/indicators/domain/{domain}/general"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    return {"verified": False, "source": "otx", "error": f"HTTP {resp.status}"}
                data = await resp.json()
                pulse_count = data.get("pulse_info", {}).get("count", 0)
                return {
                    "verified": pulse_count > 0,
                    "source": "otx",
                    "pulseCount": pulse_count,
                    "reputation": data.get("reputation", 0),
                }
    except Exception as exc:
        return {"verified": False, "source": "otx", "error": str(exc)}
```

**Paso 2:** Llamar desde el endpoint de threats details o exposure scan y agregar campo `verificacion_externa` a la respuesta.

**Tests:** Mock de la respuesta OTX y verificar parsing.

---

#### D2. Resumen ejecutivo

**Archivo a modificar:** `backend/app/services/ai_rag.py`

**Agregar función:**

```python
async def generate_executive_summary(context: str) -> dict[str, Any]:
    prompt = (
        "Traduce este texto técnico de ciberseguridad a lenguaje de negocio. "
        "Máximo 20 palabras. Responde SOLO en JSON: {\"resumen\": \"...\"}"
        f"\n\nTexto: {context}"
    )
    # usar misma lógica de OpenAI que analyze_threat
    # si no hay API key, generar resumen template offline
```

**Agregar endpoint:** `POST /api/v1/ai/summary` en `backend/app/api/routes/ai.py`.

**Tests:** Verificar que sin API key devuelve un resumen offline válido.

---

#### D3. Alertas Telegram

**Archivo a crear:** `backend/app/services/alerts.py`

**Paso 1:** Agregar a `backend/app/core/config.py`:

```python
telegram_bot_token: str = ""
telegram_chat_id: str = ""
```

**Paso 2:** Crear servicio:

```python
import aiohttp
from app.core.config import settings

async def send_telegram_alert(message: str) -> bool:
    if not settings.telegram_bot_token or not settings.telegram_chat_id:
        return False
    url = f"https://api.telegram.org/bot{settings.telegram_bot_token}/sendMessage"
    payload = {"chat_id": settings.telegram_chat_id, "text": message, "parse_mode": "HTML"}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=payload) as resp:
                return resp.status == 200
    except Exception:
        return False
```

**Paso 3:** Llamar `send_telegram_alert` desde la ruta de verificación de incidentes (`POST /threats/{id}/verify`) cuando el incidente sea Critical.

**Variables de entorno:** Agregar `TELEGRAM_BOT_TOKEN` y `TELEGRAM_CHAT_ID` a `backend/.env.example`.

**Tests:** Mock del endpoint de Telegram y verificar que se llama con el formato correcto.

---

#### D4. Expandir RAG

**Archivo a crear:** `backend/app/data/rag_cases/` (directorio con archivos .txt)

**Paso 1:** Crear al menos 20 archivos `.txt` con casos de estudio reales y públicos:
- `colonial_pipeline.txt`
- `solarwinds.txt`
- `log4shell.txt`
- `moveit.txt`
- `lockbit_healthcare.txt`
- etc.

Cada archivo: 3–5 párrafos describiendo el incidente, impacto y respuesta.

**Paso 2:** Modificar `backend/app/services/ai_rag.py` para cargar los archivos del directorio en lugar de los 4 docs hardcodeados:

```python
from pathlib import Path

def _load_rag_docs() -> list[str]:
    cases_dir = Path(__file__).resolve().parent.parent / "data" / "rag_cases"
    if not cases_dir.exists():
        return []  # fallback a docs hardcodeados
    docs = []
    for f in sorted(cases_dir.glob("*.txt")):
        docs.append(f.read_text(encoding="utf-8").strip())
    return docs
```

**Tests:** Verificar que la función carga archivos correctamente y que FAISS puede indexar >20 docs.

---

### Fase E — Producción y tiempo real

**Ejecutar SOLO después de que Fase D esté completa.**

---

#### E1. WebSockets feed

**Archivo a crear:** `backend/app/api/ws.py`

**Paso 1:** Crear endpoint WebSocket en FastAPI:

```python
from fastapi import WebSocket, WebSocketDisconnect

connections: list[WebSocket] = []

async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connections.remove(websocket)

async def broadcast(message: dict):
    for ws in connections:
        try:
            await ws.send_json(message)
        except Exception:
            connections.remove(ws)
```

**Paso 2:** Registrar en `main.py`: `app.websocket("/ws")(websocket_endpoint)`

**Paso 3:** Llamar `broadcast` desde el scheduler cuando se detecten nuevos incidentes.

**Paso 4:** En el frontend, crear hook `useWebSocket` que se conecte a `ws://localhost:8000/ws` y actualice el dashboard.

---

#### E2. Tor pool

**Archivo a crear:** `backend/app/core/tor_pool.py`

**Concepto:** Pool de SOCKS proxies vía Tor para rotar circuitos al scrapear .onion.

**Dependencia:** `pip install aiohttp-socks` (agregar a `requirements.txt`).

**Nota:** Requiere Tor instalado en el host o un contenedor Tor en docker-compose.

---

#### E3. Deploy

**Frontend:** Vercel (`vercel deploy` desde `frontend/`).

**Backend:** Cloud Run o Railway:
- Usar `backend/Dockerfile` existente.
- Configurar variables de entorno (`DATABASE_URL`, `REDIS_URL`, `OSINT_TOKEN`, `SECRET_KEY`).
- Necesita PostgreSQL y Redis externos (ej: Supabase + Upstash).

**Paso 1:** Configurar secretos en el proveedor de cloud.
**Paso 2:** Desplegar.
**Paso 3:** Ejecutar smoke tests contra la URL de producción.

---

#### E4. Actualizar Cursor rules

Después de completar E1–E3, actualizar `.cursor/rules/leakguard-core.mdc` para reflejar:
- Nuevas rutas WebSocket
- Configuración Tor si aplica
- URLs de producción
- Nuevos servicios y convenciones

---

## 5. Orden recomendado para el agente Cursor

1. **B1 + B2** (unit tests exposure + censor) — funciones puras, sin dependencias externas.
2. **B3 + B4** (tests routes + smoke) — necesitan `conftest.py` y `pytest-asyncio`.
3. **B5** (vitest frontend) — independiente del backend.
4. **B6** (CI) — después de que todos los tests pasen localmente.
5. **C1** (K-Anonymity) — diferenciador ético del pitch.
6. **C3** (1 scraper) — demuestra visión de recolección.
7. **D1 + D3** (OTX + Telegram) — impacto en demo.
8. Resto según tiempo disponible.

**Regla:** No avanzar a la siguiente tarea si la actual tiene tests que fallan.

---

## 6. Legacy v1

No expandir `legacy/` salvo hotfixes. Mantener solo como referencia y demo offline:

```bash
npm run dev:legacy   # → http://localhost:1337
```

Archivos: `legacy/app.js`, `legacy/proxy/server.js`, `legacy/functions/index.js`

---

## 7. Checklist al cerrar cada tarea

- [ ] Código implementado y probado localmente (`docker compose up` o dev local)
- [ ] Tests pasan: `cd backend && pytest` y `cd frontend && npm test`
- [ ] SDD.md actualizado si cambia estado de módulo (✅ / ⚠️ / 🔜)
- [ ] CHANGELOG.md con entrada semver
- [ ] Cursor rules actualizadas si cambian convenciones
- [ ] No hay secretos en el código (`git diff` antes de commit)

---

## 8. Referencias rápidas

| Recurso | Ubicación |
|---------|-----------|
| API Swagger | http://localhost:8000/docs |
| Frontend dev | http://localhost:3000 |
| Variables backend | `backend/.env.example` |
| Seed incidentes | `backend/app/data/seed.py` |
| Cliente REST frontend | `frontend/src/lib/api.ts` |
| Schemas Pydantic | `backend/app/schemas/__init__.py` |
| Modelos SQLAlchemy | `backend/app/models/` |
| Reglas agente | `.cursor/rules/*.mdc` |
| Config backend | `backend/app/core/config.py` |
| Docker Compose | `docker-compose.yml` |
