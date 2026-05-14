const { body } = require('express-validator');

const updateProgressValidator = [
  body('completed')
    .notEmpty().withMessage('Completed field is required')
    .isBoolean().withMessage('Completed must be true or false'),
];

module.exports = { updateProgressValidator };