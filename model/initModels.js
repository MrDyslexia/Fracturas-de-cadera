// model/initModels.js
const { sequelize } = require("./db");

// Definiciones
const User            = require("./user")(sequelize);
const Paciente        = require("./paciente")(sequelize);
const Funcionario     = require("./funcionario")(sequelize);
const Tecnologo       = require("./tecnologo")(sequelize);
const Investigador    = require("./investigador")(sequelize);
const Administrador   = require("./administrador")(sequelize);

const Examen          = require("./examen")(sequelize);
const Muestra         = require("./muestra")(sequelize);
const Resultado       = require("./resultado")(sequelize);
const IndicadorRiesgo = require("./indicador_riesgo")(sequelize);
const Alerta          = require("./alerta")(sequelize);
const Minuta          = require("./minuta")(sequelize);
const Descarga        = require("./descarga")(sequelize);
const Registro        = require("./registro")(sequelize);

// ---- Users ↔ Perfiles (1:1)
User.hasOne(Paciente,     { foreignKey: "user_id", onDelete: "CASCADE" });
Paciente.belongsTo(User,  { foreignKey: "user_id" });

User.hasOne(Funcionario,  { foreignKey: "user_id", onDelete: "CASCADE" });
Funcionario.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Tecnologo,    { foreignKey: "user_id", onDelete: "CASCADE" });
Tecnologo.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Investigador, { foreignKey: "user_id", onDelete: "CASCADE" });
Investigador.belongsTo(User, { foreignKey: "user_id" });

User.hasOne(Administrador,{ foreignKey: "user_id", onDelete: "CASCADE" });
Administrador.belongsTo(User, { foreignKey: "user_id" });

// ---- Relaciones de negocio

// Paciente/Funcionario → Examen
Paciente.hasMany(Examen,    { foreignKey: "paciente_id" });
Examen.belongsTo(Paciente,  { foreignKey: "paciente_id" });

Funcionario.hasMany(Examen, { foreignKey: "funcionario_id" });
Examen.belongsTo(Funcionario, { foreignKey: "funcionario_id" });

// Examen → Muestra (y Tecnólogo → Muestra)
Examen.hasMany(Muestra,     { foreignKey: "examen_id" });
Muestra.belongsTo(Examen,   { foreignKey: "examen_id" });

Tecnologo.hasMany(Muestra,  { foreignKey: "tecnologo_id" });
Muestra.belongsTo(Tecnologo,{ foreignKey: "tecnologo_id" });

// Muestra → Resultado
Muestra.hasMany(Resultado,  { foreignKey: "muestra_id" });
Resultado.belongsTo(Muestra,{ foreignKey: "muestra_id" });

// Resultado → IndicadorRiesgo → Alerta
Resultado.hasMany(IndicadorRiesgo, { foreignKey: "resultado_id" });
IndicadorRiesgo.belongsTo(Resultado,{ foreignKey: "resultado_id" });

IndicadorRiesgo.hasMany(Alerta, { foreignKey: "indicador_id" });
Alerta.belongsTo(IndicadorRiesgo,{ foreignKey: "indicador_id" });

// Minuta ← Funcionario/Paciente/Tecnologo
Funcionario.hasMany(Minuta, { foreignKey: "funcionario_id" });
Minuta.belongsTo(Funcionario,{ foreignKey: "funcionario_id" });

Paciente.hasMany(Minuta,    { foreignKey: "paciente_id" });
Minuta.belongsTo(Paciente,  { foreignKey: "paciente_id" });

Tecnologo.hasMany(Minuta,   { foreignKey: "tecnologo_id" });
Minuta.belongsTo(Tecnologo, { foreignKey: "tecnologo_id" });

// Descarga ← Investigador/Muestra
Investigador.hasMany(Descarga, { foreignKey: "investigador_id" });
Descarga.belongsTo(Investigador,{ foreignKey: "investigador_id" });

Muestra.hasMany(Descarga,   { foreignKey: "muestra_id" });
Descarga.belongsTo(Muestra, { foreignKey: "muestra_id" });

// Registro ← Administrador/User genérico
Administrador.hasMany(Registro, { foreignKey: "administrador_id" });
Registro.belongsTo(Administrador,{ foreignKey: "administrador_id" });

User.hasMany(Registro, { foreignKey: "actor_user_id" });
Registro.belongsTo(User,{ foreignKey: "actor_user_id" });

module.exports = {
  sequelize,
  User, Paciente, Funcionario, Tecnologo, Investigador, Administrador,
  Examen, Muestra, Resultado, IndicadorRiesgo, Alerta, Minuta, Descarga, Registro,
};
