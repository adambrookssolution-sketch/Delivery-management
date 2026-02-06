const path = require('path');
const { successResponse, errorResponse } = require('../utils/response');

class UploadController {
  /**
   * POST /api/uploads/signature
   * Upload signature image
   */
  async uploadSignature(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      const fileUrl = `/uploads/signatures/${req.file.filename}`;

      return successResponse(
        res,
        {
          filename: req.file.filename,
          url: fileUrl,
          fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
        },
        'Signature uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/uploads/photo
   * Upload delivery photo
   */
  async uploadPhoto(req, res, next) {
    try {
      if (!req.file) {
        return errorResponse(res, 'No file uploaded', 400);
      }

      const fileUrl = `/uploads/photos/${req.file.filename}`;

      return successResponse(
        res,
        {
          filename: req.file.filename,
          url: fileUrl,
          fullUrl: `${req.protocol}://${req.get('host')}${fileUrl}`,
        },
        'Photo uploaded successfully',
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
