const express = require('express');
const { login } = require('../controller/login');
const { registerPaciente } = require('../controller/register');

const router = express.Router();

// públicas
router.post('/login', login);
router.post('/register', registerPaciente);

module.exports = router;
