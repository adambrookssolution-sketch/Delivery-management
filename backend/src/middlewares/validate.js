const { validationResult } = require('express-validator');
const { errorResponse } = require('../utils/response');

/**
 * Validation middleware
 * Checks for validation errors and returns formatted response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    return errorResponse(res, 'Validation failed', 400, formattedErrors);
  }

  next();
};

module.exports = validate;
