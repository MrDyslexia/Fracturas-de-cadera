module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Administrador = sequelize.define("Administrador", {
    rut: { type: DataTypes.STRING, primaryKey: true }, // FK a users.rut
    nivel_acceso: DataTypes.STRING,
  }, { tableName: "administradores", timestamps: false, id: false });
  return Administrador;
};
