const { body } = require('express-validator');

const createLessonValidator = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('content').trim().notEmpty().withMessage('Content is required'),
  body('order').notEmpty().withMessage('Order is required')
    .isNumeric().withMessage('Order must be a number'),
];

module.exports = { createLessonValidator };