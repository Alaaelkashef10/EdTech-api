const express = require('express');
const router  = express.Router();

const {
  getCourses,
  getCourseById,
  createCourse,
  enrollCourse,
  getMyCourses,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');

const { createCourseValidator, updateCourseValidator } = 
  require('../validators/course.validators');

const protect    = require('../middleware/auth');
const role       = require('../middleware/role');
const validate   = require('../middleware/validate');
const validateId = require('../middleware/validateId');

// Student enrolled courses
router.get('/me/courses', protect, getMyCourses);

// Instructor own courses
router.get('/instructor/my-courses', protect, role('instructor'), getInstructorCourses);

// Public routes
router.get('/', getCourses);
router.get('/:courseId', validateId, getCourseById);

// Instructor only
router.post('/', protect, role('instructor'), createCourseValidator, validate, createCourse);
router.put('/:courseId', validateId, protect, role('instructor'), updateCourseValidator, validate, updateCourse);
router.delete('/:courseId', validateId, protect, role('instructor'), deleteCourse);

// Student only
router.post('/:courseId/enroll', validateId, protect, role('student'), enrollCourse);

module.exports = router;