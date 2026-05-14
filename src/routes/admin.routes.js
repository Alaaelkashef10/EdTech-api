// src/routes/admin.routes.js
const express = require('express');
const router = express.Router();

const {
  getStats,
  getAllUsers,
  deleteUser,
  getAllCourses
} = require('../controllers/admin.controller');

const protect = require('../middleware/auth');
const role = require('../middleware/role');

// All admin routes are protected + only accessible by admin
router.use(protect);
router.use(role('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/courses', getAllCourses);

module.exports = router;