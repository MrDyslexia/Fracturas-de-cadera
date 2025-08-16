const express = require('express');
const authRoutes = require('./auth');          // ← este archivo
// … (las demás rutas de dominio)

function initRoutes(app, basePath = '/api') {
  const api = express.Router();

  // públicas / sesión
  api.use('/auth', authRoutes);                // → /api/auth/login  y  /api/auth/register

  // dominio (protegidas)
  api.use('/registros',       require('./registro.routes'));
  api.use('/pacientes',       require('./paciente.routes'));
  api.use('/funcionarios',    require('./funcionario.routes'));
  api.use('/tecnologos',      require('./tecnologo.routes'));
  api.use('/investigadores',  require('./investigador.routes'));
  api.use('/administradores', require('./administrador.routes'));
  api.use('/examenes',        require('./examen.routes'));
  api.use('/muestras',        require('./muestra.routes'));
  api.use('/resultados',      require('./resultado.routes'));
  api.use('/indicadores',     require('./indicador.routes'));
  api.use('/alertas',         require('./alerta.routes'));
  api.use('/minutas',         require('./minuta.routes'));
  api.use('/descargas',       require('./descarga.routes'));

  app.use(basePath, api);

  // 404 global
  app.use((req, res) => res.status(404).json({ error: 'Ruta no encontrada' }));
}
module.exports = { initRoutes };
