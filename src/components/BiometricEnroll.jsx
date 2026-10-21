import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Smartphone, Fingerprint, Copy, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  createCredentialOptions,
  createCredential,
  verifyCredentialCreationResponse,
  base64urlEncode,
  credentialToStorageFormat,
  getErrorMessage,
} from '../utils/webauthnHelper';

/**
 * BiometricEnroll Component
 * Step-by-step wizard for enrolling biometric credentials
 */
export default function BiometricEnroll({
  userId,
  userName,
  userDisplayName,
  onComplete = () => {},
  onCancel = () => {},
  onError = () => {},
}) {
  const [step, setStep] = useState(1); // 1: Explain, 2: Select type, 3: Enroll, 4: Name, 5: Success
  const [credentialType, setCredentialType] = useState('fingerprint');
  const [credentialName, setCredentialName] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [createdCredential, setCreatedCredential] = useState(null);
  const [supported, setSupported] = useState(false);
  const [available, setAvailable] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Check WebAuthn support on mount
  useEffect(() => {
    const checkSupport = async () => {
      const isSupported = isWebAuthnSupported();
      setSupported(isSupported);

      if (isSupported) {
        const platformAvailable = await isPlatformAuthenticatorAvailable();
        setAvailable(platformAvailable);

        if (!platformAvailable) {
          setError('Your device does not support biometric authentication. Please use a device with fingerprint or face recognition.');
        }
      } else {
        setError('Biometric authentication is not supported in this browser. Please use Chrome, Edge, Safari, or Firefox.');
      }
    };

    checkSupport();
  }, []);

  const handleEnroll = async () => {
    if (!supported || !available) {
      return;
    }

    setEnrolling(true);
    setError('');

    try {
      // Create credential options
      const options = createCredentialOptions({
        userId: userId || `user_${Date.now()}`,
        userName: userName || 'user@example.com',
        userDisplayName: userDisplayName || 'User',
        attestation: 'none',
        timeout: 60000,
      });

      // Store challenge for verification
      sessionStorage.setItem('webauthn_challenge', base64urlEncode(options.challenge));

      // Create credential
      const credential = await createCredential(options);

      // Verify response
      verifyCredentialCreationResponse(credential, options.challenge);

      // Convert to storage format
      const storageFormat = credentialToStorageFormat(credential, credentialName || `${credentialType} credential`);

      setCreatedCredential(storageFormat);
      setStep(4); // Go to naming step
      setEnrolling(false);
    } catch (err) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
      onError?.(err);
      setEnrolling(false);
    }
  };

  const handleComplete = async () => {
    if (!createdCredential) {
      return;
    }

    try {
      // Call completion handler with credential data
      await onComplete({
        credential: createdCredential,
        type: credentialType,
        name: credentialName || `${credentialType} credential`,
      });

      setSuccess(true);
      setStep(5);

      // Auto-close after 2 seconds
      setTimeout(() => {
        onCancel?.();
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err));
      onError?.(err);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Step 1: Explain benefits
  if (step === 1) {
    return (
      <div className="biometric-enroll">
        <div className="enroll-header">
          <button className="back-btn" onClick={onCancel} aria-label="Cancel">
            <ArrowLeft size={20} />
          </button>
          <h2>Biometric Authentication</h2>
          <div style={{ width: 20 }} /> {/* Spacer for alignment */}
        </div>

        <div className="enroll-content">
          <div className="enroll-icon">
            <Smartphone size={48} />
          </div>

          <h3>Sign in faster & securely</h3>
          <p>Use your fingerprint or face to quickly access your health records without entering a password.</p>

          <div className="benefits">
            <div className="benefit-item">
              <CheckCircle size={20} />
              <div>
                <strong>Fast & Easy</strong>
                <p>One touch or glance to sign in</p>
              </div>
            </div>
            <div className="benefit-item">
              <CheckCircle size={20} />
              <div>
                <strong>More Secure</strong>
                <p>Your biometric data never leaves your device</p>
              </div>
            </div>
            <div className="benefit-item">
              <CheckCircle size={20} />
              <div>
                <strong>Privacy First</strong>
                <p>We only store a mathematical key, not your fingerprint</p>
              </div>
            </div>
          </div>

          {!supported && (
            <div className="error-box">
              <AlertCircle size={20} />
              <p>Biometric authentication is not supported in this browser</p>
            </div>
          )}

          {supported && !available && (
            <div className="error-box">
              <AlertCircle size={20} />
              <p>Your device does not support biometric authentication</p>
            </div>
          )}

          <div className="enroll-actions">
            <button className="btn-secondary" onClick={onCancel}>
              Maybe later
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setStep(2)}
              disabled={!supported || !available}
            >
              Set up biometric <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <style jsx>{`
          .biometric-enroll {
            display: flex;
            flex-direction: column;
            height: 100%;
            background: white;
            border-radius: 16px;
            overflow: hidden;
          }

          .enroll-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 16px 20px;
            border-bottom: 1px solid #e5e7eb;
            gap: 12px;
          }

          .back-btn {
            background: none;
            border: none;
            cursor: pointer;
            padding: 4px;
            color: #666;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 6px;
            transition: background 0.2s;
          }

          .back-btn:hover {
            background: #f3f4f6;
          }

          .enroll-header h2 {
            flex: 1;
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
          }

          .enroll-content {
            flex: 1;
            overflow-y: auto;
            padding: 32px 20px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .enroll-icon {
            text-align: center;
            color: #2563eb;
            margin-bottom: 8px;
          }

          h3 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
            text-align: center;
            color: #1f2937;
          }

          .enroll-content > p {
            margin: 0;
            font-size: 15px;
            color: #666;
            text-align: center;
            line-height: 1.5;
          }

          .benefits {
            display: flex;
            flex-direction: column;
            gap: 12px;
          }

          .benefit-item {
            display: flex;
            gap: 12px;
            align-items: flex-start;
          }

          .benefit-item svg {
            flex-shrink: 0;
            color: #22c55e;
            margin-top: 2px;
          }

          .benefit-item strong {
            display: block;
            margin-bottom: 2px;
            color: #1f2937;
          }

          .benefit-item p {
            margin: 0;
            font-size: 13px;
            color: #666;
          }

          .error-box {
            display: flex;
            gap: 12px;
            padding: 12px 16px;
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            color: #991b1b;
          }

          .error-box svg {
            flex-shrink: 0;
          }

          .error-box p {
            margin: 0;
            font-size: 14px;
          }

          .enroll-actions {
            display: flex;
            gap: 12px;
            margin-top: auto;
          }

          .btn-primary, .btn-secondary {
            flex: 1;
            padding: 12px 16px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
            font-family: inherit;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }

          .btn-primary {
            background: #2563eb;
            color: white;
          }

          .btn-primary:hover:not(:disabled) {
            background: #1d4ed8;
          }

          .btn-primary:disabled {
            background: #e5e7eb;
            color: #9ca3af;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: white;
            color: #666;
            border: 1px solid #e5e7eb;
          }

          .btn-secondary:hover {
            background: #f9fafb;
          }

          @media (max-width: 600px) {
            .enroll-content {
              padding: 24px 16px;
              gap: 20px;
            }

            h3 {
              font-size: 20px;
            }
          }
        `}</style>
      </div>
    );
  }

  // Step 2: Select credential type
  if (step === 2) {
    return (
      <div className="biometric-enroll">
        <div className="enroll-header">
          <button className="back-btn" onClick={() => setStep(1)} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <h2>Which will you use?</h2>
          <div style={{ width: 20 }} />
        </div>

        <div className="enroll-content">
          <p style={{ textAlign: 'center', color: '#666', fontSize: 14 }}>
            Choose the biometric method your device supports best
          </p>

          <div className="type-options">
            <button
              className={`type-option ${credentialType === 'fingerprint' ? 'selected' : ''}`}
              onClick={() => setCredentialType('fingerprint')}
            >
              <div className="type-icon">👆</div>
              <h4>Fingerprint</h4>
              <p>Scan your fingerprint</p>
            </button>

            <button
              className={`type-option ${credentialType === 'face' ? 'selected' : ''}`}
              onClick={() => setCredentialType('face')}
            >
              <div className="type-icon">👤</div>
              <h4>Face ID</h4>
              <p>Scan your face</p>
            </button>
          </div>

          <div className="enroll-actions">
            <button className="btn-secondary" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn-primary" onClick={() => setStep(3)}>
              Continue <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <style jsx>{`
          .type-options {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .type-option {
            padding: 20px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 12px;
            background: white;
            cursor: pointer;
            transition: all 0.2s;
            text-align: center;
            font-family: inherit;
          }

          .type-option:hover {
            border-color: #2563eb;
            background: #f0f9ff;
          }

          .type-option.selected {
            border-color: #2563eb;
            background: #dbeafe;
          }

          .type-icon {
            font-size: 32px;
            margin-bottom: 8px;
          }

          .type-option h4 {
            margin: 0 0 4px 0;
            font-size: 14px;
            font-weight: 600;
            color: #1f2937;
          }

          .type-option p {
            margin: 0;
            font-size: 12px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  // Step 3: Enroll credential
  if (step === 3) {
    return (
      <div className="biometric-enroll">
        <div className="enroll-header">
          <button className="back-btn" onClick={() => setStep(2)} disabled={enrolling} aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <h2>Add {credentialType}</h2>
          <div style={{ width: 20 }} />
        </div>

        <div className="enroll-content">
          {!enrolling && !error && (
            <>
              <div className="enroll-icon">
                {credentialType === 'fingerprint' ? (
                  <Fingerprint size={48} />
                ) : (
                  <span style={{ fontSize: 48 }}>👤</span>
                )}
              </div>

              <h3>Ready to enroll</h3>
              <p>
                {credentialType === 'fingerprint'
                  ? 'Place your finger on the sensor when prompted'
                  : 'Look at your device camera when prompted'}
              </p>

              <div className="enroll-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  Back
                </button>
                <button 
                  className="btn-primary" 
                  onClick={handleEnroll}
                  disabled={enrolling}
                >
                  Start enrollment
                </button>
              </div>
            </>
          )}

          {enrolling && (
            <>
              <div className="enroll-icon loading">
                <Loader size={48} />
              </div>
              <h3>Enrolling {credentialType}...</h3>
              <p>Follow the prompts on your device</p>
            </>
          )}

          {error && (
            <>
              <div className="error-box" style={{ marginTop: 24 }}>
                <AlertCircle size={20} />
                <div>
                  <strong>Enrollment failed</strong>
                  <p>{error}</p>
                </div>
              </div>

              <div className="enroll-actions">
                <button className="btn-secondary" onClick={() => setStep(2)}>
                  Back
                </button>
                <button className="btn-primary" onClick={handleEnroll}>
                  Try again
                </button>
              </div>
            </>
          )}
        </div>

        <style jsx>{`
          .enroll-icon.loading {
            animation: spin 2s linear infinite;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }

          .error-box {
            display: flex;
            gap: 12px;
            padding: 12px 16px;
            background: #fee2e2;
            border: 1px solid #fecaca;
            border-radius: 8px;
            color: #991b1b;
          }

          .error-box strong {
            display: block;
            margin-bottom: 4px;
          }

          .error-box p {
            margin: 0;
            font-size: 13px;
          }
        `}</style>
      </div>
    );
  }

  // Step 4: Name credential
  if (step === 4) {
    const defaultName = `My ${credentialType}`;
    
    return (
      <div className="biometric-enroll">
        <div className="enroll-header">
          <button className="back-btn" disabled aria-label="Back">
            <ArrowLeft size={20} />
          </button>
          <h2>Name this credential</h2>
          <div style={{ width: 20 }} />
        </div>

        <div className="enroll-content">
          <div className="enroll-icon" style={{ color: '#22c55e' }}>
            <CheckCircle size={48} />
          </div>

          <h3>Successfully enrolled!</h3>
          <p>Give this credential a name to remember it</p>

          <div className="name-input-group">
            <input
              type="text"
              placeholder={defaultName}
              value={credentialName}
              onChange={(e) => setCredentialName(e.target.value)}
              className="name-input"
              maxLength={30}
            />
            <small>{credentialName.length}/30 characters</small>
          </div>

          <div className="enroll-actions">
            <button className="btn-secondary" onClick={() => setStep(3)}>
              Back
            </button>
            <button 
              className="btn-primary" 
              onClick={handleComplete}
            >
              Complete setup
            </button>
          </div>
        </div>

        <style jsx>{`
          .name-input-group {
            display: flex;
            flex-direction: column;
            gap: 4px;
          }

          .name-input {
            padding: 12px 16px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            font-family: inherit;
            transition: border 0.2s;
          }

          .name-input:focus {
            outline: none;
            border-color: #2563eb;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          .name-input-group small {
            font-size: 12px;
            color: #9ca3af;
          }
        `}</style>
      </div>
    );
  }

  // Step 5: Success
  if (step === 5) {
    return (
      <div className="biometric-enroll">
        <div className="enroll-content" style={{ alignItems: 'center', justifyContent: 'center' }}>
          <div className="enroll-icon" style={{ color: '#22c55e' }}>
            <CheckCircle size={56} />
          </div>
          <h3>All set!</h3>
          <p>You can now sign in with your {credentialType}</p>
        </div>
      </div>
    );
  }

  return null;
}
