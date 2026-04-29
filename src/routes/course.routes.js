const express = require('express');
const router = express.Router();
const { getCourses, getCourseById, createCourse, enrollCourse, getMyCourses } = require('../controllers/course.controller');
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const validateId = require('../middleware/validateId');
const { createCourseValidator } = require('../validators/course.validators');

// me/courses must be ABOVE /:courseId
router.get('/me/courses', protect, getMyCourses);

router.get('/', getCourses);
router.get('/:courseId', validateId, getCourseById);
router.post('/', protect, role('instructor'), createCourseValidator, validate, createCourse);
router.post('/:courseId/enroll', validateId, protect, enrollCourse);

module.exports = router;