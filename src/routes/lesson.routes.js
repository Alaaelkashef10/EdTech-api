const express = require('express');
const router = express.Router({ mergeParams: true });
const { getLessons, createLesson } = require('../controllers/lesson.controller');
const protect = require('../middleware/auth');
const role = require('../middleware/role');
const validate = require('../middleware/validate');
const validateId = require('../middleware/validateId');
const { createLessonValidator } = require('../validators/lesson.validators');

router.get('/', validateId, protect, getLessons);
router.post('/', validateId, protect, role('instructor'), createLessonValidator, validate, createLesson);

module.exports = router;