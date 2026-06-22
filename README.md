<p align="center">
  <img src="https://img.shields.io/badge/LeakGuard-v3.5-00F5FF?style=for-the-badge&labelColor=040B14&borderColor=00F5FF" alt="LeakGuard" />
  <img src="https://img.shields.io/badge/Gemini_2.5_Flash-Inside-7C3AED?style=for-the-badge&labelColor=040B14" alt="Gemini" />
  <img src="https://img.shields.io/badge/Terms_%26_Conditions-ES%20%7C%20EN%20%7C%20RU%20%7C%20HE-00C853?style=for-the-badge&labelColor=040B14" alt="T&C" />
</p>

<h1 align="center">🛡️ LeakGuard</h1>

<p align="center">
  Plataforma unificada de <strong>Threat Intelligence</strong> y verificación de filtraciones OSINT de grado corporativo. Diseñada con proxy seguro, análisis de riesgo heurístico, encriptación local y un asistente inteligente basado en <strong>Gemini 2.5 Flash</strong>.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_14-App_Router-000?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python_3.11-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/PostgreSQL-Data_Seed-316192?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Redis-Mock_Engine-DC382D?style=flat-square&logo=redis&logoColor=white" alt="Redis" />
  <img src="https://img.shields.io/badge/pytest-28_unit_tests-0A9EDC?style=flat-square&logo=pytest&logoColor=white" alt="pytest" />
  <img src="https://img.shields.io/badge/Lucide_Icons-Premium_UI-7C3AED?style=flat-square" alt="Lucide" />
</p>

---

## 🗂️ Tabla de Contenidos

