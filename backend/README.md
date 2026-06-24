# LeakGuard Backend

API FastAPI (Python 3.11) — proxy OSINT seguro, PostgreSQL, Redis, RAG.

## Desarrollo

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

- Swagger UI: http://localhost:8000/docs
- Health: http://localhost:8000/health

## Variables de entorno

Ver `.env.example`. Mínimo requerido:

```env
DATABASE_URL=postgresql+asyncpg://leakguard:leakguard@localhost:5432/leakguard
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=change-me
OSINT_TOKEN=tu-token-leakosint
```

## Estructura

```
app/
├── main.py                 # FastAPI app + CORS + lifespan
├── api/routes/
│   ├── auth.py             # JWT login/register/demo
│   ├── threats.py          # Incidentes + admin queue
│   ├── exposure.py         # OSINT scan + breach-check
│   ├── dashboard.py        # KPIs, charts, darkweb
│   └── ai.py               # RAG + scraping
├── core/
│   ├── config.py           # pydantic-settings
│   ├── database.py         # SQLAlchemy async
│   ├── redis_client.py     # Cache + sesiones
│   └── security.py         # JWT + bcrypt
├── models/                 # User, Incident, ConsultedScan, AuditLog
├── services/
│   ├── osint.py            # LeakOsint API
│   ├── breach.py           # XposedOrNot
│   ├── censor.py           # Censura credenciales
│   ├── exposure.py         # Parse + risk score
│   ├── scraping.py         # Playwright + BS4 + aiohttp
│   └── ai_rag.py           # OpenAI + FAISS
└── data/seed.py            # Incidentes iniciales
```

## Base de datos

Las tablas se crean automáticamente al iniciar (`init_db` + `seed_database`).

Modelos:
- `users` — autenticación
- `incidents` — threat intelligence (JSONB payload)
- `consulted_scans` — historial Exposure Check (solo `query_hash` + metadatos; sin query en texto plano)
- `audit_logs` — trazabilidad admin

## Playwright (scraping dinámico)

```powershell
playwright install chromium
```

## Docker

```powershell
docker build -t leakguard-api .
docker run -p 8000:8000 --env-file .env leakguard-api
```

O usar `docker compose up` desde la raíz del monorepo.
