import React, { useState, useEffect } from 'react';
import { getTrustedDevices, revokeTrustedDevice, getMFASettings } from '../utils/mfaHelper';
import { Trash2, Lock, Smartphone, Monitor, Calendar, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

/**
 * MFASettings Component
 * Manage MFA settings, trusted devices, and method preferences
 * Supports: device management, MFA disable, method changes
 */

const MFASettings = ({
  userId,
  mfaEnabled,
  mfaMethod,
  onMethodChange,
  onDisableMFA,
  onEnableMFA,
  onClose
}) => {
  const [settings, setSettings] = useState(null);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('devices'); // devices, method, security
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  // Load MFA settings and trusted devices
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setError('');
        const [settingsData, devicesData] = await Promise.all([
          getMFASettings(userId),
          getTrustedDevices(userId)
        ]);

        setSettings(settingsData);
        setTrustedDevices(devicesData || []);
      } catch (err) {
        setError(err.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, [userId]);

  const handleRevokeDevice = async (deviceId) => {
    try {
      setError('');
      await revokeTrustedDevice(userId, deviceId);
      setTrustedDevices(trustedDevices.filter((d) => d.id !== deviceId));
      setSuccess('Device removed successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to revoke device');
    }
  };

  const handleDisableMFA = async () => {
    try {
      setError('');
      await onDisableMFA?.();
      setSuccess('✓ MFA disabled successfully');
      setTimeout(() => onClose?.(), 1500);
    } catch (err) {
      setError(err.message || 'Failed to disable MFA');
    }
  };

  const getDeviceIcon = (type) => {
    if (type === 'mobile') return <Smartphone size={20} />;
    return <Monitor size={20} />;
  };

  const getDeviceType = (fingerprint) => {
    if (!fingerprint) return 'desktop';
    const ua = fingerprint.includes('Mobile') || fingerprint.includes('Android') || fingerprint.includes('iPhone');
    return ua ? 'mobile' : 'desktop';
  };

  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <Loader2 size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto' }} />
        <p style={{ marginTop: '15px', color: '#666' }}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto', padding: '30px 20px' }}>
      {/* Header */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: '#333', marginBottom: '10px' }}>Security Settings</h2>
        <p style={{ color: '#666', fontSize: '14px' }}>
          Manage your MFA settings and trusted devices
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

      {/* MFA Status Card */}
      <div
        style={{
          backgroundColor: mfaEnabled ? '#d4edda' : '#fff3cd',
          border: `1px solid ${mfaEnabled ? '#c3e6cb' : '#ffc107'}`,
          borderRadius: '4px',
          padding: '15px',
          marginBottom: '20px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
          <Lock size={24} style={{ color: mfaEnabled ? '#155724' : '#856404' }} />
          <div>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: 'bold' }}>
              {mfaEnabled ? 'Multi-Factor Authentication is ON' : 'Multi-Factor Authentication is OFF'}
            </p>
            <p style={{ margin: '5px 0 0 0', fontSize: '13px', color: '#666' }}>
              {mfaEnabled
                ? `Method: ${mfaMethod === 'sms' ? 'SMS' : 'Email'}`
                : 'Enable MFA to protect your account'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #ddd'
        }}
      >
        {mfaEnabled && (
          <>
            <button
              onClick={() => setActiveTab('devices')}
              style={{
                padding: '10px 15px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'devices' ? 'bold' : 'normal',
                color: activeTab === 'devices' ? '#007bff' : '#666',
                borderBottom: activeTab === 'devices' ? '2px solid #007bff' : 'none',
                marginBottom: '-1px'
              }}
            >
              Trusted Devices
            </button>
            <button
              onClick={() => setActiveTab('method')}
              style={{
                padding: '10px 15px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: activeTab === 'method' ? 'bold' : 'normal',
                color: activeTab === 'method' ? '#007bff' : '#666',
                borderBottom: activeTab === 'method' ? '2px solid #007bff' : 'none',
                marginBottom: '-1px'
              }}
            >
              Verification Method
            </button>
          </>
        )}
        <button
          onClick={() => setActiveTab('security')}
          style={{
            padding: '10px 15px',
            border: 'none',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: activeTab === 'security' ? 'bold' : 'normal',
            color: activeTab === 'security' ? '#007bff' : '#666',
            borderBottom: activeTab === 'security' ? '2px solid #007bff' : 'none',
            marginBottom: '-1px'
          }}
        >
          {mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
        </button>
      </div>

      {/* Trusted Devices Tab */}
      {activeTab === 'devices' && (
        <div>
          {trustedDevices.length === 0 ? (
            <div
              style={{
                backgroundColor: '#f8f9fa',
                border: '1px solid #dee2e6',
                borderRadius: '4px',
                padding: '30px',
                textAlign: 'center'
              }}
            >
              <Smartphone size={40} style={{ color: '#ccc', margin: '0 auto' }} />
              <p style={{ color: '#666', marginTop: '15px' }}>No trusted devices yet</p>
              <p style={{ color: '#999', fontSize: '13px', margin: '10px 0 0 0' }}>
                Check the "Trust this device" option during login to add devices
              </p>
            </div>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
                Trusted devices won't require MFA verification for 30 days. Click the trash icon to
                remove a device.
              </p>
              {trustedDevices.map((device) => (
                <div
                  key={device.id}
                  style={{
                    backgroundColor: device.enabled ? '#f8f9fa' : '#f5f5f5',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    padding: '15px',
                    marginBottom: '10px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    opacity: device.enabled ? 1 : 0.6
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flex: 1 }}>
                    <div style={{ color: '#666' }}>
                      {getDeviceIcon(getDeviceType(device.fingerprint))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: '500', color: '#333' }}>
                        {device.deviceName || 'Unknown Device'}
                      </p>
                      <p style={{ margin: '0 0 3px 0', fontSize: '12px', color: '#666' }}>
                        <Calendar size={12} style={{ display: 'inline', marginRight: '4px' }} />
                        Trusted: {formatDate(device.trustedAt)}
                      </p>
                      <p style={{ margin: '0', fontSize: '12px', color: '#999' }}>
                        Expires: {formatDate(device.expiresAt)}
                      </p>
                      {!device.enabled && (
                        <p style={{ margin: '3px 0 0 0', fontSize: '11px', color: '#999' }}>
                          [REVOKED]
                        </p>
                      )}
                    </div>
                  </div>
                  {device.enabled && (
                    <button
                      onClick={() => handleRevokeDevice(device.id)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '8px 12px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={14} />
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Verification Method Tab */}
      {activeTab === 'method' && (
        <div>
          <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>
            Choose how you want to receive verification codes
          </p>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="method"
                value="sms"
                checked={mfaMethod === 'sms'}
                onChange={(e) => onMethodChange?.('sms')}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <span style={{ fontWeight: '500' }}>SMS Text Message</span>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
                  Receive codes via text message
                </p>
              </div>
            </label>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
              <input
                type="radio"
                name="method"
                value="email"
                checked={mfaMethod === 'email'}
                onChange={(e) => onMethodChange?.('email')}
                style={{ width: '18px', height: '18px' }}
              />
              <div>
                <span style={{ fontWeight: '500' }}>Email</span>
                <p style={{ margin: '3px 0 0 0', fontSize: '12px', color: '#666' }}>
                  Receive codes via email
                </p>
              </div>
            </label>
          </div>
        </div>
      )}

      {/* Security / Disable MFA Tab */}
      {activeTab === 'security' && (
        <div>
          {!mfaEnabled ? (
            <div
              style={{
                backgroundColor: '#e7f3ff',
                border: '1px solid #b3d9ff',
                borderRadius: '4px',
                padding: '20px'
              }}
            >
              <p style={{ color: '#004085', marginBottom: '15px' }}>
                Enable MFA to add an extra layer of security to your account. You'll receive a
                verification code via SMS or email when logging in from a new device.
              </p>
              <button
                onClick={onEnableMFA}
                style={{
                  padding: '12px 20px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: 'bold'
                }}
              >
                Enable MFA
              </button>
            </div>
          ) : (
            <div>
              {!confirmDisable ? (
                <div
                  style={{
                    backgroundColor: '#fff3cd',
                    border: '1px solid #ffc107',
                    borderRadius: '4px',
                    padding: '20px'
                  }}
                >
                  <p style={{ color: '#856404', marginBottom: '15px' }}>
                    Disabling MFA will make your account less secure. You will no longer need to
                    enter a verification code when logging in.
                  </p>
                  <button
                    onClick={() => setConfirmDisable(true)}
                    style={{
                      padding: '12px 20px',
                      backgroundColor: '#ffc107',
                      color: '#333',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 'bold'
                    }}
                  >
                    Disable MFA
                  </button>
                </div>
              ) : (
                <div
                  style={{
                    backgroundColor: '#f8d7da',
                    border: '1px solid #f5c6cb',
                    borderRadius: '4px',
                    padding: '20px'
                  }}
                >
                  <p style={{ color: '#721c24', marginBottom: '15px', fontWeight: 'bold' }}>
                    ⚠️ Are you sure? Disabling MFA will significantly reduce your account security.
                  </p>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => setConfirmDisable(false)}
                      style={{
                        flex: 1,
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
                      Keep MFA Enabled
                    </button>
                    <button
                      onClick={handleDisableMFA}
                      style={{
                        flex: 1,
                        padding: '12px',
                        backgroundColor: '#dc3545',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        fontWeight: 'bold'
                      }}
                    >
                      Disable MFA
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Close Button */}
      <div style={{ marginTop: '30px' }}>
        <button
          onClick={onClose}
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
          Close
        </button>
      </div>
    </div>
  );
};

export default MFASettings;
