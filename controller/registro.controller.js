// controller/registro.controller.js
const models = require('../model/initModels');

function parseIdParam(req) {
  const raw = req.params.id ?? req.query.id;
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function parseDateOrNull(input) {
  if (!input) return null;
  const t = Date.parse(input);
  return Number.isNaN(t) ? null : new Date(t);
}

// GET /registros?limit=20&offset=0&accion=ALTA
async function list(req, res) {
  try {
    const limit = Math.min(Number(req.query.limit) || 20, 100);
    const offset = Number(req.query.offset) || 0;
    const where = {};
    if (req.query.accion) where.accion = String(req.query.accion).trim();

    const rows = await models.Registro.findAll({
      where,
      order: [['registro_id', 'DESC']],
      limit,
      offset,
    });
    res.json(rows);
  } catch (err) {
    console.error('list registros error', err);
    res.status(500).json({ error: 'Error al listar registros' });
  }
}

async function getOne(req, res) {
  try {
    const id = parseIdParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const row = await models.Registro.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (err) {
    console.error('getOne registro error', err);
    res.status(500).json({ error: 'Error al obtener registro' });
  }
}

// POST /registros
// body: { accion, fecha_registro, administrador_rut? }
// actor_user_rut se toma del token (req.user.rut)
async function create(req, res) {
  try {
    const { accion, fecha_registro } = req.body || {};
    if (!accion) return res.status(400).json({ error: 'accion obligatoria' });

    const fecha = parseDateOrNull(fecha_registro) || new Date(); // default: ahora
    if (!fecha) return res.status(400).json({ error: 'fecha_registro inválida (ISO recomendado)' });

    const actorRut = req.user?.rut || null;
    const normRut = (r) => String(r || '').replace(/\./g, '').replace(/-/g, '').toUpperCase();
    
    let administrador_rut = null;
    if (req.body?.administrador_rut != null) {
      const rut = normRut(req.body.administrador_rut);
      const user = await models.User.findOne({ where: { rut } });
      if (!user) return res.status(400).json({ error: 'administrador_rut no existe' });
      const adm = await models.Administrador.findByPk(user.id);
      if (!adm) return res.status(400).json({ error: 'administrador_rut no corresponde a un administrador' });
      administrador_rut = rut;
    }

    const created = await models.Registro.create({
      accion: String(accion).trim(),
      fecha_registro: fecha,
      administrador_rut,
      actor_user_rut: actorRut,
    });

    res
      .status(201)
      .location(`/registros/${created.registro_id}`)
      .json(created);
  } catch (err) {
    console.error('create registro error', err);
    res.status(500).json({ error: 'Error al crear registro' });
  }
}

async function update(req, res) {
  try {
    const id = parseIdParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const row = await models.Registro.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const { accion, fecha_registro, administrador_rut } = req.body || {};

    if (accion !== undefined) row.accion = String(accion).trim();

    if (fecha_registro !== undefined) {
      const fecha = parseDateOrNull(fecha_registro);
      if (!fecha) return res.status(400).json({ error: 'fecha_registro inválida' });
      row.fecha_registro = fecha;
    }

    if (administrador_rut !== undefined) {
      if (administrador_rut) {
        const norm = String(administrador_rut).replace(/\./g, '').replace(/-/g, '').toUpperCase();
        const user = await models.User.findOne({ where: { rut: norm } });
        if (!user) return res.status(400).json({ error: 'administrador_rut no existe' });
        const adm = await models.Administrador.findByPk(user.id);
        if (!adm) return res.status(400).json({ error: 'administrador_rut no corresponde a un administrador' });
        row.administrador_rut = norm;
      } else {
        row.administrador_rut = null;
      }
    }

  
    await row.save();
    res.json(row);
  } catch (err) {
    console.error('update registro error', err);
    res.status(500).json({ error: 'Error al actualizar registro' });
  }
}

async function remove(req, res) {
  try {
    const id = parseIdParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });

    const row = await models.Registro.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    await row.destroy();
    res.status(204).send();
  } catch (err) {
    console.error('remove registro error', err);
    res.status(500).json({ error: 'Error al eliminar registro' });
  }
}

// helper rápido para registrar acciones desde otros controladores
async function logRegistro(req, accion, administrador_rut = null) {
  try {
    await models.Registro.create({
      accion: String(accion).trim(),
      fecha_registro: new Date(),
      administrador_rut: administrador_rut ?? null,
      actor_user_rut: req.user?.rut ?? null, // si existe token
    });
  } catch (e) {
    console.error('logRegistro error:', e);
  }
}

module.exports = { list, getOne, create, update, remove, logRegistro };
