const express = require('express');

// públicas / sesión
const authRoutes         = require('./auth');

// dominio (las que ya tienes)
const userRoutes         = require('./user.routes');
const pacienteRoutes     = require('./paciente.routes');
const funcionarioRoutes  = require('./funcionario.routes');
const tecnologoRoutes    = require('./tecnologo.routes');
const investigadorRoutes = require('./investigador.routes');
const administradorRoutes= require('./administrador.routes');
const examenRoutes       = require('./examen.routes');
const muestraRoutes      = require('./muestra.routes');
const resultadoRoutes    = require('./resultado.routes');
const indicadorRoutes    = require('./indicador.routes');
const alertaRoutes       = require('./alerta.routes');
const minutaRoutes       = require('./minuta.routes');
const descargaRoutes     = require('./descarga.routes');
const registroRoutes     = require('./registro.routes');
const adminUser          = require('./admin.users');
const perfilRoutes       = require('./perfil');

function initRoutes(app, basePath = '/api') {
  const api = express.Router();

  // públicas
  api.use('/auth', authRoutes);

  // dominio (todas RELATIVAS dentro de cada archivo)
  api.use('/users',           userRoutes);
  api.use('/pacientes',       pacienteRoutes);
  api.use('/funcionarios',    funcionarioRoutes);
  api.use('/tecnologos',      tecnologoRoutes);
  api.use('/investigadores',  investigadorRoutes);
  api.use('/administradores', administradorRoutes);
  api.use('/examenes',        examenRoutes);
  api.use('/muestras',        muestraRoutes);
  api.use('/resultados',      resultadoRoutes);
  api.use('/indicadores',     indicadorRoutes);
  api.use('/alertas',         alertaRoutes);
  api.use('/minutas',         minutaRoutes);
  api.use('/descargas',       descargaRoutes);
  api.use('/registros',       registroRoutes);
  api.use('/adminUser',       adminUser);
  api.use('/perfil',          perfilRoutes);

  app.use(basePath, api);

  // 404 (útil para ver qué ruta te está faltando)
  app.use((req, res) => {
    res.status(404).json({ error: 'Ruta no encontrada', path: req.originalUrl });
  });
}

module.exports = { initRoutes };
