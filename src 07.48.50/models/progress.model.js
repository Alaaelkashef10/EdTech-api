const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  lesson_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  completed: { type: Boolean, default: false },
  completed_at: { type: Date },
}, { timestamps: true });

// One progress record per student per lesson
progressSchema.index({ student_id: 1, lesson_id: 1 }, { unique: true });

module.exports = mongoose.model('Progress', progressSchema);