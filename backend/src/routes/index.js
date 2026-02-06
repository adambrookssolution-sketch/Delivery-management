const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');
const shipmentRoutes = require('./shipments');
const userRoutes = require('./users');
const uploadRoutes = require('./uploads');

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/shipments', shipmentRoutes);
router.use('/users', userRoutes);
router.use('/uploads', uploadRoutes);

module.exports = router;
