// controller/parametro.controller.js (Parametrización de laboratorio)
const models = require('../model/initModels');

function codeParam(req) {
  const c = (req.params?.codigo ?? req.params?.id ?? '').toString().trim();
  return c.length ? c : null;
}

async function list(req, res) {
  try {
    const rows = await models.ParametroLab.findAll({ order: [['codigo', 'ASC']] });
    res.json(rows);
  } catch (e) {
    console.error('list parametro error', e);
    res.status(500).json({ error: 'Error al listar parámetros' });
  }
}

async function getOne(req, res) {
  try {
    const codigo = codeParam(req);
    if (!codigo) return res.status(400).json({ error: 'codigo inválido' });
    const row = await models.ParametroLab.findByPk(codigo);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne parametro error', e);
    res.status(500).json({ error: 'Error al obtener parámetro' });
  }
}

async function create(req, res) {
  try {
    const { codigo, nombre, unidad, ref_min, ref_max, notas } = req.body || {};
    if (!codigo || !nombre) return res.status(400).json({ error: 'codigo y nombre son obligatorios' });
    const exists = await models.ParametroLab.findByPk(String(codigo));
    if (exists) return res.status(409).json({ error: 'codigo ya existe' });
    const created = await models.ParametroLab.create({
      codigo: String(codigo),
      nombre: String(nombre),
      unidad: unidad ?? null,
      ref_min: ref_min ?? null,
      ref_max: ref_max ?? null,
      notas: notas ?? null,
    });
    res.status(201).json(created);
  } catch (e) {
    console.error('create parametro error', e);
    res.status(500).json({ error: 'Error al crear parámetro' });
  }
}

async function update(req, res) {
  try {
    const codigo = codeParam(req);
    if (!codigo) return res.status(400).json({ error: 'codigo inválido' });
    const row = await models.ParametroLab.findByPk(codigo);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    const { nombre, unidad, ref_min, ref_max, notas } = req.body || {};
    if (nombre !== undefined) row.nombre = nombre;
    if (unidad !== undefined) row.unidad = unidad ?? null;
    if (ref_min !== undefined) row.ref_min = ref_min ?? null;
    if (ref_max !== undefined) row.ref_max = ref_max ?? null;
    if (notas !== undefined) row.notas = notas ?? null;
    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update parametro error', e);
    res.status(500).json({ error: 'Error al actualizar parámetro' });
  }
}

async function remove(req, res) {
  try {
    const codigo = codeParam(req);
    if (!codigo) return res.status(400).json({ error: 'codigo inválido' });
    const row = await models.ParametroLab.findByPk(codigo);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove parametro error', e);
    res.status(500).json({ error: 'Error al eliminar parámetro' });
  }
}

module.exports = { list, getOne, create, update, remove };

