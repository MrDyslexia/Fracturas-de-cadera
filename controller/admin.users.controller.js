// controller/admin.users.controller.js
const models = require('../model/initModels');
const bcrypt = require('bcryptjs');

const VALID_ROLES = new Set(['FUNCIONARIO','TECNOLOGO','INVESTIGADOR','ADMIN']);

const normEmail = (s) => (s||'').trim().toLowerCase();
const strongPwd = (s) => s?.length>=8 && /[A-Z]/.test(s) && /\d/.test(s);
function normRut(r) {
  if (!r) return '';
  return String(r).replace(/\./g, '').replace(/-/g, '').toUpperCase();
}

// POST /admin/users  (soporta {user,profile} o plano legado)
async function createUserWithRole(req, res) {
  try {

    const payload = req.body || {};
    
    console.log('createUserWithRole payload:', payload);
    const userIn = payload.user ? payload.user : {
      nombres: payload.nombres,
      apellido_paterno: payload.apellido_paterno,
      apellido_materno: payload.apellido_materno,
      correo: payload.correo,
      rut: payload.rut,
      password: payload.password,
      telefono: payload.telefono,
      sexo: payload.sexo,
      fecha_nacimiento: payload.fecha_nacimiento,
    };

    const profileIn = payload.user ? (payload.profile || {}) : {};
    let role = payload.user ? (profileIn.cargo || payload.role) : payload.role;
    role = String(role || '').toUpperCase();

    const correo = normEmail(userIn.correo);
    const password = userIn.password || '';

    if (!userIn.nombres || !userIn.apellido_paterno || !userIn.apellido_materno || !correo || !password) {
      return res.status(400).json({ error: 'nombres, apellidos, correo y password son obligatorios' });
    }
    if (!strongPwd(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener ≥8, 1 mayúscula y 1 número' });
    }
    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ error: `cargo/role inválido. Use: ${[...VALID_ROLES].join(', ')}` });
    }

    if (await models.User.findOne({ where: { correo } })) {
      return res.status(409).json({ error: 'Correo ya registrado' });
    }
    if (userIn.rut) {
      const dupeRut = await models.User.findOne({ where: { rut: userIn.rut } });
      if (dupeRut) return res.status(409).json({ error: 'RUT ya registrado' });
    }

    const t = await models.User.sequelize.transaction();
    try {
      const password_hash = await bcrypt.hash(password, 10);
      const user = await models.User.create({
        rut: normRut(userIn.rut || ''),
        nombres: userIn.nombres,
        apellido_paterno: userIn.apellido_paterno,
        apellido_materno: userIn.apellido_materno,
        correo,
        password_hash,
        telefono: userIn.telefono || null,
        sexo: userIn.sexo,
        fecha_nacimiento: userIn.fecha_nacimiento,
      }, { transaction: t });

      // Perfil profesional (si viene desde el frontend nuevo)
      if (payload.user) {
        await models.ProfessionalProfile.create({
          user_id: user.id,
          rut_profesional: normRut(profileIn.rut_profesional|| ''),
          especialidad: profileIn.especialidad || null,
          cargo: role,
          hospital: profileIn.hospital || null,
          departamento: profileIn.departamento || null,
        }, { transaction: t });
      }

      // Si role = ADMIN, asegura registro en administradores
      if (role === 'ADMIN') {
        if (!await models.Administrador.findByPk(user.id)) {
          await models.Administrador.create({ user_id: user.id }, { transaction: t });
        }
      }

      await t.commit();
      return res.status(201).json({
        message: 'Usuario creado',
        user: { id: user.id, nombres: user.nombres, correo: user.correo, rut: user.rut },
        cargo: role,
      });
    } catch (e) {
      await t.rollback();
      throw e;
    }
  } catch (err) {
    console.error('createUserWithRole error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

// POST /admin/users/:id/roles  (aquí lo tomamos como "cambiar/asegurar cargo")
async function addRoleToUser(req, res) {
  try {
    const userId = Number(req.params.id);
    let { role, rut_profesional, especialidad, hospital, departamento } = req.body || {};
    role = String(role || '').toUpperCase();

    if (!Number.isInteger(userId)) return res.status(400).json({ error: 'id inválido' });
    if (!VALID_ROLES.has(role)) return res.status(400).json({ error: 'role inválido' });

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    if (role === 'ADMIN') {
      if (!await models.Administrador.findByPk(userId)) {
        await models.Administrador.create({ user_id: userId });
      }
      return res.status(201).json({ message: 'Rol ADMIN asegurado', userId, role });
    }

    // Asegura/actualiza ProfessionalProfile
    const existing = await models.ProfessionalProfile.findOne({ where: { user_id: userId } });
    if (existing) {
      existing.cargo = role;
      if (rut_profesional !== undefined) existing.rut_profesional = rut_profesional || null;
      if (especialidad !== undefined)    existing.especialidad   = especialidad   || null;
      if (hospital !== undefined)        existing.hospital       = hospital       || null;
      if (departamento !== undefined)    existing.departamento   = departamento   || null;
      await existing.save();
    } else {
      await models.ProfessionalProfile.create({
        user_id: userId,
        cargo: role,
        rut_profesional: rut_profesional || null,
        especialidad: especialidad || null,
        hospital: hospital || null,
        departamento: departamento || null,
      });
    }

    return res.status(201).json({ message: 'Rol profesional asegurado', userId, role });
  } catch (err) {
    console.error('addRoleToUser error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

// DELETE /admin/users/:id/roles/:role
async function removeRoleFromUser(req, res) {
  try {
    const userId = Number(req.params.id);
    const role = String(req.params.role || '').toUpperCase();

    if (!Number.isInteger(userId)) return res.status(400).json({ error: 'id inválido' });
    if (!VALID_ROLES.has(role)) return res.status(400).json({ error: 'role inválido' });

    if (role === 'ADMIN') {
      const r = await models.Administrador.findByPk(userId);
      if (r) await r.destroy();
      return res.status(204).send();
    }

    const prof = await models.ProfessionalProfile.findOne({ where: { user_id: userId } });
    if (prof) {
      if (prof.cargo === role) {
        // Si quitas su rol principal, lo dejamos como FUNCIONARIO o borra perfil si prefieres:
        prof.cargo = 'FUNCIONARIO';
        await prof.save();
      }
    }
    return res.status(204).send();
  } catch (err) {
    console.error('removeRoleFromUser error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

// GET /adminUser/users
async function listUsers(_req, res) {
  try {
    const users = await models.User.findAll({
      order: [['id', 'DESC']],
      include: [{
        model: models.ProfessionalProfile,
        as: 'professional_profile',          // 👈 alias debe coincidir con initModels
        required: false,                     // LEFT JOIN
        attributes: [
          'id', 'rut_profesional', 'cargo',
          'especialidad', 'hospital', 'departamento', 'activo'
        ],
      }],
    });
    res.json(users);
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

// GET /adminUser/users/:id
async function getUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

    const user = await models.User.findByPk(id, {
      include: [{
        model: models.ProfessionalProfile,
        as: 'professional_profile',
        required: false,
        attributes: [
          'id', 'rut_profesional', 'cargo',
          'especialidad', 'hospital', 'departamento', 'activo'
        ],
      }],
    });

    if (!user) return res.status(404).json({ error: 'No encontrado' });
    res.json(user);
  } catch (err) {
    console.error('getUser error', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}


module.exports = {
  createUserWithRole,
  addRoleToUser,
  removeRoleFromUser,
  listUsers,
  getUser, // 👈 nuevo (si lo agregaste)
};
