const mongoose = require('mongoose');

/**
 * Validates that any ObjectId route parameters (courseId, lessonId, id)
 * are in a valid MongoDB format before hitting the database.
 * Returns 400 immediately if an ID is malformed.
 */
const validateId = (req, res, next) => {
  const paramIds = [req.params.courseId, req.params.lessonId, req.params.id].filter(Boolean);

  for (const id of paramIds) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ID format: ${id}`,
      });
    }
  }

  next();
};

module.exports = validateId;
