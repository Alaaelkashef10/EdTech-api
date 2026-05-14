const express = require('express');
const router = express.Router({ mergeParams: true });
const { getProgress, updateProgress } = require('../controllers/progress.controller');
const protect = require('../middleware/auth');
const validate = require('../middleware/validate');
const validateId = require('../middleware/validateId');
const { updateProgressValidator } = require('../validators/progress.validators');

router.get('/', validateId, protect, getProgress);
router.post('/:lessonId', validateId, protect, updateProgressValidator, validate, updateProgress);

module.exports = router;