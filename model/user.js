// model/user.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const User = sequelize.define("User", {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    rut: { type: DataTypes.STRING, unique: true, allowNull: false },
    
    // 👇 campos separados
    nombres: { type: DataTypes.STRING, allowNull: false },
    apellido_paterno: { type: DataTypes.STRING, allowNull: false },
    apellido_materno: { type: DataTypes.STRING, allowNull: false },

    correo: { type: DataTypes.STRING, unique: true, allowNull: false },
    password_hash: { type: DataTypes.STRING, allowNull: false },

    sexo: DataTypes.CHAR(1),
    fecha_nacimiento: DataTypes.DATEONLY,
    fecha_creacion: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, { 
    tableName: "users", 
    timestamps: false 
  });

  return User;
};
