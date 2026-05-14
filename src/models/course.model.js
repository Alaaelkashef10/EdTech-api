const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    instructor_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    thumbnail: {
      type: String,
    },
    is_completed: {
      type: Boolean,
      default: false,
    },
    completed_at: {
      type: Date,
    },
  },
  { timestamps: true }
);

// ─── Indexes ──────────────────────────────────────────────────────────────────
courseSchema.index({ instructor_id: 1 });


module.exports = mongoose.model('Course', courseSchema);

module.exports = mongoose.model('Course', courseSchema);

