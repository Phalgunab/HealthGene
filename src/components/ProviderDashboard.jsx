/**
 * Provider Dashboard
 * Main interface for healthcare providers to manage patients and clinical workflows
 * Phase 2: Healthcare Provider Integration
 */

import React, { useState, useEffect } from 'react';
import {
  LogOut, Users, AlertCircle, FileText, MessageSquare, Settings,
  ChevronRight, Search, Calendar, Clock, CheckCircle2, Plus
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { collection, getDocs, query, where } from 'firebase/firestore';
import '../styles/ProviderDashboard.css';

const ProviderDashboard = ({ providerData, currentUser }) => {
  const [tab, setTab] = useState('Patients');
  const [patients, setPatients] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadProviderData();
  }, [currentUser]);

  const loadProviderData = async () => {
    if (!currentUser) return;
    
    try {
      // Load patients who granted access to this provider
      const accessSnapshot = await getDocs(
        query(
          collection(db, 'users'),
          where('grantedProviders', 'array-contains', currentUser.uid)
        )
      );
      
      const patientList = await Promise.all(
        accessSnapshot.docs.map(async (docSnapshot) => {
          const userId = docSnapshot.id;
          const profileDoc = await getDocs(
            collection(db, 'users', userId, 'profile')
          );
          
          let profileData = { fullName: 'Unknown Patient' };
          profileDoc.forEach(doc => {
            if (doc.id === 'details') {
              profileData = doc.data();
            }
          });
          
          return {
            id: userId,
            ...profileData,
            status: 'Active'
          };
        })
      );
      
      setPatients(patientList);
      
      // Load clinical alerts
      const alertsSnapshot = await getDocs(
        query(
          collection(db, 'clinicalAlerts'),
          where('assignedProviderId', '==', currentUser.uid)
        )
      );
      
      const alertsList = alertsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAlerts(alertsList);
      setLoading(false);
    } catch (error) {
      console.error('Error loading provider data:', error);
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const filteredPatients = patients.filter(patient =>
    patient.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="provider-loading">Loading provider dashboard...</div>;
  }

  if (showSettings) {
    return <ProviderSettings provider={providerData} onBack={() => setShowSettings(false)} onLogout={handleLogout} />;
  }

  return (
    <main className="provider-dashboard">
      <header className="provider-header">
        <div className="provider-brand">
          <h1>Provider Portal</h1>
          <span className="provider-name">{providerData?.fullName || 'Healthcare Provider'}</span>
        </div>
        <div className="header-actions">
          <button
            className="icon-button"
            onClick={() => setShowSettings(true)}
            aria-label="Settings"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button
            className="logout-button"
            onClick={handleLogout}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      <div className="provider-content">
        {/* Navigation Tabs */}
        <nav className="provider-nav">
          {[
            { name: 'Patients', icon: Users, count: patients.length },
            { name: 'Alerts', icon: AlertCircle, count: alerts.length },
            { name: 'Messages', icon: MessageSquare, count: 0 },
            { name: 'Reports', icon: FileText, count: 0 }
          ].map(({ name, icon: Icon, count }) => (
            <button
              key={name}
              className={`nav-tab ${tab === name ? 'active' : ''}`}
              onClick={() => setTab(name)}
            >
              <Icon size={18} />
              <span>{name}</span>
              {count > 0 && <span className="badge">{count}</span>}
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        <section className="provider-section">
          {tab === 'Patients' && (
            <div className="patients-section">
              <div className="section-header">
                <h2>My Patients</h2>
                <div className="search-box">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search patients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {filteredPatients.length > 0 ? (
                <div className="patients-list">
                  {filteredPatients.map((patient) => (
                    <div key={patient.id} className="patient-card">
                      <div className="patient-info">
                        <div className="patient-avatar">
                          {patient.fullName?.[0]?.toUpperCase()}
                        </div>
                        <div className="patient-details">
                          <h3>{patient.fullName}</h3>
                          <span className="patient-status">
                            <CheckCircle2 size={14} />
                            {patient.status}
                          </span>
                        </div>
                      </div>
                      <button className="view-button">
                        View Records
                        <ChevronRight size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Users size={48} />
                  <p>No patients yet</p>
                  <span>Patients will appear here after they grant you access</span>
                </div>
              )}
            </div>
          )}

          {tab === 'Alerts' && (
            <div className="alerts-section">
              <div className="section-header">
                <h2>Clinical Alerts</h2>
              </div>

              {alerts.length > 0 ? (
                <div className="alerts-list">
                  {alerts.map((alert) => (
                    <div key={alert.id} className="alert-card">
                      <div className="alert-content">
                        <div className="alert-header">
                          <h3>{alert.title || 'Clinical Alert'}</h3>
                          <span className={`alert-severity ${alert.severity || 'medium'}`}>
                            {alert.severity || 'MEDIUM'}
                          </span>
                        </div>
                        <p>{alert.description}</p>
                        <div className="alert-meta">
                          <span className="alert-patient">
                            Patient: {alert.patientName || 'Unknown'}
                          </span>
                          <span className="alert-time">
                            <Clock size={14} />
                            {new Date(alert.createdAt?.toDate?.() || alert.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <button className="action-button">Review</button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <AlertCircle size={48} />
                  <p>No active alerts</p>
                  <span>Clinical alerts will appear here when triggered</span>
                </div>
              )}
            </div>
          )}

          {tab === 'Messages' && (
            <div className="messages-section">
              <div className="empty-state">
                <MessageSquare size={48} />
                <p>Messaging coming soon</p>
                <span>Provider messaging will be available in the next update</span>
              </div>
            </div>
          )}

          {tab === 'Reports' && (
            <div className="reports-section">
              <div className="empty-state">
                <FileText size={48} />
                <p>Reports coming soon</p>
                <span>Report generation tools will be available in the next update</span>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

function ProviderSettings({ provider, onBack, onLogout }) {
  return (
    <main className="provider-settings">
      <header className="settings-header">
        <button className="back-button" onClick={onBack}>←</button>
        <h1>Settings</h1>
      </header>

      <div className="settings-content">
        <section className="settings-section">
          <h2>Profile Information</h2>
          <div className="setting-item">
            <label>Name</label>
            <p>{provider?.fullName}</p>
          </div>
          <div className="setting-item">
            <label>Email</label>
            <p>{provider?.email}</p>
          </div>
          <div className="setting-item">
            <label>Specialization</label>
            <p>{provider?.specialization}</p>
          </div>
          <div className="setting-item">
            <label>License Number</label>
            <p>{provider?.licenseNumber}</p>
          </div>
          <div className="setting-item">
            <label>Hospital/Clinic</label>
            <p>{provider?.hospitalName}</p>
          </div>
          <div className="setting-item">
            <label>Verification Status</label>
            <p className={`status ${provider?.status === 'verified' ? 'verified' : 'pending'}`}>
              {provider?.status === 'verified' ? '✓ Verified' : '⏳ Pending Admin Approval'}
            </p>
          </div>
        </section>

        <section className="settings-section danger-zone">
          <h2>Account</h2>
          <button className="logout-button-full" onClick={onLogout}>
            <LogOut size={18} />
            Sign Out
          </button>
        </section>
      </div>
    </main>
  );
}

export default ProviderDashboard;
