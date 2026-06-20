/**
 * Servidor local de desarrollo.
 * Sirve la app estática y proxies seguros (tokens solo en .env del servidor).
 */
const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 8787;
const UPSTREAM = 'https://leakosintapi.com/';

app.use(express.json({ limit: '32kb' }));

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

app.post('/api/breach-check', async (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Email válido requerido' });
  }

  const encoded = encodeURIComponent(email.trim());

  try {
    const [checkRes, analyticsRes] = await Promise.allSettled([
      fetch(`https://api.xposedornot.com/v1/check-email/${encoded}?details=true`),
      fetch(`https://api.xposedornot.com/v1/breach-analytics?email=${encoded}`)
    ]);

    let checkData = null;
    let analyticsData = null;

    if (checkRes.status === 'fulfilled' && checkRes.value.ok) {
      checkData = await checkRes.value.json();
    } else if (checkRes.status === 'fulfilled' && checkRes.value.status === 404) {
      checkData = { Error: 'Not found', email: email.trim() };
    }

    if (analyticsRes.status === 'fulfilled' && analyticsRes.value.ok) {
      analyticsData = await analyticsRes.value.json();
    }

    return res.json({
      source: 'xposedornot',
      check: checkData,
      analytics: analyticsData
    });
  } catch {
    return res.status(502).json({ error: 'Servicio OSINT gratuito no disponible' });
  }
});

app.get('/api/breaches-recent', async (_req, res) => {
  try {
    const upstream = await fetch('https://api.xposedornot.com/v1/breaches');
    if (!upstream.ok) {
      return res.status(upstream.status).json({ error: 'No se pudo obtener el índice de filtraciones' });
    }
    const data = await upstream.json();
    return res.json({ source: 'xposedornot', breaches: data });
  } catch {
    return res.status(502).json({ error: 'Servicio OSINT gratuito no disponible' });
  }
});

app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`LeakGuard dev server → http://localhost:${PORT}`);
  console.log('Proxy: POST /api/scan · POST /api/breach-check · GET /api/breaches-recent');
});
