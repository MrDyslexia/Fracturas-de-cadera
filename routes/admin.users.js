// routes/admin.users.js
const express = require('express');
const { auth } = require('../middleware/auth');
const ctrl = require('../controller/admin.users.controller');

const router = express.Router();

router.post('/users',                     auth(['ADMIN']), ctrl.createUserWithRole);
// router.post('/users',                     ctrl.createUserWithRole);
router.post('/users/:id/roles',           auth(['ADMIN']), ctrl.addRoleToUser);
router.delete('/users/:id/roles/:role',   auth(['ADMIN']), ctrl.removeRoleFromUser);
router.get('/users',                      auth(['ADMIN']), ctrl.listUsers);

module.exports = router;
