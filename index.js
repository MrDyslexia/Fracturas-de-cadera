// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { connectDB, sequelize } = require('./model/db');
require('./model/initModels');

const { initRoutes } = require('./routes/initRoutes');
const { verifyMailTransport } = require('./utils/mailer'); // 👈 AÑADIDO

const app = express();

// ---------- Config ----------
const PORT = Number(process.env.PORT) || 3001;             // backend en 3001
const BASE_PATH = process.env.API_BASE || '/api/v1';
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000';

// Body parsing
app.use(express.json({ limit: '1mb' }));

// CORS (Next.js en 3000)
const corsOptions = {
  origin: [FRONT_ORIGIN],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Origin', req.headers.origin || FRONT_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
// ---------- Healthcheck ----------
app.get('/health', async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, db: 'up' });
  } catch {
    return res.status(500).json({ ok: false, db: 'down' });
  }
});

// ---------- Rutas ----------
initRoutes(app, BASE_PATH); // p.ej. /api/v1/login, /api/v1/register, /api/v1/...

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({ error: err.message || 'Server Error' });
});

// ---------- Boot ----------
(async () => {
  try {
    const ALTER = String(process.env.DB_ALTER || '').toLowerCase() === 'true';
    await connectDB({ alter: ALTER });

    // 👇 inicializa el mailer (imprime las credenciales de Ethereal en consola)
    await verifyMailTransport();

    app.listen(PORT, () => {
      console.log(`🚀 API escuchando en http://localhost:${PORT}${BASE_PATH}`);
      console.log(`🌐 CORS: ${FRONT_ORIGIN}`);
    });
  } catch (e) {
    console.error('❌ No se pudo iniciar:', e);
    process.exit(1);
  }
})();
