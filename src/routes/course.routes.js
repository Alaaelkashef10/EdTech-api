const express = require('express');
const router  = express.Router();

const {
  getCourses,
  getCourseById,
  createCourse,
  enrollCourse,
  getMyCourses,
  updateCourse,
  deleteCourse,
} = require('../controllers/course.controller');

const { createCourseValidator, updateCourseValidator } = 
require('../validators/course.validators');

const protect              = require('../middleware/auth');
const role                 = require('../middleware/role');
const validate             = require('../middleware/validate');
const validateId           = require('../middleware/validateId');


// NOTE: /me/courses must come BEFORE /:courseId to avoid "me" being treated as an ID
router.get('/me/courses', protect, getMyCourses);

// GET  /api/courses          – list all courses (public)
router.get('/', getCourses);

// GET  /api/courses/:courseId
router.get('/:courseId', validateId, getCourseById);

// POST /api/courses          – create a course (instructors only)
router.post('/', protect, role('instructor'), createCourseValidator, validate, createCourse);

// POST /api/courses/:courseId/enroll — students only
router.post('/:courseId/enroll', validateId, protect, role('student'), enrollCourse);


// PUT /api/courses/:courseId — update (owner only)
router.put(
  '/:courseId',
  validateId,
  protect,
  role('instructor'),
  updateCourseValidator,
  validate,
  updateCourse
);

// DELETE /api/courses/:courseId — delete (owner only)
router.delete(
  '/:courseId',
  validateId,
  protect,
  role('instructor'),
  deleteCourse
);

module.exports = router;
