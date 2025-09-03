// model/resultados.js
module.exports = (sequelize) => {
  const { DataTypes } = require('sequelize');

  const Resultado = sequelize.define(
    'Resultado',
    {
      muestra_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        field: 'solicitud',
      },

      examen_id: {
        type: DataTypes.INTEGER,        // <-- corregido
        allowNull: false,
        primaryKey: true,
        field: 'id_examen',
      },

      id_parametro: {
        type: DataTypes.STRING(50),
        allowNull: false,
        primaryKey: true,
      },
      valor: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },

      examenesRealizadoSolicitud: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: 'examenes_realizado_solicitud', // <-- mapeo de nombre
      },
    },
    {
      tableName: 'resultados',
      schema: 'public',
      timestamps: false,
    }
  );

  return Resultado;
};
