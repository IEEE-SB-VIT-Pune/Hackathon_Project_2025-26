import otpGenerator from 'otp-generator';

/**
 * Generate a 6-digit numeric OTP
 * @returns {string} - 6-digit OTP
 */
export const generateOTP = () => {
  return otpGenerator.generate(6, {
    digits: true,
    lowerCaseAlphabets: false,
    upperCaseAlphabets: false,
    specialChars: false,
  });
};

/**
 * Get OTP expiry time (5 minutes from now)
 * @returns {Date} - Expiry timestamp
 */
export const getOTPExpiry = () => {
  return new Date(Date.now() + 5 * 60 * 1000); // 5 minutes
};

/**
 * Validate OTP format
 * @param {string} otp - OTP to validate
 * @returns {boolean} - True if valid
 */
export const isValidOTPFormat = (otp) => {
  return /^\d{6}$/.test(otp);
};
