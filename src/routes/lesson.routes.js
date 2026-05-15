const express = require('express');
const router = express.Router({ mergeParams: true });

const {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
} = require('../controllers/lesson.controller');

const protect = require('../middleware/auth');
const role = require('../middleware/role');
const validateId = require('../middleware/validateId');

// GET /api/courses/:courseId/lessons — any authenticated user
router.get('/', validateId, protect, getLessons);

// POST /api/courses/:courseId/lessons — course owner only
router.post('/', validateId, protect, role('instructor'), createLesson);

// PUT /api/lessons/:lessonId — course owner only
router.put('/:lessonId', validateId, protect, role('instructor'), updateLesson);

// DELETE /api/lessons/:lessonId — course owner only
router.delete('/:lessonId', validateId, protect, role('instructor'), deleteLesson);

module.exports = router;