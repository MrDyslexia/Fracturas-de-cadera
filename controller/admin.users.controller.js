// controller/admin.users.controller.js
const models = require('../model/initModels');
const bcrypt = require('bcryptjs');

const VALID_ROLES = new Set(['FUNCIONARIO','TECNOLOGO','INVESTIGADOR','ADMIN']); // NO 'PACIENTE' aquí

function normEmail(s){return (s||'').trim().toLowerCase();}
function strongPwd(s){return s?.length>=8 && /[A-Z]/.test(s) && /\d/.test(s);}

async function ensureRoleProfile(userId, role) {
  switch (role) {
    case 'FUNCIONARIO':
      if (!await models.Funcionario.findOne({ where: { user_id: userId } }))
        await models.Funcionario.create({ user_id: userId });
      break;
    case 'TECNOLOGO':
      if (!await models.Tecnologo.findOne({ where: { user_id: userId } }))
        await models.Tecnologo.create({ user_id: userId });
      break;
    case 'INVESTIGADOR':
      if (!await models.Investigador.findOne({ where: { user_id: userId } }))
        await models.Investigador.create({ user_id: userId });
      break;
    case 'ADMIN':
      if (!await models.Administrador.findByPk(userId)) // PK = user_id
        await models.Administrador.create({ user_id: userId });
      break;
    default:
      throw new Error('Rol inválido para perfil administrativo');
  }
}

async function removeRoleProfile(userId, role) {
  switch (role) {
    case 'FUNCIONARIO': { const r = await models.Funcionario.findOne({ where:{ user_id:userId } }); if (r) await r.destroy(); break; }
    case 'TECNOLOGO':   { const r = await models.Tecnologo.findOne({ where:{ user_id:userId } });   if (r) await r.destroy(); break; }
    case 'INVESTIGADOR':{ const r = await models.Investigador.findOne({ where:{ user_id:userId } });if (r) await r.destroy(); break; }
    case 'ADMIN':       { const r = await models.Administrador.findByPk(userId); if (r) await r.destroy(); break; }
    default: throw new Error('Rol inválido');
  }
}


// POST /admin/users
// body: { nombre, correo, rut?, password, role }  // role ∈ VALID_ROLES
async function createUserWithRole(req, res) {
  try {
    let { nombres, apellido_paterno, apellido_materno, correo, rut, password, role } = req.body || {};
    role = String(role || '').toUpperCase();
    correo = normEmail(correo);

    if (!nombres || !correo || !password || !role) {
      return res.status(400).json({ error: 'nombre, correo, password y role son obligatorios' });
    }
    if (!VALID_ROLES.has(role)) {
      return res.status(400).json({ error: `role inválido. Use uno de: ${[...VALID_ROLES].join(', ')}` });
    }
    if (!strongPwd(password)) {
      return res.status(400).json({ error: 'La contraseña debe tener ≥8, 1 mayúscula y 1 número' });
    }

    const exists = await models.User.findOne({ where: { correo } });
    if (exists) return res.status(409).json({ error: 'Correo ya registrado' });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await models.User.create({ nombres, apellido_paterno, apellido_materno, correo, rut: rut || null, password_hash });

    // crea perfil según rol
    await ensureRoleProfile(user.id, role);

    return res.status(201).json({
      message: 'Usuario creado por admin',
      user: { id: user.id, nombres: user.nombres, correo: user.correo, rut: user.rut },
      role_created: role,
    });
  } catch (err) {
    console.error('createUserWithRole error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

// POST /admin/users/:id/roles
// body: { role } // agrega rol adicional
async function addRoleToUser(req, res) {
  try {
    const userId = Number(req.params.id);
    let { role } = req.body || {};
    role = String(role || '').toUpperCase();

    if (!Number.isInteger(userId)) return res.status(400).json({ error: 'id inválido' });
    if (!VALID_ROLES.has(role)) return res.status(400).json({ error: 'role inválido' });

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await ensureRoleProfile(user.id, role);
    return res.status(201).json({ message: 'Rol agregado', userId, role });
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

    const user = await models.User.findByPk(userId);
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    await removeRoleProfile(user.id, role);
    return res.status(204).send();
  } catch (err) {
    console.error('removeRoleFromUser error', err);
    return res.status(500).json({ error: 'Error en el servidor' });
  }
}

// (Opcional) GET /admin/users
async function listUsers(_req, res) {
  try {
    // Simple: lista todos los usuarios; si quieres, incluye perfiles con LEFT JOINs
    const users = await models.User.findAll({ order: [['id', 'DESC']] });
    res.json(users);
  } catch (err) {
    console.error('listUsers error', err);
    res.status(500).json({ error: 'Error en el servidor' });
  }
}

module.exports = {
  createUserWithRole,
  addRoleToUser,
  removeRoleFromUser,
  listUsers,
};
