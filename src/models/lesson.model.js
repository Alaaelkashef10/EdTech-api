const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema(
  {
    course_id: {
      type:     mongoose.Schema.Types.ObjectId,
      ref:      'Course',
      required: true,
    },
    title: {
      type:     String,
      required: [true, 'Title is required'],
      trim:     true,
    },
    content: {
      type:     String,
      required: [true, 'Content is required'],
    },
    order: {
      type:     Number,
      required: [true, 'Order is required'],
    },
    thumbnail: {
      type: String,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
// Speeds up fetching all lessons in a course, sorted by order
lessonSchema.index({ course_id: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);
