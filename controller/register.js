// controller/register.js
const models = require('../model/initModels');
const bcrypt = require('bcryptjs');

function normEmail(s)  { return (s||'').trim().toLowerCase(); }
function strongPwd(s)  { return s?.length>=8 && /[A-Z]/.test(s) && /\d/.test(s); }

async function registerPaciente(req, res) {
  try {
    // ahora esperamos nombres y apellidos por separado
    let { nombres, apellido_paterno, apellido_materno, correo, rut, password } = req.body || {};
    correo = normEmail(correo);

    if (!nombres || !apellido_paterno || !apellido_materno || !correo || !password) {
      return res.status(400).json({ error: 'nombres, apellido_paterno, apellido_materno, correo y password son obligatorios' });
    }
    if (!strongPwd(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener ≥8, 1 mayúscula y 1 número' });
    }

    // evita duplicados por correo (y puedes validar RUT si quieres)
    const dup = await models.User.findOne({ where: { correo } });
    if (dup) return res.status(409).json({ error: 'Correo ya registrado' });

    const password_hash = await bcrypt.hash(password, 10);

    // crea usuario base con los NUEVOS campos
    const user = await models.User.create({
      rut: rut || null,
      nombres,
      apellido_paterno,
      apellido_materno,
      correo,
      password_hash,
    });

    // crea perfil PACIENTE (OJO: usa la PK correcta de tu modelo Paciente)
    // si tu modelo Paciente define PK: user_id, usa user_id:
    await models.Paciente.create({ user_id: user.id });

    const nombre = [nombres, apellido_paterno, apellido_materno].filter(Boolean).join(' ').trim();

    return res.status(201).json({
      message: 'Cuenta de Paciente creada',
      user: {
        id: user.id,
        rut: user.rut,
        nombre,                // útil para el front actual
        nombres,
        apellido_paterno,
        apellido_materno,
        correo: user.correo
      },
      role_created: 'PACIENTE',
    });
  } catch (err) {
    console.error('registerPaciente error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = { registerPaciente };
