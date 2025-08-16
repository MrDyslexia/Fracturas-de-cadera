// model/professional_profile.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const ProfessionalProfile = sequelize.define(
    "ProfessionalProfile",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true, // 1 perfil profesional por usuario
        references: { model: "users", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },

      // Solo para profesionales; puede ser null si cargo = FUNCIONARIO (si así lo decides)
      rut_profesional: {
        type: DataTypes.STRING(16),
        allowNull: true,
        unique: true,
        validate: {
          len: { args: [5, 16], msg: "rut_profesional entre 5 y 16 caracteres" },
        },
      },

      especialidad: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },

      cargo: {
        type: DataTypes.ENUM("TECN0LOGO", "MEDICO", "INVESTIGADOR", "FUNCIONARIO"),
        allowNull: false,
      },

    hospital: { type: DataTypes.STRING(120), allowNull: true },
    departamento: { type: DataTypes.STRING(80), allowNull: true },
    fecha_ingreso: { type: DataTypes.DATEONLY, defaultValue: DataTypes.NOW },
    activo: { type: DataTypes.BOOLEAN, defaultValue: true },
    },
    {
      tableName: "professional_profiles",
      timestamps: true,
      underscored: true,
      indexes: [
        { fields: ["user_id"], unique: true },
        { fields: ["rut_profesional"], unique: true },
        { fields: ["cargo"] },
      ],
    }
  );

  ProfessionalProfile.associate = (models) => {
    ProfessionalProfile.belongsTo(models.User, { foreignKey: "user_id", as: "usuario" });
  };

  return ProfessionalProfile;
};
