const express = require('express');
const router = express.Router();

const { register, login, getMe, updateMe, deleteMe } = require('../controllers/user.controller');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/user.validators');

// POST /api/users/register
router.post('/register', registerValidator, validate, register);

// POST /api/users/login
router.post('/login', loginValidator, validate, login);

// GET  /api/users/me  (protected)
router.get('/me', protect, getMe);

// PUT  /api/users/me  (protected) — update own profile
router.put('/me', protect, updateMe);

// DELETE /api/users/me (protected) — delete own account
router.delete('/me', protect, deleteMe);

module.exports = router;