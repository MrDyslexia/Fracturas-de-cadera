const models = require("../model/initModels");

async function list(req, res) {
  try { res.json(await models.Funcionario.findAll()); }
  catch { res.status(500).json({ error: "Error al listar funcionarios" }); }
}

async function getOne(req, res) {
  try {
    const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
    const row = await models.Funcionario.findByPk(id);
    if (!row) return res.status(404).json({ error: "No encontrado" });
    res.json(row);
  } catch { res.status(500).json({ error: "Error al obtener funcionario" }); }
}

async function create(req, res) {
  try {
    const { user_id, cargo, departamento } = req.body;
    if (!user_id) return res.status(400).json({ error: "user_id obligatorio" });
    const user = await models.User.findByPk(user_id);
    if (!user) return res.status(400).json({ error: "User no existe" });

    const created = await models.Funcionario.create({ user_id, cargo, departamento });
    res.status(201).json(created);
  } catch { res.status(500).json({ error: "Error al crear funcionario" }); }
}

async function update(req, res) {
  try {
    const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
    const row = await models.Funcionario.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });

    const { cargo, departamento } = req.body;
    if (cargo !== undefined) row.cargo = cargo;
    if (departamento !== undefined) row.departamento = departamento;
    await row.save();
    res.json(row);
  } catch { res.status(500).json({ error: "Error al actualizar funcionario" }); }
}

async function remove(req, res) {
  try {
    const id = Number(req.params.user_id); if (!id) return res.status(400).json({ error: "user_id inválido" });
    const row = await models.Funcionario.findByPk(id); if (!row) return res.status(404).json({ error: "No encontrado" });
    await row.destroy();
    res.status(204).send();
  } catch { res.status(500).json({ error: "Error al eliminar funcionario" }); }
}

module.exports = { list, getOne, create, update, remove };
