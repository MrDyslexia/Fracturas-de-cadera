// controller/control_clinico.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');

function parseDate(input) {
  if (!input) return null;
  const t = Date.parse(input);
  return Number.isNaN(t) ? null : new Date(t);
}

async function list(req, res) {
  try {
    const rows = await models.ControlClinico.findAll({ order: [['control_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list control_clinico error', e);
    res.status(500).json({ error: 'Error al listar controles clínicos' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.ControlClinico.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne control_clinico error', e);
    res.status(500).json({ error: 'Error al obtener control clínico' });
  }
}

async function create(req, res) {
  try {
    const {
      episodio_id,
      profesional_id,
      profesional_nombre,
      origen,
      resumen,
      fecha_hora_control,
    } = req.body || {};

    if (!episodio_id) return res.status(400).json({ error: 'episodio_id es obligatorio' });
    const epi = await models.Episodio.findByPk(episodio_id);
    if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });

    const created = await models.ControlClinico.create({
      episodio_id,
      profesional_id: profesional_id ?? null,
      profesional_nombre: profesional_nombre ?? null,
      origen: origen ?? undefined,
      resumen: resumen ?? null,
      fecha_hora_control: fecha_hora_control ? parseDate(fecha_hora_control) : new Date(),
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create control_clinico error', e);
    res.status(500).json({ error: 'Error al crear control clínico' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.ControlClinico.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const body = req.body || {};
    if (body.episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(body.episodio_id);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      row.episodio_id = body.episodio_id;
    }
    if (body.profesional_id !== undefined) row.profesional_id = body.profesional_id ?? null;
    if (body.profesional_nombre !== undefined) row.profesional_nombre = body.profesional_nombre ?? null;
    if (body.origen !== undefined) row.origen = body.origen;
    if (body.resumen !== undefined) row.resumen = body.resumen ?? null;
    if (body.fecha_hora_control !== undefined) row.fecha_hora_control = body.fecha_hora_control ? parseDate(body.fecha_hora_control) : new Date();

    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update control_clinico error', e);
    res.status(500).json({ error: 'Error al actualizar control clínico' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.ControlClinico.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove control_clinico error', e);
    res.status(500).json({ error: 'Error al eliminar control clínico' });
  }
}

module.exports = { list, getOne, create, update, remove };

