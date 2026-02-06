const prisma = require('../config/database');
const { hashPassword } = require('../utils/password');

class UserService {
  /**
   * Get all users with pagination
   */
  async getAll(query) {
    const {
      page = 1,
      limit = 10,
      role,
      isActive,
      search,
    } = query;

    const skip = (page - 1) * limit;

    // Build filter
    const where = {};

    if (role) {
      where.role = role;
    }

    if (typeof isActive === 'boolean' || isActive === 'true' || isActive === 'false') {
      where.isActive = isActive === 'true' || isActive === true;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Get total count
    const total = await prisma.user.count({ where });

    // Get users
    const users = await prisma.user.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedShipments: true,
          },
        },
      },
    });

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
      },
    };
  }

  /**
   * Get user by ID
   */
  async getById(id) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            assignedShipments: true,
            createdShipments: true,
          },
        },
      },
    });

    if (!user) {
      throw { statusCode: 404, message: 'User not found' };
    }

    return user;
  }

  /**
   * Create a new user
   */
  async create(userData) {
    const { email, password, name, phone, role, isActive } = userData;

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw { statusCode: 400, message: 'Email already registered' };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        phone,
        role,
        isActive: isActive !== undefined ? isActive : true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Update user
   */
  async update(id, updateData) {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // If updating email, check if it's already taken
    if (updateData.email && updateData.email !== existing.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email: updateData.email },
      });

      if (emailExists) {
        throw { statusCode: 400, message: 'Email already in use' };
      }
    }

    // Hash password if being updated
    if (updateData.password) {
      updateData.password = await hashPassword(updateData.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  /**
   * Delete user (soft delete by deactivating)
   */
  async delete(id) {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { id },
    });

    if (!existing) {
      throw { statusCode: 404, message: 'User not found' };
    }

    // Soft delete by deactivating
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    return { message: 'User deactivated successfully' };
  }

  /**
   * Get all drivers (for assignment dropdown)
   */
  async getDrivers(onlyActive = true) {
    const where = { role: 'DRIVER' };

    if (onlyActive) {
      where.isActive = true;
    }

    const drivers = await prisma.user.findMany({
      where,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        isActive: true,
        _count: {
          select: {
            assignedShipments: {
              where: {
                status: {
                  notIn: ['DELIVERED', 'RETURNED', 'FAILED'],
                },
              },
            },
          },
        },
      },
    });

    return drivers;
  }

  /**
   * Get driver statistics
   */
  async getDriverStats(driverId) {
    const stats = await prisma.shipment.groupBy({
      by: ['status'],
      where: { driverId },
      _count: true,
    });

    const totalDelivered = await prisma.shipment.count({
      where: {
        driverId,
        status: 'DELIVERED',
      },
    });

    const totalAssigned = await prisma.shipment.count({
      where: { driverId },
    });

    return {
      totalAssigned,
      totalDelivered,
      byStatus: stats,
    };
  }
}

module.exports = new UserService();
