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


/**
 * @desc    Update a lesson
 * @route   PUT /api/lessons/:lessonId
 * @access  Private (course owner only)
 */
const updateLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Fetch the course to verify ownership
    const course = await Course.findById(lesson.course);

    if (!course) {
      throw new AppError('Associated course not found', 404);
    }

    // Ownership check: only the course creator can edit lessons
    if (!course.instructor_id.equals(req.user._id)) {
      throw new AppError('Not authorized to update this lesson', 403);
    }

    const { title, content, videoUrl, order } = req.body;

    if (title !== undefined) lesson.title = title;
    if (content !== undefined) lesson.content = content;
    if (videoUrl !== undefined) lesson.videoUrl = videoUrl;
    if (order !== undefined) lesson.order = order;

    await lesson.save();

    res.json({ success: true, lesson });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc    Delete a lesson
 * @route   DELETE /api/lessons/:lessonId
 * @access  Private (course owner only)
 */
const deleteLesson = async (req, res, next) => {
  try {
    const lesson = await Lesson.findById(req.params.lessonId);

    if (!lesson) {
      throw new AppError('Lesson not found', 404);
    }

    // Fetch the course to verify ownership
    const course = await Course.findById(lesson.course);

    if (!course) {
      throw new AppError('Associated course not found', 404);
    }

    // Ownership check: only the course creator can delete lessons
    if (!course.instructor_id.equals(req.user._id)) {
      throw new AppError('Not authorized to delete this lesson', 403);
    }

    await lesson.deleteOne();

    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (err) {
    next(err);
  }
};
module.exports = {
  getLessons,
  createLesson,
  updateLesson,
  deleteLesson,
};