// routes/auth.js
const express = require('express');
const { login } = require('../controller/login');
const { registerPaciente, verifyEmail } = require('../controller/register');
const router = express.Router();

router.post('/login', login);
router.post('/register', registerPaciente);
router.get('/verify', verifyEmail); // 👈 nuevo

module.exports = router;
