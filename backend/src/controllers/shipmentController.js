const shipmentService = require('../services/shipmentService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');
const { generateQRCodeDataURL } = require('../utils/qrCode');

class ShipmentController {
  /**
   * POST /api/shipments
   * Create a new shipment
   */
  async create(req, res, next) {
    try {
      const shipment = await shipmentService.create(req.body, req.user.id);
      return successResponse(res, shipment, 'Shipment created successfully', 201);
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/shipments
   * Get all shipments with pagination
   */
  async getAll(req, res, next) {
    try {
      const { shipments, pagination } = await shipmentService.getAll(
        req.query,
        req.user.id,
        req.user.role
      );
      return paginatedResponse(res, shipments, pagination, 'Shipments retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/shipments/:id
   * Get shipment by ID
   */
  async getById(req, res, next) {
    try {
      const shipment = await shipmentService.getById(req.params.id);
      return successResponse(res, shipment, 'Shipment retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/shipments/track/:trackingNumber
   * Get shipment by tracking number (public)
   */
  async getByTrackingNumber(req, res, next) {
    try {
      const shipment = await shipmentService.getByTrackingNumber(req.params.trackingNumber);
      return successResponse(res, shipment, 'Shipment found');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * PUT /api/shipments/:id
   * Update shipment
   */
  async update(req, res, next) {
    try {
      const shipment = await shipmentService.update(req.params.id, req.body);
      return successResponse(res, shipment, 'Shipment updated successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * PUT /api/shipments/:id/status
   * Update shipment status
   */
  async updateStatus(req, res, next) {
    try {
      const shipment = await shipmentService.updateStatus(
        req.params.id,
        req.body,
        req.user.id
      );
      return successResponse(res, shipment, 'Status updated successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * PUT /api/shipments/:id/assign
   * Assign driver to shipment
   */
  async assignDriver(req, res, next) {
    try {
      const shipment = await shipmentService.assignDriver(
        req.params.id,
        req.body.driverId
      );
      return successResponse(res, shipment, 'Driver assigned successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * POST /api/shipments/:id/deliver
   * Complete delivery
   */
  async deliver(req, res, next) {
    try {
      const shipment = await shipmentService.deliver(
        req.params.id,
        req.body,
        req.user.id
      );
      return successResponse(res, shipment, 'Delivery completed successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * DELETE /api/shipments/:id
   * Delete shipment
   */
  async delete(req, res, next) {
    try {
      const result = await shipmentService.delete(req.params.id);
      return successResponse(res, result, 'Shipment deleted successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/shipments/driver/my
   * Get current driver's shipments
   */
  async getMyShipments(req, res, next) {
    try {
      const shipments = await shipmentService.getDriverShipments(
        req.user.id,
        req.query.status
      );
      return successResponse(res, shipments, 'Shipments retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/shipments/:id/qr
   * Generate QR code for shipment
   */
  async getQRCode(req, res, next) {
    try {
      const shipment = await shipmentService.getById(req.params.id);

      // Generate QR code with tracking number
      const qrData = shipment.trackingNumber;
      const qrCodeDataURL = await generateQRCodeDataURL(qrData, { width: 400 });

      return successResponse(res, {
        trackingNumber: shipment.trackingNumber,
        qrCode: qrCodeDataURL,
      }, 'QR code generated successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/shipments/:id/label
   * Get label data for printing (4x6 format)
   */
  async getLabelData(req, res, next) {
    try {
      const shipment = await shipmentService.getById(req.params.id);

      // Generate QR code
      const qrCodeDataURL = await generateQRCodeDataURL(shipment.trackingNumber, { width: 200 });

      // Return label data
      const labelData = {
        trackingNumber: shipment.trackingNumber,
        qrCode: qrCodeDataURL,
        sender: {
          name: shipment.senderName,
          phone: shipment.senderPhone,
          address: shipment.senderAddress,
        },
        recipient: {
          name: shipment.recipientName,
          phone: shipment.recipientPhone,
          address: shipment.recipientAddress,
        },
        package: {
          weight: shipment.packageWeight,
          size: shipment.packageSize,
          description: shipment.description,
        },
        createdAt: shipment.createdAt,
        status: shipment.status,
      };

      return successResponse(res, labelData, 'Label data retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}

module.exports = new ShipmentController();
