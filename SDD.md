# SDD: LeakGuard

**Versión:** 3.1 (Alineado con código real)  
**Estado:** Documento sincronizado con `frontend/` + `backend/` + `legacy/`  
**Objetivo:** Plataforma de threat intelligence OSINT con proxy seguro, riesgo explicable y verificación humana.  
**Repositorio:** https://github.com/paltaunkwnow/LEAKGUARD

---

## Historial de Versiones

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 3.1 | 2026-06-20 | Equipo LeakGuard | SDD reescrito: estado honesto por módulo (implementado / parcial / roadmap). |
| 3.0 | 2026-06-20 | Equipo LeakGuard | Migración a Next.js 14 + FastAPI + PostgreSQL + Redis. |
| 2.1 | 2026-06-20 | Equipo LeakGuard | Sección 9: Testing y Calidad de Código. |
| 2.0 | 2026-06-20 | Equipo LeakGuard | Draft inicial con 8 módulos y stack objetivo. |
| 1.0 | 2026-06-20 | Equipo LeakGuard | MVP v1 vanilla JS + Firebase (ahora en `legacy/`). |

Ver el historial completo en [CHANGELOG.md](CHANGELOG.md). Plan de alineación completado: [SDD-plan.md](SDD-plan.md).

**Leyenda de estado:** ✅ Implementado · ⚠️ Parcial · 🔜 Roadmap

---

## 1. Introducción y Filosofía del Proyecto

### 1.1. El Problema
- Las filtraciones de datos aparecen en foros criminales, blogs de ransomware y marketplaces ocultos.
- La información está dispersa, es técnica y difícil de interpretar.
- Herramientas opacas comercializan datos robados sin transparencia ni trazabilidad legal.

### 1.2. Nuestra Solución

#### ✅ Implementado hoy
- **Proxy OSINT seguro:** FastAPI consulta `leakosintapi.com` y `xposedornot.com`; `OSINT_TOKEN` solo en `backend/.env`.
- **Censura server-side:** Contraseñas, emails, teléfonos y hashes censurados antes de llegar al browser (`services/censor.py`).
- **Riesgo explicable:** Score 0–99 con fórmula ponderada en `services/exposure.py`.
- **Verificación humana:** Admin panel con cola de incidentes y audit log en PostgreSQL.
- **Auth JWT:** Registro, login, demo bypass; alerta XposedOrNot al registrarse/iniciar sesión.

#### 🔜 Visión / roadmap
- Scraping autónomo de blogs ransomware y foros (.onion) con Tor pool.
- K-Anonymity (estilo HIBP) para búsquedas anónimas.
- Verificación cruzada con OTX y Ransomware.live.
- Alertas push (Telegram, Slack, email).
- WebSockets para feed en tiempo real.

---

## 2. Arquitectura General (v3.1 — implementada)

```
Browser (Next.js 14, puerto 3000)
    ↓ REST + JWT (Bearer)
FastAPI Backend (puerto 8000, /api/v1/*)
    ├── PostgreSQL → users, incidents, audit_logs, consulted_scans
    ├── Redis → cache de scraps (TTL 30 min)
    ├── leakosintapi.com (OSINT_TOKEN en servidor)
    ├── xposedornot.com (gratis, breach-check)
    └── OpenAI GPT-4o-mini (opcional, fallback offline)
```

**Flujo Exposure Check:**
1. Frontend envía `{ request, mode, limit, lang }` a `POST /api/v1/exposure/scan`.
2. Backend consulta LeakOsint con token en servidor.
3. Si es email, merge con XposedOrNot (`merge_xon_records`).
4. Backend censura credenciales, calcula riesgo y recomendaciones.
5. Persiste consulta en PostgreSQL (`consulted_scans`).

**Infraestructura:** `docker-compose.yml` levanta postgres, redis, backend y frontend.

**Legacy v1:** SPA vanilla + Express/Firebase en `legacy/` (`npm run dev:legacy` → puerto 1337).

---

## 3. Módulos Detallados

