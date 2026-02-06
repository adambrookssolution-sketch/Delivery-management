const { errorResponse } = require('../utils/response');

/**
 * Role-based access control middleware
 * @param {string[]} allowedRoles - Array of allowed roles
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'Authentication required', 401);
    }

    if (!allowedRoles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Required role: ${allowedRoles.join(' or ')}`,
        403
      );
    }

    next();
  };
};

/**
 * Check if user is admin
 */
const isAdmin = requireRole('ADMIN');

/**
 * Check if user is admin or dispatcher
 */
const isAdminOrDispatcher = requireRole('ADMIN', 'DISPATCHER');

/**
 * Check if user is driver
 */
const isDriver = requireRole('DRIVER');

/**
 * Check if user is driver or admin
 */
const isDriverOrAdmin = requireRole('DRIVER', 'ADMIN');

/**
 * Check if user is any authenticated role
 */
const isAuthenticated = requireRole('ADMIN', 'DISPATCHER', 'DRIVER');

module.exports = {
  requireRole,
  isAdmin,
  isAdminOrDispatcher,
  isDriver,
  isDriverOrAdmin,
  isAuthenticated,
};
