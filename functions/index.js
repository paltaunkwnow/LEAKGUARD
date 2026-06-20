const { onRequest } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const osintToken = defineSecret('OSINT_TOKEN');
const UPSTREAM_URL = 'https://leakosintapi.com/';

function setCors(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}

exports.scanProxy = onRequest(
  { secrets: [osintToken], cors: true, maxInstances: 10 },
  async (req, res) => {
    setCors(res);

    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    const { request, limit = 500, lang = 'es' } = req.body || {};

    if (!request || typeof request !== 'string' || !request.trim()) {
      return res.status(400).json({ error: 'Parámetro request requerido' });
    }

    const token = osintToken.value();
    if (!token) {
      return res.status(503).json({ error: 'Servicio de escaneo no configurado' });
    }

    const safeLimit = Math.min(10000, Math.max(10, Number(limit) || 500));

    try {
      const upstream = await fetch(UPSTREAM_URL, {
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
  }
);

exports.breachCheckProxy = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    setCors(res);

    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

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

      return res.json({ source: 'xposedornot', check: checkData, analytics: analyticsData });
    } catch {
      return res.status(502).json({ error: 'Servicio OSINT gratuito no disponible' });
    }
  }
);

exports.breachesRecentProxy = onRequest(
  { cors: true, maxInstances: 5 },
  async (req, res) => {
    setCors(res);

    if (req.method === 'OPTIONS') {
      return res.status(204).send('');
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
      const upstream = await fetch('https://api.xposedornot.com/v1/breaches');
      if (!upstream.ok) {
        return res.status(upstream.status).json({ error: 'No se pudo obtener el índice' });
      }
      const data = await upstream.json();
      return res.json({ source: 'xposedornot', breaches: data });
    } catch {
      return res.status(502).json({ error: 'Servicio OSINT gratuito no disponible' });
    }
  }
);
