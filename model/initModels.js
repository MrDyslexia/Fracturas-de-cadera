// model/initModels.js
const { sequelize } = require("./db");

// ─── Modelos base ───
const User                = require("./user")(sequelize);
const Paciente            = require("./paciente")(sequelize);
const Administrador       = require("./administrador")(sequelize);

// Perfil profesional unificado
const ProfessionalProfile = require("./professional_profile")(sequelize);

// ─── Negocio ───
const Examen              = require("./examen")(sequelize);
const Muestra             = require("./muestra")(sequelize);
const Resultado           = require("./resultados")(sequelize);
const Parametro           = require("./parametros")(sequelize); // ✅ FALTABA
const IndicadorRiesgo     = require("./indicador_riesgo")(sequelize);
const Alerta              = require("./alerta")(sequelize);
const Minuta              = require("./minuta")(sequelize);
const Registro            = require("./registro")(sequelize);
const GenericReport       = require("./generic_report")(sequelize);

// ───────────────────────────────────────────────────────────────────────────────
// Relaciones entre modelos
// ───────────────────────────────────────────────────────────────────────────────

// Examen ↔ GenericReport (1:1)
Examen.hasOne(GenericReport, { foreignKey: "examen_id" });
GenericReport.belongsTo(Examen, { foreignKey: "examen_id" });

// Users ↔ Paciente (1:1)
User.hasOne(Paciente, { as: "paciente", foreignKey: "user_id", onDelete: "CASCADE" });
Paciente.belongsTo(User, { as: "user", foreignKey: "user_id" });

// Users ↔ Administrador (1:1)
User.hasOne(Administrador, { as: "administrador", foreignKey: "user_id", onDelete: "CASCADE" });
Administrador.belongsTo(User, { as: "user", foreignKey: "user_id" });

// Users ↔ ProfessionalProfile (1:1)
User.hasOne(ProfessionalProfile, { as: "professional_profile", foreignKey: "user_id", onDelete: "CASCADE" });
ProfessionalProfile.belongsTo(User, { as: "user", foreignKey: "user_id" });

// ─── Relaciones de negocio ───

// Paciente ↔ Examen (1:N)
Paciente.hasMany(Examen, { foreignKey: "paciente_id" });
Examen.belongsTo(Paciente, { foreignKey: "paciente_id" });

// ⛔ OJO: tu modelo Examen NO tiene profesional_id, así que esta relación NO aplica.
// ProfessionalProfile.hasMany(Examen, { foreignKey: "profesional_id" });
// Examen.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

// Examen ↔ Muestra (1:N)
Examen.hasMany(Muestra, { foreignKey: "examen_id" });
Muestra.belongsTo(Examen, { foreignKey: "examen_id" });

// ProfessionalProfile ↔ Muestra (1:N)  (Muestra sí tiene profesional_id)
ProfessionalProfile.hasMany(Muestra, { foreignKey: "profesional_id" });
Muestra.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

// Muestra ↔ Resultado (1:N)
Muestra.hasMany(Resultado, { foreignKey: "muestra_id" });
Resultado.belongsTo(Muestra, { foreignKey: "muestra_id" });

// Examen ↔ Resultado (1:N)
// ⚠️ Asegúrate de que `resultados.examen_id` sea del MISMO tipo que `examen.examen_id` (INTEGER).
Examen.hasMany(Resultado, { foreignKey: "examen_id" });
Resultado.belongsTo(Examen, { foreignKey: "examen_id" });

// Parametro ↔ Resultado (1:N)  ✅ NUEVO (coincide con FK resultados.id_parametro → parametros.id_parametro)
Parametro.hasMany(Resultado, { foreignKey: "id_parametro" });
Resultado.belongsTo(Parametro, { foreignKey: "id_parametro" });

// Resultado ↔ IndicadorRiesgo  ⛔ PROBLEMA DE ESQUEMA
// Estas líneas ASUMEN un campo indicador_riesgo.resultado_id que apunte a una PK simple en Resultado.
// Tu Resultado NO tiene `resultado_id` (usa PK compuesta), así que comentamos hasta definir la referencia.
// Resultado.hasMany(IndicadorRiesgo, { foreignKey: "resultado_id" });
// IndicadorRiesgo.belongsTo(Resultado, { foreignKey: "resultado_id" });

// IndicadorRiesgo ↔ Alerta (1:N)
IndicadorRiesgo.hasMany(Alerta, { foreignKey: "indicador_id" });
Alerta.belongsTo(IndicadorRiesgo, { foreignKey: "indicador_id" });

// ProfessionalProfile ↔ Minuta (1:N)
ProfessionalProfile.hasMany(Minuta, { foreignKey: "profesional_id" });
Minuta.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

// Paciente ↔ Minuta (1:N)
Paciente.hasMany(Minuta, { foreignKey: "paciente_id" });
Minuta.belongsTo(Paciente, { foreignKey: "paciente_id" });

// Registro (auditoría)
Administrador.hasMany(Registro, { foreignKey: "administrador_id" });
Registro.belongsTo(Administrador, { foreignKey: "administrador_id" });

User.hasMany(Registro, { foreignKey: "actor_user_id" });
Registro.belongsTo(User, { foreignKey: "actor_user_id" });

module.exports = {
  sequelize,
  User, Paciente, Administrador,
  ProfessionalProfile,
  Examen, Muestra, Resultado, Parametro, // ✅ incluye Parametro
  IndicadorRiesgo, Alerta, Minuta, Registro, GenericReport,
};
