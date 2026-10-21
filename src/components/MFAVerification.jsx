import React, { useState, useEffect } from 'react';
import { verifyOTP, verifyBackupCode } from '../utils/mfaHelper';
import { Loader2, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react';

/**
 * MFAVerification Component
 * OTP verification screen during login
 * Supports: OTP verification, backup code fallback, device trust
 */

const MFAVerification = ({
  userId,
  sessionId,
  method,
  onVerifySuccess,
  onVerifyFailed,
  onUseBackupCode,
  onResendOTP,
  onCancel
}) => {
  const [otp, setOTP] = useState('');
  const [backupCode, setBackupCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [maxAttempts] = useState(5);
  const [useBackupCode, setUseBackupCode] = useState(false);
  const [showBackupCode, setShowBackupCode] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setError('OTP expired. Please request a new one.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit code');
      return;
    }

    if (attempts >= maxAttempts) {
      setError('Too many attempts. Please try again later.');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const result = await verifyOTP(userId, sessionId, otp);

      if (result.verified) {
        setSuccess('✓ Verification successful!');
        setTimeout(() => {
          onVerifySuccess?.({
            method,
            otp,
            rememberDevice,
            verified: true
          });
        }, 500);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError(result.message);

        if (newAttempts >= maxAttempts) {
          setTimeout(() => {
            onVerifyFailed?.({
              reason: 'max_attempts',
              message: 'Maximum attempts exceeded. Please try again later.'
            });
          }, 1000);
        }
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyBackupCode = async (e) => {
    e.preventDefault();

    if (!backupCode) {
      setError('Please enter a backup code');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const result = await verifyBackupCode(userId, backupCode);

      if (result.valid) {
        setSuccess('✓ Backup code verified!');
        onUseBackupCode?.({
          backupCode,
          rememberDevice,
          verified: true
        });
      } else {
        setError(result.message || 'Invalid backup code');
      }
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setError('');
      setLoading(true);
      setOTP('');
      setAttempts(0);
      setTimeRemaining(300);
      await onResendOTP?.();
      setSuccess('New code sent!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '40px 20px',
        textAlign: 'center'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>
          {useBackupCode ? 'Enter Backup Code' : 'Verify Your Identity'}
        </h2>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '10px' }}>
          {useBackupCode
            ? 'Enter one of your backup codes to access your account'
            : `A 6-digit code has been sent to your ${method === 'sms' ? 'phone' : 'email'}`}
        </p>
        {timeRemaining > 0 && !useBackupCode && (
          <p style={{ color: timeRemaining < 60 ? '#dc3545' : '#666', fontSize: '13px' }}>
            Code expires in: <strong>{formatTime(timeRemaining)}</strong>
          </p>
        )}
      </div>

      {/* Error Alert */}
      {error && (
        <div
          style={{
            backgroundColor: '#f8d7da',
            border: '1px solid #f5c6cb',
            borderRadius: '4px',
            padding: '12px 15px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'flex-start'
          }}
        >
          <AlertCircle size={20} style={{ color: '#721c24', flexShrink: 0 }} />
          <span style={{ color: '#721c24', textAlign: 'left', fontSize: '14px' }}>{error}</span>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div
          style={{
            backgroundColor: '#d4edda',
            border: '1px solid #c3e6cb',
            borderRadius: '4px',
            padding: '12px 15px',
            marginBottom: '20px',
            display: 'flex',
            gap: '10px',
            alignItems: 'center'
          }}
        >
          <CheckCircle size={20} style={{ color: '#155724' }} />
          <span style={{ color: '#155724', fontSize: '14px' }}>{success}</span>
        </div>
      )}

      {/* OTP Verification Form */}
      {!useBackupCode && (
        <form onSubmit={handleVerifyOTP} style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="000000"
            value={otp}
            onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
            disabled={loading || attempts >= maxAttempts}
            maxLength="6"
            style={{
              width: '100%',
              padding: '15px',
              fontSize: '28px',
              letterSpacing: '12px',
              textAlign: 'center',
              border: `2px solid ${error ? '#dc3545' : '#ddd'}`,
              borderRadius: '4px',
              marginBottom: '15px',
              boxSizing: 'border-box',
              fontFamily: 'monospace',
              opacity: attempts >= maxAttempts ? 0.5 : 1
            }}
          />

          <div style={{ fontSize: '12px', color: '#666', marginBottom: '20px' }}>
            Attempt {attempts + 1} of {maxAttempts}
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6 || attempts >= maxAttempts}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor:
                loading || otp.length !== 6 || attempts >= maxAttempts
                  ? 'not-allowed'
                  : 'pointer',
              opacity:
                loading || otp.length !== 6 || attempts >= maxAttempts ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            Verify Code
          </button>
        </form>
      )}

      {/* Backup Code Form */}
      {useBackupCode && (
        <form onSubmit={handleVerifyBackupCode} style={{ marginBottom: '20px' }}>
          <div style={{ position: 'relative', marginBottom: '15px' }}>
            <input
              type={showBackupCode ? 'text' : 'password'}
              placeholder="XXXXXXXX"
              value={backupCode}
              onChange={(e) => setBackupCode(e.target.value.toUpperCase())}
              disabled={loading}
              maxLength="8"
              style={{
                width: '100%',
                padding: '15px 40px 15px 15px',
                fontSize: '18px',
                border: `2px solid ${error ? '#dc3545' : '#ddd'}`,
                borderRadius: '4px',
                boxSizing: 'border-box',
                fontFamily: 'monospace'
              }}
            />
            <button
              type="button"
              onClick={() => setShowBackupCode(!showBackupCode)}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '5px'
              }}
            >
              {showBackupCode ? (
                <EyeOff size={18} style={{ color: '#666' }} />
              ) : (
                <Eye size={18} style={{ color: '#666' }} />
              )}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading || !backupCode}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: loading || !backupCode ? 'not-allowed' : 'pointer',
              opacity: loading || !backupCode ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            Verify Backup Code
          </button>
        </form>
      )}

      {/* Device Trust Checkbox */}
      <div
        style={{
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px',
          textAlign: 'left'
        }}
      >
        <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '10px' }}>
          <input
            type="checkbox"
            checked={rememberDevice}
            onChange={(e) => setRememberDevice(e.target.checked)}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <span style={{ fontSize: '14px', color: '#333' }}>
            Trust this device for 30 days
          </span>
        </label>
        <p style={{ fontSize: '12px', color: '#666', marginTop: '8px', marginLeft: '28px' }}>
          You won't need to verify on this device for the next 30 days
        </p>
      </div>

      {/* Fallback Links */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
        {!useBackupCode && (
          <button
            onClick={() => setUseBackupCode(true)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 15px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#007bff',
              fontWeight: '500'
            }}
          >
            Use Backup Code Instead
          </button>
        )}

        {!useBackupCode && (
          <button
            onClick={handleResendOTP}
            disabled={loading}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 15px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '13px',
              color: '#007bff',
              fontWeight: '500',
              opacity: loading ? 0.6 : 1
            }}
          >
            Resend Code
          </button>
        )}

        {useBackupCode && (
          <button
            onClick={() => setUseBackupCode(false)}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid #ddd',
              borderRadius: '4px',
              padding: '10px 15px',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#007bff',
              fontWeight: '500'
            }}
          >
            Use Code Instead
          </button>
        )}
      </div>

      {/* Cancel Button */}
      <button
        onClick={onCancel}
        style={{
          width: '100%',
          padding: '12px',
          backgroundColor: '#6c757d',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: 'bold'
        }}
      >
        Cancel
      </button>
    </div>
  );
};

export default MFAVerification;
