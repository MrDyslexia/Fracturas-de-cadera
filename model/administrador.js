module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Administrador = sequelize.define("Administrador", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    nivel_acceso: DataTypes.STRING,
  }, { tableName: "administradores", timestamps: false });
  return Administrador;
};
