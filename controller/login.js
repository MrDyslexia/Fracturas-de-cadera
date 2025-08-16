// controller/login.js
const models = require("../model/initModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Devuelve lista de roles según perfiles existentes
async function getUserRoles(userId) {
  const roles = [];
  if (await models.Paciente.findByPk(userId)) roles.push("PACIENTE");
  if (await models.Funcionario.findByPk(userId)) roles.push("FUNCIONARIO");
  if (await models.Tecnologo.findByPk(userId)) roles.push("TECNOLOGO");
  if (await models.Investigador.findByPk(userId)) roles.push("INVESTIGADOR");
  if (await models.Administrador.findByPk(userId)) roles.push("ADMIN");
  return roles;
}

async function login(req, res) {
  try {
    const { correo, password } = req.body; // ← usa 'correo' y 'password' desde el front
    if (!correo || !password) {
      return res.status(400).json({ error: "correo y password son obligatorios" });
    }

    // Buscar usuario por correo
    const user = await models.User.findOne({ where: { correo } });
    if (!user) return res.status(404).json({ error: "Usuario no encontrado" });

    // Validar contraseña
    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Credenciales inválidas" });

    // Roles a partir de perfiles
    const roles = await getUserRoles(user.id);

    // Firmar JWT
    const token = jwt.sign(
      { id: user.id, correo: user.correo, roles },
      process.env.JWT_SECRET || "dev_secret_change_me",
      { expiresIn: process.env.JWT_EXPIRES || "1h" }
    );

    return res.json({
      message: "Login exitoso",
      token,
      user: {
        id: user.id,
        rut: user.rut,
        nombre: user.nombre,
        correo: user.correo,
        roles, // ← array de strings
      },
    });
  } catch (err) {
    console.error("❌ Error en login:", err);
    return res.status(500).json({ error: "Error en el servidor" });
  }
}

module.exports = { login };