### Módulo 1: Recolección de Inteligencia — ⚠️ Parcial

| Aspecto | Estado |
|---------|--------|
| Endpoint `POST /api/v1/scrape` (BeautifulSoup + aiohttp) | ✅ |
| Scraping dinámico con Playwright (`scrape_dynamic`) | ✅ (requiere `playwright install chromium`) |
| Cache Redis para resultados de scrape | ✅ |
| Scrapers de blogs ransomware / foros criminales | 🔜 |
| Tor pool, cron cada 15 min, metadatos actor/víctima | 🔜 |

**Implementación actual:** `backend/app/services/scraping.py` — scrape genérico por URL (título, preview de texto, links). No rastrea fuentes criminales de forma autónoma.

**Datos de threat feed:** Incidentes seed en `backend/app/data/seed.py` → PostgreSQL al arrancar.

---

### Módulo 2: Clasificación y Verificación con IA — ⚠️ Parcial

| Aspecto | Estado |
|---------|--------|
| `POST /api/v1/ai/analyze` (RAG + GPT-4o-mini) | ✅ |
| Fallback offline sin `OPENAI_API_KEY` | ✅ |
| Verificación OTX / Ransomware.live | 🔜 |
| Clasificación automática de incidentes al scrapear | 🔜 |

**Implementación actual:** `backend/app/services/ai_rag.py` — 4 documentos RAG embebidos; FAISS con vectores simplificados; respuesta vía OpenAI o template offline.

---

### Módulo 3: Motor de Riesgo Explicable — ✅ Implementado

**Ubicación:** `backend/app/services/exposure.py` → `calculate_real_risk_percent()`

**Fórmula (score 0–99):**
- Volumen de logins: hasta 35 pts (`log10(n+1) * 15`)
- Bases con hits: hasta 25 pts (`db_count * 4`)
- Contraseñas en texto claro: hasta 30 pts (`plaintext * 6`)
- Hashes: hasta 12 pts (`hashed * 2`)
- Umbrales mínimos por volumen (5 / 20 / 50 logins) y plaintext ≥ 3

**Niveles:** Crítico (≥80), Alto (≥60), Moderado (≥35), Bajo (<35).

**UI:** Barra de progreso y badge en `/exposure` (Next.js).

---

### Módulo 4: Resumen Ejecutivo — ⚠️ Parcial

| Aspecto | Estado |
|---------|--------|
| Análisis en lenguaje natural vía `/api/v1/ai/analyze` | ✅ |
| Prompt dedicado “máx. 20 palabras” + JSON estructurado | 🔜 |
| Cache semántico por actor/sector/tamaño | 🔜 |

---

### Módulo 5: Dashboard — ✅ Implementado (sin tiempo real)

**Frontend:** Next.js 14 + Tailwind + shadcn/ui en `frontend/src/app/dashboard/`.

**Widgets:**
- KPIs: amenazas hoy, críticas, verificadas, pendientes, actores, sectores
- Chart.js: sectores, estado de riesgo, verificación
- Leaflet: mapa geográfico (`threat-map.tsx`)
- Tabla feed de amenazas + panel dark web (`GET /api/v1/dashboard/darkweb`)

**Backend:** `backend/app/api/routes/dashboard.py`

**No implementado:** WebSockets / SSE para live log de scraping.

---

### Módulo 6: Búsqueda de Exposición — ✅ Implementado (sin K-Anonymity)

**Rutas:**
- `POST /api/v1/exposure/scan` — dominio, email o teléfono
- `POST /api/v1/exposure/breach-check` — XposedOrNot por email
- `GET /api/v1/exposure/breaches-recent` — índice público reciente
- `GET /api/v1/exposure/consulted` — historial de consultas

**Modos:** domain, email, phone (`detect_search_type`).

**K-Anonymity (roadmap):** Hoy la búsqueda es directa y las consultas se guardan en `consulted_scans` (no anónimo).

---

### Módulo 7: Alertas — ⚠️ Parcial

