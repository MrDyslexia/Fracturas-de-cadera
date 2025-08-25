module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Resultado = sequelize.define("Resultado", {
    resultado_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    parametro: { type: DataTypes.STRING, allowNull: false },
    valor: { type: DataTypes.FLOAT, allowNull: false },
    unidad: DataTypes.STRING,
    fecha_resultado: { type: DataTypes.DATE, allowNull: false },
    muestra_id: { type: DataTypes.INTEGER, allowNull: false }, // → muestra.muestra_id
  }, { tableName: "resultado", timestamps: false });
  return Resultado;
};
