const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/user.controller');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const { registerValidator, loginValidator } = require('../validators/user.validators');

router.post('/register', registerValidator, validate, register);
router.post('/login', loginValidator, validate, login);
router.get('/me', protect, getMe);

module.exports = router;