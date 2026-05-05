import nodemailer from 'nodemailer';
import log from './logger.js';

/* ==================== CONFIGURATION ==================== */
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const EMAIL_CONFIGURED = !!(EMAIL_USER && EMAIL_PASS);

if (!EMAIL_CONFIGURED) {
  log.warn('EMAIL_SERVICE', '⚠️  EMAIL_USER / EMAIL_PASS not set in .env. Emails will be QUEUED but NOT delivered until credentials are configured.');
}

// Build the transporter only when credentials exist
const transporter = EMAIL_CONFIGURED
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    })
  : null;

/* ==================== BACKGROUND JOB QUEUE ==================== */
// A simple in-memory queue with a configurable batch size & interval.
// For production you'd swap this for Bull/BullMQ + Redis, but this
// works perfectly for a single-server deployment.

const emailQueue = [];          // items: { to, subject, html, resolve, reject }
let isProcessing = false;

const BATCH_SIZE  = 10;          // process up to 10 emails per tick
const TICK_MS     = 3_000;       // process queue every 3 seconds

async function processQueue() {
  if (isProcessing || emailQueue.length === 0) return;
  if (!EMAIL_CONFIGURED) {
    log.warn('EMAIL_QUEUE', `Queue has ${emailQueue.length} jobs, but SMTP credentials are missing. Skipping.`);
    return;
  }

  isProcessing = true;
  const batch = emailQueue.splice(0, BATCH_SIZE);

  log.info('EMAIL_QUEUE', `Processing batch of ${batch.length} emails (${emailQueue.length} remaining)`);

  for (const job of batch) {
    try {
      const info = await transporter.sendMail({
        from: `"Hackathon Platform" <${EMAIL_USER}>`,
        to:      job.to,
        subject: job.subject,
        html:    job.html,
      });
      log.success('EMAIL_QUEUE', `✅ Sent to ${job.to} — messageId: ${info.messageId}`);
      job.resolve(info);
    } catch (err) {
      log.error('EMAIL_QUEUE', `❌ Failed to send to ${job.to}: ${err.message}`);
      job.reject(err);
    }
  }

  isProcessing = false;
}

// Start the background ticker
setInterval(processQueue, TICK_MS);

/* ==================== PUBLIC API ==================== */

/**
 * Enqueue an email for background delivery.
 * Returns a Promise that resolves when the email is actually sent.
 * If SMTP is not configured the promise resolves immediately with status: 'queued_no_smtp'.
 */
export const sendEmail = (options) => {
  if (!EMAIL_CONFIGURED) {
    log.warn('EMAIL_SERVICE', `Email to ${options.to} queued, but SMTP not configured. Add EMAIL_USER and EMAIL_PASS to .env.`);
    return Promise.resolve({ status: 'queued_no_smtp' });
  }

  return new Promise((resolve, reject) => {
    emailQueue.push({ ...options, resolve, reject });
    log.info('EMAIL_QUEUE', `Email to ${options.to} queued. Queue length: ${emailQueue.length}`);
  });
};

/**
 * Return a snapshot of the current queue for admin visibility.
 */
export const getQueueStatus = () => ({
  queued: emailQueue.length,
  isProcessing,
  smtpConfigured: EMAIL_CONFIGURED,
});

/**
 * Send OTP verification email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 */
export const sendOTPEmail = async (email, otp) => {
  const subject = 'OTP Verification - HackHub';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .content p {
          color: #333333;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .otp-box {
          background-color: #f8f9fa;
          border: 2px dashed #667eea;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #667eea;
          letter-spacing: 8px;
          margin: 10px 0;
        }
        .expiry {
          color: #dc3545;
          font-size: 14px;
          font-weight: 600;
          margin-top: 10px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
        }
        .warning p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Email Verification</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <p>Thank you for signing up with <strong>HackHub</strong>. To complete your registration, please verify your email address using the OTP below:</p>
          
          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your One-Time Password</p>
            <div class="otp-code">${otp}</div>
            <p class="expiry">⏰ This OTP will expire in 5 minutes</p>
          </div>

          <p>Enter this OTP in the verification form to activate your account.</p>

          <div class="warning">
            <p><strong>⚠️ Security Notice:</strong></p>
            <p>• Never share this OTP with anyone</p>
            <p>• HackHub will never ask for your OTP via phone or email</p>
            <p>• If you didn't request this, please ignore this email</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} HackHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};

/**
 * Send password reset OTP email
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 */
export const sendPasswordResetEmail = async (email, otp) => {
  const subject = 'Password Reset OTP - HackHub';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 50px auto;
          background-color: #ffffff;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: #ffffff;
          padding: 30px;
          text-align: center;
        }
        .header h1 {
          margin: 0;
          font-size: 28px;
        }
        .content {
          padding: 40px 30px;
          text-align: center;
        }
        .content p {
          color: #333333;
          font-size: 16px;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .otp-box {
          background-color: #fff5f5;
          border: 2px dashed #f5576c;
          border-radius: 8px;
          padding: 20px;
          margin: 30px 0;
        }
        .otp-code {
          font-size: 36px;
          font-weight: bold;
          color: #f5576c;
          letter-spacing: 8px;
          margin: 10px 0;
        }
        .expiry {
          color: #dc3545;
          font-size: 14px;
          font-weight: 600;
          margin-top: 10px;
        }
        .footer {
          background-color: #f8f9fa;
          padding: 20px;
          text-align: center;
          color: #6c757d;
          font-size: 14px;
        }
        .warning {
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
        }
        .warning p {
          margin: 0;
          color: #856404;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔑 Password Reset</h1>
        </div>
        <div class="content">
          <p>Hello!</p>
          <p>We received a request to reset your password for your <strong>HackHub</strong> account. Use the OTP below to reset your password:</p>
          
          <div class="otp-box">
            <p style="margin: 0; color: #666; font-size: 14px;">Your One-Time Password</p>
            <div class="otp-code">${otp}</div>
            <p class="expiry">⏰ This OTP will expire in 5 minutes</p>
          </div>

          <p>Enter this OTP on the password reset page to set your new password.</p>

          <div class="warning">
            <p><strong>⚠️ Security Notice:</strong></p>
            <p>• Never share this OTP with anyone</p>
            <p>• HackHub will never ask for your OTP via phone or email</p>
            <p>• If you didn't request this password reset, please ignore this email</p>
            <p>• Your password will remain unchanged if you don't use this OTP</p>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated email. Please do not reply.</p>
          <p>&copy; ${new Date().getFullYear()} HackHub. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to: email, subject, html });
};
