const Progress     = require('../models/progress.model');
const Lesson       = require('../models/lesson.model');
const Course       = require('../models/course.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError     = require('../utils/AppError');

// ─── Helper ───────────────────────────────────────────────────────────────────

/**
 * Calculate the completion percentage for a student in a course.
 * @param {string}   studentId  - Student's ObjectId
 * @param {string[]} lessonIds  - All lesson ObjectIds in the course
 * @returns {Object} { completedCount, totalLessons, percentage }
 */
const calcProgress = async (studentId, lessonIds) => {
  const totalLessons = lessonIds.length;

  const progressRecords = await Progress.find({
    student_id: studentId,
    lesson_id:  { $in: lessonIds },
  });

  const completedCount = progressRecords.filter((p) => p.completed).length;
  const percentage     = totalLessons
    ? Math.round((completedCount / totalLessons) * 100)
    : 0;

  return { completedCount, totalLessons, percentage, progressRecords };
};

// ─── Controllers ──────────────────────────────────────────────────────────────

/**
 * @route   GET /api/courses/:courseId/progress
 * @access  Private
 * @desc    Get progress for a course.
 *          - Students see their own progress.
 *          - Instructors see all students' progress.
 */
const getProgress = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId).populate('students', 'username email');

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  const isInstructor = course.instructor_id.toString() === req.user.id;
  const isEnrolled   = course.students.some((s) => s._id.toString() === req.user.id);

  if (!isInstructor && !isEnrolled) {
    throw new AppError('Access denied. You must be enrolled in this course.', 403);
  }

  const lessons    = await Lesson.find({ course_id: req.params.courseId }).select('_id');
  const lessonIds  = lessons.map((l) => l._id);

  // ── Instructor view: all students ──────────────────────────────────────────
  if (isInstructor) {
    const studentsProgress = await Promise.all(
      course.students.map(async (student) => {
        const { completedCount, totalLessons, percentage } = await calcProgress(student._id, lessonIds);

        return {
          student: { id: student._id, username: student.username, email: student.email },
          percentage,
          completedCount,
          totalLessons,
        };
      })
    );

    return res.json({
      success:       true,
      course:        course.title,
      totalStudents: course.students.length,
      studentsProgress,
    });
  }

  // ── Student view: own progress ─────────────────────────────────────────────
  const { completedCount, totalLessons, percentage, progressRecords } = await calcProgress(
    req.user.id,
    lessonIds
  );

  res.json({ success: true, percentage, completedCount, totalLessons, progress: progressRecords });
});

/**
 * @route   POST /api/courses/:courseId/progress/:lessonId
 * @access  Private (enrolled students only)
 * @desc    Mark a lesson as completed or incomplete
 */
const updateProgress = asyncHandler(async (req, res) => {
  const course = await Course.findById(req.params.courseId);

  if (!course) {
    throw new AppError('Course not found', 404);
  }

  if (!course.students.includes(req.user.id)) {
    throw new AppError('You must be enrolled in this course to update progress', 403);
  }

  const lesson = await Lesson.findById(req.params.lessonId);

  if (!lesson) {
    throw new AppError('Lesson not found', 404);
  }

  // Verify the lesson belongs to the requested course
  if (lesson.course_id.toString() !== req.params.courseId) {
    throw new AppError('Lesson does not belong to this course', 400);
  }

  const { completed } = req.body;

  // upsert: create a new record if one doesn't exist yet
  const progress = await Progress.findOneAndUpdate(
    { student_id: req.user.id, lesson_id: req.params.lessonId },
    { completed, completed_at: completed ? new Date() : null },
    { upsert: true, new: true }
  );

  res.json({ success: true, progress });
});

module.exports = { getProgress, updateProgress };
