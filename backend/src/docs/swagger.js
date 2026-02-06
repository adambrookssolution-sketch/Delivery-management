const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Delivery Management API',
      version: '1.0.0',
      description: 'API documentation for Delivery Management System',
      contact: {
        name: 'API Support',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'DRIVER', 'DISPATCHER'] },
            isActive: { type: 'boolean' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateUser: {
          type: 'object',
          required: ['email', 'password', 'name', 'role'],
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'DRIVER', 'DISPATCHER'] },
            isActive: { type: 'boolean', default: true },
          },
        },
        UpdateUser: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 6 },
            name: { type: 'string' },
            phone: { type: 'string' },
            role: { type: 'string', enum: ['ADMIN', 'DRIVER', 'DISPATCHER'] },
            isActive: { type: 'boolean' },
          },
        },
        Shipment: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            trackingNumber: { type: 'string' },
            status: {
              type: 'string',
              enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'],
            },
            senderName: { type: 'string' },
            senderPhone: { type: 'string' },
            senderAddress: { type: 'string' },
            recipientName: { type: 'string' },
            recipientPhone: { type: 'string' },
            recipientAddress: { type: 'string' },
            recipientLat: { type: 'number' },
            recipientLng: { type: 'number' },
            packageWeight: { type: 'number' },
            packageSize: { type: 'string', enum: ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'] },
            description: { type: 'string' },
            deliveryCode: { type: 'string' },
            signatureUrl: { type: 'string' },
            photoUrl: { type: 'string' },
            deliveredAt: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
        },
        CreateShipment: {
          type: 'object',
          required: ['senderName', 'senderPhone', 'senderAddress', 'recipientName', 'recipientPhone', 'recipientAddress'],
          properties: {
            senderName: { type: 'string' },
            senderPhone: { type: 'string' },
            senderAddress: { type: 'string' },
            recipientName: { type: 'string' },
            recipientPhone: { type: 'string' },
            recipientAddress: { type: 'string' },
            recipientLat: { type: 'number' },
            recipientLng: { type: 'number' },
            packageWeight: { type: 'number' },
            packageSize: { type: 'string', enum: ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'] },
            description: { type: 'string' },
            driverId: { type: 'string', format: 'uuid' },
            generateDeliveryCode: { type: 'boolean', default: false },
          },
        },
        UpdateShipment: {
          type: 'object',
          properties: {
            senderName: { type: 'string' },
            senderPhone: { type: 'string' },
            senderAddress: { type: 'string' },
            recipientName: { type: 'string' },
            recipientPhone: { type: 'string' },
            recipientAddress: { type: 'string' },
            recipientLat: { type: 'number' },
            recipientLng: { type: 'number' },
            packageWeight: { type: 'number' },
            packageSize: { type: 'string', enum: ['SMALL', 'MEDIUM', 'LARGE', 'EXTRA_LARGE'] },
            description: { type: 'string' },
          },
        },
        StatusHistory: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['PENDING', 'PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY', 'DELIVERED', 'FAILED', 'RETURNED'],
            },
            note: { type: 'string' },
            location: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string' },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  field: { type: 'string' },
                  message: { type: 'string' },
                },
              },
            },
          },
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'object' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string' },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication endpoints' },
      { name: 'Shipments', description: 'Shipment management endpoints' },
      { name: 'Users', description: 'User management endpoints' },
      { name: 'Uploads', description: 'File upload endpoints' },
    ],
  },
  apis: ['./src/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
