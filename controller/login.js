// controller/login.js
const models = require("../model/initModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const DUMMY_HASH = "$2a$10$Q7wS3m8w7C9g7JcM9z8J6eT8c0pQp8tWZ0w9JwLrG3Eo9vI1mYw6i"; // "dummyPwd123!"

async function getUserRoles(userId) {
  const roles = [];
  if (await models.Paciente.findByPk(userId)) roles.push("PACIENTE");
  if (await models.Funcionario.findByPk(userId)) roles.push("FUNCIONARIO");
  if (await models.Tecnologo.findByPk(userId)) roles.push("TECNOLOGO");
  if (await models.Investigador.findByPk(userId)) roles.push("INVESTIGADOR");
  if (await models.Administrador.findByPk(userId)) roles.push("ADMIN");
  return roles.map(r => String(r).toUpperCase());
}

function nombreCompuesto(u) {
  return [u.nombres, u.apellido_paterno, u.apellido_materno]
    .filter(Boolean)
    .join(" ")
    .trim();
}

async function login(req, res) {
  try {
    let { correo, password } = req.body || {};
    correo = (correo || "").trim().toLowerCase();
    password = (password || "").trim();

    if (!correo || !password) {
      return res.status(400).json({ error: "correo y password son obligatorios" });
    }

    const user = await models.User.findOne({ where: { correo } });

    const hashToCheck = user?.password_hash || DUMMY_HASH;
    const ok = await bcrypt.compare(password, hashToCheck);
    if (!user || !ok) return res.status(401).json({ error: "Credenciales inválidas" });

    const roles = await getUserRoles(user.id);

    const token = jwt.sign(
      { id: user.id, correo: user.correo, roles },
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
        // compatibilidad para el front actual:
        nombre: nombreCompuesto(user),
        // y enviamos también los campos separados por si los usas luego:
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
