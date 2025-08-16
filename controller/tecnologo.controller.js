const models = require("../model/initModels");

async function list(req, res) { try { res.json(await models.Tecnologo.findAll()); } catch { res.status(500).json({ error: "Error al listar tecnólogos" }); } }
async function getOne(req, res) { try {
  const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
  const row = await models.Tecnologo.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener tecnólogo" }); } }
async function create(req, res) { try {
  const { user_id, rut_profesional, especialidad } = req.body;
  if (!user_id) return res.status(400).json({ error: "user_id obligatorio" });
  const user = await models.User.findByPk(user_id); if (!user) return res.status(400).json({ error: "User no existe" });
  const created = await models.Tecnologo.create({ user_id, rut_profesional, especialidad });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear tecnólogo" }); } }
async function update(req, res) { try {
  const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
  const row = await models.Tecnologo.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { rut_profesional, especialidad } = req.body;
  if (rut_profesional !== undefined) row.rut_profesional = rut_profesional;
  if (especialidad !== undefined) row.especialidad = especialidad;
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar tecnólogo" }); } }
async function remove(req, res) { try {
  const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
  const row = await models.Tecnologo.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar tecnólogo" }); } }

module.exports = { list, getOne, create, update, remove };
