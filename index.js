// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser'); 
const bcrypt = require('bcryptjs');

const { connectDB, sequelize } = require('./model/db');
const modelos = require('./model/initModels');

const { initRoutes } = require('./routes/initRoutes');
const { verifyMailTransport } = require('./utils/mailer'); 

const app = express();

// ---------- Config ----------
const PORT = Number(process.env.PORT) || 3001;            
const BASE_PATH = process.env.API_BASE || '/api/v1';
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || 'http://localhost:3000';
// Body parsing
// parsers
app.use(cookieParser());    
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
app.get('/', async (_req, res) => {
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
    const Usuario = modelos.User; // <-- Usa el modelo correcto según tu initModels.js
    const adminEmail = process.env.ADMIN_EMAIL || 'Admin@admin.com';
    const pass=await bcrypt.hash('Clave123', 10)
    const [admin, created] = await Usuario.findOrCreate({
      where: { correo: adminEmail }, // <-- Asegúrate de que el campo coincida con tu modelo
      defaults: {
        nombres: "Admin",
        apellido_paterno: "Admin",
        apellido_materno: "Admin",
        correo: adminEmail,
        rut: "111111111",
        password_hash: pass,
        telefono: 12341234,
        sexo: "M",
        fecha_nacimiento: "2001-01-01",
      },
    });

    if (created) {
      console.log(`✅ Usuario administrador creado: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Usuario administrador ya existe: ${adminEmail}`);
    }

    const AdminModel = modelos.Administrador; // <-- Usa el modelo correcto según tu initModels.js
    const [adminProfile, profCreated] = await AdminModel.findOrCreate({
      where: { user_id: admin.id },
      defaults: {
        user_id: admin.id,
        nivel_acceso: null,
      },
    }); 
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