import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';

export const SessionTimeoutWarning = ({ isOpen, countdown, onContinue, onLogout }) => {
  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const timeDisplay = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal" style={{ maxWidth: '420px' }}>
        <div className="consent-modal-header">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            width: '100%'
          }}>
            <AlertTriangle size={24} style={{ color: '#ff6b6b', flexShrink: 0 }} />
            <h2 style={{ margin: 0, fontSize: '18px', flex: 1 }}>Session Expiring Soon</h2>
          </div>
        </div>

        <div className="consent-text">
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <Clock size={20} style={{ color: '#ff6b6b', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <p style={{ margin: '0 0 4px 0', fontWeight: '600', fontSize: '16px', color: '#000' }}>
                {timeDisplay}
              </p>
              <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                Time remaining
              </p>
            </div>
          </div>

          <p style={{ marginBottom: '12px', lineHeight: '1.5' }}>
            Your session will expire due to inactivity. You'll be logged out in <strong>{timeDisplay}</strong> for your security.
          </p>

          <p style={{ marginBottom: 0, lineHeight: '1.5', color: '#666', fontSize: '14px' }}>
            Click "Continue" to stay logged in or "Log Out" to exit safely.
          </p>
        </div>

        <div className="consent-actions" style={{
          display: 'flex',
          gap: '10px',
          marginTop: '20px'
        }}>
          <button 
            className="sheet-secondary" 
            onClick={onLogout}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Log Out
          </button>
          <button 
            className="auth-primary" 
            onClick={onContinue}
            style={{
              flex: 1,
              padding: '10px 16px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Continue Session
          </button>
        </div>

        <p style={{
          margin: '12px 0 0 0',
          fontSize: '12px',
          color: '#999',
          textAlign: 'center'
        }}>
          Your activity will reset the timer
        </p>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
