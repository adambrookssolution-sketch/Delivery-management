const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const uploadController = require('../controllers/uploadController');
const { authenticate } = require('../middlewares/auth');
const { isDriver, isDriverOrAdmin } = require('../middlewares/roleCheck');

// Configure multer storage for signatures
const signatureStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/signatures'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `signature-${uuidv4()}${ext}`);
  },
});

// Configure multer storage for photos
const photoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/photos'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `photo-${uuidv4()}${ext}`);
  },
});

// File filter for images
const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Multer instances
const uploadSignature = multer({
  storage: signatureStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

const uploadPhoto = multer({
  storage: photoStorage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB
  },
  fileFilter: imageFilter,
});

/**
 * @swagger
 * /api/uploads/signature:
 *   post:
 *     summary: Upload signature image
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               signature:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Signature uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 */
router.post(
  '/signature',
  authenticate,
  isDriverOrAdmin,
  uploadSignature.single('signature'),
  uploadController.uploadSignature
);

/**
 * @swagger
 * /api/uploads/photo:
 *   post:
 *     summary: Upload delivery photo
 *     tags: [Uploads]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Photo uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 */
router.post(
  '/photo',
  authenticate,
  isDriverOrAdmin,
  uploadPhoto.single('photo'),
  uploadController.uploadPhoto
);

module.exports = router;
