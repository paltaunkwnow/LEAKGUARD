/**
 * Servidor local de desarrollo.
 * Sirve la app estática y el proxy /api/scan (token solo en .env del servidor).
 *
 * Uso:
 *   1. Copia .env.example a .env y coloca OSINT_TOKEN
 *   2. npm install && npm start
 *   3. Abre http://localhost:8787
 */
const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8787;
const UPSTREAM = 'https://leakosintapi.com/';

app.use(express.json({ limit: '32kb' }));
app.use(express.static(path.join(__dirname, '..')));

app.post('/api/scan', async (req, res) => {
  const token = process.env.OSINT_TOKEN;
  if (!token) {
    return res.status(503).json({ error: 'OSINT_TOKEN no configurado en proxy/.env' });
  }

  const { request, limit = 500, lang = 'es' } = req.body || {};
  if (!request || typeof request !== 'string' || !request.trim()) {
    return res.status(400).json({ error: 'Parámetro request requerido' });
  }

  const safeLimit = Math.min(10000, Math.max(10, Number(limit) || 500));

  try {
    const upstream = await fetch(UPSTREAM, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        request: request.trim(),
        limit: safeLimit,
        lang: typeof lang === 'string' ? lang : 'es'
      })
    });

    const text = await upstream.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return res.status(502).json({ error: 'Respuesta inválida del motor de indexación' });
    }

    return res.status(upstream.ok ? 200 : upstream.status).json(data);
  } catch {
    return res.status(502).json({ error: 'Motor de indexación no disponible' });
  }
});

app.listen(PORT, () => {
  console.log(`LeakGuard dev server → http://localhost:${PORT}`);
  console.log('Proxy activo en POST /api/scan (token oculto del navegador)');
});
