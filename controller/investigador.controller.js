const models = require("../model/initModels");

async function list(req, res) { try { res.json(await models.Investigador.findAll()); } catch { res.status(500).json({ error: "Error al listar investigadores" }); } }
async function getOne(req, res) { try {
  const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
  const row = await models.Investigador.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener investigador" }); } }
async function create(req, res) { try {
  const { user_id, area } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id obligatorio" });
  const user = await models.User.findByPk(user_id); if (!user) return res.status(400).json({ error: "User no existe" });
  const created = await models.Investigador.create({ user_id, area });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear investigador" }); } }
async function update(req, res) { try {
  const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
  const row = await models.Investigador.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { area } = req.body; if (area !== undefined) row.area = area;
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar investigador" }); } }
async function remove(req, res) { try {
  const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
  const row = await models.Investigador.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar investigador" }); } }

module.exports = { list, getOne, create, update, remove };
