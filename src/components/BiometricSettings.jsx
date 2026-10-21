import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Smartphone, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { isPlatformAuthenticatorAvailable } from '../utils/webauthnHelper';
import BiometricEnroll from './BiometricEnroll';

/**
 * BiometricSettings Component
 * Manage enrolled biometric credentials
 */
export default function BiometricSettings({
  userId,
  userName,
  userDisplayName,
  credentials = [],
  onAddCredential = () => {},
  onDeleteCredential = () => {},
  disabled = false,
}) {
  const [showEnroll, setShowEnroll] = useState(false);
  const [available, setAvailable] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    const checkAvailable = async () => {
      const platformAvailable = await isPlatformAuthenticatorAvailable();
      setAvailable(platformAvailable);
    };
    checkAvailable();
  }, []);

  const handleDeleteCredential = async (credentialId) => {
    if (!window.confirm('Remove this biometric credential? You can enroll it again later.')) {
      return;
    }

    setDeleting(credentialId);
    try {
      await onDeleteCredential(credentialId);
      setDeleting(null);
    } catch (error) {
      console.error('Error deleting credential:', error);
      setDeleting(null);
    }
  };

  const handleEnrollComplete = async (data) => {
    setEnrolling(true);
    try {
      await onAddCredential(data);
      setShowEnroll(false);
      setEnrolling(false);
    } catch (error) {
      console.error('Error saving credential:', error);
      setEnrolling(false);
    }
  };

  if (showEnroll) {
    return (
      <BiometricEnroll
        userId={userId}
        userName={userName}
        userDisplayName={userDisplayName}
        onComplete={handleEnrollComplete}
        onCancel={() => setShowEnroll(false)}
        onError={(error) => console.error('Enrollment error:', error)}
      />
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const formatCredentialType = (type) => {
    const types = {
      fingerprint: { emoji: '👆', label: 'Fingerprint' },
      face: { emoji: '👤', label: 'Face ID' },
      platform: { emoji: '📱', label: 'Device' },
    };
    return types[type] || types.platform;
  };

  return (
    <div className="biometric-settings">
      <div className="settings-header">
        <div>
          <h3>Biometric Authentication</h3>
          <p>Manage your fingerprint and face ID credentials</p>
        </div>
        {available && (
          <button
            className="btn-add-credential"
            onClick={() => setShowEnroll(true)}
            disabled={disabled || enrolling}
            aria-label="Add biometric credential"
          >
            <Plus size={18} />
            <span>Add credential</span>
          </button>
        )}
      </div>

      {!available && (
        <div className="alert-box">
          <AlertCircle size={18} />
          <div>
            <strong>Not available</strong>
            <p>Your device does not support biometric authentication</p>
          </div>
        </div>
      )}

      {credentials && credentials.length > 0 ? (
        <div className="credentials-list">
          {credentials.map((credential) => {
            const typeInfo = formatCredentialType(credential.type);
            return (
              <div key={credential.id} className="credential-card">
                <div className="credential-header">
                  <div className="credential-icon">{typeInfo.emoji}</div>
                  <div className="credential-info">
                    <h4>{credential.name || typeInfo.label}</h4>
                    <small>
                      Added {formatDate(credential.created)} • Used {formatDate(credential.lastUsed)}
                    </small>
                  </div>
                  <button
                    className="btn-delete"
                    onClick={() => handleDeleteCredential(credential.id)}
                    disabled={deleting === credential.id || disabled}
                    aria-label={`Delete ${credential.name}`}
                    title="Remove this credential"
                  >
                    {deleting === credential.id ? (
                      <Loader size={18} className="spinner" />
                    ) : (
                      <Trash2 size={18} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-state">
          <Smartphone size={40} />
          <h4>No biometric credentials</h4>
          <p>Add a fingerprint or face ID credential to sign in faster</p>
          {available && (
            <button
              className="btn-primary"
              onClick={() => setShowEnroll(true)}
              disabled={disabled || enrolling}
            >
              <Plus size={16} />
              Add your first credential
            </button>
          )}
        </div>
      )}

      <style jsx>{`
        .biometric-settings {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .settings-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
        }

        .settings-header h3 {
          margin: 0 0 4px 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .settings-header p {
          margin: 0;
          font-size: 13px;
          color: #666;
        }

        .btn-add-credential {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .btn-add-credential:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-add-credential:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .alert-box {
          display: flex;
          gap: 12px;
          padding: 12px 16px;
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 8px;
          color: #92400e;
        }

        .alert-box svg {
          flex-shrink: 0;
          margin-top: 2px;
        }

        .alert-box strong {
          display: block;
          margin-bottom: 2px;
        }

        .alert-box p {
          margin: 0;
          font-size: 13px;
        }

        .credentials-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .credential-card {
          padding: 12px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          background: white;
          transition: all 0.2s;
        }

        .credential-card:hover {
          border-color: #d1d5db;
          background: #f9fafb;
        }

        .credential-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .credential-icon {
          font-size: 24px;
          flex-shrink: 0;
        }

        .credential-info {
          flex: 1;
          min-width: 0;
        }

        .credential-info h4 {
          margin: 0 0 2px 0;
          font-size: 14px;
          font-weight: 500;
          color: #1f2937;
          word-break: break-word;
        }

        .credential-info small {
          display: block;
          font-size: 12px;
          color: #999;
          word-break: break-word;
        }

        .btn-delete {
          background: none;
          border: none;
          color: #ef4444;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .btn-delete:hover:not(:disabled) {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .empty-state {
          text-align: center;
          padding: 32px 20px;
          color: #666;
        }

        .empty-state svg {
          color: #d1d5db;
          margin-bottom: 12px;
        }

        .empty-state h4 {
          margin: 0 0 4px 0;
          font-size: 15px;
          font-weight: 600;
          color: #1f2937;
        }

        .empty-state p {
          margin: 0 0 16px 0;
          font-size: 13px;
          color: #666;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #1d4ed8;
        }

        .btn-primary:disabled {
          background: #e5e7eb;
          color: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .settings-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-add-credential {
            width: 100%;
            justify-content: center;
          }

          .credential-card {
            flex-direction: column;
            gap: 8px;
          }

          .credential-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .btn-delete {
            align-self: flex-start;
            margin-left: 28px;
          }
        }
      `}</style>
    </div>
  );
}
