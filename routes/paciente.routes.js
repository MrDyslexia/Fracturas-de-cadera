// routes/paciente.routes.js
const express = require('express');
const { auth } = require('../middleware/auth');

const c = require('../controller/paciente.controller');
const router = express.Router();

// Gestión interna del perfil Paciente (si la usas)
router.get('/', auth(['ADMIN','FUNCIONARIO','INVESTIGADOR']), c.list);
router.get('/:user_id', auth(['ADMIN','FUNCIONARIO','INVESTIGADOR']), c.getOne);
router.post('/', auth(['ADMIN','FUNCIONARIO']), c.create);
router.put('/:user_id', auth(['ADMIN','FUNCIONARIO']), c.update);
router.delete('/:user_id', auth(['ADMIN']), c.remove);

module.exports = router;
