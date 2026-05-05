import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../common/Input';
import Button from '../common/Button';
import { sendResetOTP, resetPassword } from '../../services/api';

const ForgotPasswordForm = () => {
  const navigate = useNavigate();
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    otp: '',
    newPassword: '',
  });
  
  // UI state
  const [step, setStep] = useState(1); // 1: Enter email, 2: Enter OTP + new password
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpExpiry, setOtpExpiry] = useState(null);

  // Countdown timer for resend button
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // OTP expiry countdown
  useEffect(() => {
    if (otpExpiry) {
      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, Math.floor((otpExpiry - now) / 1000));
        if (remaining === 0) {
          setError('OTP has expired. Please request a new one.');
          clearInterval(interval);
        }
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [otpExpiry]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long';
    }
    return null;
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!validateEmail(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const response = await sendResetOTP({ email: formData.email });
      
      if (response.data.success) {
        setSuccess('OTP sent! Please check your email.');
        setStep(2);
        setResendCooldown(30); // 30 seconds cooldown
        setOtpExpiry(Date.now() + 5 * 60 * 1000); // 5 minutes
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Send Reset OTP Error:', err);
      const message = err.response?.data?.message || 'Failed to send OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!/^\d{6}$/.test(formData.otp)) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    setLoading(true);

    try {
      const response = await resetPassword({
        email: formData.email,
        otp: formData.otp,
        newPassword: formData.newPassword,
      });

      if (response.data.success) {
        setSuccess('Password reset successfully! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 2000);
      }
    } catch (err) {
      console.error('Reset Password Error:', err);
      const message = err.response?.data?.message || 'Failed to reset password. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const response = await sendResetOTP({ email: formData.email });
      
      if (response.data.success) {
        setSuccess('OTP resent! Please check your email.');
        setResendCooldown(30);
        setOtpExpiry(Date.now() + 5 * 60 * 1000);
        setFormData(prev => ({ ...prev, otp: '' })); // Clear OTP field
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Resend OTP Error:', err);
      const message = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep1 = () => {
    setStep(1);
    setFormData(prev => ({ ...prev, otp: '', newPassword: '' }));
    setError('');
    setSuccess('');
    setOtpExpiry(null);
  };

  const getRemainingTime = () => {
    if (!otpExpiry) return 0;
    const remaining = Math.max(0, Math.floor((otpExpiry - Date.now()) / 1000));
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="auth-form-container">
      <div className="auth-header">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">
          {step === 1 
            ? 'Enter your email to receive a password reset OTP'
            : 'Enter the OTP and your new password'}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error" style={{
          backgroundColor: '#fee',
          border: '1px solid #fcc',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#c33',
          fontSize: '14px',
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="alert alert-success" style={{
          backgroundColor: '#efe',
          border: '1px solid #cfc',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          color: '#3c3',
          fontSize: '14px',
        }}>
          ✓ {success}
        </div>
      )}

      {/* Step 1: Enter Email */}
      {step === 1 && (
        <form onSubmit={handleSendOTP} className="auth-form">
          <Input
            label="Email address"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />

          <Button
            text={loading ? 'Sending OTP...' : 'Send OTP'}
            type="submit"
            disabled={loading}
          />
        </form>
      )}

      {/* Step 2: Enter OTP + New Password */}
      {step === 2 && (
        <form onSubmit={handleResetPassword} className="auth-form">
          <div style={{
            backgroundColor: '#f8f9fa',
            border: '1px solid #dee2e6',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
            textAlign: 'center',
          }}>
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#6c757d' }}>
              OTP sent to: <strong>{formData.email}</strong>
            </p>
            {otpExpiry && (
              <p style={{ margin: 0, fontSize: '13px', color: '#dc3545', fontWeight: '600' }}>
                ⏰ Expires in: {getRemainingTime()}
              </p>
            )}
          </div>

          <Input
            label="Enter OTP"
            name="otp"
            type="text"
            placeholder="Enter 6-digit OTP"
            value={formData.otp}
            onChange={handleInputChange}
            maxLength={6}
            pattern="\d{6}"
            required
            autoFocus
          />

          <Input
            label="New Password"
            name="newPassword"
            type="password"
            placeholder="Enter new password (min 8 characters)"
            value={formData.newPassword}
            onChange={handleInputChange}
            required
          />

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <Button
              text={loading ? 'Resetting...' : 'Reset Password'}
              type="submit"
              disabled={loading || formData.otp.length !== 6}
              style={{ flex: 1 }}
            />
            <button
              type="button"
              onClick={handleBackToStep1}
              disabled={loading}
              style={{
                flex: 1,
                padding: '12px',
                border: '1px solid #dee2e6',
                borderRadius: '8px',
                backgroundColor: '#fff',
                color: '#6c757d',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '500',
              }}
            >
              Back
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            {resendCooldown > 0 ? (
              <p style={{ fontSize: '14px', color: '#6c757d' }}>
                Resend OTP in {resendCooldown}s
              </p>
            ) : (
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={loading}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#667eea',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  textDecoration: 'underline',
                }}
              >
                Resend OTP
              </button>
            )}
          </div>
        </form>
      )}

      <p className="auth-footer">
        Remember your password?{' '}
        <Link to="/login" className="auth-link">Login</Link>
      </p>
    </div>
  );
};

export default ForgotPasswordForm;
