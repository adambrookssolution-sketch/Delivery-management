const { body, param, query } = require('express-validator');

const createShipmentValidator = [
  // Sender info
  body('senderName')
    .trim()
    .notEmpty()
    .withMessage('Sender name is required')
    .isLength({ max: 100 })
    .withMessage('Sender name must be less than 100 characters'),
  body('senderPhone')
    .trim()
    .notEmpty()
    .withMessage('Sender phone is required'),
  body('senderAddress')
    .trim()
    .notEmpty()
    .withMessage('Sender address is required')
    .isLength({ max: 500 })
    .withMessage('Sender address must be less than 500 characters'),

  // Recipient info
  body('recipientName')
    .trim()
    .notEmpty()
    .withMessage('Recipient name is required')
    .isLength({ max: 100 })
    .withMessage('Recipient name must be less than 100 characters'),
  body('recipientPhone')
    .trim()
    .notEmpty()
    .withMessage('Recipient phone is required'),
  body('recipientAddress')
    .trim()
    .notEmpty()
    .withMessage('Recipient address is required')
    .isLength({ max: 500 })
    .withMessage('Recipient address must be less than 500 characters'),
  body('recipientLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('recipientLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),

  // Package info
  body('packageWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Package weight must be a positive number'),
  body('packageSize')
    .optional()
    .isIn(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'])
    .withMessage('Invalid package size'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),

  // Optional driver assignment
  body('driverId')
    .optional()
    .isUUID()
    .withMessage('Invalid driver ID'),

  // Generate delivery code option
  body('generateDeliveryCode')
    .optional()
    .isBoolean()
    .withMessage('generateDeliveryCode must be a boolean'),
];

const updateShipmentValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID'),

  // Sender info (optional for update)
  body('senderName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Sender name must be less than 100 characters'),
  body('senderPhone')
    .optional()
    .trim(),
  body('senderAddress')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Sender address must be less than 500 characters'),

  // Recipient info (optional for update)
  body('recipientName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Recipient name must be less than 100 characters'),
  body('recipientPhone')
    .optional()
    .trim(),
  body('recipientAddress')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Recipient address must be less than 500 characters'),
  body('recipientLat')
    .optional()
    .isFloat({ min: -90, max: 90 })
    .withMessage('Invalid latitude'),
  body('recipientLng')
    .optional()
    .isFloat({ min: -180, max: 180 })
    .withMessage('Invalid longitude'),

  // Package info
  body('packageWeight')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Package weight must be a positive number'),
  body('packageSize')
    .optional()
    .isIn(['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'])
    .withMessage('Invalid package size'),
  body('description')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Description must be less than 1000 characters'),
];

const updateStatusValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID'),
  body('status')
    .isIn(['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'])
    .withMessage('Invalid status'),
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters'),
  body('location')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Location must be less than 200 characters'),
];

const assignDriverValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID'),
  body('driverId')
    .isUUID()
    .withMessage('Invalid driver ID'),
];

const deliverShipmentValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid shipment ID'),
  body('deliveryCode')
    .optional()
    .isLength({ min: 6, max: 6 })
    .withMessage('Delivery code must be 6 characters'),
  body('signatureUrl')
    .optional()
    .isURL()
    .withMessage('Invalid signature URL'),
  body('photoUrl')
    .optional()
    .isURL()
    .withMessage('Invalid photo URL'),
  body('note')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Note must be less than 500 characters'),
];

const getShipmentsValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'])
    .withMessage('Invalid status'),
  query('driverId')
    .optional()
    .isUUID()
    .withMessage('Invalid driver ID'),
];

const idParamValidator = [
  param('id')
    .isUUID()
    .withMessage('Invalid ID'),
];

const trackingNumberValidator = [
  param('trackingNumber')
    .trim()
    .notEmpty()
    .withMessage('Tracking number is required'),
];

module.exports = {
  createShipmentValidator,
  updateShipmentValidator,
  updateStatusValidator,
  assignDriverValidator,
  deliverShipmentValidator,
  getShipmentsValidator,
  idParamValidator,
  trackingNumberValidator,
};
