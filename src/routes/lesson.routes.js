const express = require('express');
// mergeParams: true lets us access :courseId from the parent router
const router  = express.Router({ mergeParams: true });

const { getLessons, createLesson }      = require('../controllers/lesson.controller');
const protect                           = require('../middleware/auth');
const role                              = require('../middleware/role');
const validate                          = require('../middleware/validate');
const validateId                        = require('../middleware/validateId');
const { createLessonValidator }         = require('../validators/lesson.validators');

// GET  /api/courses/:courseId/lessons
router.get('/', validateId, protect, getLessons);

// POST /api/courses/:courseId/lessons  (instructors only)
router.post('/', validateId, protect, role('instructor'), createLessonValidator, validate, createLesson);

module.exports = router;
