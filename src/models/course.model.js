const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  instructor_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  thumbnail: { type: String },
  is_completed: { type: Boolean, default: false },
  completed_at: { type: Date },
}, { timestamps: true });

courseSchema.index({ instructor_id: 1 });

module.exports = mongoose.model('Course', courseSchema);