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
 * @route POST /api/courses/:courseId/enroll
 * @access Private (student only)
 * @desc Enroll the authenticated user in a course
 */
const enrollCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Defense-in-depth: block a student who is also the course owner
  if (course.instructor_id.equals(req.user._id)) {
    throw new AppError('You cannot enroll in a course you own', 400);
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


/**
 * @route PUT /api/courses/:courseId
 * @access Private (instructor who owns the course)
 * @desc Update a course
 */
const updateCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Ownership check: only the creator can modify
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
 * @route DELETE /api/courses/:courseId
 * @access Private (instructor who owns the course)
 * @desc Delete a course
 */
const 
deleteCourse = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Ownership check: only the creator can delete
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
  updateCourse,
  deleteCourse,
};