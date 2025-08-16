const models = require("../model/initModels");
const { idParam } = require("./_crud");

async function list(req, res) { try {
  const rows = await models.Examen.findAll({ order: [["examen_id", "DESC"]] });
  res.json(rows);
} catch { res.status(500).json({ error: "Error al listar exámenes" }); } }

async function getOne(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Examen.findByPk(id);
  if (!row) return res.status(404).json({ error: "No encontrado" });
  res.json(row);
} catch { res.status(500).json({ error: "Error al obtener examen" }); } }

async function create(req, res) { try {
  const { tipo_examen, fecha_solicitud, paciente_id, funcionario_id } = req.body;
  if (!tipo_examen || !fecha_solicitud || !paciente_id || !funcionario_id)
    return res.status(400).json({ error: "Campos obligatorios: tipo_examen, fecha_solicitud, paciente_id, funcionario_id" });

  // validaciones de FK:
  const p = await models.Paciente.findByPk(paciente_id);
  const f = await models.Funcionario.findByPk(funcionario_id);
  if (!p) return res.status(400).json({ error: "paciente_id no existe" });
  if (!f) return res.status(400).json({ error: "funcionario_id no existe" });

  const created = await models.Examen.create({
    tipo_examen, fecha_solicitud: new Date(fecha_solicitud), paciente_id, funcionario_id
  });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear examen" }); } }

async function update(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Examen.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });

  const { tipo_examen, fecha_solicitud, paciente_id, funcionario_id } = req.body;
  if (tipo_examen !== undefined) row.tipo_examen = String(tipo_examen);
  if (fecha_solicitud !== undefined) row.fecha_solicitud = new Date(fecha_solicitud);
  if (paciente_id !== undefined) {
    const p = await models.Paciente.findByPk(paciente_id);
    if (!p) return res.status(400).json({ error: "paciente_id no existe" });
    row.paciente_id = paciente_id;
  }
  if (funcionario_id !== undefined) {
    const f = await models.Funcionario.findByPk(funcionario_id);
    if (!f) return res.status(400).json({ error: "funcionario_id no existe" });
    row.funcionario_id = funcionario_id;
  }
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar examen" }); } }

async function remove(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Examen.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar examen" }); } }

module.exports = { list, getOne, create, update, remove };
