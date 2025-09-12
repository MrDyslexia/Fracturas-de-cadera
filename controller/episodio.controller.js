// controller/episodio.controller.js
const models = require('../model/initModels');
const { idParam } = require('./_crud');

function parseDate(input) {
  if (!input) return null;
  const t = Date.parse(input);
  return Number.isNaN(t) ? null : new Date(t);
}

async function list(req, res) {
  try {
    const rows = await models.Episodio.findAll({ order: [['episodio_id', 'DESC']] });
    res.json(rows);
  } catch (e) {
    console.error('list episodios error', e);
    res.status(500).json({ error: 'Error al listar episodios' });
  }
}

async function getOne(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Episodio.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    res.json(row);
  } catch (e) {
    console.error('getOne episodio error', e);
    res.status(500).json({ error: 'Error al obtener episodio' });
  }
}

async function create(req, res) {
  try {
    const {
      paciente_id,
      cie10,
      tipo_fractura,
      lado,
      procedencia,
      fecha_diagnostico,
      fecha_ingreso_quirurgico,
      fecha_alta,
      no_operado,
      causa_no_operar,
      abo,
      rh,
      tabaco,
      alcohol,
      corticoides_cronicos,
      taco,
      fallecimiento,
      fecha_fallecimiento,
      notas_ingreso,
    } = req.body || {};

    if (!paciente_id || !cie10 || !tipo_fractura || !fecha_diagnostico)
      return res.status(400).json({ error: 'paciente_id, cie10, tipo_fractura, fecha_diagnostico son obligatorios' });

    const pac = await models.Paciente.findByPk(paciente_id);
    if (!pac) return res.status(400).json({ error: 'paciente_id no existe' });

    const created = await models.Episodio.create({
      paciente_id,
      cie10,
      tipo_fractura,
      lado: lado ?? null,
      procedencia: procedencia ?? null,
      fecha_diagnostico: parseDate(fecha_diagnostico) || new Date(),
      fecha_ingreso_quirurgico: fecha_ingreso_quirurgico ? parseDate(fecha_ingreso_quirurgico) : null,
      fecha_alta: fecha_alta ? parseDate(fecha_alta) : null,
      no_operado: !!no_operado,
      causa_no_operar: causa_no_operar ?? null,
      abo: abo ?? null,
      rh: rh ?? null,
      tabaco: !!tabaco,
      alcohol: !!alcohol,
      corticoides_cronicos: !!corticoides_cronicos,
      taco: !!taco,
      fallecimiento: !!fallecimiento,
      fecha_fallecimiento: fecha_fallecimiento ? parseDate(fecha_fallecimiento) : null,
      notas_ingreso: notas_ingreso ?? null,
    });

    res.status(201).json(created);
  } catch (e) {
    console.error('create episodio error', e);
    res.status(500).json({ error: 'Error al crear episodio' });
  }
}

async function update(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Episodio.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });

    const body = req.body || {};

    const assign = (k, v) => { if (v !== undefined) row[k] = v; };

    if (body.paciente_id !== undefined) {
      const pac = await models.Paciente.findByPk(body.paciente_id);
      if (!pac) return res.status(400).json({ error: 'paciente_id no existe' });
      row.paciente_id = body.paciente_id;
    }
    assign('cie10', body.cie10);
    assign('tipo_fractura', body.tipo_fractura);
    assign('lado', body.lado ?? null);
    assign('procedencia', body.procedencia ?? null);
    if (body.fecha_diagnostico !== undefined) {
      const d = parseDate(body.fecha_diagnostico);
      if (!d) return res.status(400).json({ error: 'fecha_diagnostico inválida' });
      row.fecha_diagnostico = d;
    }
    if (body.fecha_ingreso_quirurgico !== undefined) row.fecha_ingreso_quirurgico = body.fecha_ingreso_quirurgico ? parseDate(body.fecha_ingreso_quirurgico) : null;
    if (body.fecha_alta !== undefined) row.fecha_alta = body.fecha_alta ? parseDate(body.fecha_alta) : null;
    if (body.fecha_fallecimiento !== undefined) row.fecha_fallecimiento = body.fecha_fallecimiento ? parseDate(body.fecha_fallecimiento) : null;
    if (body.no_operado !== undefined) row.no_operado = !!body.no_operado;
    assign('causa_no_operar', body.causa_no_operar ?? null);
    assign('abo', body.abo ?? null);
    assign('rh', body.rh ?? null);
    if (body.tabaco !== undefined) row.tabaco = !!body.tabaco;
    if (body.alcohol !== undefined) row.alcohol = !!body.alcohol;
    if (body.corticoides_cronicos !== undefined) row.corticoides_cronicos = !!body.corticoides_cronicos;
    if (body.taco !== undefined) row.taco = !!body.taco;
    if (body.fallecimiento !== undefined) row.fallecimiento = !!body.fallecimiento;
    assign('notas_ingreso', body.notas_ingreso ?? null);

    await row.save();
    res.json(row);
  } catch (e) {
    console.error('update episodio error', e);
    res.status(500).json({ error: 'Error al actualizar episodio' });
  }
}

async function remove(req, res) {
  try {
    const id = idParam(req);
    if (!id) return res.status(400).json({ error: 'id inválido' });
    const row = await models.Episodio.findByPk(id);
    if (!row) return res.status(404).json({ error: 'No encontrado' });
    await row.destroy();
    res.status(204).send();
  } catch (e) {
    console.error('remove episodio error', e);
    res.status(500).json({ error: 'Error al eliminar episodio' });
  }
}

module.exports = { list, getOne, create, update, remove };

