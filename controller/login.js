// controller/login.js
const models = require('../model/initModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const getUserRoles = require('../utils/getUserRoles'); // 👈 usa el helper

const DUMMY_HASH = '$2a$10$Q7wS3m8w7C9g7JcM9z8J6eT8c0pQp8tWZ0w9JwLrG3Eo9vI1mYw6i';

// Lee bandera del .env (default: true). Pon EMAIL_VERIFICATION_REQUIRED=false para pruebas.
const REQUIRE_VERIFY =
  String(process.env.EMAIL_VERIFICATION_REQUIRED ?? 'true').toLowerCase() !== 'false';

// Normaliza RUT (sin puntos/guion y en mayúsculas)
function normRut(r) {
  if (!r) return '';
  return String(r).replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

function nombreCompuesto(u) {
  return [u.nombres, u.apellido_paterno, u.apellido_materno]
    .filter(Boolean)
    .join(' ')
    .trim();
}

async function login(req, res) {
  try {
    let { rut, password } = req.body || {};
    rut = normRut(rut || '');
    password = (password || '').trim();
    
    if (!rut || !password) {
      return res.status(400).json({ error: 'rut y password son obligatorios' });
    }
    console.log('login attempt for RUT:', rut);
    // 1) Busca SOLO por RUT
    const user = await models.User.findOne({ where: { rut } });
    if (!user) {
      return res.status(404).json({ error: 'Usuario no registrado' });
    }
    console.log('login payload:', req.body);

    // 2) Verificación de correo (según bandera)
    if (REQUIRE_VERIFY && user.email_verified === false) {
      return res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesión' });
    }

    // 3) Verifica contraseña
    const ok = await bcrypt.compare(password, user.password_hash || DUMMY_HASH);
    if (!ok) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // 4) Obtiene roles desde tablas de perfil (incluye ADMIN si existe en administradores)
    const roles = await getUserRoles(models, user.id); // 👈 AQUÍ

    // 5) Genera token JWT
    const token = jwt.sign(
      { id: user.id, rut: user.rut, roles },
      process.env.JWT_SECRET || 'dev_secret_change_me',
      { expiresIn: process.env.JWT_EXPIRES || '1h' }
    );

    // 6) Respuesta
    return res.json({
      message: 'Login exitoso',
      token_type: 'Bearer',
      token,
      user: {
        id: user.id,
        rut: user.rut,
        nombre: nombreCompuesto(user),
        nombres: user.nombres,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        correo: user.correo,
        roles, // 👈 p.ej. ["ADMIN"] y/o otros
      },
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = { login };