- [Descripción](#descripción)
- [Novedades en v3.5.0](#novedades-en-v350)
- [Stack Tecnológico](#stack-tecnológico)
- [Arquitectura](#arquitectura)
- [Inicio Rápido](#inicio-rápido)
- [Configuración de Entorno](#configuración-de-entorno)
- [Seguridad & Privacidad](#seguridad--privacidad)
- [Términos y Condiciones](#términos-y-condiciones)
- [Contribuidores](#contribuidores)

---

## 📖 Descripción

**LeakGuard** proporciona a analistas y equipos de ciberseguridad una consola centralizada para monitorear y mitigar filtraciones de credenciales.

### Características principales:
- **Proxy Seguro:** El navegador del cliente nunca interactúa directamente con proveedores OSINT de pago, previniendo fugas de claves de API.
- **Iconografía Profesional:** Interfaz corporativa basada exclusivamente en componentes **Lucide-react** con badges de países (`[AR]`, `[CL]`, `[BO]`, etc.).
- **Asistente IA (Gemini 2.5 Flash):** Chat interactivo para profundizar en mitigaciones e impacto técnico directamente con la IA de Google.
- **K-Anonymity:** Buscador seguro mediante hash SHA-256 truncado para proteger la privacidad del usuario al escanear.
- **Términos y Condiciones Multiidioma:** Cobertura legal en Español, Inglés, Ruso y Hebreo con marco jurisdiccional de EE. UU.

---

## 🔥 Novedades en v3.5.0

1. **Términos & Condiciones Legales Multiidioma:** Página completa de T&C con 5 secciones legales (Propósito, Neutralidad, Censura, Privacidad, Jurisdicción) disponibles en **ES · EN · RU · HE**.
2. **Modal de Aceptación en Login:** Checkbox obligatorio en el formulario de inicio de sesión que despliega los T&C en modal. No se permite acceder sin aceptación explícita.
3. **Sección de Contribuidores en Landing:** Footer actualizado con los perfiles GitHub de todos los colaboradores del proyecto.
4. **Canvas de Iconos Profesionales:** El fondo animado del landing page ahora usa iconos vectoriales dibujados a mano (Shield, Lock, Key, Radar, Hexagon) en lugar de texto ASCII.
5. **Corrección de Caché Next.js:** Resolución del error `MODULE_NOT_FOUND` por chunks corruptos en `.next`.

### Versión anterior — v3.4.0

1. **Google Gemini 2.5 Flash Nativo:** Eliminación de los wrappers de OpenAI SDK para conectar directamente mediante REST (`httpx`) con el endpoint oficial de Google Generative Language.
2. **Chat Assistant en AI Safety:** Panel conversacional interactivo con RAG (FAISS) + Gemini en tiempo real.
3. **Expansión LATAM:** Seeding extendido con filtraciones para **Bolivia**, **Brasil**, **Perú**, **Colombia** y **México**.
4. **Emoji-Free UI:** Reemplazo integral de emojis por badges de diseño premium.
5. **Cero Fugas de Auth:** Control de peticiones asíncronas para evitar llamadas 401 antes de resolver el estado de autenticación.
6. **Bypass de Bcrypt local:** Solución para incompatibilidades en registro local mediante `bcrypt` puro.

---

## 💻 Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| **Backend** | Python 3.11 + FastAPI (async nativo), pytest |
| **Base de Datos** | PostgreSQL (Auditoría, Incidentes, Logs, Usuarios) |
| **Cache & Colas** | Redis (Cache de feed ransomware y estado de APIs) |
| **Inteligencia Artificial** | Gemini 2.5 Flash + FAISS (RAG Local y Offline en fallback) |
| **Monitoreo & OSINT** | Playwright + BeautifulSoup + leakosintapi.com |
| **i18n Legal** | Español · English · Русский · עברית |

---

## 🏗️ Arquitectura

```mermaid
flowchart TD
    subgraph Cliente["Frontend (Next.js 14)"]
        UI["UI Console"]
        Chat["Gemini 2.5 Chat UI"]
        TC["T&C Modal (ES/EN/RU/HE)"]
    end

    subgraph Servidor["Backend (FastAPI)"]
        API["REST Routes"]
        OSINT["Servicio OSINT"]
        AI["RAG Engine (FAISS)"]
        DirectGemini["REST Gemini Client"]
    end

    subgraph BD["Persistencia"]
        PG["PostgreSQL"]
        RD["Redis Cache"]
    end

    subgraph Proveedores["Servicios Externos"]
        LO["leakosintapi.com"]
        GEM["Gemini 2.5 API"]
    end

    UI --> API
    Chat --> API
    TC --> UI
    API --> PG
    API --> RD
    OSINT --> LO
    AI --> DirectGemini
    DirectGemini --> GEM
```

---

## 🚀 Inicio Rápido

### Opción A — Ejecución con Docker (Recomendado)

1. Crea las variables de entorno copiando el archivo `.env.example`:
   ```bash
   cp .env.example .env
   ```
2. Configura tu token OSINT y tu clave API de Gemini:
   ```env
   OSINT_TOKEN=tu_token_leakosint
   OPENAI_API_KEY=tu_clave_api_gemini
   ```
3. Construye y levanta los servicios:
   ```bash
   docker compose up --build
   ```
4. Accede a la interfaz web en: **`http://localhost:3000`**

### Opción B — Desarrollo Local Manual

**1. Levantar PostgreSQL y Redis:**
```bash
docker compose up postgres redis -d
```

**2. Iniciar el Backend:**
```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# Edita tu archivo .env con las API Keys correspondientes
uvicorn app.main:app --reload --port 8000
```

**3. Iniciar el Frontend:**
```bash
cd frontend
npm install
npm run dev
```

---

## ⚙️ Configuración de Entorno

### Backend `.env`
- `OSINT_TOKEN`: Token de acceso para `leakosintapi.com`.
- `OPENAI_API_KEY`: Clave de API de Gemini 2.5 Flash (soporta prefijos `AQ.` e `AIzaSy`).
- `DATABASE_URL`: URI de conexión asíncrona de PostgreSQL (`postgresql+asyncpg://`).
- `REDIS_URL`: URI de conexión a Redis (o `mock` para desarrollo sin Redis).

---

## 🔒 Seguridad & Privacidad

1. **Anonimato en Búsquedas:** Las consultas se registran únicamente como hash SHA-256 (`query_hash`). No almacenamos búsquedas en texto plano ni direcciones IP.
2. **Censura en Servidor:** Contraseñas y credenciales sensibles se ofuscan en el backend (`*****`) antes de ser enviadas al cliente.
3. **Control de JWT:** Sesión protegida mediante firmas HS256 locales.
4. **Sin Venta de Datos:** Los datos de registro (nombre y correo) se usan exclusivamente para notificar al usuario sobre filtraciones detectadas. No se comercializan ni comparten con terceros.

---

## ⚖️ Términos y Condiciones

LeakGuard opera bajo los principios legales de **plataforma intermediaria** conforme al marco de la **Section 230 del Communications Decency Act (EE. UU.)** y prácticas similares a las de plataformas de inteligencia OSINT como IntelX.

### Puntos clave:
- 🔍 **Solo información pública:** LeakGuard indexa y presenta datos que ya son públicamente accesibles en internet. No participamos ni facilitamos hackeos o filtraciones.
- 🚫 **Sin responsabilidad por filtraciones:** La plataforma no es responsable del origen de los datos filtrados. La responsabilidad de su uso recae exclusivamente en el usuario.
- 🔐 **Contraseñas censuradas:** Todas las contraseñas en texto plano son automáticamente ofuscadas antes de ser mostradas.
- 🌐 **Jurisdicción:** Cualquier disputa legal se rige bajo la ley del Estado de **Delaware, EE. UU.**
- 📄 **Idiomas disponibles:** Español · English · Русский · עברית

> Ver página completa en: `/terms`

---

## 👥 Contribuidores

<table align="center">
  <tr>
    <td align="center">
      <a href="https://github.com/paltaunkwnow">
        <img src="https://avatars.githubusercontent.com/paltaunkwnow?v=4&s=80" width="80" style="border-radius:50%" alt="paltaunkwnow"/><br/>
        <sub><b>@paltaunkwnow</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/emilio-garcia-ie">
        <img src="https://avatars.githubusercontent.com/emilio-garcia-ie?v=4&s=80" width="80" style="border-radius:50%" alt="emilio-garcia-ie"/><br/>
        <sub><b>@emilio-garcia-ie</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/invertilo">
        <img src="https://avatars.githubusercontent.com/invertilo?v=4&s=80" width="80" style="border-radius:50%" alt="invertilo"/><br/>
        <sub><b>@invertilo</b></sub>
      </a>
    </td>
    <td align="center">
      <a href="https://github.com/fernandocastedo">
        <img src="https://avatars.githubusercontent.com/fernandocastedo?v=4&s=80" width="80" style="border-radius:50%" alt="fernandocastedo"/><br/>
        <sub><b>@fernandocastedo</b></sub>
      </a>
    </td>
  </tr>
</table>


---

<p align="center">
  Diseñado con pasión para mitigar riesgos en Latinoamérica. <strong>LeakGuard © 2026</strong>.
</p>
