// controller/login.js
const models = require('../model/initModels');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const DUMMY_HASH = '$2a$10$Q7wS3m8w7C9g7JcM9z8J6eT8c0pQp8tWZ0w9JwLrG3Eo9vI1mYw6i';
const REQUIRE_VERIFY = String(process.env.EMAIL_VERIFICATION_REQUIRED ?? 'true').toLowerCase() !== 'false';

const cookieOpts = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge: 24 * 60 * 60 * 1000, // 1 día
};

const normRut = (r) => String(r || '').replace(/\./g, '').replace(/-/g, '').toUpperCase();
const nombreCompleto = (u) =>
  [u.nombres, u.apellido_paterno, u.apellido_materno].filter(Boolean).join(' ').trim();

async function getUserRoles(models, userId) {
  // Ajusta según tus tablas de perfil:
  const roles = new Set();
  const Admin = models.Administrador;
  const Func = models.Funcionario;
  const Tec  = models.Tecnologo;
  const Inv  = models.Investigador;
  const Pac  = models.Paciente;

  if (Admin && await Admin.findOne({ where: { user_id: userId } })) roles.add('ADMIN');
  if (Func  && await Func.findOne({ where: { user_id: userId } })) roles.add('FUNCIONARIO');
  if (Tec   && await Tec.findOne({ where: { user_id: userId } })) roles.add('TECNOLOGO');
  if (Inv   && await Inv.findOne({ where: { user_id: userId } })) roles.add('INVESTIGADOR');
  if (Pac   && await Pac.findOne({ where: { user_id: userId } })) roles.add('PACIENTE');

  return Array.from(roles);
}

exports.login = async (req, res) => {
  try {
    let { rut, password } = req.body || {};
    rut = normRut(rut);
    password = String(password || '').trim();

    if (!rut || !password) return res.status(400).json({ error: 'rut y password son obligatorios' });

    const user = await models.User.findOne({ where: { rut } });
    if (!user) return res.status(404).json({ error: 'Usuario no registrado' });

    if (REQUIRE_VERIFY && user.email_verified === false) {
      return res.status(403).json({ error: 'Debes verificar tu correo antes de iniciar sesión' });
    }

    const ok = await bcrypt.compare(password, user.password_hash || DUMMY_HASH);
    if (!ok) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const roles = await getUserRoles(models, user.id);

    const token = jwt.sign(
      { id: user.id, rut: user.rut, roles },
      process.env.JWT_SECRET || 'dev_secret_change_me',
      { expiresIn: process.env.JWT_EXPIRES || '1d' }
    );

    // 👉 set cookie httpOnly
    res.cookie('auth', token, cookieOpts);

    return res.json({
      message: 'Login exitoso',
      user: {
        id: user.id,
        rut: user.rut,
        nombre: nombreCompleto(user),
        correo: user.correo,
        roles,
      },
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
};

exports.logout = async (_req, res) => {
  res.clearCookie('auth', { ...cookieOpts, maxAge: 0 });
  return res.json({ ok: true });
};

exports.me = async (req, res) => {
  // req.user viene del middleware auth()
  return res.json({ me: req.user });
};
