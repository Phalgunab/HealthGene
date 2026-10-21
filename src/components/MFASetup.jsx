import React, { useState } from 'react';
import { sendOTP, saveBackupCodes, generateBackupCodes } from '../utils/mfaHelper';
import { Loader2, AlertCircle, CheckCircle, Copy } from 'lucide-react';

/**
 * MFASetup Component
 * 5-step wizard for setting up MFA
 * Step 1: Welcome & explanation
 * Step 2: Choose method (SMS or Email)
 * Step 3: Enter contact details
 * Step 4: Verify OTP
 * Step 5: Display backup codes
 */

const MFASetup = ({ userId, userName, userEmail, onComplete, onCancel, onError }) => {
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState('sms');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState(userEmail || '');
  const [otp, setOTP] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [backupCodes, setBackupCodes] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleNext = async () => {
    try {
      setError('');
      setLoading(true);

      if (step === 2) {
        // Validate and send OTP
        const contact = method === 'sms' ? phoneNumber : email;
        if (!contact) {
          setError(`Please enter your ${method === 'sms' ? 'phone number' : 'email'}`);
          setLoading(false);
          return;
        }

        const result = await sendOTP(userId, method, contact);
        setSessionId(result.sessionId);
        setOTP('');
      } else if (step === 4) {
        // Generate and save backup codes
        const codes = generateBackupCodes();
        await saveBackupCodes(userId, codes);
        setBackupCodes(codes);
      }

      setStep(step + 1);
    } catch (err) {
      setError(err.message || 'An error occurred');
      if (onError) onError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setStep(step - 1);
    setError('');
  };

  const handleFinish = async () => {
    try {
      setLoading(true);
      await onComplete?.({
        method,
        contact: method === 'sms' ? phoneNumber : email,
        backupCodes,
        timestamp: new Date()
      });
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    const codes = backupCodes.join('\n');
    navigator.clipboard.writeText(codes);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const steps_content = [
    // Step 0: Welcome
    <div key="step0" style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Add Two-Factor Authentication</h2>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'left',
        backgroundColor: '#f0f7ff',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <p style={{ marginBottom: '10px' }}>
          <strong>Two-Factor Authentication (2FA)</strong> adds an extra layer of security to your account.
        </p>
        <ul style={{ marginLeft: '20px' }}>
          <li>You'll receive a code via SMS or email</li>
          <li>Enter the code when you log in</li>
          <li>You'll get backup codes for account recovery</li>
        </ul>
      </div>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        This usually takes about 2 minutes to set up.
      </p>
    </div>,

    // Step 1: Choose method
    <div key="step1" style={{ padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center', color: '#333' }}>Choose Verification Method</h2>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
      }}>
        <div
          onClick={() => setMethod('sms')}
          style={{
            padding: '20px',
            border: method === 'sms' ? '2px solid #007bff' : '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: method === 'sms' ? '#f0f7ff' : '#fff',
            transition: 'all 0.3s ease'
          }}
        >
          <input type="radio" checked={method === 'sms'} readOnly />
          <label style={{ marginLeft: '10px', cursor: 'pointer', fontWeight: method === 'sms' ? 'bold' : 'normal' }}>
            Text Message (SMS)
          </label>
          <p style={{ color: '#666', marginTop: '5px' }}>We'll send a code to your phone</p>
        </div>

        <div
          onClick={() => setMethod('email')}
          style={{
            padding: '20px',
            border: method === 'email' ? '2px solid #007bff' : '2px solid #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            backgroundColor: method === 'email' ? '#f0f7ff' : '#fff',
            transition: 'all 0.3s ease'
          }}
        >
          <input type="radio" checked={method === 'email'} readOnly />
          <label style={{ marginLeft: '10px', cursor: 'pointer', fontWeight: method === 'email' ? 'bold' : 'normal' }}>
            Email
          </label>
          <p style={{ color: '#666', marginTop: '5px' }}>We'll send a code to your email</p>
        </div>
      </div>
    </div>,

    // Step 2: Enter contact details
    <div key="step2" style={{ padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center', color: '#333' }}>
        Enter Your {method === 'sms' ? 'Phone Number' : 'Email'}
      </h2>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <input
          type={method === 'sms' ? 'tel' : 'email'}
          placeholder={method === 'sms' ? '+1 (555) 123-4567' : 'your.email@example.com'}
          value={method === 'sms' ? phoneNumber : email}
          onChange={(e) => method === 'sms' ? setPhoneNumber(e.target.value) : setEmail(e.target.value)}
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '20px',
            boxSizing: 'border-box'
          }}
        />
        <p style={{ color: '#666', fontSize: '14px' }}>
          {method === 'sms' 
            ? 'Include your country code (e.g., +1 for USA)'
            : 'We\'ll send the verification code to this email address'
          }
        </p>
      </div>
    </div>,

    // Step 3: Verify OTP
    <div key="step3" style={{ padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '30px', textAlign: 'center', color: '#333' }}>Verify Your {method === 'sms' ? 'Phone' : 'Email'}</h2>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <p style={{ marginBottom: '20px', color: '#666' }}>
          We've sent a 6-digit code to your {method === 'sms' ? 'phone' : 'email'}. Enter it below to verify.
        </p>
        <input
          type="text"
          placeholder="000000"
          value={otp}
          onChange={(e) => setOTP(e.target.value.replace(/\D/g, '').slice(0, 6))}
          maxLength="6"
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '20px',
            letterSpacing: '8px',
            textAlign: 'center',
            border: '1px solid #ddd',
            borderRadius: '4px',
            marginBottom: '20px',
            boxSizing: 'border-box',
            fontFamily: 'monospace'
          }}
        />
        <p style={{ color: '#999', fontSize: '12px', textAlign: 'center' }}>
          Didn't receive the code? Check your spam folder or request a new one.
        </p>
      </div>
    </div>,

    // Step 4: Backup codes
    <div key="step4" style={{ padding: '40px 20px' }}>
      <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#333' }}>Save Your Backup Codes</h2>
      <div style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div style={{
          backgroundColor: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px'
        }}>
          <strong>⚠️ Important:</strong> Save these codes in a safe place. You'll need them if you lose access to your phone or email.
        </div>

        <div style={{
          backgroundColor: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '4px',
          padding: '20px',
          marginBottom: '20px',
          fontFamily: 'monospace',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all'
        }}>
          {backupCodes.map((code, idx) => (
            <div key={idx} style={{ marginBottom: '10px' }}>
              {code}
            </div>
          ))}
        </div>

        <button
          onClick={copyToClipboard}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: copied ? '#28a745' : '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
            transition: 'all 0.3s ease'
          }}
        >
          {copied ? '✓ Copied to Clipboard' : 'Copy Codes'}
        </button>
      </div>
    </div>,

    // Step 5: Success
    <div key="step5" style={{ padding: '40px 20px', textAlign: 'center' }}>
      <CheckCircle size={64} style={{ color: '#28a745', marginBottom: '20px' }} />
      <h2 style={{ marginBottom: '20px', color: '#333' }}>Two-Factor Authentication Enabled!</h2>
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        textAlign: 'left',
        backgroundColor: '#d4edda',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <p style={{ marginBottom: '10px' }}>✓ Your account is now protected with 2FA</p>
        <p style={{ marginBottom: '10px' }}>✓ You'll need to verify with {method === 'sms' ? 'SMS' : 'email'} on next login</p>
        <p>✓ Keep your backup codes safe for account recovery</p>
      </div>
    </div>
  ];

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      {/* Error Alert */}
      {error && (
        <div style={{
          backgroundColor: '#f8d7da',
          border: '1px solid #f5c6cb',
          borderRadius: '4px',
          padding: '12px',
          marginBottom: '20px',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
          margin: '20px'
        }}>
          <AlertCircle size={20} style={{ color: '#721c24', flexShrink: 0 }} />
          <span style={{ color: '#721c24' }}>{error}</span>
        </div>
      )}

      {/* Steps Indicator */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        padding: '20px',
        borderBottom: '1px solid #eee'
      }}>
        {['Welcome', 'Method', 'Contact', 'Verify', 'Backup Codes', 'Success'].map((label, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: '12px',
              color: step >= idx ? '#007bff' : '#999'
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                backgroundColor: step >= idx ? '#007bff' : '#ddd',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 'bold',
                marginRight: '8px'
              }}
            >
              {step > idx ? '✓' : idx + 1}
            </div>
            <span style={{ display: 'none' }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Step Content */}
      {steps_content[step]}

      {/* Error for testing OTP */}
      {step === 3 && (
        <div style={{
          maxWidth: '500px',
          margin: '0 auto',
          padding: '0 20px',
          backgroundColor: '#f0f7ff',
          border: '1px solid #b3d9ff',
          borderRadius: '4px',
          padding: '10px',
          marginBottom: '20px',
          fontSize: '12px',
          color: '#004085'
        }}>
          💡 For testing, you can enter any 6-digit code (the OTP was printed to console for dev)
        </div>
      )}

      {/* Navigation Buttons */}
      <div style={{
        display: 'flex',
        gap: '10px',
        padding: '20px',
        borderTop: '1px solid #eee',
        justifyContent: step === 0 ? 'flex-end' : 'space-between'
      }}>
        {step > 0 && step < 5 && (
          <button
            onClick={handleBack}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            Back
          </button>
        )}

        {step === 0 && (
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              backgroundColor: '#6c757d',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        )}

        {step < 5 && (
          <button
            onClick={handleNext}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
            {step === 4 ? 'Generate Codes' : 'Next'}
          </button>
        )}

        {step === 5 && (
          <button
            onClick={handleFinish}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.6 : 1
            }}
          >
            {loading ? 'Finishing...' : 'Done'}
          </button>
        )}
      </div>
    </div>
  );
};

export default MFASetup;
