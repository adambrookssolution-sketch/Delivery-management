const { body, param, query } = require('express-validator');

const createUserValidator = [
  body('email')
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('phone')
    .optional()
    .trim(),
  body('role')
    .isIn(['ADMIN', 'DRIVER', 'DISPATCHER'])
    .withMessage('Valid role is required'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const updateUserValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
  body('email')
    .optional()
    .isEmail()
    .withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Name must be less than 100 characters'),
  body('phone')
    .optional()
    .trim(),
  body('role')
    .optional()
    .isIn(['ADMIN', 'DRIVER', 'DISPATCHER'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const getUsersValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('role')
    .optional()
    .isIn(['ADMIN', 'DRIVER', 'DISPATCHER'])
    .withMessage('Invalid role'),
  query('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean'),
];

const idParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid user ID'),
];

module.exports = {
  createUserValidator,
  updateUserValidator,
  getUsersValidator,
  idParamValidator,
};
