module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Minuta = sequelize.define("Minuta", {
    minuta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    ruta_pdf: DataTypes.STRING,
    fecha_creacion: { type: DataTypes.DATE, allowNull: false },
    funcionario_id: { type: DataTypes.INTEGER, allowNull: false }, // → funcionarios.user_id
    paciente_id: { type: DataTypes.INTEGER, allowNull: false },    // → pacientes.user_id
    tecnologo_id: { type: DataTypes.INTEGER, allowNull: false },   // → tecnologos.user_id
  }, { tableName: "minuta", timestamps: false });
  return Minuta;
};
