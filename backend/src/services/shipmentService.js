const prisma = require('../config/database');
const { generateTrackingNumber, generateDeliveryCode } = require('../utils/trackingNumber');

class ShipmentService {
  /**
   * Create a new shipment
   */
  async create(shipmentData, createdById) {
    const {
      senderName,
      senderPhone,
      senderAddress,
      recipientName,
      recipientPhone,
      recipientAddress,
      recipientLat,
      recipientLng,
      packageWeight,
      packageSize,
      description,
      driverId,
      generateDeliveryCode: shouldGenerateCode,
    } = shipmentData;

    // Generate unique tracking number
    let trackingNumber;
    let isUnique = false;

    while (!isUnique) {
      trackingNumber = generateTrackingNumber();
      const existing = await prisma.shipment.findUnique({
        where: { trackingNumber },
      });
      if (!existing) {
        isUnique = true;
      }
    }

    // Create shipment
    const shipment = await prisma.shipment.create({
      data: {
        trackingNumber,
        senderName,
        senderPhone,
        senderAddress,
        recipientName,
        recipientPhone,
        recipientAddress,
        recipientLat,
        recipientLng,
        packageWeight,
        packageSize,
        description,
        driverId,
        createdById,
        deliveryCode: shouldGenerateCode ? generateDeliveryCode() : null,
        statusHistory: {
          create: {
            status: 'PENDING',
            note: 'Shipment created',
          },
        },
      },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return shipment;
  }

  /**
   * Get shipment by ID
   */
  async getById(id) {
    const shipment = await prisma.shipment.findUnique({
      where: { id },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!shipment) {
      throw { statusCode: 404, message: 'Shipment not found' };
    }

    return shipment;
  }

  /**
   * Get shipment by tracking number (public)
   */
  async getByTrackingNumber(trackingNumber) {
    const shipment = await prisma.shipment.findUnique({
      where: { trackingNumber },
      select: {
        id: true,
        trackingNumber: true,
        status: true,
        recipientName: true,
        recipientAddress: true,
        senderName: true,
        packageSize: true,
        description: true,
        deliveredAt: true,
        createdAt: true,
        updatedAt: true,
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          select: {
            status: true,
            note: true,
            location: true,
            createdAt: true,
          },
        },
      },
    });

    if (!shipment) {
      throw { statusCode: 404, message: 'Shipment not found' };
    }

    return shipment;
  }

  /**
   * Get all shipments with pagination and filters
   */
  async getAll(query, userId, userRole) {
    const {
      page = 1,
      limit = 10,
      status,
      driverId,
      search,
    } = query;

    const skip = (page - 1) * limit;

    // Build filter
    const where = {};

    if (status) {
      where.status = status;
    }

    // If driver, only show assigned shipments
    if (userRole === 'DRIVER') {
      where.driverId = userId;
    } else if (driverId) {
      where.driverId = driverId;
    }

    if (search) {
      where.OR = [
        { trackingNumber: { contains: search, mode: 'insensitive' } },
        { recipientName: { contains: search, mode: 'insensitive' } },
        { senderName: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.shipment.count({ where });

    // Get shipments
    const shipments = await prisma.shipment.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return {
      shipments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    };
  }

  /**
   * Update shipment
   */
  async update(id, updateData) {
    // Check if shipment exists
    const existing = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Shipment not found' };
    }

    // Don't allow update if delivered
    if (existing.status === 'DELIVERED') {
      throw { statusCode: 400, message: 'Cannot update delivered shipment' };
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        statusHistory: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return shipment;
  }

  /**
   * Update shipment status
   */
  async updateStatus(id, statusData, userId) {
    const { status, note, location } = statusData;

    // Check if shipment exists
    const existing = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Shipment not found' };
    }

    // Update shipment and create history in transaction
    const shipment = await prisma.$transaction(async (tx) => {
      // Create status history
      await tx.statusHistory.create({
        data: {
          shipmentId: id,
          status,
          note,
          location,
        },
      });

      // Update shipment status
      return tx.shipment.update({
        where: { id },
        data: {
          status,
          ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });

    return shipment;
  }

  /**
   * Assign driver to shipment
   */
  async assignDriver(id, driverId) {
    // Check if shipment exists
    const existing = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Shipment not found' };
    }

    // Check if driver exists and is active
    const driver = await prisma.user.findUnique({
      where: { id: driverId },
    });

    if (!driver) {
      throw { statusCode: 404, message: 'Driver not found' };
    }

    if (driver.role !== 'DRIVER') {
      throw { statusCode: 400, message: 'User is not a driver' };
    }

    if (!driver.isActive) {
      throw { statusCode: 400, message: 'Driver is not active' };
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: { driverId },
      include: {
        driver: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
      },
    });

    return shipment;
  }

  /**
   * Complete delivery
   */
  async deliver(id, deliveryData, driverId) {
    const { deliveryCode, signatureUrl, photoUrl, note } = deliveryData;

    // Check if shipment exists
    const existing = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Shipment not found' };
    }

    // Check if shipment is assigned to this driver
    if (existing.driverId !== driverId) {
      throw { statusCode: 403, message: 'Shipment is not assigned to you' };
    }

    // Check delivery code if required
    if (existing.deliveryCode && existing.deliveryCode !== deliveryCode) {
      throw { statusCode: 400, message: 'Invalid delivery code' };
    }

    // Complete delivery in transaction
    const shipment = await prisma.$transaction(async (tx) => {
      // Create status history
      await tx.statusHistory.create({
        data: {
          shipmentId: id,
          status: 'DELIVERED',
          note: note || 'Package delivered successfully',
        },
      });

      // Update shipment
      return tx.shipment.update({
        where: { id },
        data: {
          status: 'DELIVERED',
          signatureUrl,
          photoUrl,
          deliveredAt: new Date(),
        },
        include: {
          driver: {
            select: {
              id: true,
              name: true,
              phone: true,
            },
          },
          statusHistory: {
            orderBy: { createdAt: 'desc' },
          },
        },
      });
    });

    return shipment;
  }

  /**
   * Delete shipment
   */
  async delete(id) {
    // Check if shipment exists
    const existing = await prisma.shipment.findUnique({
      where: { id },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'Shipment not found' };
    }

    // Don't allow deletion of delivered shipments
    if (existing.status === 'DELIVERED') {
      throw { statusCode: 400, message: 'Cannot delete delivered shipment' };
    }

    await prisma.shipment.delete({
      where: { id },
    });

    return { message: 'Shipment deleted successfully' };
  }

  /**
   * Get driver's assigned shipments
   */
  async getDriverShipments(driverId, status) {
    const where = { driverId };

    if (status) {
      where.status = status;
    }

    const shipments = await prisma.shipment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        statusHistory: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return shipments;
  }
}

module.exports = new ShipmentService();
