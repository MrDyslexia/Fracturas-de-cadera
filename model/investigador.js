module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Investigador = sequelize.define("Investigador", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    area: DataTypes.STRING,
  }, { tableName: "investigadores", timestamps: false });
  return Investigador;
};
