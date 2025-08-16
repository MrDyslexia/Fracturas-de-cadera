module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Funcionario = sequelize.define("Funcionario", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },
    cargo: DataTypes.STRING,
    departamento: DataTypes.STRING,
  }, { tableName: "funcionarios", timestamps: false });
  return Funcionario;
};
