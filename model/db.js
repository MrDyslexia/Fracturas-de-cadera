// model/db.js
const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.PGDATABASE,
  process.env.PGUSER,
  process.env.PGPASSWORD,
  {
    host: process.env.PGHOST,
    port: process.env.PGPORT,
    dialect: "postgres",
    logging: false,
    define: {
      underscored: true,     // columnas created_at, etc. si activaras timestamps
      freezeTableName: true, // no pluraliza
    },
  }
);

async function connectDB(syncOptions = { alter: true }) {
  await sequelize.authenticate();
  console.log("✅ Conexión a PostgreSQL establecida correctamente");
  // ¡OJO! Los modelos deben estar registrados antes (ver initModels).
  await sequelize.sync(syncOptions);
  console.log("✅ Modelos sincronizados");
}

module.exports = { sequelize, connectDB };
