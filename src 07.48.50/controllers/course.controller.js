const Course = require('../models/course.model');

// @route GET /api/courses
const getCourses = async (req, res, next) => {
  try {
    const courses = await Course.find()
      .populate('instructor_id', 'username email');

    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/courses/:courseId
const getCourseById = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId)
      .populate('instructor_id', 'username email')
      .populate('students', 'username email');

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    res.json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/courses  (instructor only)
const createCourse = async (req, res, next) => {
  try {
    const { title, description, thumbnail } = req.body;

    const course = await Course.create({
      title,
      description,
      thumbnail,
      instructor_id: req.user.id,
    });

    res.status(201).json({ success: true, course });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/courses/:courseId/enroll
const enrollCourse = async (req, res, next) => {
  try {
    const course = await Course.findById(req.params.courseId);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (course.instructor_id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'Instructors cannot enroll in their own course' });
    }

    if (course.students.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled in this course' });
    }

    course.students.push(req.user.id);
    await course.save();

    res.json({ success: true, message: 'Enrolled successfully' });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/courses/me/courses
const getMyCourses = async (req, res, next) => {
  try {
    const courses = await Course.find({ students: req.user.id })
      .populate('instructor_id', 'username -_id')
      .select('-students -__v -updatedAt');

    res.json({ success: true, courses });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCourses, getCourseById, createCourse, enrollCourse, getMyCourses };