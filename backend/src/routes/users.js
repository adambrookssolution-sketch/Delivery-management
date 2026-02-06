const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middlewares/auth');
const { isAdmin, isAdminOrDispatcher } = require('../middlewares/roleCheck');
const validate = require('../middlewares/validate');
const {
  createUserValidator,
  updateUserValidator,
  getUsersValidator,
  idParamValidator,
} = require('../validators/userValidator');

/**
 * @swagger
 * /api/users/drivers:
 *   get:
 *     summary: Get all drivers
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: onlyActive
 *         schema:
 *           type: boolean
 *           default: true
 *     responses:
 *       200:
 *         description: Drivers retrieved successfully
 */
router.get(
  '/drivers',
  authenticate,
  isAdminOrDispatcher,
  userController.getDrivers
);

/**
 * @swagger
 * /api/users/drivers/{id}/stats:
 *   get:
 *     summary: Get driver statistics
 *     tags: [Users]
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
 *         description: Driver statistics retrieved successfully
 */
router.get(
  '/drivers/:id/stats',
  authenticate,
  isAdminOrDispatcher,
  idParamValidator,
  validate,
  userController.getDriverStats
);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination
 *     tags: [Users]
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
 *         name: role
 *         schema:
 *           type: string
 *           enum: [ADMIN, DRIVER, DISPATCHER]
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 */
router.get(
  '/',
  authenticate,
  isAdmin,
  getUsersValidator,
  validate,
  userController.getAll
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
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
 *         description: User retrieved successfully
 *       404:
 *         description: User not found
 */
router.get(
  '/:id',
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  userController.getById
);

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create a new user
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateUser'
 *     responses:
 *       201:
 *         description: User created successfully
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  createUserValidator,
  validate,
  userController.create
);

/**
 * @swagger
 * /api/users/{id}:
 *   put:
 *     summary: Update user
 *     tags: [Users]
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
 *             $ref: '#/components/schemas/UpdateUser'
 *     responses:
 *       200:
 *         description: User updated successfully
 */
router.put(
  '/:id',
  authenticate,
  isAdmin,
  updateUserValidator,
  validate,
  userController.update
);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Deactivate user
 *     tags: [Users]
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
 *         description: User deactivated successfully
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  idParamValidator,
  validate,
  userController.delete
);

module.exports = router;
