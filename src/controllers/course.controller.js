const Course       = require('../models/course.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

/**
 * @route   GET /api/courses
 * @access  Public
 */
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find()
    .populate('instructor_id', 'username email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: courses.length, courses });
});

/**
 * @route   GET /api/courses/:courseId
 * @access  Public
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId)
    .populate('instructor_id', 'username email')
    .populate('students', 'username email');
  if (!course) throw new AppError('Course not found', 404);
  res.json({ success: true, course });
});

/**
 * @route   POST /api/courses
 * @access  Private (instructor)
 */
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, thumbnail } = req.body;
  const course = await Course.create({
    title,
    description,
    thumbnail,
    instructor_id: req.user._id,
  });
  res.status(201).json({ success: true, course });
});

/**
 * @route   POST /api/courses/:courseId/enroll
 * @access  Private (student)
 */
const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (course.instructor_id.equals(req.user._id)) {
    throw new AppError('You cannot enroll in a course you own', 400);
  }
  if (course.students.includes(req.user._id)) {
    throw new AppError('You are already enrolled in this course', 400);
  }
  course.students.push(req.user._id);
  await course.save();
  res.json({ success: true, message: 'Enrolled successfully' });
});

/**
 * @route   GET /api/courses/me/courses
 * @access  Private (student)
 */
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ students: req.user._id })
    .populate('instructor_id', 'username')
    .select('-students -__v -updatedAt');
  res.json({ success: true, count: courses.length, courses });
});

/**
 * @route   GET /api/courses/instructor/my-courses
 * @access  Private (instructor)
 */
const getInstructorCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ instructor_id: req.user._id })
    .populate('students', 'username email')
    .sort({ createdAt: -1 });
  res.json({ success: true, count: courses.length, courses });
});

/**
 * @route   PUT /api/courses/:courseId
 * @access  Private (instructor owner)
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (!course.instructor_id.equals(req.user._id)) {
    throw new AppError('Not authorized to update this course', 403);
  }
  const { title, description, thumbnail } = req.body;
  if (title !== undefined) course.title = title;
  if (description !== undefined) course.description = description;
  if (thumbnail !== undefined) course.thumbnail = thumbnail;
  await course.save();
  res.json({ success: true, course });
});

/**
 * @route   DELETE /api/courses/:courseId
 * @access  Private (instructor owner)
 */
const deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);
  if (!course) throw new AppError('Course not found', 404);
  if (!course.instructor_id.equals(req.user._id)) {
    throw new AppError('Not authorized to delete this course', 403);
  }
  await course.deleteOne();
  res.json({ success: true, message: 'Course deleted successfully' });
});

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  enrollCourse,
  getMyCourses,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
};