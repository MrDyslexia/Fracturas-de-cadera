const express = require('express');
const { auth } = require('../middleware/auth');
const paciente = require('../controller/paciente.controller');

const router = express.Router();

// ✅ RUTAS RELATIVAS (el prefijo /pacientes lo pone initRoutes)
router.get('/search', auth(), paciente.search);
router.get('/', auth(), paciente.list);
router.get('/:user_id', auth(), paciente.getOne);
router.post('/', auth(), paciente.create);
router.put('/:user_id', auth(), paciente.update);
router.delete('/:user_id', auth(), paciente.remove);

module.exports = router;
