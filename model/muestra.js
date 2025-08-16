module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Muestra = sequelize.define("Muestra", {
    muestra_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha_toma: { type: DataTypes.DATE, allowNull: false },
    examen_id: { type: DataTypes.INTEGER, allowNull: false },     // → examen.examen_id
    tecnologo_id: { type: DataTypes.INTEGER, allowNull: false },  // → tecnologos.user_id
  }, { tableName: "muestra", timestamps: false });
  return Muestra;
};
