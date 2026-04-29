const express = require('express');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api/users',                          require('./routes/user.routes'));
app.use('/api/courses',                        require('./routes/course.routes'));
app.use('/api/courses/:courseId/lessons',      require('./routes/lesson.routes'));
app.use('/api/courses/:courseId/progress',     require('./routes/progress.routes'));

// Error handler
app.use(require('./middleware/error'));

module.exports = app;