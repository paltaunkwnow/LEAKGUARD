# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

---

## [3.1.0] - 2026-06-20

### Changed (SDD)

- SDD.md v3.1: reescrito con estado honesto por módulo (✅ / ⚠️ / 🔜)
- Separación clara entre implementado, parcial y roadmap
- Módulos 9–11 documentados (auth, admin, AI safety)
- Tabla API REST completa y roadmap por fases
- Corregidas afirmaciones incorrectas (K-Anonymity, Tor, OTX, WebSockets marcados como roadmap)

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
