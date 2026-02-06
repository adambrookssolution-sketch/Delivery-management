require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const swaggerUi = require('swagger-ui-express');

const routes = require('./routes');
const swaggerSpec = require('./docs/swagger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Delivery Management API',
}));

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Delivery Management API',
    version: '1.0.0',
    documentation: '/api-docs',
    health: '/api/health',
  });
});

// Error handlers
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('   Delivery Management API Server');
  console.log('🚀 ========================================');
  console.log('');
  console.log(`   📡 Server:      http://localhost:${PORT}`);
  console.log(`   📚 API Docs:    http://localhost:${PORT}/api-docs`);
  console.log(`   💚 Health:      http://localhost:${PORT}/api/health`);
  console.log('');
  console.log(`   Environment:    ${process.env.NODE_ENV || 'development'}`);
  console.log('');
  console.log('🚀 ========================================');
  console.log('');
});

module.exports = app;
