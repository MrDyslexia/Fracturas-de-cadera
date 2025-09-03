// index.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const { connectDB, sequelize } = require("./model/db");
const modelos = require("./model/initModels");

const { initRoutes } = require("./routes/initRoutes");
const { verifyMailTransport } = require("./utils/mailer");

const app = express();

// ---------- Config ----------
const PORT = Number(process.env.PORT) || 3001;
const BASE_PATH = process.env.API_BASE || "/api/v1";
const FRONT_ORIGIN = process.env.FRONT_ORIGIN || "http://localhost:3000";

// Body parsing
// parsers
app.use(cookieParser());
app.use(express.json({ limit: "1mb" }));

// CORS (Next.js en 3000)
const corsOptions = {
  origin: [FRONT_ORIGIN],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Origin", req.headers.origin || FRONT_ORIGIN);
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ---------- Healthcheck ----------
app.get("/", async (_req, res) => {
  try {
    await sequelize.authenticate();
    return res.json({ ok: true, db: "up" });
  } catch {
    return res.status(500).json({ ok: false, db: "down" });
  }
});

// ---------- Rutas ----------
initRoutes(app, BASE_PATH);

// ---------- 404 ----------
app.use((req, res) => {
  res.status(404).json({ error: "Not Found", path: req.originalUrl });
});

// ---------- Error handler ----------
app.use((err, _req, res, _next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Server Error" });
});

// ---------- Función para crear rol ----------
async function CrearRol(Rol, usuario) {
  try {
    let rol = await Rol.findOne({ where: { user_id: usuario.id } });
    if (!rol) {
      // Buscar por rut_profesional como fallback
      rol = await Rol.findOne({ where: { rut_profesional: usuario.rut } });
      
      if (!rol) {
        // Crear nuevo perfil profesional
        rol = await Rol.create({
          user_id: usuario.id,
          rut: usuario.rut,
          rut_profesional: usuario.rut,
          especialidad: "Administración",
          cargo: "FUNCIONARIO",
          hospital: "Sistema",
          departamento: "TI",
          fecha_ingreso: new Date(),
          historial_pacientes: [],
        });
        console.log(`✅ Perfil profesional de administrador creado`);
      } else {
        // Actualizar perfil existente con el user_id correcto
        await rol.update({ user_id: usuario.id });
        console.log(`🔄 Perfil profesional existente actualizado con user_id correcto`);
      }
    }
    return rol;
  } catch (error) {
    console.error("❌ Error al crear rol:", error);
    throw error;
  }
}

// ---------- Boot ----------
(async () => {
  try {
    const ALTER = String(process.env.DB_ALTER || "").toLowerCase() === "true";
    await connectDB({ alter: ALTER });
    
    const Usuario = modelos.User;
    const Rol = modelos.ProfessionalProfile;
    const adminEmail = process.env.ADMIN_EMAIL || "Admin@admin.com";
    const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const pass = await bcrypt.hash(adminPassword, 10);
    const adminRut = process.env.ADMIN_RUT || "111111111";
    
    // Buscar o crear usuario administrador
    let [usuario, creado] = await Usuario.findOrCreate({
      where: { correo: adminEmail },
      defaults: {
        nombres: "Admin",
        apellido_paterno: "Admin",
        apellido_materno: "Admin",
        correo: adminEmail,
        rut: adminRut,
        password_hash: pass,
        telefono: "12341234",
        sexo: "M",
        fecha_nacimiento: "2001-01-01",
      },
    });

    if (creado) {
      console.log(`✅ Usuario administrador creado: ${adminEmail}`);
    } else {
      console.log(`ℹ️ Usuario administrador ya existe: ${adminEmail}`);
    }

    // Crear o actualizar el rol del administrador
    await CrearRol(Rol, usuario);

    await verifyMailTransport();

    app.listen(PORT, () => {
      console.log(`🚀 API escuchando en http://localhost:${PORT}${BASE_PATH}`);
      console.log(`🌐 CORS: ${FRONT_ORIGIN}`);
    });
  } catch (e) {
    console.error("❌ No se pudo iniciar:", e);
    process.exit(1);
  }
})();