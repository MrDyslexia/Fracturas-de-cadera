// model/professional_profile.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const ProfessionalProfile = sequelize.define("ProfessionalProfile", {
    id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    user_id: {
      type: DataTypes.INTEGER, allowNull: false, unique: true,
      references: { model: "users", key: "id" },
      onUpdate: "CASCADE", onDelete: "CASCADE",
    },
    rut_profesional: { type: DataTypes.STRING(16), allowNull: true, unique: true },
    especialidad: { type: DataTypes.STRING(120), allowNull: true },
    cargo: {
      type: DataTypes.ENUM("TECNOLOGO", "INVESTIGADOR", "FUNCIONARIO"),
      allowNull: false,
    },
    hospital: { type: DataTypes.STRING(120), allowNull: true },
    departamento: { type: DataTypes.STRING(80), allowNull: true },
    fecha_ingreso: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  }, {
    tableName: "professional_profiles",
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ["user_id"], unique: true },
      { fields: ["rut_profesional"], unique: true },
      { fields: ["cargo"] },
    ],
  });

  // El belongsTo lo declaramos en initModels para tener todo centralizado.
  return ProfessionalProfile;
};
