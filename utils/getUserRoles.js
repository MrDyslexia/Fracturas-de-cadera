// utils/getUserRoles.js
module.exports = async function getUserRoles(models, userId) {
  const roles = [];

  // ADMIN (tu modelo Administrador tiene PK = user_id, así que findByPk sirve)
  if (models.Administrador) {
    const a = await models.Administrador.findByPk(userId);
    if (a) roles.push('ADMIN');
  }

  // PROFESIONALES vía tablas separadas
  if (models.Funcionario) {
    const f = await models.Funcionario.findOne({ where: { user_id: userId } });
    if (f) roles.push('FUNCIONARIO');
  }
  if (models.Tecnologo) {
    const t = await models.Tecnologo.findOne({ where: { user_id: userId } });
    if (t) roles.push('TECNOLOGO');
  }
  if (models.Investigador) {
    const i = await models.Investigador.findOne({ where: { user_id: userId } });
    if (i) roles.push('INVESTIGADOR');
  }

  // PACIENTE (si existe)
  if (models.Paciente?.findOne) {
    const p = await models.Paciente.findOne({ where: { user_id: userId } });
    if (p) roles.push('PACIENTE');
  }

  // únicos en mayúscula
  return Array.from(new Set(roles.map(r => String(r).toUpperCase())));
};