| Aspecto | Estado |
|---------|--------|
| Alerta XposedOrNot al login/registro | ✅ |
| Telegram / Discord / Slack / email push | 🔜 |
| Disparador por criticidad Alta en PostgreSQL | 🔜 |

---

### Módulo 8: Copiloto RAG — ⚠️ Parcial

**Endpoint:** `POST /api/v1/ai/analyze` (requiere JWT).

**Implementación:** RAG con 4 casos embebidos + GPT-4o-mini o respuesta offline.

**Roadmap:** 50 casos de estudio, chat UI dedicado, embeddings reales.

---

### Módulo 9: Autenticación — ✅ Implementado

**Rutas:** `/api/v1/auth/register`, `/login`, `/demo`, `/me`

**Frontend:** `frontend/src/contexts/auth-context.tsx` — JWT en `localStorage`.

**Demo bypass:** Login sin registro para demos de hackathon.

---

### Módulo 10: Admin / Verificación Humana — ✅ Implementado

**Rutas:**
- `GET /api/v1/threats/admin/queue`
- `GET /api/v1/threats/admin/audits`
- `POST /api/v1/threats/{id}/verify` (verify | reject + reason)

**Persistencia:** `incidents`, `audit_logs` en PostgreSQL.

**Frontend:** `frontend/src/app/admin/page.tsx`

---

### Módulo 11: AI Safety y Transparencia — ✅ Implementado

**Ruta:** `GET /api/v1/dashboard/ai-safety`

**Métricas:** verification rate, false positive rate, avg confidence (calculadas desde incidentes).

**Frontend:** `frontend/src/app/ai-safety/page.tsx`

---

## 4. Stack Tecnológico

| Capa | Tecnología | Estado |
|------|------------|--------|
| Frontend | Next.js 14, TypeScript, Tailwind, shadcn/ui | ✅ |
| Backend | Python 3.11, FastAPI, SQLAlchemy async | ✅ |
| Base de datos | PostgreSQL 16 | ✅ |
| Cache | Redis 7 | ✅ |
| OSINT | leakosintapi.com + xposedornot.com | ✅ |
| Scraping | BeautifulSoup + aiohttp + Playwright (opcional) | ⚠️ |
| IA | OpenAI GPT-4o-mini + FAISS simplificado | ⚠️ |
| Visualización | Chart.js, Leaflet | ✅ |
| Legacy v1 | Vanilla JS + Express + Firebase | ✅ (`legacy/`) |

**Roadmap:** Tor pool, K-Anonymity, WebSockets, alertas push, OTX/Ransomware.live.

---

## 5. Estructura de Carpetas

```
/leakguard
├── frontend/                 # Next.js 14 App Router
│   ├── src/app/              # /, /login, /dashboard, /exposure, /admin, /ai-safety, /threats/[id]
│   ├── src/components/       # UI, charts, layout, auth
│   └── src/lib/api.ts        # Cliente REST
├── backend/
│   ├── app/
│   │   ├── api/routes/       # auth, threats, exposure, dashboard, ai (+ scrape)
│   │   ├── core/             # config, database, redis, security (JWT)
│   │   ├── models/           # User, Incident, AuditLog, ConsultedScan
│   │   ├── services/         # osint, breach, censor, exposure, scraping, ai_rag
│   │   ├── data/seed.py      # Incidentes y dark web seed
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── legacy/                   # v1: index.html, app.js, proxy/, functions/
├── .cursor/rules/            # Reglas del agente Cursor
├── docker-compose.yml
├── package.json              # npm run dev (frontend + backend)
├── SDD.md
├── SDD-plan.md
├── CHANGELOG.md
└── README.md
```

---

## 6. Roadmap de Evolución

### Fase 1 — Completada ✅
- Stack v2: Next.js + FastAPI + PostgreSQL + Redis + Docker Compose
- Exposure Check con proxy seguro, censura y riesgo explicable
- Dashboard, Admin, AI Safety, JWT auth
- Legacy v1 preservado en `legacy/`

