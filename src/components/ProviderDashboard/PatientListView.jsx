import React, { useState } from 'react';
import { getPatientDetail, logProviderAction } from '../../utils/providerDashboard';
import PatientDetailView from './PatientDetailView';

/**
 * PatientListView
 * Displays list of patients with key metrics in card format
 */
export default function PatientListView({ patients }) {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState(null);

  /**
   * Handle patient card click to view details
   */
  async function handleViewPatient(patient) {
    try {
      setLoadingDetail(true);
      setDetailError(null);

      // Log the action
      await logProviderAction('provider-123', patient.id, 'view_patient', {
        patientName: patient.name
      });

      // Get detailed patient information
      const detailedPatient = await getPatientDetail(patient.id);
      setSelectedPatient(detailedPatient);
    } catch (err) {
      setDetailError(err.message || 'Failed to load patient details');
      console.error('Patient detail error:', err);
    } finally {
      setLoadingDetail(false);
    }
  }

  /**
   * Close detail view
   */
  function handleCloseDetail() {
    setSelectedPatient(null);
    setDetailError(null);
  }

  // If a patient is selected, show detail view
  if (selectedPatient) {
    return (
      <PatientDetailView 
        patient={selectedPatient}
        onClose={handleCloseDetail}
      />
    );
  }

  return (
    <div className="patient-list-view">
      <div className="patient-grid">
        {patients.map(patient => (
          <div 
            key={patient.id} 
            className={`patient-card ${patient.riskLevel}`}
            onClick={() => handleViewPatient(patient)}
          >
            {/* Header */}
            <div className="card-header">
              <div className="patient-avatar">
                {patient.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="card-title-section">
                <h3 className="patient-name">{patient.name}</h3>
                <p className="patient-id">{patient.id}</p>
              </div>
              <div className="card-badges">
                <span className={`risk-badge ${patient.riskLevel}`}>
                  {patient.riskLevel.toUpperCase()}
                </span>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="card-metrics">
              <div className="metric">
                <span className="metric-label">Adherence</span>
                <div className="metric-value">
                  <span className={`percentage ${getAdherenceClass(patient.adherenceRate)}`}>
                    {patient.adherenceRate}%
                  </span>
                  <span className={`trend ${patient.adherenceTrend}`}>
                    {getTrendIcon(patient.adherenceTrend)}
                  </span>
                </div>
              </div>

              <div className="metric">
                <span className="metric-label">Risk Score</span>
                <div className="metric-value">
                  <div className="risk-gauge">
                    <div 
                      className="risk-fill"
                      style={{ width: `${patient.riskScore * 100}%` }}
                    ></div>
                  </div>
                  <span className="risk-text">{(patient.riskScore * 100).toFixed(0)}</span>
                </div>
              </div>

              <div className="metric">
                <span className="metric-label">Alerts</span>
                <div className="metric-value">
                  <span className={`alert-count ${patient.alertCount > 0 ? 'has-alerts' : ''}`}>
                    {patient.alertCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Patient Info */}
            <div className="card-info">
              <div className="info-row">
                <span className="label">Age:</span>
                <span className="value">{patient.age}</span>
              </div>
              <div className="info-row">
                <span className="label">Conditions:</span>
                <span className="value">{patient.conditions.length}</span>
              </div>
              <div className="info-row">
                <span className="label">Medications:</span>
                <span className="value">{patient.medications.length}</span>
              </div>
              <div className="info-row">
                <span className="label">Last Visit:</span>
                <span className="value">{formatDate(patient.lastVisit)}</span>
              </div>
            </div>

            {/* Alerts Preview */}
            {patient.alertCount > 0 && (
              <div className="card-alerts">
                <div className="alerts-title">Recent Alerts:</div>
                {patient.alerts.slice(0, 2).map(alert => (
                  <div key={alert.id} className={`alert-item ${alert.severity}`}>
                    <span className="alert-icon">⚠️</span>
                    <span className="alert-text">{alert.message}</span>
                  </div>
                ))}
                {patient.alertCount > 2 && (
                  <div className="alerts-more">+{patient.alertCount - 2} more alerts</div>
                )}
              </div>
            )}

            {/* Action */}
            <div className="card-action">
              <span className="click-hint">👆 Click to view details</span>
            </div>
          </div>
        ))}
      </div>

      {/* Error state */}
      {detailError && (
        <div className="error-notification">
          <p>Error: {detailError}</p>
          <button onClick={() => setDetailError(null)}>Dismiss</button>
        </div>
      )}
    </div>
  );
}

// ============== HELPER FUNCTIONS ==============

/**
 * Get CSS class for adherence percentage
 */
function getAdherenceClass(rate) {
  if (rate >= 90) return 'excellent';
  if (rate >= 75) return 'good';
  if (rate >= 60) return 'fair';
  return 'poor';
}

/**
 * Get trend icon
 */
function getTrendIcon(trend) {
  const icons = {
    'improving': '📈',
    'stable': '➡️',
    'declining': '📉'
  };
  return icons[trend] || '➡️';
}

/**
 * Format date
 */
function formatDate(date) {
  const d = new Date(date);
  const today = new Date();
  const diffTime = today - d;
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return `${Math.floor(diffDays / 30)}m ago`;
}
