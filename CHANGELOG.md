# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [3.3.0] - 2026-06-20

### Added

- **Fase B (SDD-plan):** pytest suite (28 tests), vitest frontend (2 tests), GitHub Actions CI
- **Fase C parcial:** K-Anonymity (`/api/v1/exposure/k-anon/{prefix}`), `query_hash` en consulted_scans
- Scraper ransomware.live con cache Redis y scheduler cada 15 min
- Endpoint `GET /api/v1/dashboard/ransomware-feed`

### Changed

- `consulted_scans` ya no guarda la query en texto claro (solo `search_type` + hash)
- SDD-plan actualizado con estado de ejecución por tarea

---

### Fixed

- SDD.md: numeración de secciones corregida (§1–10 secuencial, antes saltaba §6 y §8)
- `testing.mdc`: actualizado de v1 (`functions/`, `app.js`) a v2 (`backend/`, `frontend/`, pytest/vitest)
- `git-commits-prs.mdc`: secretos y checklist PR actualizados a rutas v2
- `sdd-documentation.mdc`: referencia de versión actualizada a v3.2

### Changed (SDD-plan)

- SDD-plan.md reescrito con instrucciones paso a paso para cada tarea (B1–E4)
- Incluye código de ejemplo, imports, mocks, assertions y comandos exactos
- Diseñado para ser ejecutable por cualquier agente de código sin contexto previo

---

## [3.1.0] - 2026-06-20

### Changed (SDD)

- SDD.md v3.1: reescrito con estado honesto por módulo (✅ / ⚠️ / 🔜)
- Separación clara entre implementado, parcial y roadmap
- Módulos 9–11 documentados (auth, admin, AI safety)
- Tabla API REST completa y roadmap por fases
- Corregidas afirmaciones incorrectas (K-Anonymity, Tor, OTX, WebSockets marcados como roadmap)

### Changed (SDD-plan)

- SDD-plan.md reescrito como backlog de evolución (Fases B–E)
- Brechas conocidas, tareas accionables con archivos y criterios de aceptación
- Plan de alineación marcado como completado

---

## [3.0.0] - 2026-06-20

### Added — Stack v2 (migración completa)

- **Frontend:** Next.js 14 App Router, Tailwind CSS, shadcn/ui, Chart.js, Leaflet
- **Backend:** FastAPI (Python 3.11), SQLAlchemy async, JWT auth
- **PostgreSQL:** usuarios, incidentes, audit log, historial de consultas OSINT
- **Redis:** cache de scraps y sesiones
- **Servicios:** OSINT proxy, XposedOrNot, censura de credenciales, cálculo de riesgo
- **Scraping:** Playwright + BeautifulSoup + aiohttp (endpoint `/api/v1/scrape`)
- **IA:** OpenAI GPT-4o-mini + FAISS RAG offline (`/api/v1/ai/analyze`)
- **Docker Compose:** postgres, redis, backend, frontend
- Páginas: landing, login, dashboard, exposure, threats/[id], admin, ai-safety
- Alertas de filtración al login/registro vía XposedOrNot
- Demo bypass sin registro

### Changed

- App vanilla movida a `legacy/` (index.html, app.js, proxy Express, Firebase Functions)
- README.md reescrito para el stack v2
- SDD.md alineado con arquitectura implementada

### Security

- Token OSINT centralizado en `backend/.env` (no expuesto al browser)
- `.gitignore` actualizado para `backend/.env` y `legacy/proxy/.env`

---

## [2.1.0] - 2026-06-20

### Added (SDD)

- Section 9: Testing and Code Quality — unit tests, smoke tests, code agent strategy

---

## [2.0.0] - 2026-06-20

### Added (SDD)

- Initial SDD draft with 8 modules and target stack

---

## [1.0.0] - 2026-06-20

### Added (MVP v1 — legacy)

- Vanilla JS SPA with Tailwind CDN and Chart.js
- Express proxy + Firebase Cloud Functions for OSINT APIs
- Exposure Check with censored credentials and risk scoring
- Dashboard, Threat Details, Admin Panel, AI Safety (mock metrics)
- Login breach alerts via XposedOrNot
