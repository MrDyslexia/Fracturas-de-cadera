// index.js
require('dotenv').config();

const express = require('express');
const cors = require('cors');

const { connectDB, sequelize } = require('./model/db');
// Registra modelos/asociaciones antes de sincronizar
require('./model/initModels');

// Rutas main (monta todas bajo BASE_PATH)
const { initRoutes } = require('./routes/initRoutes');

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
  credentials: false,
};
app.use(cors(corsOptions));

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
    // En dev: alter opcional; en prod: usa migraciones
    const ALTER = String(process.env.DB_ALTER || '').toLowerCase() === 'true';
    await connectDB({ alter: ALTER }); // { alter: true } solo si DB_ALTER=true

    app.listen(PORT, () => {
      console.log(`🚀 API escuchando en http://localhost:${PORT}${BASE_PATH}`);
      console.log(`🌐 CORS: ${FRONT_ORIGIN}`);
    });
  } catch (e) {
    console.error('❌ No se pudo iniciar:', e);
    process.exit(1);
  }
})();
