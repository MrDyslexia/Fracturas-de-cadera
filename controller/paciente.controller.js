const models = require("../model/initModels");

async function list(req, res) {
  try { res.json(await models.Paciente.findAll()); }
  catch { res.status(500).json({ error: "Error al listar pacientes" }); }
}

async function getOne(req, res) {
  try {
    const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
    const row = await models.Paciente.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    res.json(row);
  } catch { res.status(500).json({ error: "Error al obtener paciente" }); }
}

async function create(req, res) {
  try {
    const { user_id, tipo_sangre, altura, edad } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id obligatorio" });

    const user = await models.User.findByPk(user_id);
    if (!user) return res.status(400).json({ error: "User no existe" });

    const created = await models.Paciente.create({ user_id, tipo_sangre, altura, edad });
    res.status(201).json(created);
  } catch { res.status(500).json({ error: "Error al crear paciente" }); }
}

async function update(req, res) {
  try {
    const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
    const row = await models.Paciente.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });

    const { tipo_sangre, altura, edad } = req.body;
    if (tipo_sangre !== undefined) row.tipo_sangre = tipo_sangre;
    if (altura !== undefined) row.altura = altura;
    if (edad !== undefined) row.edad = edad;
    await row.save();
    res.json(row);
  } catch { res.status(500).json({ error: "Error al actualizar paciente" }); }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
    const row = await models.Paciente.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
    await row.destroy();
    res.status(204).send();
  } catch { res.status(500).json({ error: "Error al eliminar paciente" }); }
}

module.exports = { list, getOne, create, update, remove };
