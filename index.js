// index.js
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { connectDB, sequelize } = require("./model/db");

// Registra modelos y asociaciones (antes de sync)
require("./model/initModels");

// Rutas main (todas las rutas se montan desde aquí)
const { initRoutes } = require("./routes/initRoutes");

const app = express();
app.use(cors());
app.use(express.json());

// Healthcheck
app.get("/health", async (_req, res) => {
  try {
    await sequelize.authenticate();
    res.json({ ok: true });
  } catch {
    res.status(500).json({ ok: false });
  }
});

// Montar TODAS las rutas bajo /api/v1
initRoutes(app, "/api/v1");

const PORT = process.env.PORT || 3000;

(async () => {
  try {
    await connectDB({ alter: true }); // en dev; en prod usa migraciones
    app.listen(PORT, () =>
      console.log(`🚀 API escuchando en http://localhost:${PORT}`)
    );
  } catch (e) {
    console.error("❌ No se pudo iniciar:", e);
    process.exit(1);
  }
})();
