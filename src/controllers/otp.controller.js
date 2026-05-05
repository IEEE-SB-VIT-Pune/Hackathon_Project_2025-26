import bcrypt from 'bcryptjs';
import OTP from '../models/otp.model.js';
import User from '../models/user.model.js';
import { generateOTP, getOTPExpiry, isValidOTPFormat } from '../utils/otp.js';
import { sendOTPEmail } from '../utils/email.js';
import { signToken } from '../utils/jwt.js';
import log from '../utils/logger.js';

// Rate limiting: Track OTP send attempts per email
const otpSendAttempts = new Map();
const MAX_OTP_SENDS_PER_HOUR = 5;
const OTP_SEND_COOLDOWN = 30000; // 30 seconds between sends

/**
 * Check if email can send OTP (rate limiting)
 */
const canSendOTP = (email) => {
  const now = Date.now();
  const attempts = otpSendAttempts.get(email) || { count: 0, firstAttempt: now, lastAttempt: 0 };

  // Reset counter if an hour has passed
  if (now - attempts.firstAttempt > 60 * 60 * 1000) {
    otpSendAttempts.set(email, { count: 0, firstAttempt: now, lastAttempt: 0 });
    return { allowed: true };
  }

  // Check cooldown period
  if (now - attempts.lastAttempt < OTP_SEND_COOLDOWN) {
    const remainingSeconds = Math.ceil((OTP_SEND_COOLDOWN - (now - attempts.lastAttempt)) / 1000);
    return { allowed: false, reason: `Please wait ${remainingSeconds} seconds before requesting another OTP` };
  }

  // Check max attempts
  if (attempts.count >= MAX_OTP_SENDS_PER_HOUR) {
    return { allowed: false, reason: 'Too many OTP requests. Please try again after an hour.' };
  }

  return { allowed: true };
};

/**
 * Record OTP send attempt
 */
const recordOTPSend = (email) => {
  const now = Date.now();
  const attempts = otpSendAttempts.get(email) || { count: 0, firstAttempt: now, lastAttempt: 0 };
  attempts.count += 1;
  attempts.lastAttempt = now;
  otpSendAttempts.set(email, attempts);
};

/* ================= SEND OTP ================= */
export const sendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      log.warn('SEND_OTP', 'Email is required');
      return next({ statusCode: 400, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log.warn('SEND_OTP', `Invalid email format: ${email}`);
      return next({ statusCode: 400, message: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limiting
    const rateLimitCheck = canSendOTP(normalizedEmail);
    if (!rateLimitCheck.allowed) {
      log.warn('SEND_OTP', `Rate limit exceeded for ${normalizedEmail}`);
      return next({ statusCode: 429, message: rateLimitCheck.reason });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      log.warn('SEND_OTP', `User already exists: ${normalizedEmail}`);
      return next({ statusCode: 400, message: 'An account with this email already exists. Please login.' });
    }

    // Delete any existing OTPs for this email
    await OTP.deleteMany({ email: normalizedEmail });

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Save OTP to database
    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      attempts: 0,
      isUsed: false,
    });

    // Send OTP email
    try {
      await sendOTPEmail(normalizedEmail, otp);
      log.success('SEND_OTP', `OTP sent to ${normalizedEmail}`);
    } catch (emailError) {
      log.error('SEND_OTP', `Failed to send email to ${normalizedEmail}`, emailError);
      // Delete the OTP if email fails
      await OTP.deleteMany({ email: normalizedEmail });
      return next({ statusCode: 500, message: 'Failed to send OTP email. Please try again.' });
    }

    // Record the send attempt
    recordOTPSend(normalizedEmail);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email. Please check your inbox.',
      expiresIn: 300, // 5 minutes in seconds
    });
  } catch (error) {
    log.error('SEND_OTP', 'Error sending OTP', error);
    next({ statusCode: 500, message: 'Failed to send OTP. Please try again.' });
  }
};

