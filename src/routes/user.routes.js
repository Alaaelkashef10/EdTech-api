const express  = require('express');
const router   = express.Router();

const { register, login, getMe }          = require('../controllers/user.controller');
const protect                             = require('../middleware/auth');
const validate                            = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/user.validators');

// POST /api/users/register
router.post('/register', registerValidator, validate, register);

// POST /api/users/login
router.post('/login', loginValidator, validate, login);

// GET  /api/users/me  (protected)
router.get('/me', protect, getMe);

module.exports = router;
