const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin, isAdminOrDispatcher, isDriver, isDriverOrAdmin } = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const {
  createShipmentValidator,
  updateShipmentValidator,
  updateStatusValidator,
  assignDriverValidator,
  deliverShipmentValidator,
  getShipmentsValidator,
  idParamValidator,
  trackingNumberValidator,
} = require('../validators/shipmentValidator');

/**
 * @swagger
 * /api/shipments/track/{trackingNumber}:
 *   get:
 *     summary: Track shipment by tracking number (Public)
 *     tags: [Shipments]
 *     parameters:
 *       - in: path
 *         name: trackingNumber
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipment found
 *       404:
 *         description: Shipment not found
 */
router.get(
  '/track/:trackingNumber',
  trackingNumberValidator,
  validate,
  shipmentController.getByTrackingNumber
);

/**
 * @swagger
 * /api/shipments/driver/my:
 *   get:
 *     summary: Get current driver's shipments
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED]
 *     responses:
 *       200:
 *         description: Shipments retrieved successfully
 */
router.get(
  '/driver/my',
  authenticate,
  isDriver,
  shipmentController.getMyShipments
);

/**
 * @swagger
 * /api/shipments:
 *   post:
 *     summary: Create a new shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateShipment'
 *     responses:
 *       201:
 *         description: Shipment created successfully
 */
router.post(
  '/',
  authenticate,
  isAdminOrDispatcher,
  createShipmentValidator,
  validate,
  shipmentController.create
);

/**
 * @swagger
 * /api/shipments:
 *   get:
 *     summary: Get all shipments with pagination
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: driverId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipments retrieved successfully
 */
router.get(
  '/',
  authenticate,
  getShipmentsValidator,
  validate,
  shipmentController.getAll
);

/**
 * @swagger
 * /api/shipments/{id}:
 *   get:
 *     summary: Get shipment by ID
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipment retrieved successfully
 *       404:
 *         description: Shipment not found
 */
router.get(
  '/:id',
  authenticate,
  idParamValidator,
  validate,
  shipmentController.getById
);

/**
 * @swagger
 * /api/shipments/{id}:
 *   put:
 *     summary: Update shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateShipment'
 *     responses:
 *       200:
 *         description: Shipment updated successfully
 */
router.put(
  '/:id',
  authenticate,
  isAdminOrDispatcher,
  updateShipmentValidator,
  validate,
  shipmentController.update
);

/**
 * @swagger
 * /api/shipments/{id}/status:
 *   put:
 *     summary: Update shipment status
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY, DELIVERED, FAILED, RETURNED]
 *               note:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       200:
 *         description: Status updated successfully
 */
router.put(
  '/:id/status',
  authenticate,
  isDriverOrAdmin,
  updateStatusValidator,
  validate,
  shipmentController.updateStatus
);

/**
 * @swagger
 * /api/shipments/{id}/assign:
 *   put:
 *     summary: Assign driver to shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - driverId
 *             properties:
 *               driverId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Driver assigned successfully
 */
router.put(
  '/:id/assign',
  authenticate,
  isAdminOrDispatcher,
  assignDriverValidator,
  validate,
  shipmentController.assignDriver
);

/**
 * @swagger
 * /api/shipments/{id}/deliver:
 *   post:
 *     summary: Complete delivery
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               deliveryCode:
 *                 type: string
 *               signatureUrl:
 *                 type: string
 *               photoUrl:
 *                 type: string
 *               note:
 *                 type: string
 *     responses:
 *       200:
 *         description: Delivery completed successfully
 */
router.post(
  '/:id/deliver',
  authenticate,
  isDriver,
  deliverShipmentValidator,
  validate,
  shipmentController.deliver
);

/**
 * @swagger
 * /api/shipments/{id}:
 *   delete:
 *     summary: Delete shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Shipment deleted successfully
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  shipmentController.delete
);

/**
 * @swagger
 * /api/shipments/{id}/qr:
 *   get:
 *     summary: Generate QR code for shipment
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: QR code generated successfully
 */
router.get(
  '/:id/qr',
  authenticate,
  idParamValidator,
  validate,
  shipmentController.getQRCode
);

/**
 * @swagger
 * /api/shipments/{id}/label:
 *   get:
 *     summary: Get label data for 4x6 printing
 *     tags: [Shipments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Label data retrieved successfully
 */
router.get(
  '/:id/label',
  authenticate,
  idParamValidator,
  validate,
  shipmentController.getLabelData
);

module.exports = router;
