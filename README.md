<p align="center">
  <img src="https://img.shields.io/badge/LeakGuard-v3.3-22d3ee?style=for-the-badge&labelColor=0f172a" alt="LeakGuard" />
</p>

<h1 align="center">LeakGuard</h1>

<p align="center">
  Plataforma de <strong>Threat Intelligence</strong> y verificación de filtraciones OSINT con credenciales censuradas, proxy seguro y análisis de riesgo.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python%203.11-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/pytest-0A9EDC?style=flat-square&logo=pytest&logoColor=white" alt="pytest" />
  <img src="https://img.shields.io/badge/Chart.js-FF6384?style=flat-square&logo=chartdotjs&logoColor=white" alt="Chart.js" />
  <img src="https://img.shields.io/badge/Leaflet-199900?style=flat-square&logo=leaflet&logoColor=white" alt="Leaflet" />
</p>

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Stack tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Inicio rápido](#inicio-rápido)
- [Configuración](#configuración)
- [Módulos](#módulos)
- [API REST](#api-rest)
- [Testing](#testing)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Legacy v1](#legacy-v1)
- [Documentación adicional](#documentación-adicional)
- [Seguridad](#seguridad)

---

## Descripción

**LeakGuard** es una plataforma web orientada a analistas de ciberseguridad. Permite:

- Auditar exposición de activos digitales (dominios, correos, teléfonos) contra índices OSINT.
- Visualizar incidentes de threat intelligence con scoring de riesgo y verificación humana.
- Consultar filtraciones recientes, dark web/foros y feed de ransomware en vivo.
- Analizar amenazas con RAG (OpenAI GPT-4o-mini + FAISS offline).
- Búsqueda con **K-Anonymity** (hash parcial SHA-256, estilo HIBP).

El token de la API OSINT de pago **nunca se expone al navegador**: el frontend habla con FastAPI, que actúa como proxy seguro.

---

## Stack tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui, Vitest |
| **Backend** | Python 3.11 + FastAPI (async nativo), pytest |
| **Base de datos** | PostgreSQL (usuarios, incidentes, auditoría, consultas) |
| **Cache / sesiones** | Redis (scraps, feed ransomware, sesiones) |
| **Scraping** | Playwright + BeautifulSoup + aiohttp + ransomware.live API |
| **Inteligencia artificial** | OpenAI GPT-4o-mini + FAISS (RAG local offline) |
| **Visualización** | Chart.js (gráficos) + Leaflet (mapas) |
| **CI** | GitHub Actions (pytest + vitest + lint) |

---

## Arquitectura

```mermaid
flowchart LR
    subgraph Browser["Navegador"]
        UI["Next.js 14 UI"]
    end

    subgraph Backend["FastAPI"]
        API["/api/v1/*"]
        OSINT["Servicio OSINT"]
        AI["RAG + OpenAI"]
        SCR["Scraping + Scheduler"]
        KA["K-Anonymity"]
    end

    subgraph Data["Datos"]
        PG["PostgreSQL"]
        RD["Redis"]
    end

    subgraph External["Externo"]
        LO["leakosintapi.com"]
        XON["xposedornot.com"]
        RWL["ransomware.live"]
        OAI["OpenAI API"]
    end

    UI -->|"JWT + REST"| API
    API --> PG
    API --> RD
    OSINT --> LO
    OSINT --> XON
    AI --> OAI
    SCR --> RWL
    SCR --> RD
    KA --> PG
```

---

## Inicio rápido

### Requisitos

- **Node.js** 20+
- **Python** 3.11+
- **Docker** (recomendado para PostgreSQL + Redis)
- Token **OSINT** (LeakOsint) en `backend/.env`

### Opción A — Docker (recomendado)

```bash
# Desde la raíz del repo
cp .env.example .env
# Editar .env → OSINT_TOKEN=tu-token

docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:3000 |
| Backend / Swagger | http://localhost:8000/docs |
| PostgreSQL | localhost:5432 |
| Redis | localhost:6379 |

### Opción B — Desarrollo local

**1. Infraestructura**

```bash
docker compose up postgres redis -d
```

**2. Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Editar backend/.env con OSINT_TOKEN
uvicorn app.main:app --reload --port 8000
```

**3. Frontend**

```bash
cd frontend
npm install
npm run dev
```

**4. Todo en uno (raíz)**

```bash
npm install
npm run dev
```

### Acceso demo

1. Abrir http://localhost:3000
2. Ir a **Login** → **Demo bypass (sin registro)**
3. Explorar Dashboard, Exposure Check, Admin y AI Safety

---

## Configuración

### Backend (`backend/.env`)

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `OSINT_TOKEN` | Sí (Exposure Check) | Token LeakOsint — **solo servidor** |
| `DATABASE_URL` | Sí | `postgresql+asyncpg://leakguard:leakguard@localhost:5432/leakguard` |
| `REDIS_URL` | Sí | `redis://localhost:6379/0` |
| `SECRET_KEY` | Sí | Clave JWT (cambiar en producción) |
| `OPENAI_API_KEY` | No | GPT-4o-mini para AI Safety (fallback offline sin key) |
| `CORS_ORIGINS` | No | Orígenes permitidos (default: localhost:3000) |

### Frontend

| Variable | Descripción |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL del backend (default: `http://localhost:8000`). Next.js reescribe `/api/*` hacia el backend. |

### Docker Compose (`.env` raíz)

```env
OSINT_TOKEN=tu-token
OPENAI_API_KEY=sk-...   # opcional
```

---

## Módulos

| Módulo | Ruta | Descripción |
|--------|------|-------------|
| **Landing** | `/` | Presentación del producto |
| **Login / Registro** | `/login` | JWT + alerta XposedOrNot al iniciar sesión |
| **Dashboard** | `/dashboard` | KPIs, Chart.js, mapa Leaflet, feed de amenazas |
| **Exposure Check** | `/exposure` | Escaneo OSINT censurado + % riesgo + recomendaciones |
| **Threat Details** | `/threats/[id]` | Análisis forense por incidente |
| **Admin Panel** | `/admin` | Cola de verificación humana + audit log (PostgreSQL) |
| **AI Safety** | `/ai-safety` | Métricas de transparencia + análisis RAG |

### Exposure Check incluye

- Porcentaje de riesgo calculado (fórmula ponderada en backend, score 0–99)
- Conteo total de logins / credenciales indexadas
- Tabla completa de registros devueltos por la API (credenciales censuradas)
- Recomendaciones de mitigación (inmediato, 24 h, 7 días)
- Merge con XposedOrNot para búsquedas por email
- Historial de consultas en PostgreSQL (solo `search_type` + hash, sin query en claro)
- K-Anonymity: búsqueda por prefijo de hash SHA-256

### Recolección de inteligencia

- Scraper de **ransomware.live** cada 15 minutos → cache Redis
- Endpoint `GET /api/v1/dashboard/ransomware-feed` para el dashboard
- Scraping genérico por URL (BeautifulSoup / Playwright) vía `POST /api/v1/scrape`

---

## API REST

Documentación interactiva: http://localhost:8000/docs

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/api/v1/auth/register` | — | Registro + alerta de filtración |
| POST | `/api/v1/auth/login` | — | Login JWT |
| POST | `/api/v1/auth/demo` | — | Modo demo |
| GET | `/api/v1/auth/me` | Bearer | Usuario actual |
| GET | `/api/v1/threats` | — | Lista de incidentes |
| GET | `/api/v1/threats/{id}` | — | Detalle de incidente |
| GET | `/api/v1/threats/admin/queue` | Bearer | Cola admin |
| GET | `/api/v1/threats/admin/audits` | Bearer | Audit log |
| POST | `/api/v1/threats/{id}/verify` | Bearer | Verificar / rechazar |
| POST | `/api/v1/exposure/scan` | opcional | Escaneo OSINT |
| GET | `/api/v1/exposure/consulted` | opcional | Historial de consultas (sin PII) |
| GET | `/api/v1/exposure/k-anon/{prefix}` | — | K-Anonymity: hashes por prefijo |
| POST | `/api/v1/exposure/breach-check` | — | XposedOrNot por email |
| GET | `/api/v1/exposure/breaches-recent` | — | Filtraciones públicas recientes |
| GET | `/api/v1/dashboard/kpis` | — | KPIs del dashboard |
| GET | `/api/v1/dashboard/charts` | — | Datos para Chart.js |
| GET | `/api/v1/dashboard/darkweb` | — | Panel dark web / foros |
| GET | `/api/v1/dashboard/ransomware-feed` | — | Víctimas recientes (ransomware.live) |
| GET | `/api/v1/dashboard/ai-safety` | — | Métricas AI Safety |
| POST | `/api/v1/ai/analyze` | Bearer | Análisis RAG |
| POST | `/api/v1/scrape` | Bearer | Scraping (BS4 / Playwright) |

---

## Testing

### Backend (pytest)

```bash
cd backend
source .venv/bin/activate
pip install -r requirements.txt

# Unit tests (sin PostgreSQL)
pytest tests/test_exposure.py tests/test_censor.py tests/test_k_anonymity.py tests/test_scraping.py -v

# Todos los tests (requiere PostgreSQL)
docker compose up postgres redis -d
pytest tests/ -v
```

**Cobertura actual:** 28 unit tests + 9 integration/smoke tests.

### Frontend (vitest)

```bash
cd frontend
npm install
npm test
```

### CI

GitHub Actions ejecuta pytest + vitest + lint en cada push/PR a `main` (ver `.github/workflows/ci.yml`).

---

## Estructura del proyecto

```
leakguard/
├── frontend/                 # Next.js 14 + Tailwind + shadcn/ui
│   ├── src/app/              # App Router (pages)
│   ├── src/components/       # UI, charts, layout
│   ├── src/lib/api.ts        # Cliente REST
│   └── src/lib/k-anonymity.ts
├── backend/                  # FastAPI
│   ├── app/
│   │   ├── api/routes/       # auth, threats, exposure, dashboard, ai
│   │   ├── core/             # config, DB, Redis, JWT, scheduler
│   │   ├── models/           # SQLAlchemy (User, Incident, ConsultedScan, …)
│   │   ├── services/         # osint, breach, censor, exposure, scraping, ai_rag, k_anonymity
│   │   └── data/seed.py      # Datos iniciales
│   ├── tests/                # pytest (exposure, censor, routes, smoke, scraping)
│   ├── conftest.py
│   └── requirements.txt
├── legacy/                   # v1: vanilla JS + Express proxy + Firebase
├── .cursor/rules/            # Reglas del agente Cursor
├── .github/workflows/        # CI (pytest + vitest)
├── docker-compose.yml
├── SDD.md                    # Software Design Document (v3.2)
├── SDD-plan.md               # Backlog de evolución y tareas
├── CHANGELOG.md
└── README.md
```

---

## Legacy v1

La versión anterior (HTML estático + Express + Firebase) está en `legacy/`:

```bash
npm run dev:legacy
# → http://localhost:1337
```

Ver [legacy/README.md](legacy/README.md).

---

## Documentación adicional

| Archivo | Contenido |
|---------|-----------|
| [SDD.md](SDD.md) | Diseño del sistema, módulos (§1–10) y roadmap |
| [SDD-plan.md](SDD-plan.md) | Backlog de evolución con tareas ejecutables (Fases B–E) |
| [CHANGELOG.md](CHANGELOG.md) | Historial de cambios (semver) |
| [backend/README.md](backend/README.md) | Guía del API FastAPI |
| [frontend/README.md](frontend/README.md) | Guía del frontend Next.js |

---

## Seguridad

- `OSINT_TOKEN` solo en `backend/.env` — **nunca** en el frontend ni en Git.
- Contraseñas, emails y teléfonos censurados en el servidor antes de enviar al cliente.
- JWT para autenticación; Redis para cache de sesiones y scraps.
- **K-Anonymity:** consultas almacenadas como hash SHA-256; endpoint `/k-anon/{prefix}` no expone queries en claro.
- Historial `consulted_scans` guarda solo `search_type` + `query_hash` (no el valor buscado).
- `.env`, `backend/.env`, `backend/.venv/` y `legacy/proxy/.env` están en `.gitignore`.

---

<p align="center">
  <strong>LeakGuard</strong> — Inteligencia verificada, proxy seguro, stack preparado para Cursor.
</p>
