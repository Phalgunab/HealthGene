/**
 * Provider Details Modal Component
 * Shows comprehensive provider information for admin verification
 */

import React, { useState } from 'react';
import {
  X, Mail, Phone, Building2, Award, Calendar, CheckCircle, AlertCircle, MapPin
} from 'lucide-react';

const ProviderDetailsModal = ({ provider, onClose, onApprove, onReject }) => {
  const [action, setAction] = useState(null); // 'approve', 'reject', null
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleApprove = async () => {
    if (!notes.trim()) {
      setError('Please provide approval notes');
      return;
    }

    setLoading(true);
    try {
      await onApprove(provider.uid, notes);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!notes.trim()) {
      setError('Please provide a rejection reason');
      return;
    }

    setLoading(true);
    try {
      await onReject(provider.uid, notes);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal provider-details-modal" onClick={e => e.stopPropagation()}>
        {/* Close Button */}
        <button className="modal-close-btn" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">Provider Details</h2>
          <p className="modal-subtitle">Review provider credentials for verification</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="alert alert-error" role="alert">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Content */}
        <div className="modal-content provider-details-content">
          {/* Status */}
          <div className="detail-section">
            <h3 className="section-title">Status</h3>
            <div className="detail-row">
              <span className={`provider-status ${provider.status}`}>
                {provider.status?.replace(/_/g, ' ').toUpperCase()}
              </span>
            </div>
          </div>

          {/* Personal Information */}
          <div className="detail-section">
            <h3 className="section-title">Personal Information</h3>
            
            <div className="detail-row">
              <span className="detail-label">Full Name</span>
              <span className="detail-value">{provider.fullName}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <Mail size={14} /> Email
              </span>
              <span className="detail-value">{provider.email}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <Phone size={14} /> Phone
              </span>
              <span className="detail-value">{provider.phone || 'Not provided'}</span>
            </div>
          </div>

          {/* Professional Information */}
          <div className="detail-section">
            <h3 className="section-title">Professional Information</h3>

            <div className="detail-row">
              <span className="detail-label">
                <Award size={14} /> Specialization
              </span>
              <span className="detail-value">{provider.specialization || 'Not specified'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <Award size={14} /> License Number
              </span>
              <span className="detail-value">{provider.licenseNumber || 'Not provided'}</span>
            </div>

            <div className="detail-row">
              <span className="detail-label">
                <Building2 size={14} /> Hospital/Clinic
              </span>
              <span className="detail-value">{provider.hospitalName || 'Not specified'}</span>
            </div>
          </div>

          {/* Verification Timeline */}
          <div className="detail-section">
            <h3 className="section-title">Timeline</h3>

            <div className="detail-row">
              <span className="detail-label">
                <Calendar size={14} /> Registered
              </span>
              <span className="detail-value">{formatDate(provider.createdAt)}</span>
            </div>

            {provider.verifiedAt && (
              <div className="detail-row">
                <span className="detail-label">
                  <CheckCircle size={14} /> Verified
                </span>
                <span className="detail-value">{formatDate(provider.verifiedAt)}</span>
              </div>
            )}

            {provider.verificationNotes && (
              <div className="detail-row">
                <span className="detail-label">Verification Notes</span>
                <span className="detail-value">{provider.verificationNotes}</span>
              </div>
            )}

            {provider.rejectionReason && (
              <div className="detail-row">
                <span className="detail-label">Rejection Reason</span>
                <span className="detail-value rejection">{provider.rejectionReason}</span>
              </div>
            )}
          </div>

          {/* Policies */}
          <div className="detail-section">
            <h3 className="section-title">Compliance</h3>
            <div className="detail-row">
              <span className="detail-label">Privacy Policy Accepted</span>
              <span className="detail-value">
                {provider.policiesAccepted ? (
                  <span style={{ color: '#4caf50' }}>✓ Yes</span>
                ) : (
                  <span style={{ color: '#f44336' }}>✗ No</span>
                )}
              </span>
            </div>
            {provider.acceptedAt && (
              <div className="detail-row">
                <span className="detail-label">Accepted At</span>
                <span className="detail-value">{formatDate(provider.acceptedAt)}</span>
              </div>
            )}
          </div>

          {/* Action Section */}
          {provider.status === 'pending_verification' && (
            <div className="detail-section action-section">
              <h3 className="section-title">Verification Action</h3>

              <div className="modal-form-group">
                <label className="modal-label">Action</label>
                <div className="action-selector">
                  <button
                    className={`action-option ${action === 'approve' ? 'active approve' : ''}`}
                    onClick={() => {
                      setAction('approve');
                      setError('');
                    }}
                  >
                    <CheckCircle size={16} />
                    Approve
                  </button>
                  <button
                    className={`action-option ${action === 'reject' ? 'active reject' : ''}`}
                    onClick={() => {
                      setAction('reject');
                      setError('');
                    }}
                  >
                    <AlertCircle size={16} />
                    Reject
                  </button>
                </div>
              </div>

              {action && (
                <div className="modal-form-group">
                  <label className="modal-label">
                    {action === 'approve' ? 'Approval Notes' : 'Rejection Reason'}
                  </label>
                  <textarea
                    className="modal-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={
                      action === 'approve'
                        ? 'Enter approval notes (e.g., verified credentials, checked license)'
                        : 'Enter rejection reason (e.g., invalid license, incomplete documentation)'
                    }
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="modal-actions">
          <button className="modal-btn" onClick={onClose} disabled={loading}>
            Close
          </button>

          {provider.status === 'pending_verification' && action && (
            <>
              <button
                className="modal-btn primary"
                onClick={() => (action === 'approve' ? handleApprove() : handleReject())}
                disabled={loading || !notes.trim()}
              >
                {loading ? 'Processing...' : action === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .modal-close-btn {
          position: absolute;
          top: 16px;
          right: 16px;
          background: none;
          border: none;
          cursor: pointer;
          color: #999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
        }

        .modal-close-btn:hover {
          background: #f5f7fa;
          color: #333;
        }

        .provider-details-content {
          max-height: 60vh;
          overflow-y: auto;
        }

        .detail-section {
          margin-bottom: 20px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e9ecef;
        }

        .detail-section:last-child {
          border-bottom: none;
        }

        .section-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
          color: #1b5e20;
          margin: 0 0 12px 0;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
          font-size: 13px;
        }

        .detail-label {
          font-weight: 600;
          color: #666;
          display: flex;
          align-items: center;
          gap: 6px;
          min-width: 120px;
        }

        .detail-value {
          color: #333;
          text-align: right;
          flex: 1;
          word-break: break-word;
        }

        .detail-value.rejection {
          color: #f44336;
          font-weight: 500;
        }

        .action-section {
          background: rgba(27, 94, 32, 0.02);
          padding: 16px;
          border-radius: 8px;
          border: 1px solid rgba(27, 94, 32, 0.1);
          margin-bottom: 0;
          border-bottom: none;
          padding-bottom: 0;
        }

        .action-selector {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .action-option {
          padding: 12px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: all 0.2s ease;
          color: #666;
        }

        .action-option:hover {
          border-color: #1b5e20;
        }

        .action-option.active {
          background: #f0f0f0;
          border-color: #1b5e20;
          color: #1b5e20;
        }

        .action-option.active.approve {
          background: rgba(76, 175, 80, 0.1);
          border-color: #4caf50;
          color: #2e7d32;
        }

        .action-option.active.reject {
          background: rgba(244, 67, 54, 0.1);
          border-color: #f44336;
          color: #c62828;
        }

        .alert-error {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px;
          background: #f8d7da;
          border: 1px solid #f5c6cb;
          border-radius: 6px;
          color: #721c24;
          font-size: 13px;
          margin-bottom: 16px;
        }
      `}</style>
    </div>
  );
};

export default ProviderDetailsModal;
