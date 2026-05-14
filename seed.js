require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./src/models/user.model');
const Course = require('./src/models/course.model');
const Lesson = require('./src/models/lesson.model');
const Progress = require('./src/models/progress.model');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany();
    await Course.deleteMany();
    await Lesson.deleteMany();
    await Progress.deleteMany();
    console.log('Cleared existing data');

    // ===== USERS =====
    const password = await bcrypt.hash('123456', 10);

    const users = await User.insertMany([
      // Instructors
      { username: 'john_instructor', email: 'john@edu.com', password, is_instructor: true },
      { username: 'sara_instructor', email: 'sara@edu.com', password, is_instructor: true },

      // Students
      { username: 'ali_student',     email: 'ali@edu.com',     password, is_instructor: false },
      { username: 'mona_student',    email: 'mona@edu.com',    password, is_instructor: false },
      { username: 'omar_student',    email: 'omar@edu.com',    password, is_instructor: false },
      { username: 'lina_student',    email: 'lina@edu.com',    password, is_instructor: false },
    ]);

    const [john, sara, ali, mona, omar, lina] = users;
    console.log('Users created');

    // ===== COURSES =====
    const courses = await Course.insertMany([
      {
        title: 'Complete Node.js Bootcamp',
        description: 'Learn Node.js from scratch. Build real-world REST APIs with Express and MongoDB.',
        instructor_id: john._id,
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg',
        students: [ali._id, mona._id, omar._id],
        is_completed: false,
      },
      {
        title: 'MongoDB for Beginners',
        description: 'Master MongoDB and Mongoose. Learn schema design, queries, and aggregation.',
        instructor_id: john._id,
        thumbnail: 'https://www.vectorlogo.zone/logos/mongodb/mongodb-ar21.svg',
        students: [ali._id, lina._id],
        is_completed: false,
      },
      {
        title: 'JavaScript Fundamentals',
        description: 'A complete guide to modern JavaScript. ES6+, async/await, and more.',
        instructor_id: sara._id,
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/6/6a/JavaScript-logo.png',
        students: [mona._id, omar._id, lina._id],
        is_completed: false,
      },
      {
        title: 'React.js from Zero to Hero',
        description: 'Build modern web apps with React. Hooks, Context API, and real projects.',
        instructor_id: sara._id,
        thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg',
        students: [ali._id, omar._id],
        is_completed: false,
      },
    ]);

    const [nodeCourse, mongoCourse, jsCourse, reactCourse] = courses;
    console.log('Courses created');

    // ===== LESSONS =====
    const nodeLesson1 = await Lesson.create({ course_id: nodeCourse._id, title: 'Introduction to Node.js',      content: 'Node.js is a JavaScript runtime built on Chrome V8 engine. It allows you to run JavaScript on the server side.', order: 1, thumbnail: 'https://upload.wikimedia.org/wikipedia/commons/d/d9/Node.js_logo.svg' });
    const nodeLesson2 = await Lesson.create({ course_id: nodeCourse._id, title: 'Node.js Modules & NPM',        content: 'Learn about CommonJS modules, require(), module.exports, and how to use NPM packages.', order: 2 });
    const nodeLesson3 = await Lesson.create({ course_id: nodeCourse._id, title: 'Building REST APIs',           content: 'Build your first REST API with Express.js. Learn about routes, controllers, and middleware.', order: 3 });
    const nodeLesson4 = await Lesson.create({ course_id: nodeCourse._id, title: 'Authentication with JWT',      content: 'Implement secure authentication using JSON Web Tokens. Learn about bcrypt and token verification.', order: 4 });

    const mongoLesson1 = await Lesson.create({ course_id: mongoCourse._id, title: 'What is MongoDB?',           content: 'MongoDB is a NoSQL document database. Learn about collections, documents, and the JSON data model.', order: 1 });
    const mongoLesson2 = await Lesson.create({ course_id: mongoCourse._id, title: 'CRUD Operations',            content: 'Learn insertOne, insertMany, find, updateOne, updateMany, deleteOne, and deleteMany.', order: 2 });
    const mongoLesson3 = await Lesson.create({ course_id: mongoCourse._id, title: 'Mongoose Schema Design',     content: 'Learn how to design schemas with Mongoose. Understand embedding vs referencing.', order: 3 });

    const jsLesson1 = await Lesson.create({ course_id: jsCourse._id, title: 'Variables & Data Types',          content: 'Learn var, let, const, and JavaScript data types including strings, numbers, booleans, arrays and objects.', order: 1 });
    const jsLesson2 = await Lesson.create({ course_id: jsCourse._id, title: 'Functions & Arrow Functions',      content: 'Learn function declarations, expressions, arrow functions, and higher-order functions.', order: 2 });
    const jsLesson3 = await Lesson.create({ course_id: jsCourse._id, title: 'Promises & Async/Await',          content: 'Master asynchronous JavaScript with Promises, async/await, and error handling.', order: 3 });
    const jsLesson4 = await Lesson.create({ course_id: jsCourse._id, title: 'ES6+ Features',                   content: 'Destructuring, spread operator, template literals, modules, and more modern JavaScript features.', order: 4 });

    const reactLesson1 = await Lesson.create({ course_id: reactCourse._id, title: 'What is React?',            content: 'Learn about React components, JSX, and the virtual DOM. Set up your first React project.', order: 1 });
    const reactLesson2 = await Lesson.create({ course_id: reactCourse._id, title: 'State & Props',             content: 'Understand React state management with useState hook and passing data with props.', order: 2 });
    const reactLesson3 = await Lesson.create({ course_id: reactCourse._id, title: 'useEffect & Lifecycle',     content: 'Learn the useEffect hook for side effects, data fetching, and component lifecycle.', order: 3 });

    console.log('Lessons created');

    // ===== PROGRESS =====
    // Ali — Node.js course (completed 3/4 lessons)
    await Progress.insertMany([
      { student_id: ali._id, lesson_id: nodeLesson1._id, completed: true,  completed_at: new Date() },
      { student_id: ali._id, lesson_id: nodeLesson2._id, completed: true,  completed_at: new Date() },
      { student_id: ali._id, lesson_id: nodeLesson3._id, completed: true,  completed_at: new Date() },
      { student_id: ali._id, lesson_id: nodeLesson4._id, completed: false },
    ]);

    // Ali — MongoDB course (completed 1/3 lessons)
    await Progress.insertMany([
      { student_id: ali._id, lesson_id: mongoLesson1._id, completed: true, completed_at: new Date() },
      { student_id: ali._id, lesson_id: mongoLesson2._id, completed: false },
      { student_id: ali._id, lesson_id: mongoLesson3._id, completed: false },
    ]);

    // Ali — React course (completed 2/3 lessons)
    await Progress.insertMany([
      { student_id: ali._id, lesson_id: reactLesson1._id, completed: true, completed_at: new Date() },
      { student_id: ali._id, lesson_id: reactLesson2._id, completed: true, completed_at: new Date() },
      { student_id: ali._id, lesson_id: reactLesson3._id, completed: false },
    ]);

    // Mona — Node.js course (completed 2/4)
    await Progress.insertMany([
      { student_id: mona._id, lesson_id: nodeLesson1._id, completed: true,  completed_at: new Date() },
      { student_id: mona._id, lesson_id: nodeLesson2._id, completed: true,  completed_at: new Date() },
      { student_id: mona._id, lesson_id: nodeLesson3._id, completed: false },
      { student_id: mona._id, lesson_id: nodeLesson4._id, completed: false },
    ]);

    // Mona — JS course (completed all 4/4)
    await Progress.insertMany([
      { student_id: mona._id, lesson_id: jsLesson1._id, completed: true, completed_at: new Date() },
      { student_id: mona._id, lesson_id: jsLesson2._id, completed: true, completed_at: new Date() },
      { student_id: mona._id, lesson_id: jsLesson3._id, completed: true, completed_at: new Date() },
      { student_id: mona._id, lesson_id: jsLesson4._id, completed: true, completed_at: new Date() },
    ]);

    // Omar — Node.js course (completed 1/4)
    await Progress.insertMany([
      { student_id: omar._id, lesson_id: nodeLesson1._id, completed: true, completed_at: new Date() },
      { student_id: omar._id, lesson_id: nodeLesson2._id, completed: false },
    ]);

    // Omar — JS course (completed 2/4)
    await Progress.insertMany([
      { student_id: omar._id, lesson_id: jsLesson1._id, completed: true, completed_at: new Date() },
      { student_id: omar._id, lesson_id: jsLesson2._id, completed: true, completed_at: new Date() },
      { student_id: omar._id, lesson_id: jsLesson3._id, completed: false },
    ]);

    // Omar — React course (completed 1/3)
    await Progress.insertMany([
      { student_id: omar._id, lesson_id: reactLesson1._id, completed: true, completed_at: new Date() },
      { student_id: omar._id, lesson_id: reactLesson2._id, completed: false },
    ]);

    // Lina — MongoDB course (completed all 3/3)
    await Progress.insertMany([
      { student_id: lina._id, lesson_id: mongoLesson1._id, completed: true, completed_at: new Date() },
      { student_id: lina._id, lesson_id: mongoLesson2._id, completed: true, completed_at: new Date() },
      { student_id: lina._id, lesson_id: mongoLesson3._id, completed: true, completed_at: new Date() },
    ]);

    // Lina — JS course (completed 1/4)
    await Progress.insertMany([
      { student_id: lina._id, lesson_id: jsLesson1._id, completed: true, completed_at: new Date() },
      { student_id: lina._id, lesson_id: jsLesson2._id, completed: false },
    ]);

    // Lina — React course (not started)
    await Progress.insertMany([
      { student_id: lina._id, lesson_id: reactLesson1._id, completed: false },
    ]);

    console.log('Progress created');
    console.log('');
    console.log('===== SEED COMPLETE =====');
    console.log('');
    console.log('Login credentials (all passwords: 123456)');
    console.log('------------------------------------------');
    console.log('Instructors:');
    console.log('  john@edu.com');
    console.log('  sara@edu.com');
    console.log('Students:');
    console.log('  ali@edu.com');
    console.log('  mona@edu.com');
    console.log('  omar@edu.com');
    console.log('  lina@edu.com');

    process.exit(0);

  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
};

seed();