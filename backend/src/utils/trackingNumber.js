/**
 * Generate unique tracking number
 * Format: PKG-YYYYMMDD-XXXXX
 * Example: PKG-20260204-A1B2C
 */
const generateTrackingNumber = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  const dateStr = `${year}${month}${day}`;

  // Generate random 5 character alphanumeric code
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let randomCode = '';
  for (let i = 0; i < 5; i++) {
    randomCode += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return `PKG-${dateStr}-${randomCode}`;
};

/**
 * Generate delivery verification code
 * Format: 6 digit numeric code
 */
const generateDeliveryCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  generateTrackingNumber,
  generateDeliveryCode,
};
