const express = require('express');
const router = express.Router();

const {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getAllLessons,
  deleteLesson
} = require('../controllers/admin.controller');

const protect = require('../middleware/auth');
const role = require('../middleware/role');
const validateId = require('../middleware/validateId');

// All admin routes are protected + only accessible by admin
router.use(protect);
router.use(role('admin'));

// Stats
router.get('/stats', getStats);

// Users
router.get('/users', getAllUsers);
router.put('/users/:id', validateId, updateUser);
router.delete('/users/:id', validateId, deleteUser);

// Courses
router.get('/courses', getAllCourses);
router.delete('/courses/:id', validateId, deleteCourse);

// Lessons
router.get('/lessons', getAllLessons);
router.delete('/lessons/:id', validateId, deleteLesson);

module.exports = router;