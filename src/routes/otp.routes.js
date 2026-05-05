import express from 'express';
import { sendOTP, verifyOTP, resendOTP, sendResetOTP, resetPassword } from '../controllers/otp.controller.js';

const router = express.Router();

/**
 * @route   POST /api/auth/send-otp
 * @desc    Send OTP to email for signup verification
 * @access  Public
 */
router.post('/send-otp', sendOTP);

/**
 * @route   POST /api/auth/verify-otp
 * @desc    Verify OTP and create user account
 * @access  Public
 */
router.post('/verify-otp', verifyOTP);

/**
 * @route   POST /api/auth/resend-otp
 * @desc    Resend OTP to email
 * @access  Public
 */
router.post('/resend-otp', resendOTP);

/**
 * @route   POST /api/auth/send-reset-otp
 * @desc    Send OTP to email for password reset
 * @access  Public
 */
router.post('/send-reset-otp', sendResetOTP);

/**
 * @route   POST /api/auth/reset-password
 * @desc    Reset password using OTP
 * @access  Public
 */
router.post('/reset-password', resetPassword);

export default router;
