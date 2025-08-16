// model/initModels.js
const { sequelize } = require("./db");

// Modelos base
const User     = require("./user")(sequelize);
const Paciente = require("./paciente")(sequelize);
const Administrador = require("./administrador")(sequelize);

// NUEVO perfil profesional unificado
const ProfessionalProfile = require("./professional_profile")(sequelize);

// Negocio (ajústalos si cambia la FK a profesional)
const Examen          = require("./examen")(sequelize);
const Muestra         = require("./muestra")(sequelize);
const Resultado       = require("./resultado")(sequelize);
const IndicadorRiesgo = require("./indicador_riesgo")(sequelize);
const Alerta          = require("./alerta")(sequelize);
const Minuta          = require("./minuta")(sequelize);
const Descarga        = require("./descarga")(sequelize);
const Registro        = require("./registro")(sequelize);

// ---- Users ↔ Perfiles (1:1)
User.hasOne(Paciente, { foreignKey: "user_id", onDelete: "CASCADE" });
Paciente.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Administrador, { foreignKey: "user_id", onDelete: "CASCADE" });
Administrador.belongsTo(User, { foreignKey: "user_id" });

// NUEVO: Users ↔ ProfessionalProfile (1:1)
User.hasOne(ProfessionalProfile, { foreignKey: "user_id", onDelete: "CASCADE" });
ProfessionalProfile.belongsTo(User, { foreignKey: "user_id" });

/**
 * ⚠ IMPORTANTE (Migración de FKs):
 * Si antes tenías funcionario_id / tecnologo_id / investigador_id,
 * te recomiendo cambiar a un solo campo: `profesional_id`
 * que referencie professional_profiles.user_id.
 *
 * Mientras migras el esquema, comenta o ajusta abajo:
 */

// ─── Relaciones de negocio (sugerencia con profesional_id) ───

// Paciente → Examen (creador profesional genérico)
Paciente.hasMany(Examen, { foreignKey: "paciente_id" });
Examen.belongsTo(Paciente, { foreignKey: "paciente_id" });

// Examen realizado/ingresado por profesional
ProfessionalProfile.hasMany(Examen, { foreignKey: "profesional_id" });
Examen.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

// Examen → Muestra
Examen.hasMany(Muestra, { foreignKey: "examen_id" });
Muestra.belongsTo(Examen, { foreignKey: "examen_id" });

// Toma/procesa muestra: profesional
ProfessionalProfile.hasMany(Muestra, { foreignKey: "profesional_id" });
Muestra.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

// Muestra → Resultado
Muestra.hasMany(Resultado, { foreignKey: "muestra_id" });
Resultado.belongsTo(Muestra, { foreignKey: "muestra_id" });

// Resultado → IndicadorRiesgo → Alerta
Resultado.hasMany(IndicadorRiesgo, { foreignKey: "resultado_id" });
IndicadorRiesgo.belongsTo(Resultado, { foreignKey: "resultado_id" });

IndicadorRiesgo.hasMany(Alerta, { foreignKey: "indicador_id" });
Alerta.belongsTo(IndicadorRiesgo, { foreignKey: "indicador_id" });

// Minuta ← profesional y paciente
ProfessionalProfile.hasMany(Minuta, { foreignKey: "profesional_id" });
Minuta.belongsTo(ProfessionalProfile, { foreignKey: "profesional_id" });

Paciente.hasMany(Minuta, { foreignKey: "paciente_id" });
Minuta.belongsTo(Paciente, { foreignKey: "paciente_id" });

// Descarga ← profesional (investigador) / muestra
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
  Examen, Muestra, Resultado, IndicadorRiesgo, Alerta, Minuta, Descarga, Registro,
};
