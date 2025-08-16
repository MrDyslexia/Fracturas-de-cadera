module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Examen = sequelize.define("Examen", {
    examen_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo_examen: { type: DataTypes.STRING, allowNull: false },
    fecha_solicitud: { type: DataTypes.DATE, allowNull: false },
    // FKs fuertes por rol:
    paciente_id: { type: DataTypes.INTEGER, allowNull: false },    // → pacientes.user_id
    funcionario_id: { type: DataTypes.INTEGER, allowNull: false }, // → funcionarios.user_id
  }, { tableName: "examen", timestamps: false });
  return Examen;
};
