module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Tecnologo = sequelize.define("Tecnologo", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    rut_profesional: DataTypes.STRING,
    especialidad: DataTypes.STRING,
  }, { tableName: "tecnologos", timestamps: false });
  return Tecnologo;
};
