// controller/episodio_indicador.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');

function parseDate(input) {
  if (!input) return null;
  const t = Date.parse(input);
  return Number.isNaN(t) ? null : new Date(t);
}

async function list(req, res) {
  try {
    const rows = await models.EpisodioIndicador.findAll({ order: [['episodio_indicador_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list episodio_indicador error', e);
    res.status(500).json({ error: 'Error al listar indicadores de episodio' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.EpisodioIndicador.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne episodio_indicador error', e);
    res.status(500).json({ error: 'Error al obtener indicador de episodio' });
  }
}

async function create(req, res) {
  try {
    const { episodio_id, tipo, valor, nivel, detalles, calculado_en } = req.body || {};
    if (!episodio_id || !tipo) return res.status(400).json({ error: 'episodio_id y tipo son obligatorios' });
    const epi = await models.Episodio.findByPk(episodio_id);
    if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
    const created = await models.EpisodioIndicador.create({
      episodio_id,
      tipo,
      valor: valor ?? null,
      nivel: nivel ?? null,
      detalles: detalles ?? null,
      calculado_en: calculado_en ? parseDate(calculado_en) : new Date(),
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create episodio_indicador error', e);
    res.status(500).json({ error: 'Error al crear indicador de episodio' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.EpisodioIndicador.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    const body = req.body || {};
    if (body.episodio_id !== undefined) {
      const epi = await models.Episodio.findByPk(body.episodio_id);
      if (!epi) return res.status(400).json({ error: 'episodio_id no existe' });
      row.episodio_id = body.episodio_id;
    }
    if (body.tipo !== undefined) row.tipo = body.tipo;
    if (body.valor !== undefined) row.valor = body.valor ?? null;
    if (body.nivel !== undefined) row.nivel = body.nivel ?? null;
    if (body.detalles !== undefined) row.detalles = body.detalles ?? null;
    if (body.calculado_en !== undefined) row.calculado_en = body.calculado_en ? parseDate(body.calculado_en) : new Date();
    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update episodio_indicador error', e);
    res.status(500).json({ error: 'Error al actualizar indicador de episodio' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.EpisodioIndicador.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove episodio_indicador error', e);
    res.status(500).json({ error: 'Error al eliminar indicador de episodio' });
  }
}

module.exports = { list, getOne, create, update, remove };

