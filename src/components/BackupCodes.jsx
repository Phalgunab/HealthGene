import React, { useState, useEffect } from 'react';
import { regenerateBackupCodes } from '../utils/mfaHelper';
import { Download, Copy, RefreshCw, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';

/**
 * BackupCodes Component
 * Display, manage, and regenerate backup codes
 * Supports: code display, download, regeneration with password confirmation
 */

const BackupCodes = ({
  userId,
  backupCodes,
  usedCodes,
  onRegenerateSuccess,
  onCancel
}) => {
  const [displayCodes, setDisplayCodes] = useState(backupCodes || []);
  const [usedCodesList, setUsedCodesList] = useState(usedCodes || []);
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [copiedCode, setCopiedCode] = useState(null);
  const [activeTab, setActiveTab] = useState('display'); // display, regenerate
  const [remainingCodes, setRemainingCodes] = useState(
    (backupCodes || []).length - (usedCodes || []).length
  );

  // Calculate remaining codes
  useEffect(() => {
    const remaining = (displayCodes || []).length - (usedCodesList || []).length;
    setRemainingCodes(remaining);
  }, [displayCodes, usedCodesList]);

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const downloadCodes = () => {
    const codesText = displayCodes
      .map((code, idx) => {
        const used = usedCodesList.includes(code);
        return `${idx + 1}. ${code}${used ? ' [USED]' : ''}`;
      })
      .join('\n');

    const document = `HealthGene Backup Codes
Generated: ${new Date().toLocaleString()}
Used Codes: ${usedCodesList.length}/${displayCodes.length}

IMPORTANT: Keep these codes in a safe place. Each code can only be used once.
If you lose access to your device, these codes are your backup way to log in.

${codesText}

Do not share these codes with anyone.`;

    const blob = new Blob([document], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `healthgene-backup-codes-${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    setSuccess('Codes downloaded successfully');
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleRegenerate = async (e) => {
    e.preventDefault();

    if (!password) {
      setError('Please enter your password');
      return;
    }

    try {
      setError('');
      setLoading(true);

      const result = await regenerateBackupCodes(userId, password);

      if (result.success) {
        setDisplayCodes(result.codes);
        setUsedCodesList([]);
        setPassword('');
        setShowPassword(false);
        setActiveTab('display');
        setSuccess('✓ Backup codes regenerated successfully!');

        onRegenerateSuccess?.({
          codes: result.codes,
          timestamp: new Date().toISOString()
        });

        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(result.message || 'Failed to regenerate codes');
      }
    } catch (err) {
      setError(err.message || 'Error regenerating codes');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '30px 20px',
        backgroundColor: '#fff'
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Backup Codes</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Store these codes in a safe place. Use them to log in if you lose access to your device.
        </p>
      </div>

      {/* Alerts */}
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

      {/* Status Card */}
      <div
        style={{
          backgroundColor: remainingCodes === 0 ? '#fff3cd' : '#e7f3ff',
          border: `1px solid ${remainingCodes === 0 ? '#ffc107' : '#b3d9ff'}`,
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <p style={{ margin: 0, fontSize: '12px', color: '#666', fontWeight: '500' }}>
              Codes Remaining
            </p>
            <p
              style={{
                margin: '5px 0 0 0',
                fontSize: '24px',
                fontWeight: 'bold',
                color: remainingCodes === 0 ? '#ff6b6b' : '#007bff'
              }}
            >
              {remainingCodes}/{displayCodes.length}
            </p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '12px', color: '#666' }}>
            <p>
              {usedCodesList.length > 0 && `${usedCodesList.length} used`}
              {remainingCodes === 0 && ' - Regenerate codes needed'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #ddd' }}>
        <button
          onClick={() => setActiveTab('display')}
          style={{
            padding: '10px 15px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'display' ? 'bold' : 'normal',
            color: activeTab === 'display' ? '#007bff' : '#666',
            borderBottom: activeTab === 'display' ? '2px solid #007bff' : 'none',
            marginBottom: '-1px'
          }}
        >
          View Codes
        </button>
        <button
          onClick={() => setActiveTab('regenerate')}
          style={{
            padding: '10px 15px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'regenerate' ? 'bold' : 'normal',
            color: activeTab === 'regenerate' ? '#007bff' : '#666',
            borderBottom: activeTab === 'regenerate' ? '2px solid #007bff' : 'none',
            marginBottom: '-1px'
          }}
        >
          Regenerate Codes
        </button>
      </div>

      {/* Display Codes Tab */}
      {activeTab === 'display' && (
        <div>
          {/* Important Notice */}
          <div
            style={{
              backgroundColor: '#fff3cd',
              border: '1px solid #ffeaa7',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '12px',
              color: '#856404'
            }}
          >
            <strong>⚠️ Important:</strong> Save these codes in a secure location. Each code can only
            be used once. Do not share these codes with anyone.
          </div>

          {/* Codes Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '10px',
              marginBottom: '20px'
            }}
          >
            {displayCodes.map((code, idx) => {
              const isUsed = usedCodesList.includes(code);
              const isCopied = copiedCode === code;

              return (
                <div
                  key={idx}
                  style={{
                    backgroundColor: isUsed ? '#f5f5f5' : '#f8f9fa',
                    border: `1px solid ${isUsed ? '#ddd' : '#dee2e6'}`,
                    borderRadius: '4px',
                    padding: '12px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: isUsed ? 0.6 : 1
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
                      Code {idx + 1}
                    </div>
                    <code
                      style={{
                        fontSize: '14px',
                        fontWeight: 'bold',
                        fontFamily: 'monospace',
                        color: '#333',
                        textDecoration: isUsed ? 'line-through' : 'none'
                      }}
                    >
                      {code}
                    </code>
                    {isUsed && (
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '4px' }}>
                        [USED]
                      </div>
                    )}
                  </div>
                  {!isUsed && (
                    <button
                      onClick={() => copyToClipboard(code)}
                      disabled={isUsed}
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: isUsed ? 'default' : 'pointer',
                        padding: '5px',
                        color: isCopied ? '#28a745' : '#666',
                        transition: 'color 0.2s'
                      }}
                      title="Copy to clipboard"
                    >
                      {isCopied ? (
                        <CheckCircle size={16} />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
            <button
              onClick={downloadCodes}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#17a2b8',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <Download size={16} />
              Download
            </button>
            <button
              onClick={() => setActiveTab('regenerate')}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: '#ffc107',
                color: '#333',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <RefreshCw size={16} />
              Regenerate
            </button>
          </div>
        </div>
      )}

      {/* Regenerate Codes Tab */}
      {activeTab === 'regenerate' && (
        <form onSubmit={handleRegenerate}>
          {/* Warning */}
          <div
            style={{
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px',
              padding: '12px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#721c24'
            }}
          >
            <strong>⚠️ Warning:</strong> Regenerating codes will invalidate all existing unused
            codes. You will need to download and save the new codes immediately.
          </div>

          {/* Password Input */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>
              Confirm Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                placeholder="Enter your password to confirm"
                style={{
                  width: '100%',
                  padding: '12px 40px 12px 12px',
                  border: `2px solid ${error ? '#dc3545' : '#ddd'}`,
                  borderRadius: '4px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '5px',
                  color: '#666'
                }}
              >
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            <p style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Your password is required to regenerate backup codes for security.
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={() => setActiveTab('display')}
              disabled={loading}
              style={{
                padding: '12px 20px',
                backgroundColor: '#6c757d',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: loading ? 0.6 : 1
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !password}
              style={{
                padding: '12px 20px',
                backgroundColor: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading || !password ? 'not-allowed' : 'pointer',
                fontSize: '14px',
                fontWeight: 'bold',
                opacity: loading || !password ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />}
              Regenerate Codes
            </button>
          </div>
        </form>
      )}

      {/* Close Button */}
      <div style={{ marginTop: '20px' }}>
        <button
          onClick={onCancel}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: '#f0f0f0',
            color: '#333',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold'
          }}
        >
          Done
        </button>
      </div>
    </div>
  );
};

export default BackupCodes;
