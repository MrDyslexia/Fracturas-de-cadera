// controller/admin.users.controller.js
const models = require('../model/initModels');
const bcrypt = require('bcryptjs');

const VALID_ROLES = new Set(['FUNCIONARIO','TECNOLOGO','INVESTIGADOR','ADMIN']);

const normEmail = (s) => (s||'').trim().toLowerCase();
const strongPwd = (s) => s?.length>=8 && /[A-Z]/.test(s) && /\d/.test(s);
const normRut = (r) => String(r||'').replace(/\./g,'').replace(/-/g,'').toUpperCase();

function rolesFromDbRow(rowJson) {
  const roles = [];
  if (rowJson?.administrador) roles.push('ADMIN');
  return roles;
}

async function createUserWithRole(req, res) {
  try {
    const payload = req.body || {};
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
    let role = payload.user ? (payload.role || profileIn.cargo) : payload.role;
    role = String(role || '').toUpperCase();

    const correo = normEmail(userIn.correo);
    const password = userIn.password || '';
    if (!userIn.nombres || !userIn.apellido_paterno || !userIn.apellido_materno || !correo || !password) {
      return res.status(400).json({ error: 'nombres, apellidos, correo y password son obligatorios' });
    }
    if (!strongPwd(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener ≥8, 1 mayúscula y 1 número' });
    }

    if (!await models.User.sequelize) throw new Error('Sequelize no inicializado');

    if (await models.User.findOne({ where: { correo } })) {
      return res.status(409).json({ error: 'Correo ya registrado' });
    }
    if (userIn.rut) {
      const dupeRut = await models.User.findOne({ where: { rut: normRut(userIn.rut) } });
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

      if (payload.user) {
        const cargoProfesional = (String(profileIn.cargo || 'FUNCIONARIO').toUpperCase());
        const cargoValido = ['FUNCIONARIO','TECNOLOGO','INVESTIGADOR'].includes(cargoProfesional)
          ? cargoProfesional : 'FUNCIONARIO';

        await models.ProfessionalProfile.create({
          user_id: user.id,
          rut_profesional: profileIn.rut_profesional ? normRut(profileIn.rut_profesional) : null,
          especialidad: profileIn.especialidad || null,
          cargo: cargoValido,
          hospital: profileIn.hospital || null,
          departamento: profileIn.departamento || null,
        }, { transaction: t });
      }

      if (role === 'ADMIN') {
        const exists = await models.Administrador.findByPk(user.id, { transaction: t });
        if (!exists) {
          await models.Administrador.create({ user_id: user.id }, { transaction: t });
        }
      }

      await t.commit();

      const out = await models.User.findByPk(user.id, {
        include: [
          { model: models.ProfessionalProfile, as: 'professional_profile', required: false },
          { model: models.Administrador,      as: 'administrador',         required: false, attributes: ['nivel_acceso'] },
        ]
      });
      const j = out.toJSON();
      return res.status(201).json({
        message: 'Usuario creado',
        user: { id: j.id, nombres: j.nombres, correo: j.correo, rut: j.rut },
        professional_profile: j.professional_profile || null,
        roles: rolesFromDbRow(j),
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
      const exists = await models.Administrador.findByPk(userId);
      if (!exists) await models.Administrador.create({ user_id: userId });
    } else {
      const existing = await models.ProfessionalProfile.findOne({ where: { user_id: userId } });
      if (existing) {
        existing.cargo = role;
        if (rut_profesional !== undefined) existing.rut_profesional = rut_profesional ? normRut(rut_profesional) : null;
        if (especialidad !== undefined)    existing.especialidad   = especialidad ?? null;
        if (hospital !== undefined)        existing.hospital       = hospital ?? null;
        if (departamento !== undefined)    existing.departamento   = departamento ?? null;
        await existing.save();
      } else {
        await models.ProfessionalProfile.create({
          user_id: userId,
          cargo: role, 
          rut_profesional: rut_profesional ? normRut(rut_profesional) : null,
          especialidad: especialidad ?? null,
          hospital: hospital ?? null,
          departamento: departamento ?? null,
        });
      }
    }

    const u = await models.User.findByPk(userId, {
      include: [
        { model: models.Administrador, as: 'administrador', required: false, attributes: ['nivel_acceso'] },
        { model: models.ProfessionalProfile, as: 'professional_profile', required: false },
      ]
    });
    const j = u.toJSON();
    return res.status(201).json({
      message: 'Rol asignado',
      userId,
      roles: rolesFromDbRow(j),
      professional_profile: j.professional_profile || null,
    });
  } catch (err) {
    console.error('addRoleToUser error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function removeRoleFromUser(req, res) {
  try {
    const userId = Number(req.params.id);
    const role = String(req.params.role || '').toUpperCase();

    if (!Number.isInteger(userId)) return res.status(400).json({ error: 'id inválido' });
    if (!VALID_ROLES.has(role)) return res.status(400).json({ error: 'role inválido' });

    if (role === 'ADMIN') {
      const r = await models.Administrador.findByPk(userId);
      if (r) await r.destroy();
    } else {
      const prof = await models.ProfessionalProfile.findOne({ where: { user_id: userId } });
      if (prof && prof.cargo === role) {
        prof.cargo = 'FUNCIONARIO';
        await prof.save();
      }
    }
    const u = await models.User.findByPk(userId, {
      include: [
        { model: models.Administrador, as: 'administrador', required: false, attributes: ['nivel_acceso'] },
        { model: models.ProfessionalProfile, as: 'professional_profile', required: false },
      ]
    });
    const j = u?.toJSON() || {};
    return res.status(200).json({
      message: 'Rol quitado',
      userId,
      roles: rolesFromDbRow(j),
      professional_profile: j.professional_profile || null,
    });
  } catch (err) {
    console.error('removeRoleFromUser error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}


async function listUsers(_req, res) {
  try {
    const users = await models.User.findAll({
      order: [['id', 'DESC']],
      include: [
        { model: models.ProfessionalProfile, as: 'professional_profile', required: false,
          attributes: ['id','rut_profesional','cargo','especialidad','hospital','departamento','activo'] },
        { model: models.Administrador, as: 'administrador', required: false, attributes: ['nivel_acceso']},
      ],
    });

    const out = users.map(u => {
      const j = u.toJSON();
      return { ...j, roles: rolesFromDbRow(j) };
    });

    res.json(out);
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

async function getUser(req, res) {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) return res.status(400).json({ error: 'id inválido' });

    const user = await models.User.findByPk(id, {
      include: [
        { model: models.ProfessionalProfile, as: 'professional_profile', required: false,
          attributes: ['id','rut_profesional','cargo','especialidad','hospital','departamento','activo'] },
        { model: models.Administrador, as: 'administrador', required: false, attributes: ['nivel_acceso'] },
      ],
    });
    if (!user) return res.status(404).json({ error: 'No encontrado' });

    const j = user.toJSON();
    return res.json({ ...j, roles: rolesFromDbRow(j) });
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
  getUser,
};
