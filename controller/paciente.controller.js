// controller/paciente.controller.js
const models = require('../model/initModels');
const { logRegistro } = require('./registro.controller');
const { Op } = require('sequelize'); // 👈 añade esto

// Helpers
function parseUserIdParam(req) {
  const raw = req.params.user_id ?? req.query.user_id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}
function isEmpty(v) {
  return v === undefined || v === null || (typeof v === 'string' && v.trim() === '');
}
const normRut = (r) => String(r || '').replace(/\./g, '').replace(/-/g, '').toUpperCase();

/**
 * GET /pacientes/search?q=texto&limit=6
 * Busca por RUT, nombres y apellidos (en la tabla User) para usuarios que SÍ tienen perfil de Paciente.
 */
async function search(req, res) {
  try {
    const q = String(req.query.q || '').trim();
    const limit = Math.min(parseInt(req.query.limit || '6', 10), 50);
    if (!q) return res.json({ items: [] });

    const qRut = normRut(q);

    // ⚠️ IMPORTANTE: usa el alias de tu relación Paciente → User.
    // Si en tu initModels declaraste Paciente.belongsTo(User, { as: 'user', foreignKey: 'user_id' }),
    // entonces "as" debe ser 'user'. Si tu alias es distinto, cámbialo aquí.
    const userAlias = 'user';

    const rows = await models.Paciente.findAll({
      include: [{
        model: models.User,
        as: userAlias,               // 🔁 ajusta si tu alias difiere
        required: true,
        attributes: ['rut', 'nombres', 'apellido_paterno', 'apellido_materno'],
        where: {
          [Op.or]: [
            { rut:               { [Op.iLike]: `%${q}%` } },   // si usas MySQL cambia iLike -> like
            { rut:               { [Op.iLike]: `%${qRut}%` } },
            { nombres:           { [Op.iLike]: `%${q}%` } },
            { apellido_paterno:  { [Op.iLike]: `%${q}%` } },
            { apellido_materno:  { [Op.iLike]: `%${q}%` } },
          ],
        },
      }],
      limit,
      order: [[{ model: models.User, as: userAlias }, 'apellido_paterno', 'ASC'],
              [{ model: models.User, as: userAlias }, 'apellido_materno', 'ASC'],
              [{ model: models.User, as: userAlias }, 'nombres', 'ASC']],
    });

    const items = rows.map((r) => {
      const u = r[userAlias];
      return {
        user_id: r.user_id,
        rut: u?.rut ?? '',
        nombres: u?.nombres ?? '',
        apellido_paterno: u?.apellido_paterno ?? '',
        apellido_materno: u?.apellido_materno ?? '',
      };
    });

    res.json({ items });
  } catch (err) {
    console.error('search pacientes error:', err);
    res.status(500).json({ error: 'Error al buscar pacientes' });
  }
}

/**
 * GET /pacientes?limit=20&offset=0&tipo_sangre=O+
 */
async function list(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const where = {};

    if (!isEmpty(req.query.tipo_sangre)) where.tipo_sangre = String(req.query.tipo_sangre).trim();

    const rows = await models.Paciente.findAll({
      where,
      order: [['user_id', 'DESC']],
      limit,
      offset,
    });

    res.json(rows);
  } catch (err) {
    console.error('list pacientes error:', err);
    res.status(500).json({ error: 'Error al listar pacientes' });
  }
}

/**
 * GET /pacientes/:user_id
 */
async function getOne(req, res) {
  try {
    const id = parseUserIdParam(req);
    if (!id) return res.status(400).json({ error: 'user_id inválido' });

    const row = await models.Paciente.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    res.json(row);
  } catch (err) {
    console.error('getOne paciente error:', err);
    res.status(500).json({ error: 'Error al obtener paciente' });
  }
}

/**
 * POST /pacientes
 * body: { user_id, tipo_sangre?, altura?, edad? }
 */
async function create(req, res) {
  try {
    const { user_id, tipo_sangre, altura, edad } = req.body || {};
    const id = Number(user_id);
    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: 'user_id obligatorio y debe ser entero > 0' });
    }

    const user = await models.User.findByPk(id);
    if (!user) return res.status(400).json({ error: 'User no existe' });

    const exists = await models.Paciente.findByPk(id);
    if (exists) return res.status(409).json({ error: 'El usuario ya tiene perfil de Paciente' });

    const created = await models.Paciente.create({
      user_id: id,
      tipo_sangre: isEmpty(tipo_sangre) ? null : String(tipo_sangre).trim(),
      altura: isEmpty(altura) ? null : Number(altura),
      edad: isEmpty(edad) ? null : Number(edad),
    });

    await logRegistro(req, 'PACIENTE_REGISTRADO');

    res.status(201).json(created);
  } catch (err) {
    console.error('create paciente error:', err);
    res.status(500).json({ error: 'Error al crear paciente' });
  }
}

/**
 * PUT /pacientes/:user_id
 */
async function update(req, res) {
  try {
    const id = parseUserIdParam(req);
    if (!id) return res.status(400).json({ error: 'user_id inválido' });

    const row = await models.Paciente.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const { tipo_sangre, altura, edad } = req.body || {};

    if (tipo_sangre !== undefined) row.tipo_sangre = isEmpty(tipo_sangre) ? null : String(tipo_sangre).trim();
    if (altura !== undefined) row.altura = isEmpty(altura) ? null : Number(altura);
    if (edad !== undefined) row.edad = isEmpty(edad) ? null : Number(edad);

    await row.save();

    await logRegistro(req, 'PACIENTE_ACTUALIZADO');

    res.json(row);
  } catch (err) {
    console.error('update paciente error:', err);
    res.status(500).json({ error: 'Error al actualizar paciente' });
  }
}

/**
 * DELETE /pacientes/:user_id
 */
async function remove(req, res) {
  try {
    const id = parseUserIdParam(req);
    if (!id) return res.status(400).json({ error: 'user_id inválido' });

    const row = await models.Paciente.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    await row.destroy();

    await logRegistro(req, 'PACIENTE_ELIMINADO');

    res.status(204).send();
  } catch (err) {
    console.error('remove paciente error:', err);
    res.status(500).json({ error: 'Error al eliminar paciente' });
  }
}

module.exports = { search, list, getOne, create, update, remove }; // 👈 exporta search
