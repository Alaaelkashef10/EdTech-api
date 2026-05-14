const Lesson = require('../models/lesson.model');
const Course = require('../models/course.model');

const getLessons = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const isInstructor = course.instructor_id.toString() === req.user.id;
    const isEnrolled = course.students.includes(req.user.id);

    const lessons = await Lesson.find({ course_id: req.params.courseId })
      .sort({ order: 1 });

    // If not enrolled and not instructor, hide content
    const result = lessons.map((lesson) => ({
      _id: lesson._id,
      title: lesson.title,
      order: lesson.order,
      thumbnail: lesson.thumbnail,
      createdAt: lesson.createdAt,
      // only show content if enrolled or instructor
      content: isEnrolled || isInstructor ? lesson.content : null,
      locked: !isEnrolled && !isInstructor,
    }));

    res.json({ success: true, lessons: result });
  } catch (error) {
    next(error);
  }
};

const createLesson = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor_id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only add lessons to your own courses' });
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
  } catch (error) {
    next(error);
  }
};

module.exports = { getLessons, createLesson };