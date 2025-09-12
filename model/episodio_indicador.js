// model/episodio_indicador.js
module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const EpisodioIndicador = sequelize.define("EpisodioIndicador", {
    episodio_indicador_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    episodio_id: { type: DataTypes.INTEGER, allowNull: false }, // → episodio.episodio_id
    tipo: { 
      type: DataTypes.ENUM(
        "RIESGO_REFRACTURA", // compuesto Albúmina, Vit D, Hb
        "OPERADO_4D",        // boolean derivado de TDC
        "CALCIO_CORREGIDO"   // si decides persistirlo aquí también
      ), 
      allowNull: false 
    },
    valor: { type: DataTypes.FLOAT, allowNull: true },
    nivel: { type: DataTypes.ENUM("BAJO","MODERADO","ALTO"), allowNull: true },
    detalles: { type: DataTypes.JSONB, allowNull: true }, // para guardar explicaciones/cálculos
    calculado_en: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  }, {
    tableName: "episodio_indicador",
    timestamps: false,
  });

  return EpisodioIndicador;
};
