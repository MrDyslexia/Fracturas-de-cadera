const models = require("../model/initModels");
const { idParam } = require("./_crud");

async function list(req, res) { try { res.json(await models.Descarga.findAll({ order: [["descarga_id","DESC"]] })); } catch { res.status(500).json({ error: "Error al listar descargas" }); } }
async function getOne(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Descarga.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener descarga" }); } }
async function create(req, res) { try {
  const { fecha_descarga, formato, investigador_id, muestra_id } = req.body;
  if (!fecha_descarga || !investigador_id || !muestra_id)
    return res.status(400).json({ error: "fecha_descarga, investigador_id, muestra_id obligatorios" });
  if (!(await models.Investigador.findByPk(investigador_id))) return res.status(400).json({ error: "investigador_id no existe" });
  if (!(await models.Muestra.findByPk(muestra_id))) return res.status(400).json({ error: "muestra_id no existe" });

  const created = await models.Descarga.create({ fecha_descarga: new Date(fecha_descarga), formato, investigador_id, muestra_id });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear descarga" }); } }
async function update(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Descarga.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { fecha_descarga, formato, investigador_id, muestra_id } = req.body;
  if (fecha_descarga !== undefined) row.fecha_descarga = new Date(fecha_descarga);
  if (formato !== undefined) row.formato = formato;
  if (investigador_id !== undefined) {
    if (!(await models.Investigador.findByPk(investigador_id))) return res.status(400).json({ error: "investigador_id no existe" });
    row.investigador_id = investigador_id;
  }
  if (muestra_id !== undefined) {
    if (!(await models.Muestra.findByPk(muestra_id))) return res.status(400).json({ error: "muestra_id no existe" });
    row.muestra_id = muestra_id;
  }
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar descarga" }); } }
async function remove(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Descarga.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar descarga" }); } }

module.exports = { list, getOne, create, update, remove };
