module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Alerta = sequelize.define("Alerta", {
    alerta_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: DataTypes.STRING,
    mensaje: DataTypes.TEXT,
    indicador_id: { type: DataTypes.INTEGER, allowNull: false }, // → indicador_riesgo.indicador_id
  }, { tableName: "alerta", timestamps: false });
  return Alerta;
};
