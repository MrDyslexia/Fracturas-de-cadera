const models = require("../model/initModels");
const { idParam } = require("./_crud");

async function list(req, res) { try { res.json(await models.Minuta.findAll({ order: [["minuta_id","DESC"]] })); } catch { res.status(500).json({ error: "Error al listar minutas" }); } }
async function getOne(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Minuta.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" }); res.json(row);
} catch { res.status(500).json({ error: "Error al obtener minuta" }); } }
async function create(req, res) { try {
  const { ruta_pdf, fecha_creacion, funcionario_id, paciente_id, tecnologo_id } = req.body;
  if (!ruta_pdf || !fecha_creacion || !funcionario_id || !paciente_id || !tecnologo_id)
    return res.status(400).json({ error: "ruta_pdf, fecha_creacion, funcionario_id, paciente_id, tecnologo_id obligatorios" });

  if (!(await models.Funcionario.findByPk(funcionario_id))) return res.status(400).json({ error: "funcionario_id no existe" });
  if (!(await models.Paciente.findByPk(paciente_id))) return res.status(400).json({ error: "paciente_id no existe" });
  if (!(await models.Tecnologo.findByPk(tecnologo_id))) return res.status(400).json({ error: "tecnologo_id no existe" });

  const created = await models.Minuta.create({ ruta_pdf, fecha_creacion: new Date(fecha_creacion), funcionario_id, paciente_id, tecnologo_id });
  res.status(201).json(created);
} catch { res.status(500).json({ error: "Error al crear minuta" }); } }
async function update(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Minuta.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  const { ruta_pdf, fecha_creacion, funcionario_id, paciente_id, tecnologo_id } = req.body;
  if (ruta_pdf !== undefined) row.ruta_pdf = ruta_pdf;
  if (fecha_creacion !== undefined) row.fecha_creacion = new Date(fecha_creacion);
  if (funcionario_id !== undefined) {
    if (!(await models.Funcionario.findByPk(funcionario_id))) return res.status(400).json({ error: "funcionario_id no existe" });
    row.funcionario_id = funcionario_id;
  }
  if (paciente_id !== undefined) {
    if (!(await models.Paciente.findByPk(paciente_id))) return res.status(400).json({ error: "paciente_id no existe" });
    row.paciente_id = paciente_id;
  }
  if (tecnologo_id !== undefined) {
    if (!(await models.Tecnologo.findByPk(tecnologo_id))) return res.status(400).json({ error: "tecnologo_id no existe" });
    row.tecnologo_id = tecnologo_id;
  }
  await row.save(); res.json(row);
} catch { res.status(500).json({ error: "Error al actualizar minuta" }); } }
async function remove(req, res) { try {
  const id = idParam(req); if (!id) return res.status(400).json({ error: "id inválido" });
  const row = await models.Minuta.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
  await row.destroy(); res.status(204).send();
} catch { res.status(500).json({ error: "Error al eliminar minuta" }); } }

module.exports = { list, getOne, create, update, remove };
