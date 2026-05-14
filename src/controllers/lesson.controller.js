const Lesson       = require('../models/lesson.model');
const Course       = require('../models/course.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

/**
 * @route   GET /api/courses/:courseId/lessons
 * @access  Private
 * @desc    Get all lessons for a course.
 *          - Instructors and enrolled students see the full content.
 *          - Non-enrolled users see titles only (content is locked).
 */
const getLessons = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const isInstructor = course.instructor_id.toString() === req.user.id;
  const isEnrolled   = course.students.some((id) => id.toString() === req.user.id);
  const hasAccess    = isInstructor || isEnrolled;

  const lessons = await Lesson.find({ course_id: req.params.courseId }).sort({ order: 1 });

  // Hide lesson content from users who are not enrolled
  const result = lessons.map((lesson) => ({
    _id:       lesson._id,
    title:     lesson.title,
    order:     lesson.order,
    thumbnail: lesson.thumbnail,
    createdAt: lesson.createdAt,
    content:   hasAccess ? lesson.content : null,
    locked:    !hasAccess,
  }));

  res.json({ success: true, count: result.length, lessons: result });
});

/**
 * @route   POST /api/courses/:courseId/lessons
 * @access  Private (instructor who owns the course)
 * @desc    Add a new lesson to a course
 */
const createLesson = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  // Only the course's own instructor can add lessons
  if (course.instructor_id.toString() !== req.user.id) {
    throw new AppError('You can only add lessons to your own courses', 403);
  }

  const { title, content, order, thumbnail } = req.body;

  const lesson = await Lesson.create({
    course_id: req.params.courseId,
    title,
    content,
    order,
    thumbnail,
  });

  res.status(201).json({ success: true, lesson });
});

module.exports = { getLessons, createLesson };
