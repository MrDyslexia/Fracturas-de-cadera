// model/initModels.js
const { sequelize } = require("./db");

// Modelos base
const User              = require("./user")(sequelize);
const Paciente          = require("./paciente")(sequelize);
const Administrador     = require("./administrador")(sequelize);

// Perfil profesional unificado
const ProfessionalProfile = require("./professional_profile")(sequelize);

// Negocio
const Examen            = require("./examen")(sequelize);
const Muestra           = require("./muestra")(sequelize);
const Resultado         = require("./lab_result_item")(sequelize);
const IndicadorRiesgo   = require("./indicador_riesgo")(sequelize);
const Alerta            = require("./alerta")(sequelize);
const Minuta            = require("./minuta")(sequelize);
const Descarga          = require("./descarga")(sequelize);
const Registro          = require("./registro")(sequelize);
const GenericReport     = require("./generic_report")(sequelize); // <— nombre consistente

// ─── Relaciones entre modelos ───

// Examen ↔ GenericReport (1:1) — informe para IMAGEN / AP
Examen.hasOne(GenericReport, { foreignKey: "examen_id" });
GenericReport.belongsTo(Examen, { foreignKey: "examen_id" });

// ---- Users ↔ Paciente/Administrador (1:1)
User.hasOne(Paciente,      { as: "paciente",      foreignKey: "user_id", onDelete: "CASCADE" });
Paciente.belongsTo(User,   { as: "user",          foreignKey: "user_id" });

User.hasOne(Administrador, { as: "administrador", foreignKey: "user_id", onDelete: "CASCADE" });
Administrador.belongsTo(User, { as: "user",      foreignKey: "user_id" });

// ---- Users ↔ ProfessionalProfile (1:1)
User.hasOne(ProfessionalProfile, { as: "professional_profile", foreignKey: "user_id", onDelete: "CASCADE" });
ProfessionalProfile.belongsTo(User, { as: "user", foreignKey: "user_id" });

// ─── Relaciones de negocio (usando profesional_id) ───
Paciente.hasMany(Examen, { foreignKey: "paciente_id" });
Examen.belongsTo(Paciente, { foreignKey: "paciente_id" });

ProfessionalProfile.hasMany(Examen, { foreignKey: "profesional_id" });
Examen.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

Examen.hasMany(Muestra, { foreignKey: "examen_id" });
Muestra.belongsTo(Examen, { foreignKey: "examen_id" });

ProfessionalProfile.hasMany(Muestra, { foreignKey: "profesional_id" });
Muestra.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

Muestra.hasMany(Resultado, { foreignKey: "muestra_id" });
Resultado.belongsTo(Muestra, { foreignKey: "muestra_id" });

// (Opcional pero recomendado) Examen ↔ Resultado (1:N)
// Requiere columna examen_id en la tabla resultado (añádela por migración si no existe)
Examen.hasMany(Resultado, { foreignKey: "examen_id" });
Resultado.belongsTo(Examen, { foreignKey: "examen_id" });

Resultado.hasMany(IndicadorRiesgo, { foreignKey: "resultado_id" });
IndicadorRiesgo.belongsTo(Resultado, { foreignKey: "resultado_id" });

IndicadorRiesgo.hasMany(Alerta, { foreignKey: "indicador_id" });
Alerta.belongsTo(IndicadorRiesgo, { foreignKey: "indicador_id" });

ProfessionalProfile.hasMany(Minuta, { foreignKey: "profesional_id" });
Minuta.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

Paciente.hasMany(Minuta, { foreignKey: "paciente_id" });
Minuta.belongsTo(Paciente, { foreignKey: "paciente_id" });

ProfessionalProfile.hasMany(Descarga, { foreignKey: "profesional_id" });
Descarga.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

Muestra.hasMany(Descarga, { foreignKey: "muestra_id" });
Descarga.belongsTo(Muestra, { foreignKey: "muestra_id" });

// Registro (auditoría)
Administrador.hasMany(Registro, { foreignKey: "administrador_id" });
Registro.belongsTo(Administrador, { foreignKey: "administrador_id" });

User.hasMany(Registro, { foreignKey: "actor_user_id" });
Registro.belongsTo(User, { foreignKey: "actor_user_id" });

module.exports = {
  sequelize,
  User, Paciente, Administrador,
  ProfessionalProfile,
  Examen, Muestra, Resultado, IndicadorRiesgo, Alerta, Minuta, Descarga, Registro, GenericReport,
};
