const mongoose = require('mongoose');

const validateId = (req, res, next) => {
  const ids = [
    req.params.courseId,
    req.params.lessonId,
    req.params.id,
  ].filter(Boolean);

  for (const id of ids) {
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