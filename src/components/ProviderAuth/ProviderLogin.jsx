/**
 * Provider Login Component
 * Secure provider authentication with email/password and MFA
 * Phase 2 Sprint 5: Healthcare Provider Integration
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, AlertCircle, Loader, CheckCircle2, ArrowRight } from 'lucide-react';
import { validateProviderEmail } from '../../utils/providerAuth';
import '../../styles/ProviderAuth.css';

const ProviderLogin = ({ onLoginSuccess, onNavigateToSignup, onNavigateToForgotPassword }) => {
  const [step, setStep] = useState('credentials'); // credentials, otp, mfa
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validation state
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const validateEmail = (e) => {
    setEmail(e.target.value);
    setEmailError('');
  };

  const validatePassword = (e) => {
    setPassword(e.target.value);
    setPasswordError('');
  };

  const handleCredentialsSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Client-side validation
    if (!email) {
      setEmailError('Email is required');
      return;
    }
    if (!validateProviderEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    if (!password || password.length < 6) {
      setPasswordError('Password is required');
      return;
    }

    try {
      setLoading(true);

      // In production: Call Firebase authentication
      // For now, simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Mock validation
      if (email && password) {
        setSuccess('Credentials verified. Sending OTP...');
        setTimeout(() => {
          setStep('otp');
          setSuccess('');
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleOTPSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!otpCode || otpCode.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));

      setSuccess('OTP verified. Checking MFA settings...');
      setTimeout(() => {
        setStep('mfa');
        setSuccess('');
      }, 1000);
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMFASubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!mfaCode || mfaCode.length < 6) {
      setError('Please enter a valid authentication code');
      return;
    }

    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1200));

      setSuccess('Authentication successful!');
      setTimeout(() => {
        onLoginSuccess({
          email,
          providerId: 'provider_' + Date.now(),
          role: 'provider',
          rememberMe
        });
      }, 1500);
    } catch (err) {
      setError('Authentication code invalid. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setSuccess('');
    try {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSuccess('OTP sent to ' + email);
      setTimeout(() => setSuccess(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="provider-login-container">
      <div className="provider-login-card">
        {/* Header */}
        <div className="provider-login-header">
          <div className="provider-logo">
            <Lock size={28} className="logo-icon" />
          </div>
          <h1>Healthcare Provider Portal</h1>
          <p className="subtitle">Secure login for medical professionals</p>
        </div>

        {/* Progress Indicator */}
        <div className="login-progress">
          <div className={`progress-step ${step === 'credentials' || step !== 'credentials' ? 'active' : ''}`}>
            <div className="step-number">1</div>
            <div className="step-label">Credentials</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step === 'otp' || step === 'mfa' ? 'active' : ''}`}>
            <div className="step-number">2</div>
            <div className="step-label">Verification</div>
          </div>
          <div className="progress-line"></div>
          <div className={`progress-step ${step === 'mfa' ? 'active' : ''}`}>
            <div className="step-number">3</div>
            <div className="step-label">MFA</div>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="alert alert-success">
            <CheckCircle2 size={18} />
            <span>{success}</span>
          </div>
        )}

        {/* Credentials Step */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="provider-login-form">
            {/* Email Field */}
            <div className="form-group">
              <label htmlFor="provider-email">Professional Email</label>
              <div className="input-wrapper">
                <Mail size={18} className="input-icon" />
                <input
                  id="provider-email"
                  type="email"
                  value={email}
                  onChange={validateEmail}
                  placeholder="your.email@hospital.com"
                  className={`form-input ${emailError ? 'error' : ''}`}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {emailError && <div className="field-error">{emailError}</div>}
              <div className="field-hint">Use your professional email for healthcare organization</div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <div className="label-row">
                <label htmlFor="provider-password">Password</label>
                <button
                  type="button"
                  className="forgot-password-btn"
                  onClick={onNavigateToForgotPassword}
                >
                  Forgot?
                </button>
              </div>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  id="provider-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={validatePassword}
                  placeholder="••••••••"
                  className={`form-input ${passwordError ? 'error' : ''}`}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-password-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordError && <div className="field-error">{passwordError}</div>}
            </div>

            {/* Remember Me */}
            <div className="form-group checkbox-group">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={loading}
              />
              <label htmlFor="remember-me">Remember me on this device</label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Continue to Verification</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Help Text */}
            <div className="auth-help">
              <p>Having trouble logging in?</p>
              <p>Contact support: support@myfamilyhealth.com</p>
            </div>
          </form>
        )}

        {/* OTP Step */}
        {step === 'otp' && (
          <form onSubmit={handleOTPSubmit} className="provider-login-form">
            <div className="otp-intro">
              <p className="intro-text">
                We've sent a verification code to <strong>{email}</strong>
              </p>
              <p className="intro-hint">
                Enter the 6-digit code from your email to continue
              </p>
            </div>

            {/* OTP Input */}
            <div className="form-group">
              <label htmlFor="otp-code">Verification Code</label>
              <input
                id="otp-code"
                type="text"
                value={otpCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtpCode(val);
                  setError('');
                }}
                placeholder="000000"
                className="form-input otp-input"
                maxLength="6"
                disabled={loading}
                autoFocus
              />
              <div className="field-hint">6-digit code from email</div>
            </div>

            {/* OTP Buttons */}
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading || otpCode.length !== 6}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Verifying code...</span>
                </>
              ) : (
                <>
                  <span>Verify & Continue</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Resend OTP */}
            <div className="form-group text-center">
              <p className="resend-text">Didn't receive the code?</p>
              <button
                type="button"
                className="resend-btn"
                onClick={handleResendOTP}
                disabled={loading}
              >
                Resend verification code
              </button>
            </div>

            {/* Back Button */}
            <button
              type="button"
              className="btn btn-secondary btn-large"
              onClick={() => {
                setStep('credentials');
                setOtpCode('');
                setError('');
              }}
              disabled={loading}
            >
              Back to Email & Password
            </button>
          </form>
        )}

        {/* MFA Step */}
        {step === 'mfa' && (
          <form onSubmit={handleMFASubmit} className="provider-login-form">
            <div className="mfa-intro">
              <p className="intro-text">
                Two-Factor Authentication Enabled
              </p>
              <p className="intro-hint">
                Enter the code from your authenticator app (Google Authenticator, Microsoft Authenticator, Authy, etc.)
              </p>
            </div>

            {/* MFA Input */}
            <div className="form-group">
              <label htmlFor="mfa-code">Authentication Code</label>
              <input
                id="mfa-code"
                type="text"
                value={mfaCode}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setMfaCode(val);
                  setError('');
                }}
                placeholder="000000"
                className="form-input otp-input"
                maxLength="6"
                disabled={loading}
                autoFocus
              />
              <div className="field-hint">6-digit code from authenticator app</div>
            </div>

            {/* MFA Submit */}
            <button
              type="submit"
              className="btn btn-primary btn-large"
              disabled={loading || mfaCode.length < 6}
            >
              {loading ? (
                <>
                  <Loader size={18} className="animate-spin" />
                  <span>Verifying authentication...</span>
                </>
              ) : (
                <>
                  <span>Complete Login</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>

            {/* Back Button */}
            <button
              type="button"
              className="btn btn-secondary btn-large"
              onClick={() => {
                setStep('otp');
                setMfaCode('');
                setError('');
              }}
              disabled={loading}
            >
              Back to Verification Code
            </button>
          </form>
        )}

        {/* Footer - Sign Up Link */}
        <div className="provider-login-footer">
          <p>
            Don't have a provider account?{' '}
            <button className="link-btn" onClick={onNavigateToSignup}>
              Create one now
            </button>
          </p>
          <p className="security-note">
            🔒 Your data is protected with HIPAA-compliant encryption
          </p>
        </div>
      </div>

      {/* Security Info Sidebar */}
      <div className="provider-security-info">
        <h3>🔐 Security Features</h3>
        <ul className="security-features-list">
          <li>
            <div className="feature-icon">✓</div>
            <div className="feature-text">
              <strong>Email Verification</strong>
              <p>Confirm your identity via email</p>
            </div>
          </li>
          <li>
            <div className="feature-icon">✓</div>
            <div className="feature-text">
              <strong>Two-Factor Authentication</strong>
              <p>Additional security with authenticator app</p>
            </div>
          </li>
          <li>
            <div className="feature-icon">✓</div>
            <div className="feature-text">
              <strong>HIPAA Compliance</strong>
              <p>All data encrypted and secure</p>
            </div>
          </li>
          <li>
            <div className="feature-icon">✓</div>
            <div className="feature-text">
              <strong>Audit Logging</strong>
              <p>All access logged for compliance</p>
            </div>
          </li>
          <li>
            <div className="feature-icon">✓</div>
            <div className="feature-text">
              <strong>Session Management</strong>
              <p>Automatic timeout for security</p>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default ProviderLogin;
