const userService = require('../services/userService');
const { successResponse, errorResponse, paginatedResponse } = require('../utils/response');

class UserController {
  /**
   * GET /api/users
   * Get all users with pagination
   */
  async getAll(req, res, next) {
    try {
      const { users, pagination } = await userService.getAll(req.query);
      return paginatedResponse(res, users, pagination, 'Users retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/users/:id
   * Get user by ID
   */
  async getById(req, res, next) {
    try {
      const user = await userService.getById(req.params.id);
      return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * POST /api/users
   * Create a new user
   */
  async create(req, res, next) {
    try {
      const user = await userService.create(req.body);
      return successResponse(res, user, 'User created successfully', 201);
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * PUT /api/users/:id
   * Update user
   */
  async update(req, res, next) {
    try {
      const user = await userService.update(req.params.id, req.body);
      return successResponse(res, user, 'User updated successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * DELETE /api/users/:id
   * Delete (deactivate) user
   */
  async delete(req, res, next) {
    try {
      const result = await userService.delete(req.params.id);
      return successResponse(res, result, 'User deactivated successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/users/drivers
   * Get all drivers
   */
  async getDrivers(req, res, next) {
    try {
      const onlyActive = req.query.onlyActive !== 'false';
      const drivers = await userService.getDrivers(onlyActive);
      return successResponse(res, drivers, 'Drivers retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }

  /**
   * GET /api/users/drivers/:id/stats
   * Get driver statistics
   */
  async getDriverStats(req, res, next) {
    try {
      const stats = await userService.getDriverStats(req.params.id);
      return successResponse(res, stats, 'Driver statistics retrieved successfully');
    } catch (error) {
      if (error.statusCode) {
        return errorResponse(res, error.message, error.statusCode);
      }
      next(error);
    }
  }
}

module.exports = new UserController();
