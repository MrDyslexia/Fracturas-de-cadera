module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Descarga = sequelize.define("Descarga", {
    descarga_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    fecha_descarga: { type: DataTypes.DATE, allowNull: false },
    formato: DataTypes.STRING,
    investigador_id: { type: DataTypes.INTEGER, allowNull: false }, 
    muestra_id: { type: DataTypes.INTEGER, allowNull: false },     
  }, { tableName: "descarga", timestamps: false });
  return Descarga;
};
