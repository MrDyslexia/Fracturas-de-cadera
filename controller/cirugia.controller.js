// controller/cirugia.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');

function parseDateOnly(input) {
  if (!input) return null;
  // Allow YYYY-MM-DD or any parsable
  const d = new Date(input);
  return isNaN(d.getTime()) ? null : d;
}

async function list(req, res) {
  try {
    const rows = await models.Cirugia.findAll({ order: [['cirugia_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list cirugia error', e);
    res.status(500).json({ error: 'Error al listar cirugías' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Cirugia.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne cirugia error', e);
    res.status(500).json({ error: 'Error al obtener cirugía' });
  }
}

async function create(req, res) {
  try {
    const {
      episodio_id,
      fecha,
      hora_inicio,
      hora_fin,
      tecnica,
      lado,
      reoperacion,
      complicacion_intraop,
      operador_id,
    } = req.body || {};

    if (!episodio_id || !fecha) return res.status(400).json({ error: 'episodio_id y fecha son obligatorios' });
    const epi = await models.Episodio.findByPk(episodio_id);
    if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });

    const created = await models.Cirugia.create({
      episodio_id,
      fecha: parseDateOnly(fecha) || new Date(),
      hora_inicio: hora_inicio ?? null,
      hora_fin: hora_fin ?? null,
      tecnica: tecnica ?? null,
      lado: lado ?? null,
      reoperacion: !!reoperacion,
      complicacion_intraop: complicacion_intraop ?? null,
      operador_id: operador_id ?? null,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create cirugia error', e);
    res.status(500).json({ error: 'Error al crear cirugía' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Cirugia.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const body = req.body || {};
    if (body.episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(body.episodio_id);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      row.episodio_id = body.episodio_id;
    }
    if (body.fecha !== undefined) row.fecha = body.fecha ? parseDateOnly(body.fecha) : row.fecha;
    if (body.hora_inicio !== undefined) row.hora_inicio = body.hora_inicio ?? null;
    if (body.hora_fin !== undefined) row.hora_fin = body.hora_fin ?? null;
    if (body.tecnica !== undefined) row.tecnica = body.tecnica ?? null;
    if (body.lado !== undefined) row.lado = body.lado ?? null;
    if (body.reoperacion !== undefined) row.reoperacion = !!body.reoperacion;
    if (body.complicacion_intraop !== undefined) row.complicacion_intraop = body.complicacion_intraop ?? null;
    if (body.operador_id !== undefined) row.operador_id = body.operador_id ?? null;

    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update cirugia error', e);
    res.status(500).json({ error: 'Error al actualizar cirugía' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Cirugia.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove cirugia error', e);
    res.status(500).json({ error: 'Error al eliminar cirugía' });
  }
}

module.exports = { list, getOne, create, update, remove };

