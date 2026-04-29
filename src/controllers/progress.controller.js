const Progress = require('../models/progress.model');
const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');

// @route GET /api/courses/:courseId/progress
// Student sees his own progress, instructor sees all students progress
const getProgress = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('students', 'username email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isInstructor = course.instructor_id.toString() === req.user.id;
    const isEnrolled = course.students.some(s => s._id.toString() === req.user.id);

    if (!isInstructor && !isEnrolled) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const lessons = await Lesson.find({ course_id: req.params.courseId });
    const totalLessons = lessons.length;
    const lessonIds = lessons.map((l) => l._id);

    // Instructor sees all students progress
    if (isInstructor) {
      const studentsProgress = await Promise.all(
        course.students.map(async (student) => {
          const progress = await Progress.find({
            student_id: student._id,
            lesson_id: { $in: lessonIds },
          });

          const completedCount = progress.filter((p) => p.completed).length;
          const percentage = totalLessons
            ? Math.round((completedCount / totalLessons) * 100)
            : 0;

          return {
            student: {
              id: student._id,
              username: student.username,
              email: student.email,
            },
            percentage,
            completedCount,
            totalLessons,
            progress,
          };
        })
      );

      return res.json({
        success: true,
        course: course.title,
        totalStudents: course.students.length,
        studentsProgress,
      });
    }

    // Student sees his own progress
    const progress = await Progress.find({
      student_id: req.user.id,
      lesson_id: { $in: lessonIds },
    });

    const completedCount = progress.filter((p) => p.completed).length;
    const percentage = totalLessons
      ? Math.round((completedCount / totalLessons) * 100)
      : 0;

    res.json({
      success: true,
      percentage,
      completedCount,
      totalLessons,
      progress,
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/courses/:courseId/progress/:lessonId
const updateProgress = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isEnrolled = course.students.includes(req.user.id);
    if (!isEnrolled) {
      return res.status(403).json({ success: false, message: 'You must be enrolled in this course to update progress' });
    }

    const lesson = await Lesson.findById(req.params.lessonId);
    if (!lesson) {
      return res.status(404).json({ success: false, message: 'Lesson not found' });
    }

    if (lesson.course_id.toString() !== req.params.courseId) {
      return res.status(400).json({ success: false, message: 'Lesson does not belong to this course' });
    }

    const { completed } = req.body;

    const progress = await Progress.findOneAndUpdate(
      {
        student_id: req.user.id,
        lesson_id: req.params.lessonId,
      },
      {
        completed,
        completed_at: completed ? new Date() : null,
      },
      { upsert: true, new: true }
    );

    res.json({ success: true, progress });
  } catch (error) {
    next(error);
  }
};

module.exports = { getProgress, updateProgress };