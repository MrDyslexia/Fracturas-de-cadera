// controller/register.js
const models = require('../model/initModels');
const bcrypt = require('bcryptjs');

const normEmail = (s) => (s || '').trim().toLowerCase();
const strongPwd = (s) => s?.length >= 8 && /[A-Z]/.test(s) && /\d/.test(s);
const isValidSexo = (s) => ['M', 'F', 'O'].includes(String(s || '').toUpperCase());
const isValidISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || '')); // YYYY-MM-DD

// --- Validación de RUT chileno ---
function isValidRut(rutRaw) {
  if (!rutRaw) return false;
  const rut = rutRaw.replace(/\./g, '').replace(/-/g, '').toUpperCase();
  if (!/^\d{7,8}[0-9K]$/.test(rut)) return false;

  const cuerpo = rut.slice(0, -1);
  const dv = rut.slice(-1);

  let suma = 0;
  let multiplicador = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += parseInt(cuerpo[i], 10) * multiplicador;
    multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
  }
  const resto = 11 - (suma % 11);
  let dvEsperado = resto === 11 ? '0' : resto === 10 ? 'K' : String(resto);
  return dv === dvEsperado;
}

async function registerPaciente(req, res) {
  try {
    let {
      nombres,
      apellido_paterno,
      apellido_materno,
      correo,
      rut,
      password,
      sexo,               // 'M' | 'F' | 'O'
      fecha_nacimiento,   // 'YYYY-MM-DD'
    } = req.body || {};

    correo = normEmail(correo);
    const sexoNorm = String(sexo || '').toUpperCase();

    // ---- Validaciones obligatorias
    if (
      !nombres ||
      !apellido_paterno ||
      !apellido_materno ||
      !correo ||
      !password ||
      !sexoNorm ||
      !fecha_nacimiento ||
      !rut
    ) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    if (!isValidRut(rut)) {
      return res.status(400).json({ error: 'RUT inválido' });
    }

    if (!isValidSexo(sexoNorm)) {
      return res.status(400).json({ error: "sexo inválido. Valores permitidos: 'M', 'F', 'O'" });
    }

    if (!isValidISODate(fecha_nacimiento)) {
      return res.status(400).json({ error: "fecha_nacimiento inválida. Formato requerido: 'YYYY-MM-DD'" });
    }

    if (!strongPwd(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener ≥8, 1 mayúscula y 1 número' });
    }

    // ---- Duplicados (correo y rut)
    const dupCorreo = await models.User.findOne({ where: { correo } });
    if (dupCorreo) return res.status(409).json({ error: 'El correo ya está registrado' });

    const dupRut = await models.User.findOne({ where: { rut } });
    if (dupRut) return res.status(409).json({ error: 'El RUT ya está registrado' });

    // ---- Crear usuario
    const password_hash = await bcrypt.hash(password, 10);

    const user = await models.User.create({
      rut: rut.replace(/\./g, '').replace(/-/g, '').toUpperCase(),
      nombres: String(nombres).trim(),
      apellido_paterno: String(apellido_paterno).trim(),
      apellido_materno: String(apellido_materno).trim(),
      correo,
      password_hash,
      sexo: sexoNorm,
      fecha_nacimiento, // YYYY-MM-DD
    });

    // ---- Crear perfil PACIENTE (PK/FK user_id)
    await models.Paciente.create({ user_id: user.id });

    const nombre = [user.nombres, user.apellido_paterno, user.apellido_materno]
      .filter(Boolean)
      .join(' ')
      .trim();

    return res.status(201).json({
      message: 'Cuenta de Paciente creada',
      user: {
        id: user.id,
        rut: user.rut,
        nombre,
        nombres: user.nombres,
        apellido_paterno: user.apellido_paterno,
        apellido_materno: user.apellido_materno,
        correo: user.correo,
        sexo: user.sexo,
        fecha_nacimiento: user.fecha_nacimiento,
      },
      role_created: 'PACIENTE',
    });
  } catch (err) {
    if (err?.name === 'SequelizeUniqueConstraintError' || err?.parent?.code === '23505') {
      const path = err?.errors?.[0]?.path || '';
      if (path.includes('correo')) return res.status(409).json({ error: 'El correo ya está registrado' });
      if (path.includes('rut')) return res.status(409).json({ error: 'El RUT ya está registrado' });
      return res.status(409).json({ error: 'Valor duplicado' });
    }

    console.error('registerPaciente error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = { registerPaciente };
