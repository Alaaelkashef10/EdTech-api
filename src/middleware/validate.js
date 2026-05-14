const { validationResult } = require('express-validator');

/**
 * Reads the validation results produced by express-validator rules
 * and returns a 400 response if any errors are found.
 *
 * Place this middleware after the validator array in a route definition:
 *   router.post('/', [...validatorRules], validate, controller);
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((e) => ({
        field:   e.path,
        message: e.msg,
      })),
    });
  }

  next();
};

module.exports = validate;