### Fase 2 — En progreso ⚠️
- Scrapers autónomos de fuentes criminales
- Tests unitarios y smoke tests (SDD §9)
- K-Anonymity para búsquedas

### Fase 3 — Planificada 🔜
- Verificación OTX / Ransomware.live
- Resúmenes ejecutivos con cache semántico
- Alertas push (Telegram, Slack, email)

### Fase 4 — Planificada 🔜
- WebSockets / SSE para feed en tiempo real
- Tor pool para .onion
- Deploy producción (Vercel + Railway/Cloud Run)

---

## 7. API REST (referencia)

Documentación interactiva: `http://localhost:8000/docs`

| Método | Ruta | Auth | Descripción |
|--------|------|------|-------------|
| GET | `/health` | — | Health check |
| POST | `/api/v1/auth/register` | — | Registro + alerta breach |
| POST | `/api/v1/auth/login` | — | Login JWT |
| POST | `/api/v1/auth/demo` | — | Modo demo |
| GET | `/api/v1/auth/me` | Bearer | Usuario actual |
| GET | `/api/v1/threats` | — | Lista incidentes |
| GET | `/api/v1/threats/{id}` | — | Detalle incidente |
| GET | `/api/v1/threats/admin/queue` | Bearer | Cola admin |
| POST | `/api/v1/threats/{id}/verify` | Bearer | Verificar / rechazar |
| POST | `/api/v1/exposure/scan` | opcional | Escaneo OSINT |
| GET | `/api/v1/exposure/consulted` | opcional | Historial consultas |
| POST | `/api/v1/exposure/breach-check` | — | XposedOrNot |
| GET | `/api/v1/exposure/breaches-recent` | — | Breaches recientes |
| GET | `/api/v1/dashboard/kpis` | — | KPIs |
| GET | `/api/v1/dashboard/charts` | — | Datos Chart.js |
| GET | `/api/v1/dashboard/darkweb` | — | Panel dark web |
| GET | `/api/v1/dashboard/ai-safety` | — | Métricas AI Safety |
| POST | `/api/v1/ai/analyze` | Bearer | Análisis RAG |
| POST | `/api/v1/scrape` | Bearer | Scrape URL |

---

## 9. Testing y Calidad de Código

### 9.1. Unit Tests (objetivo)
**Backend (`pytest`):**
- `services/exposure.py` — `calculate_real_risk_percent()`, `parse_osint_response()`
- `services/censor.py` — censura de passwords, emails, hashes
- `api/routes/exposure.py` — validación inputs, 503 sin `OSINT_TOKEN`

**Frontend (`vitest`):**
- `src/lib/api.ts` y utilidades puras

**Legacy:** Jest para `legacy/app.js` (referencia v1).

### 9.2. Smoke Tests
- `GET /health` → 200
- `GET /api/v1/threats` → lista de incidentes
- Frontend carga `/dashboard` sin 5xx
- `POST /api/v1/exposure/scan` responde (503 si falta token)

### 9.3. Estrategia del Agente de Código
- Todo PR con lógica nueva debe incluir tests.
- Cobertura mínima objetivo: 70% backend, 50% frontend.
- No commitear `OSINT_TOKEN`, `backend/.env` ni secretos.

---

## 10. Pitch Final (30 segundos)

"Mientras herramientas opacas comercializan datos filtrados en secreto, **LeakGuard** es transparente y seguro. Consultamos índices OSINT con proxy FastAPI — el token nunca llega al navegador —, censuramos credenciales, calculamos riesgo explicable y permitimos verificación humana con audit trail en PostgreSQL. Nuestra IA (GPT-4o-mini + RAG offline) traduce incidentes a recomendaciones accionables. De filtraciones dispersas a inteligencia verificada en segundos."

---

## 11. Descargo de Responsabilidad Legal (Footer)

"LeakGuard indexa metadatos de filtraciones públicas vía APIs OSINT. No almacenamos ni mostramos credenciales en texto claro — solo representaciones censuradas. La información se proporciona con fines de concienciación y seguridad. Verifique la autenticidad de las fuentes directamente."
