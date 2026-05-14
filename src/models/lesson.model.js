const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  course_id:  { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  title:      { type: String, required: true, trim: true },
  content:    { type: String, required: true },
  order:      { type: Number, required: true },
  thumbnail:  { type: String },
}, { timestamps: true });

lessonSchema.index({ course_id: 1, order: 1 });

module.exports = mongoose.model('Lesson', lessonSchema);