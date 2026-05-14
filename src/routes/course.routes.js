const express = require('express');
const router  = express.Router();

const {
  getCourses,
  getCourseById,
  createCourse,
  enrollCourse,
  getMyCourses,
} = require('../controllers/course.controller');

const protect              = require('../middleware/auth');
const role                 = require('../middleware/role');
const validate             = require('../middleware/validate');
const validateId           = require('../middleware/validateId');
const { createCourseValidator } = require('../validators/course.validators');

// NOTE: /me/courses must come BEFORE /:courseId to avoid "me" being treated as an ID
router.get('/me/courses', protect, getMyCourses);

// GET  /api/courses          – list all courses (public)
router.get('/', getCourses);

// GET  /api/courses/:courseId
router.get('/:courseId', validateId, getCourseById);

// POST /api/courses          – create a course (instructors only)
router.post('/', protect, role('instructor'), createCourseValidator, validate, createCourse);

// POST /api/courses/:courseId/enroll
router.post('/:courseId/enroll', validateId, protect, enrollCourse);

module.exports = router;
