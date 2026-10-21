/**
 * Admin Panel Component
 * Main admin interface for system management
 */

import React, { useState, useEffect } from 'react';
import { LogOut, Users, BarChart3, ShieldCheck, Settings } from 'lucide-react';
import { getAdminStats, getVerificationStats } from '../../utils/adminManagement';
import ProviderVerificationPanel from './ProviderVerificationPanel';
import '../../styles/AdminPanel.css';

const AdminPanel = ({ adminName, onLogout }) => {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const data = await getVerificationStats();
      setStats(data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-wrapper">
        {/* Header */}
        <div className="admin-header">
          <h1>
            <ShieldCheck size={28} />
            Admin Panel
          </h1>
          <div className="admin-header-actions">
            <div className="admin-header-user">
              <span>👤 {adminName || 'Administrator'}</span>
            </div>
            <button className="admin-header-logout" onClick={onLogout}>
              <LogOut size={16} style={{ marginRight: '6px' }} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Layout */}
        <div className="admin-layout">
          {/* Sidebar */}
          <div className="admin-sidebar">
            <div
              className={`admin-sidebar-item ${activeSection === 'dashboard' ? 'active' : ''}`}
              onClick={() => setActiveSection('dashboard')}
            >
              <BarChart3 size={18} />
              Dashboard
            </div>
            <div
              className={`admin-sidebar-item ${activeSection === 'verification' ? 'active' : ''}`}
              onClick={() => setActiveSection('verification')}
            >
              <Users size={18} />
              Provider Verification
            </div>
            <div
              className={`admin-sidebar-item ${activeSection === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveSection('settings')}
            >
              <Settings size={18} />
              Settings
            </div>
          </div>

          {/* Content */}
          <div className="admin-content">
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <>
                <h2 style={{ gridColumn: '1 / -1', marginBottom: '20px', fontSize: '20px', fontWeight: 600, color: '#333' }}>
                  Dashboard
                </h2>

                {/* Stats Cards */}
                {loading ? (
                  <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px' }}>
                    <div className="spinner" />
                  </div>
                ) : stats ? (
                  <>
                    <div className="stat-card">
                      <div className="stat-label">Total Providers</div>
                      <div className="stat-value">{stats.total}</div>
                      <div className="stat-subtitle">All registered providers</div>
                    </div>

                    <div className="stat-card pending">
                      <div className="stat-label">Pending Verification</div>
                      <div className="stat-value">{stats.pending}</div>
                      <div className="stat-subtitle">{stats.percentagePending}% of total</div>
                    </div>

                    <div className="stat-card verified">
                      <div className="stat-label">Verified</div>
                      <div className="stat-value">{stats.verified}</div>
                      <div className="stat-subtitle">{stats.percentageVerified}% of total</div>
                    </div>

                    <div className="stat-card rejected">
                      <div className="stat-label">Rejected</div>
                      <div className="stat-value">{stats.rejected}</div>
                      <div className="stat-subtitle">
                        {stats.total > 0 ? Math.round((stats.rejected / stats.total) * 100) : 0}% of total
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div style={{ gridColumn: '1 / -1', marginTop: '20px' }}>
                      <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                      }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                          Quick Actions
                        </h3>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
                          <button
                            onClick={() => setActiveSection('verification')}
                            style={{
                              padding: '12px 16px',
                              background: 'linear-gradient(135deg, #1b5e20 0%, #2d7a3a 100%)',
                              color: 'white',
                              border: 'none',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '13px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
                          >
                            ⚡ Review Pending Providers
                          </button>
                          <button
                            onClick={() => {
                              setActiveSection('verification');
                              // This would navigate to verified section if we had the state set up
                            }}
                            style={{
                              padding: '12px 16px',
                              background: 'rgba(76, 175, 80, 0.1)',
                              color: '#2e7d32',
                              border: '1px solid #4caf50',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontWeight: 600,
                              fontSize: '13px',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => e.target.style.background = 'rgba(76, 175, 80, 0.2)'}
                            onMouseLeave={(e) => e.target.style.background = 'rgba(76, 175, 80, 0.1)'}
                          >
                            ✓ View Verified Providers
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* System Info */}
                    <div style={{ gridColumn: '1 / -1' }}>
                      <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '20px',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                      }}>
                        <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', fontWeight: 600, color: '#333' }}>
                          System Information
                        </h3>
                        <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.8' }}>
                          <p><strong>Average Processing Time:</strong> {stats.avgProcessingTime}</p>
                          <p><strong>Last Updated:</strong> {new Date().toLocaleString()}</p>
                          <p><strong>System Status:</strong> <span style={{ color: '#4caf50', fontWeight: 600 }}>✓ Operational</span></p>
                        </div>
                      </div>
                    </div>
                  </>
                ) : null}
              </>
            )}

            {/* Provider Verification Section */}
            {activeSection === 'verification' && (
              <ProviderVerificationPanel adminName={adminName} />
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{
                  background: 'white',
                  borderRadius: '12px',
                  padding: '24px',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
                }}>
                  <h2 style={{ margin: '0 0 20px 0', fontSize: '20px', fontWeight: 600, color: '#333' }}>
                    Admin Settings
                  </h2>

                  <div style={{ display: 'grid', gap: '16px', maxWidth: '500px' }}>
                    <div>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                        Account Settings
                      </h3>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>
                        Admin Name: <strong>{adminName}</strong>
                      </p>
                      <button style={{
                        padding: '8px 16px',
                        background: 'rgba(27, 94, 32, 0.1)',
                        color: '#1b5e20',
                        border: '1px solid #1b5e20',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        Change Password
                      </button>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                        Notification Settings
                      </h3>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '8px' }}>
                        <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                        Notify on new provider signups
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginTop: '8px' }}>
                        <input type="checkbox" defaultChecked style={{ cursor: 'pointer' }} />
                        Email notifications for pending verification
                      </label>
                    </div>

                    <div style={{ paddingTop: '16px', borderTop: '1px solid #e9ecef' }}>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: 600, color: '#333' }}>
                        Danger Zone
                      </h3>
                      <p style={{ margin: '0 0 12px 0', fontSize: '13px', color: '#666' }}>
                        These actions cannot be undone.
                      </p>
                      <button style={{
                        padding: '8px 16px',
                        background: 'rgba(244, 67, 54, 0.1)',
                        color: '#f44336',
                        border: '1px solid #f44336',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '13px',
                        fontWeight: 600
                      }}>
                        Clear Audit Logs
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
