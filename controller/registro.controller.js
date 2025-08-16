const models = require("../model/initModels");
const { idParam } = require("./_crud");

async function list(req, res) { try { res.json(await models.Registro.findAll({ order: [["registro_id","DESC"]] })); } catch { res.status(500).json({ error: "Error al listar registros" }); } }
async function getOne(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Registro.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener registro" }); } }
async function create(req, res) { try {
  const { accion, fecha_registro, administrador_id, actor_user_id } = req.body;
  if (!accion || !fecha_registro) return res.status(400).json({ error: "accion y fecha_registro obligatorios" });
  if (administrador_id && !(await models.Administrador.findByPk(administrador_id)))
    return res.status(400).json({ error: "administrador_id no existe" });
  if (actor_user_id && !(await models.User.findByPk(actor_user_id)))
    return res.status(400).json({ error: "actor_user_id no existe" });

  const created = await models.Registro.create({
    accion, fecha_registro: new Date(fecha_registro), administrador_id, actor_user_id
  });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear registro" }); } }
async function update(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Registro.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { accion, fecha_registro, administrador_id, actor_user_id } = req.body;
  if (accion !== undefined) row.accion = accion;
  if (fecha_registro !== undefined) row.fecha_registro = new Date(fecha_registro);
  if (administrador_id !== undefined) {
    if (administrador_id && !(await models.Administrador.findByPk(administrador_id)))
      return res.status(400).json({ error: "administrador_id no existe" });
    row.administrador_id = administrador_id || null;
  }
  if (actor_user_id !== undefined) {
    if (actor_user_id && !(await models.User.findByPk(actor_user_id)))
      return res.status(400).json({ error: "actor_user_id no existe" });
    row.actor_user_id = actor_user_id || null;
  }
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar registro" }); } }
async function remove(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Registro.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar registro" }); } }

module.exports = { list, getOne, create, update, remove };
