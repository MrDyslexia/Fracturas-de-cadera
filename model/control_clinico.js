// model/control_clinico.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const ControlClinico = sequelize.define("ControlClinico", {
    control_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false },      // → episodio.episodio_id
    profesional_id: { type: DataTypes.INTEGER, allowNull: true },     // → professional_profiles.id
    profesional_nombre: { type: DataTypes.STRING, allowNull: true },  // respaldo por si no hay perfil
    origen: { type: DataTypes.ENUM("Guardado","Minuta","Otro"), defaultValue: "Guardado" },
    resumen: { type: DataTypes.TEXT, allowNull: true },
    fecha_hora_control: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
  }, {
    tableName: "control_clinico",
    timestamps: false,
  });

  return ControlClinico;
};
