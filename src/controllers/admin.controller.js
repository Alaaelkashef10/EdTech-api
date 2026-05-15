const User = require('../models/user.model');
const Course = require('../models/course.model');
const Lesson = require('../models/lesson.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');

/**
 * @route GET /api/admin/stats
 * @access Admin
 */
const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalCourses = await Course.countDocuments();
  const totalLessons = await Lesson.countDocuments();
  const totalInstructors = await User.countDocuments({ role: 'instructor' });
  const totalStudents = await User.countDocuments({ role: 'student' });

  res.json({
    success: true,
    stats: {
      totalUsers,
      totalCourses,
      totalLessons,
      totalInstructors,
      totalStudents
    }
  });
});

/**
 * @route GET /api/admin/users
 * @access Admin
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
 * @route PUT /api/admin/users/:id
 * @access Admin
 */
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

  // Prevent admin from modifying themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new AppError('You cannot modify your own account here', 400);
  }

  const { username, email, role } = req.body;

  if (username) user.username = username;
  if (email) user.email = email;
  if (role && ['student', 'instructor', 'admin'].includes(role)) {
    user.role = role;
  }

  await user.save();

  res.json({
    success: true,
    user: {
      _id: user._id,
      username: user.username,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }
  });
});

/**
 * @route DELETE /api/admin/users/:id
 * @access Admin
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    throw new AppError('User not found', 404);
  }

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
 * @route GET /api/admin/courses
 * @access Admin
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

/**
 * @route DELETE /api/admin/courses/:id
 * @access Admin
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Cascade delete lessons
  await Lesson.deleteMany({ course_id: course._id });
  await course.deleteOne();

  res.json({
    success: true,
    message: 'Course and its lessons deleted successfully'
  });
});

/**
 * @route GET /api/admin/lessons
 * @access Admin
 */
const getAllLessons = asyncHandler(async (req, res) => {
  const lessons = await Lesson.find()
    .populate('course_id', 'title')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: lessons.length,
    lessons
  });
});

/**
 * @route DELETE /api/admin/lessons/:id
 * @access Admin
 */
const deleteLesson = asyncHandler(async (req, res) => {
  const lesson = await Lesson.findById(req.params.id);

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  await lesson.deleteOne();

  res.json({
    success: true,
    message: 'Lesson deleted successfully'
  });
});

module.exports = {
  getStats,
  getAllUsers,
  updateUser,
  deleteUser,
  getAllCourses,
  deleteCourse,
  getAllLessons,
  deleteLesson
};