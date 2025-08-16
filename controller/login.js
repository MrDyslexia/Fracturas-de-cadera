// controller/login.js
const models = require("../model/initModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DUMMY_HASH = "$2a$10$Q7wS3m8w7C9g7JcM9z8J6eT8c0pQp8tWZ0w9JwLrG3Eo9vI1mYw6i";

// Lee bandera del .env (default: true). Pon EMAIL_VERIFICATION_REQUIRED=false para pruebas.
const REQUIRE_VERIFY =
  String(process.env.EMAIL_VERIFICATION_REQUIRED ?? "true").toLowerCase() !== "false";

// Normaliza RUT (sin puntos/guion y en mayúsculas)
function normRut(r) {
  if (!r) return "";
  return String(r).replace(/\./g, "").replace(/-/g, "").toUpperCase();
}

// 🔧 ROBUSTO Y COMPATIBLE CON ProfessionalProfile
async function getUserRoles(userId) {
  const roles = [];

  // PACIENTE (modelo opcional)
  if (models.Paciente) {
    const p = await models.Paciente.findByPk(userId);
    if (p) roles.push("PACIENTE");
  }

  // ROLES PROFESIONALES vía ProfessionalProfile (si existe)
  if (models.ProfessionalProfile) {
    const profs = await models.ProfessionalProfile.findAll({
      where: { user_id: userId, activo: true },
    });
    for (const prof of profs) {
      const r = String(prof.rol || "").toUpperCase();
      if (r) roles.push(r); // esperado: FUNCIONARIO | TECNOLOGO | INVESTIGADOR | ADMIN (si lo usas aquí)
    }
  } else {
    // Compatibilidad si aún tienes modelos separados:
    if (models.Funcionario) {
      const f = await models.Funcionario.findByPk(userId);
      if (f) roles.push("FUNCIONARIO");
    }
    if (models.Tecnologo) {
      const t = await models.Tecnologo.findByPk(userId);
      if (t) roles.push("TECNOLOGO");
    }
    if (models.Investigador) {
      const i = await models.Investigador.findByPk(userId);
      if (i) roles.push("INVESTIGADOR");
    }
  }

  // ADMIN (puede venir de tabla propia)
  if (models.Administrador) {
    const a = await models.Administrador.findByPk(userId);
    if (a) roles.push("ADMIN");
  }

  // Únicos, en mayúsculas
  return Array.from(new Set(roles.map((r) => String(r).toUpperCase())));
}

function nombreCompuesto(u) {
  return [u.nombres, u.apellido_paterno, u.apellido_materno]
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function login(req, res) {
  try {
    let { rut, password } = req.body || {};
    rut = normRut(rut || "");
    password = (password || "").trim();

    if (!rut || !password) {
      return res.status(400).json({ error: "rut y password son obligatorios" });
    }

    // 1) Busca SOLO por RUT
    const user = await models.User.findOne({ where: { rut } });
    if (!user) {
      return res.status(404).json({ error: "Usuario no registrado" });
    }

    // 2) Verificación de correo (según bandera)
    if (REQUIRE_VERIFY && user.email_verified === false) {
      return res.status(403).json({ error: "Debes verificar tu correo antes de iniciar sesión" });
    }

    // 3) Verifica contraseña
    const ok = await bcrypt.compare(password, user.password_hash || DUMMY_HASH);
    if (!ok) {
      return res.status(401).json({ error: "Contraseña incorrecta" });
    }

    // 4) Obtiene roles
    const roles = await getUserRoles(user.id);

    // 5) Genera token JWT
    const token = jwt.sign(
      { id: user.id, rut: user.rut, roles },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    return res.json({
      message: "Login exitoso",
      token_type: "Bearer",
      token,
      user: {
        id: user.id,
        rut: user.rut,
        nombre: nombreCompuesto(user),
        nombres: user.nombres,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        correo: user.correo,
        roles,
      },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

module.exports = { login };
