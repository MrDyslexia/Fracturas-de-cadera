// routes/initRoutes.js
const express = require("express");

// importa cada archivo de rutas
const userRoutes         = require("./user.routes");
const pacienteRoutes     = require("./paciente.routes");
const funcionarioRoutes  = require("./funcionario.routes");
const tecnologoRoutes    = require("./tecnologo.routes");
const investigadorRoutes = require("./investigador.routes");
const administradorRoutes= require("./administrador.routes");
const examenRoutes       = require("./examen.routes");
const muestraRoutes      = require("./muestra.routes");
const resultadoRoutes    = require("./resultado.routes");
const indicadorRoutes    = require("./indicador.routes");
const alertaRoutes       = require("./alerta.routes");
const minutaRoutes       = require("./minuta.routes");
const descargaRoutes     = require("./descarga.routes");
const registroRoutes     = require("./registro.routes");
const loginRoutes = require("./login.routes");

/**
 * Inicializa todas las rutas bajo un prefijo (ej: /api o /api/v1)
 * @param {express.Express} app
 * @param {string} basePath
 */
function initRoutes(app, basePath = "/api") {
  const api = express.Router();

  api.use("/users",           userRoutes);
  api.use("/pacientes",       pacienteRoutes);
  api.use("/funcionarios",    funcionarioRoutes);
  api.use("/tecnologos",      tecnologoRoutes);
  api.use("/investigadores",  investigadorRoutes);
  api.use("/administradores", administradorRoutes);
  api.use("/examenes",        examenRoutes);
  api.use("/muestras",        muestraRoutes);
  api.use("/resultados",      resultadoRoutes);
  api.use("/indicadores",     indicadorRoutes);
  api.use("/alertas",         alertaRoutes);
  api.use("/minutas",         minutaRoutes);
  api.use("/descargas",       descargaRoutes);
  api.use("/registros",       registroRoutes);
  api.use("/login", loginRoutes);

  // fallback para rutas desconocidas
  api.use((req, res) => {
    res.status(404).json({ error: "Ruta no encontrada" });
  });

  app.use(basePath, api);
}

module.exports = { initRoutes };