/* ================= VERIFY OTP AND CREATE USER ================= */
export const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, password, fullName } = req.body;

    // Validate inputs
    if (!email || !otp || !password || !fullName) {
      log.warn('VERIFY_OTP', 'Missing required fields');
      return next({ statusCode: 400, message: 'Email, OTP, password, and full name are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate OTP format
    if (!isValidOTPFormat(otp)) {
      log.warn('VERIFY_OTP', `Invalid OTP format: ${otp}`);
      return next({ statusCode: 400, message: 'OTP must be a 6-digit number' });
    }

    // Validate password strength
    if (password.length < 8) {
      log.warn('VERIFY_OTP', 'Password too short');
      return next({ statusCode: 400, message: 'Password must be at least 8 characters long' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      isUsed: false,
    });

    if (!otpRecord) {
      log.warn('VERIFY_OTP', `Invalid OTP for ${normalizedEmail}`);
      return next({ statusCode: 400, message: 'Invalid OTP. Please check and try again.' });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      log.warn('VERIFY_OTP', `Expired OTP for ${normalizedEmail}`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return next({ statusCode: 400, message: 'OTP has expired. Please request a new one.' });
    }

    // Check verification attempts (prevent brute force)
    if (otpRecord.attempts >= 5) {
      log.warn('VERIFY_OTP', `Too many attempts for ${normalizedEmail}`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return next({ statusCode: 400, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Double-check user doesn't exist (race condition protection)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      log.warn('VERIFY_OTP', `User already exists during verification: ${normalizedEmail}`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return next({ statusCode: 400, message: 'An account with this email already exists.' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      authProvider: 'local',
      systemRole: 'user',
      isVerified: true, // Email is verified via OTP
    });

    // Mark OTP as used and delete it
    await OTP.deleteOne({ _id: otpRecord._id });

    // Clear rate limiting for this email
    otpSendAttempts.delete(normalizedEmail);

    // Generate JWT token
    const token = signToken({ id: newUser._id });

    log.success('VERIFY_OTP', `Account created successfully: ${normalizedEmail}`);

    res.status(201).json({
      success: true,
      message: 'Account created successfully! You can now login.',
      data: {
        user: {
          id: newUser._id,
          fullName: newUser.fullName,
          email: newUser.email,
          systemRole: newUser.systemRole,
        },
        token,
      },
    });
  } catch (error) {
    log.error('VERIFY_OTP', 'Error verifying OTP', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return next({ statusCode: 400, message: 'An account with this email already exists.' });
    }

    next({ statusCode: 500, message: 'Failed to verify OTP. Please try again.' });
  }
};

/* ================= RESEND OTP ================= */
export const resendOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email || !email.trim()) {
      log.warn('RESEND_OTP', 'Email is required');
      return next({ statusCode: 400, message: 'Email is required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limiting
    const rateLimitCheck = canSendOTP(normalizedEmail);
    if (!rateLimitCheck.allowed) {
      log.warn('RESEND_OTP', `Rate limit exceeded for ${normalizedEmail}`);
      return next({ statusCode: 429, message: rateLimitCheck.reason });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      log.warn('RESEND_OTP', `User already exists: ${normalizedEmail}`);
      return next({ statusCode: 400, message: 'An account with this email already exists. Please login.' });
    }

    // Delete old OTPs
    await OTP.deleteMany({ email: normalizedEmail });

    // Generate new OTP
    const otp = generateOTP();
    const expiresAt = getOTPExpiry();

    // Save new OTP
    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      attempts: 0,
      isUsed: false,
    });

    // Send OTP email
    try {
      await sendOTPEmail(normalizedEmail, otp);
      log.success('RESEND_OTP', `OTP resent to ${normalizedEmail}`);
    } catch (emailError) {
      log.error('RESEND_OTP', `Failed to send email to ${normalizedEmail}`, emailError);
      await OTP.deleteMany({ email: normalizedEmail });
      return next({ statusCode: 500, message: 'Failed to send OTP email. Please try again.' });
    }

    // Record the send attempt
    recordOTPSend(normalizedEmail);

    res.status(200).json({
      success: true,
      message: 'OTP resent successfully. Please check your email.',
      expiresIn: 300,
    });
  } catch (error) {
    log.error('RESEND_OTP', 'Error resending OTP', error);
    next({ statusCode: 500, message: 'Failed to resend OTP. Please try again.' });
  }
};

/* ================= SEND PASSWORD RESET OTP ================= */
export const sendResetOTP = async (req, res, next) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || !email.trim()) {
      log.warn('SEND_RESET_OTP', 'Email is required');
      return next({ statusCode: 400, message: 'Email is required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      log.warn('SEND_RESET_OTP', `Invalid email format: ${email}`);
      return next({ statusCode: 400, message: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check rate limiting
    const rateLimitCheck = canSendOTP(normalizedEmail);
    if (!rateLimitCheck.allowed) {
      log.warn('SEND_RESET_OTP', `Rate limit exceeded for ${normalizedEmail}`);
      return next({ statusCode: 429, message: rateLimitCheck.reason });
    }

    // Check if user exists (but don't reveal if they don't for security)
    const existingUser = await User.findOne({ email: normalizedEmail });
    
    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (existingUser) {
      // Delete any existing OTPs for this email
      await OTP.deleteMany({ email: normalizedEmail });

      // Generate OTP
      const otp = generateOTP();
      const expiresAt = getOTPExpiry();

      // Save OTP to database
      await OTP.create({
        email: normalizedEmail,
        otp,
        expiresAt,
        attempts: 0,
        isUsed: false,
      });

      // Send password reset OTP email
      try {
        const { sendPasswordResetEmail } = await import('../utils/email.js');
        await sendPasswordResetEmail(normalizedEmail, otp);
        log.success('SEND_RESET_OTP', `Password reset OTP sent to ${normalizedEmail}`);
      } catch (emailError) {
        log.error('SEND_RESET_OTP', `Failed to send email to ${normalizedEmail}`, emailError);
        // Delete the OTP if email fails
        await OTP.deleteMany({ email: normalizedEmail });
        return next({ statusCode: 500, message: 'Failed to send OTP email. Please try again.' });
      }

      // Record the send attempt
      recordOTPSend(normalizedEmail);
    } else {
      log.warn('SEND_RESET_OTP', `User not found: ${normalizedEmail} (not revealing to client)`);
    }

    // Always return success message (security best practice)
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, you will receive a password reset OTP.',
      expiresIn: 300,
    });
  } catch (error) {
    log.error('SEND_RESET_OTP', 'Error sending password reset OTP', error);
    next({ statusCode: 500, message: 'Failed to send OTP. Please try again.' });
  }
};

/* ================= RESET PASSWORD WITH OTP ================= */
export const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate inputs
    if (!email || !otp || !newPassword) {
      log.warn('RESET_PASSWORD', 'Missing required fields');
      return next({ statusCode: 400, message: 'Email, OTP, and new password are required' });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Validate OTP format
    if (!isValidOTPFormat(otp)) {
      log.warn('RESET_PASSWORD', `Invalid OTP format: ${otp}`);
      return next({ statusCode: 400, message: 'OTP must be a 6-digit number' });
    }

    // Validate password strength
    if (newPassword.length < 8) {
      log.warn('RESET_PASSWORD', 'Password too short');
      return next({ statusCode: 400, message: 'Password must be at least 8 characters long' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({
      email: normalizedEmail,
      otp: otp.trim(),
      isUsed: false,
    });

    if (!otpRecord) {
      log.warn('RESET_PASSWORD', `Invalid OTP for ${normalizedEmail}`);
      return next({ statusCode: 400, message: 'Invalid OTP. Please check and try again.' });
    }

    // Check if OTP has expired
    if (new Date() > otpRecord.expiresAt) {
      log.warn('RESET_PASSWORD', `Expired OTP for ${normalizedEmail}`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return next({ statusCode: 400, message: 'OTP has expired. Please request a new one.' });
    }

    // Check verification attempts (prevent brute force)
    if (otpRecord.attempts >= 5) {
      log.warn('RESET_PASSWORD', `Too many attempts for ${normalizedEmail}`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return next({ statusCode: 400, message: 'Too many failed attempts. Please request a new OTP.' });
    }

    // Find user
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      log.warn('RESET_PASSWORD', `User not found: ${normalizedEmail}`);
      await OTP.deleteOne({ _id: otpRecord._id });
      return next({ statusCode: 400, message: 'User not found.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password = hashedPassword;
    await user.save();

    // Delete OTP
    await OTP.deleteOne({ _id: otpRecord._id });

    // Clear rate limiting for this email
    otpSendAttempts.delete(normalizedEmail);

    log.success('RESET_PASSWORD', `Password reset successfully for ${normalizedEmail}`);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully! You can now login with your new password.',
    });
  } catch (error) {
    log.error('RESET_PASSWORD', 'Error resetting password', error);
    next({ statusCode: 500, message: 'Failed to reset password. Please try again.' });
  }
};
