const models = require("../model/initModels");
const { idParam } = require("./_crud");

async function list(req, res) { try { res.json(await models.Resultado.findAll({ order: [["resultado_id","DESC"]] })); } catch { res.status(500).json({ error: "Error al listar resultados" }); } }
async function getOne(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Resultado.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener resultado" }); } }
async function create(req, res) { try {
  const { parametro, valor, unidad, fecha_resultado, muestra_id } = req.body;
  if (!parametro || valor === undefined || !fecha_resultado || !muestra_id)
    return res.status(400).json({ error: "parametro, valor, fecha_resultado, muestra_id obligatorios" });
  const m = await models.Muestra.findByPk(muestra_id); if (!m) return res.status(400).json({ error: "muestra_id no existe" });
  const created = await models.Resultado.create({ parametro, valor, unidad, fecha_resultado: new Date(fecha_resultado), muestra_id });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear resultado" }); } }
async function update(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Resultado.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { parametro, valor, unidad, fecha_resultado, muestra_id } = req.body;
  if (parametro !== undefined) row.parametro = parametro;
  if (valor !== undefined) row.valor = valor;
  if (unidad !== undefined) row.unidad = unidad;
  if (fecha_resultado !== undefined) row.fecha_resultado = new Date(fecha_resultado);
  if (muestra_id !== undefined) {
    const m = await models.Muestra.findByPk(muestra_id); if (!m) return res.status(400).json({ error: "muestra_id no existe" });
    row.muestra_id = muestra_id;
  }
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar resultado" }); } }
async function remove(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Resultado.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar resultado" }); } }

module.exports = { list, getOne, create, update, remove };
