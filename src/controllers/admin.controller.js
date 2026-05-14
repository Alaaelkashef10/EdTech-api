// src/controllers/admin.controller.js
const User = require('../models/user.model');
const Course = require('../models/course.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @route   GET /api/admin/stats
 * @access  Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalInstructors = await User.countDocuments({ role: 'instructor' });
  const totalStudents = await User.countDocuments({ role: 'student' });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalCourses,
      totalInstructors,
      totalStudents
    }
  });
});

/**
 * @route   GET /api/admin/users
 * @access  Admin
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find()
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    users
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @access  Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent admin from deleting himself
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot delete your own account', 400);
  }

  await user.deleteOne();

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

/**
 * @route   GET /api/admin/courses
 * @access  Admin
 */
const getAllCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate('instructor_id', 'username email')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: courses.length,
    courses
  });
});

module.exports = {
  getStats,
  getAllUsers,
  deleteUser,
  getAllCourses
};