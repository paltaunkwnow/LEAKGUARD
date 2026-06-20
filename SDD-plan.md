# SDD Plan: Actualizar SDD.md al estado real

## Diagnóstico

El SDD.md actual describe una arquitectura ambiciosa (FastAPI, Playwright, Redis, PostgreSQL, Next.js, Tor, RAG) que **no está implementada**. El proyecto real es un MVP funcional con una arquitectura significativamente diferente. El SDD debe reflejar lo real y separar claramente lo implementado de lo planificado.

## Cambios propuestos

### 1. Renombrar y corregir metadata
- **Nombre:** Cambiar "LeakWatch AI" → **"LeakGuard"** (nombre real del repo)
- **Versión:** Actualizar a reflejar el estado actual (MVP funcional con proxy backend)
- **Stack tecnológico:** Reemplazar completamente la sección 4

### 2. Reescribir Arquitectura General (Sección 2)
**Eliminar** el flujo descrito (Playwright → Redis → FastAPI → PostgreSQL).

**Reemplazar** con la arquitectura real:

```
Browser → Firebase Hosting (SPA) → Cloud Functions / Local Proxy → APIs OSINT externas
                                              ↓
                                    leakosintapi.com (pago)
                                    xposedornot.com (gratis)
```

Incluir diagrama con las 3 capas: frontend (vanilla JS), backend proxy (Firebase Functions + Express), external APIs.

### 3. Reescribir Módulos (Sección 3)

**Módulo 1 - Recolección:** Eliminar toda la sección de scrapers, Tor pool, Playwright. Reemplazar con:
- Fuente de datos: APIs OSINT externas (leakosintapi.com y xposedornot.com)
- Patrón de proxy seguro: el token nunca llega al browser
- Datos de demostración: 8 incidentes mock pre-cargados en app.js

**Módulo 2 - Clasificación:** Eliminar referencia a IA/OpenAI como módulo implementado. Mover a "futuro".
- Lo que SDD llama "Clasificación con IA" → en realidad es un motor de riesgo determinista (puntuación basada en peso de brechas)

**Módulo 3 - Motor de Riesgo:** Mantener pero corregir:
- El riesgo se calcula con fórmula ponderada real: login volume (35%), database count (25%), plaintext passwords (30%), hashed passwords (12%)
- Score 0-99, no 0-100
- Implementado en `app.js` como `calculateRealRiskPercent()`

**Módulo 4 - Resumen Ejecutivo:** Eliminar (no implementado). Mover a roadmap.

**Módulo 5 - Dashboard:** Actualizar:
- No es Next.js → es vanilla JS con Tailwind CDN
- No hay WebSockets → renderizado manual con `renderDashboard()`
- Widgets reales: 4 Chart.js charts, threat feed table, recent breaches widget
- 6 vistas: Landing, Login, Dashboard, Threat Details, Exposure Check, Admin Panel, AI Safety

**Módulo 6 - Búsqueda:** Corregir:
- No hay K-Anonymity implementado actualmente
- La búsqueda es directa contra la API OSINT vía proxy
- Mover K-Anonymity a roadmap como feature futura

**Módulo 7 - Alertas:** Eliminar o marcar como no implementado.

**Módulo 8 - Copiloto RAG:** Eliminar o marcar como no implementado.

**Agregar nuevo módulo - Autenticación:**
- Firebase Auth con modo demo offline (`[offline_bypass_mode]`)
- Session state via `sessionStorage`

**Agregar nuevo módulo - Panel de Admin / Verificación Humana:**
- Human-in-the-loop para verificar/rechazar incidentes
- Audit log in-memory con rationale tracking

**Agregar nuevo módulo - Transparencia IA:**
- Sección dedicada con model accuracy metrics, false positive index
- 5-stage AI decision pipeline visualization
- Risk factor weightings y hallucination prevention safeguards

### 4. Reescribir Estructura de Carpetas (Sección 5)
Reemplazar la estructura sugerida con la estructura real:
```
/leakguard
├── index.html              # SPA shell
├── app.js                  # Frontend engine (~2035 líneas)
├── styles.css              # Glassmorphism cyber theme
├── firebase.json           # Hosting + Functions config
├── .firebaserc             # Firebase project ID
├── config.example.js       # Token config
│
├── proxy/                  # Local dev server
│   ├── server.js           # Express proxy (idéntico a Cloud Functions)
│   ├── package.json        # express + dotenv
│   └── .env.example        # OSINT_TOKEN template
│
└── functions/              # Firebase Cloud Functions
    ├── index.js            # 3 functions: scanProxy, breachCheckProxy, breachesRecentProxy
    └── package.json        # firebase-admin + firebase-functions
```

### 5. Actualizar Plan de Desarrollo (Sección 6)
Convertir de "plan de 48h" a **"Roadmap de Evolución"** con fases:
- **Fase 1 (completado):** MVP con proxy backend, dashboard, exposure check, admin panel
- **Fase 2 (planificado):** Implementar K-Anonymity, scrapers propios, PostgreSQL para histórico
- **Fase 3 (planificado):** IA generativa (resúmenes ejecutivos), RAG copilot, alertas push
- **Fase 4 (planificado):** WebSockets en tiempo real, autenticación real, deploy production

### 6. Actualizar Pitch y Disclaimer (Secciones 7-8)
Ajustar el pitch para reflejar la realidad: plataforma de verificación OSINT con proxy seguro, no un sistema de scraping autónomo.

## Justificación

| Lo que dice el SDD | Lo que tiene el repo | Decisión |
|---|---|---|
| FastAPI + Python | Firebase Cloud Functions (Node.js) | Reemplazar |
| Next.js | Vanilla JS + Tailwind CDN | Reemplazar |
| Playwright + Tor Pool | APIs OSINT externas (leakosintapi, xposedornot) | Reemplazar |
| PostgreSQL + Redis | Sin BD (arrays en memoria) | Mover a roadmap |
| K-Anonymity | Búsqueda directa | Mover a roadmap |
| OpenAI GPT-4o-mini | No implementado | Mover a roadmap |
| WebSockets | Renderizado manual | Mover a roadmap |
| 8 módulos | 6 vistas + auth + admin + AI safety | Reescribir |

El SDD debe ser un documento de referencia para el equipo de desarrollo, no una visión ambiciosa irreconocible. Lo no implementado se preserva como roadmap de evolución, no como arquitectura actual.
