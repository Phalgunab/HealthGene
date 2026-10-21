import React, { useState, useEffect } from 'react';
import { Smartphone, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import {
  isWebAuthnSupported,
  isPlatformAuthenticatorAvailable,
  createAssertionOptions,
  getAssertion,
  verifyCredentialAssertionResponse,
  base64urlEncode,
  getErrorMessage,
} from '../utils/webauthnHelper';

/**
 * BiometricAuth Component
 * Handles biometric login/authentication flow
 * Falls back to password if biometric fails or unavailable
 */
export default function BiometricAuth({
  userCredentials = [],
  onSuccess = () => {},
  onFallback = () => {},
  loading = false,
  disabled = false,
}) {
  const [authenticating, setAuthenticating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [attemptCount, setAttemptCount] = useState(0);
  const [supported, setSupported] = useState(false);
  const [available, setAvailable] = useState(false);
  const maxAttempts = 3;

  // Check WebAuthn support on mount
  useEffect(() => {
    const checkSupport = async () => {
      setSupported(isWebAuthnSupported());
      if (isWebAuthnSupported()) {
        const platformAvailable = await isPlatformAuthenticatorAvailable();
        setAvailable(platformAvailable && userCredentials.length > 0);
      }
    };
    checkSupport();
  }, [userCredentials.length]);

  const handleBiometricAuth = async (e) => {
    e?.preventDefault();
    
    if (!isWebAuthnSupported()) {
      setError('Biometric authentication is not supported in this browser');
      return;
    }

    if (!userCredentials || userCredentials.length === 0) {
      setError('No biometric credentials enrolled. Please set up biometric authentication first.');
      return;
    }

    setAuthenticating(true);
    setError('');
    setSuccess(false);

    try {
      // Create assertion options for authentication
      const options = createAssertionOptions({
        allowCredentials: userCredentials.map(cred => ({
          id: cred.idEncoded || cred.id,
          type: 'public-key',
          transports: cred.transports || ['internal'],
        })),
        timeout: 60000,
        userVerification: 'preferred',
      });

      // Store challenge in sessionStorage for server verification
      sessionStorage.setItem('webauthn_challenge', base64urlEncode(options.challenge));

      // Get assertion from device
      const assertion = await getAssertion(options);

      // Verify client-side
      verifyCredentialAssertionResponse(assertion, options.challenge);

      // Call success handler with assertion data
      onSuccess({
        credentialId: base64urlEncode(assertion.id),
        clientDataJSON: base64urlEncode(assertion.response.clientDataJSON),
        authenticatorData: base64urlEncode(assertion.response.authenticatorData),
        signature: base64urlEncode(assertion.response.signature),
        userHandle: assertion.response.userHandle ? base64urlEncode(assertion.response.userHandle) : null,
      });

      setSuccess(true);
      setAttemptCount(0);

      // Show success briefly then proceed
      setTimeout(() => {
        setAuthenticating(false);
      }, 1500);
    } catch (err) {
      const newAttemptCount = attemptCount + 1;
      setAttemptCount(newAttemptCount);

      const errorMessage = getErrorMessage(err);
      setError(errorMessage);

      // After max attempts, show fallback option
      if (newAttemptCount >= maxAttempts) {
        setTimeout(() => {
          onFallback?.();
        }, 2000);
      }

      setAuthenticating(false);
    }
  };

  // If not supported, don't show biometric option
  if (!supported) {
    return null;
  }

  // If no credentials enrolled, don't show biometric button
  if (!available || userCredentials.length === 0) {
    return null;
  }

  return (
    <div className="biometric-auth">
      <button
        type="button"
        className={`biometric-button ${authenticating ? 'authenticating' : ''} ${success ? 'success' : ''}`}
        onClick={handleBiometricAuth}
        disabled={authenticating || loading || disabled}
        aria-label="Sign in with biometric"
      >
        {authenticating ? (
          <>
            <Loader size={18} className="spinner" />
            <span>Touch sensor...</span>
          </>
        ) : success ? (
          <>
            <CheckCircle size={18} />
            <span>Authenticated!</span>
          </>
        ) : (
          <>
            <Smartphone size={18} />
            <span>Sign in with biometric</span>
          </>
        )}
      </button>

      {error && (
        <div className="biometric-error">
          <AlertCircle size={16} />
          <span>{error}</span>
          {attemptCount >= maxAttempts && (
            <small>Showing password option...</small>
          )}
        </div>
      )}

      <style jsx>{`
        .biometric-auth {
          display: flex;
          flex-direction: column;
          gap: 12px;
          width: 100%;
        }

        .biometric-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 20px;
          border: 2px solid #e0e0e0;
          border-radius: 12px;
          background: white;
          color: #333;
          font-size: 15px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        .biometric-button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #2563eb;
          color: #2563eb;
        }

        .biometric-button:active:not(:disabled) {
          transform: scale(0.98);
        }

        .biometric-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .biometric-button.authenticating {
          background: #dbeafe;
          border-color: #2563eb;
          color: #2563eb;
        }

        .biometric-button.success {
          background: #dcfce7;
          border-color: #22c55e;
          color: #22c55e;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .biometric-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 12px 16px;
          background: #fee2e2;
          border: 1px solid #fecaca;
          border-radius: 8px;
          color: #991b1b;
          font-size: 14px;
          line-height: 1.4;
        }

        .biometric-error svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .biometric-error small {
          display: block;
          width: 100%;
          margin-top: 4px;
          font-size: 12px;
          opacity: 0.8;
        }

        @media (max-width: 600px) {
          .biometric-button {
            padding: 12px 16px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}
