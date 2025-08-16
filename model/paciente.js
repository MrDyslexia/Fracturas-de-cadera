module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");
  const Paciente = sequelize.define("Paciente", {
    user_id: { type: DataTypes.INTEGER, primaryKey: true },  // FK → users.id
    // específicos del paciente (ejemplos):
    tipo_sangre: DataTypes.STRING,
    altura: DataTypes.FLOAT,
    edad: DataTypes.INTEGER,
  }, { tableName: "pacientes", timestamps: false });
  return Paciente;
};
