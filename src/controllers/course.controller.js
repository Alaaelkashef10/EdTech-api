const Course       = require('../models/course.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

/**
 * @route   GET /api/courses
 * @access  Public
 * @desc    Get all available courses
 */
const getCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find().populate('instructor_id', 'username email');

  res.json({ success: true, count: courses.length, courses });
});

/**
 * @route   GET /api/courses/:courseId
 * @access  Public
 * @desc    Get a single course by ID (with instructor and enrolled students)
 */
const getCourseById = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId)
    .populate('instructor_id', 'username email')
    .populate('students', 'username email');

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  res.json({ success: true, course });
});

/**
 * @route   POST /api/courses
 * @access  Private (instructor only)
 * @desc    Create a new course
 */
const createCourse = asyncHandler(async (req, res) => {
  const { title, description, thumbnail } = req.body;

  const course = await Course.create({
    title,
    description,
    thumbnail,
    instructor_id: req.user.id,
  });

  res.status(201).json({ success: true, course });
});

/**
 * @route   POST /api/courses/:courseId/enroll
 * @access  Private
 * @desc    Enroll the authenticated user in a course
 */
const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Instructors should not enroll in their own courses
  if (course.instructor_id.toString() === req.user.id) {
    throw new AppError('Instructors cannot enroll in their own course', 400);
  }

  // Prevent duplicate enrollments
  if (course.students.includes(req.user.id)) {
    throw new AppError('You are already enrolled in this course', 400);
  }

  course.students.push(req.user.id);
  await course.save();

  res.json({ success: true, message: 'Enrolled successfully' });
});

/**
 * @route   GET /api/courses/me/courses
 * @access  Private
 * @desc    Get all courses that the authenticated student is enrolled in
 */
const getMyCourses = asyncHandler(async (req, res) => {
  const courses = await Course.find({ students: req.user.id })
    .populate('instructor_id', 'username -_id')
    .select('-students -__v -updatedAt');

  res.json({ success: true, count: courses.length, courses });
});

module.exports = { getCourses, getCourseById, createCourse, enrollCourse, getMyCourses };
