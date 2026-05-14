const { body } = require('express-validator');

const createCourseValidator = [
  body('title').trim().notEmpty().withMessage('Title is required')
    .isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
  body('description').trim().notEmpty().withMessage('Description is required')
    .isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
];

module.exports = { createCourseValidator };