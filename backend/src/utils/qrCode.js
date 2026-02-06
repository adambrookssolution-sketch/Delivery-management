const QRCode = require('qrcode');

/**
 * Generate QR code as base64 data URL
 * @param {string} data - Data to encode in QR code
 * @param {object} options - QR code options
 * @returns {Promise<string>} Base64 data URL
 */
const generateQRCodeDataURL = async (data, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'image/png',
    width: 300,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    ...options,
  };

  return await QRCode.toDataURL(data, defaultOptions);
};

/**
 * Generate QR code as SVG string
 * @param {string} data - Data to encode in QR code
 * @param {object} options - QR code options
 * @returns {Promise<string>} SVG string
 */
const generateQRCodeSVG = async (data, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'svg',
    width: 300,
    margin: 2,
    ...options,
  };

  return await QRCode.toString(data, defaultOptions);
};

/**
 * Generate QR code buffer (for saving to file)
 * @param {string} data - Data to encode in QR code
 * @param {object} options - QR code options
 * @returns {Promise<Buffer>} PNG buffer
 */
const generateQRCodeBuffer = async (data, options = {}) => {
  const defaultOptions = {
    errorCorrectionLevel: 'M',
    type: 'png',
    width: 300,
    margin: 2,
    ...options,
  };

  return await QRCode.toBuffer(data, defaultOptions);
};

module.exports = {
  generateQRCodeDataURL,
  generateQRCodeSVG,
  generateQRCodeBuffer,
};
