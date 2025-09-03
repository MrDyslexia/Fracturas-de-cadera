module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Parametro = sequelize.define(
    'Parametro',
    {
      id_parametro: {
        type: DataTypes.STRING(50),
        primaryKey: true,
        allowNull: false,
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      unidad_de_medida: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      valores_de_referencia: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      metodo: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
    },
    {
      tableName: 'parametros',
      timestamps: false,
      underscored: false,    
    }
  );
  return Parametro;
};
