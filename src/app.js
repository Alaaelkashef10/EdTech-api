const express = require('express');
const path    = require('path');
const cors = require('cors');

const userRoutes     = require('./routes/user.routes');
const courseRoutes   = require('./routes/course.routes');
const lessonRoutes   = require('./routes/lesson.routes');
const progressRoutes = require('./routes/progress.routes');
const errorHandler   = require('./middleware/error');

const app = express();

// ─── Global Middleware ────────────────────────────────────────────────────────

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use('/api/users',                      userRoutes);
app.use('/api/courses',                    courseRoutes);
app.use('/api/courses/:courseId/lessons',  lessonRoutes);
app.use('/api/courses/:courseId/progress', progressRoutes);
app.use('/api/admin', require('./routes/admin.routes'));

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use(errorHandler);

module.exports = app;
