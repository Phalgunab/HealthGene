import React, { useState } from 'react';
import { 
  getPatientRiskAssessment, 
  sendMessageToPatient 
} from '../../utils/providerDashboard';
import QuickActionsBar from './QuickActionsBar';

/**
 * PatientDetailView
 * Comprehensive patient details with health metrics, history, and actions
 */
export default function PatientDetailView({ patient, onClose }) {
  const [activeTab, setActiveTab] = useState('overview'); // overview, history, medications, alerts
  const [riskAssessment, setRiskAssessment] = useState(null);
  const [loadingRisk, setLoadingRisk] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageError, setMessageError] = useState(null);
  const [messageSent, setMessageSent] = useState(false);

  /**
   * Load risk assessment
   */
  React.useEffect(() => {
    loadRiskAssessment();
  }, [patient.id]);

  /**
   * Load risk assessment
   */
  async function loadRiskAssessment() {
    try {
      setLoadingRisk(true);
      const assessment = await getPatientRiskAssessment(patient.id);
      setRiskAssessment(assessment);
    } catch (err) {
      console.error('Risk assessment error:', err);
    } finally {
      setLoadingRisk(false);
    }
  }

  /**
   * Send message to patient
   */
  async function handleSendMessage() {
    if (!messageText.trim()) {
      setMessageError('Message cannot be empty');
      return;
    }

    try {
      setSendingMessage(true);
      setMessageError(null);
      
      await sendMessageToPatient('provider-123', patient.id, messageText);
      
      setMessageSent(true);
      setMessageText('');
      
      setTimeout(() => setMessageSent(false), 3000);
    } catch (err) {
      setMessageError(err.message || 'Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  }

  return (
    <div className="patient-detail-view">
      {/* Header */}
      <div className="detail-header">
        <div className="detail-title">
          <button className="back-btn" onClick={onClose}>← Back</button>
          <div className="title-content">
            <h1>{patient.name}</h1>
            <p className="subtitle">
              {patient.age} years • {patient.id} • {patient.conditions.length} conditions
            </p>
          </div>
        </div>
        <div className="detail-actions">
          <QuickActionsBar patientId={patient.id} patientName={patient.name} />
        </div>
      </div>

      {/* Key Metrics Section */}
      <div className="detail-metrics-section">
        <div className="metrics-row">
          <div className="detail-metric">
            <span className="metric-label">Adherence Rate</span>
            <div className="metric-display">
              <span className={`large-value ${getAdherenceClass(patient.adherenceRate)}`}>
                {patient.adherenceRate}%
              </span>
              <span className={`trend ${patient.adherenceTrend}`}>
                {getTrendText(patient.adherenceTrend)}
              </span>
            </div>
          </div>
          <div className="detail-metric">
            <span className="metric-label">Risk Score</span>
            <div className="metric-display">
              <div className="risk-bar">
                <div 
                  className={`risk-fill ${getRiskLevel(patient.riskScore)}`}
                  style={{ width: `${patient.riskScore * 100}%` }}
                ></div>
              </div>
              <span className="risk-level">{getRiskLevel(patient.riskScore).toUpperCase()}</span>
            </div>
          </div>
          <div className="detail-metric">
            <span className="metric-label">Active Alerts</span>
            <div className="metric-display">
              <span className={`alert-count ${patient.alerts.length > 0 ? 'critical' : ''}`}>
                {patient.alerts.length}
              </span>
            </div>
          </div>
          <div className="detail-metric">
            <span className="metric-label">Last Visit</span>
            <div className="metric-display">
              <span className="date-value">{formatDate(patient.lastVisit)}</span>
              <span className="date-detail">{formatFullDate(patient.lastVisit)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="detail-tabs">
        <button
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`tab ${activeTab === 'medications' ? 'active' : ''}`}
          onClick={() => setActiveTab('medications')}
        >
          Medications ({patient.medications.length})
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          History
        </button>
        <button
          className={`tab ${activeTab === 'alerts' ? 'active' : ''}`}
          onClick={() => setActiveTab('alerts')}
        >
          Alerts ({patient.alerts.length})
        </button>
      </div>

      {/* Content */}
      <div className="detail-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="tab-pane">
            <div className="content-section">
              <h3>Patient Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="label">Date of Birth</span>
                  <span className="value">{formatFullDate(patient.dateOfBirth)}</span>
                </div>
                <div className="info-item">
                  <span className="label">Phone</span>
                  <span className="value">{patient.phone}</span>
                </div>
                <div className="info-item">
                  <span className="label">Email</span>
                  <span className="value">{patient.email}</span>
                </div>
                <div className="info-item">
                  <span className="label">Insurance</span>
                  <span className="value">{patient.insuranceProvider}</span>
                </div>
              </div>
            </div>

            <div className="content-section">
              <h3>Active Conditions</h3>
              <div className="conditions-list">
                {patient.conditions.map((condition, idx) => (
                  <div key={idx} className="condition-badge">
                    {condition}
                  </div>
                ))}
              </div>
            </div>

            {/* Risk Assessment */}
            {riskAssessment && (
              <div className="content-section">
                <h3>Risk Assessment</h3>
                <div className="risk-assessment">
                  <div className="risk-summary">
                    <div className={`risk-score ${riskAssessment.riskLevel}`}>
                      {(riskAssessment.riskScore * 100).toFixed(0)}
                    </div>
                    <div className="risk-details">
                      <div className="risk-level">{riskAssessment.riskLevel.toUpperCase()}</div>
                      <div className="risk-factors">
                        {riskAssessment.riskFactors.map((factor, idx) => (
                          <div key={idx} className="factor">
                            {factor.factor}: {factor.description}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {riskAssessment.recommendations.length > 0 && (
                    <div className="recommendations">
                      <h4>Recommendations</h4>
                      <ul>
                        {riskAssessment.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Adherence Chart */}
            <div className="content-section">
              <h3>Adherence Trend (Last 30 Days)</h3>
              <div className="adherence-chart">
                {patient.adherenceHistory.slice(-7).map((entry, idx) => (
                  <div key={idx} className="chart-bar">
                    <div 
                      className="bar-fill"
                      style={{ height: `${entry.adherenceRate}%` }}
                      title={`${entry.date}: ${entry.adherenceRate}%`}
                    ></div>
                    <span className="bar-label">{entry.date.substring(5)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Message Section */}
            <div className="content-section message-section">
              <h3>Send Message to Patient</h3>
              <div className="message-form">
                <textarea
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  placeholder="Type your message here..."
                  className="message-input"
                  rows="3"
                />
                <div className="message-actions">
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageText.trim()}
                    className="send-btn"
                  >
                    {sendingMessage ? 'Sending...' : 'Send Message'}
                  </button>
                </div>
                {messageError && <p className="error-message">{messageError}</p>}
                {messageSent && <p className="success-message">Message sent successfully!</p>}
              </div>
            </div>
          </div>
        )}

        {/* Medications Tab */}
        {activeTab === 'medications' && (
          <div className="tab-pane">
            <div className="medications-list">
              {patient.medications.map((med, idx) => (
                <div key={idx} className="medication-item">
                  <div className="med-icon">💊</div>
                  <div className="med-info">
                    <div className="med-name">{med}</div>
                    <div className="med-details">
                      Once daily • Refills: {Math.floor(Math.random() * 5)}
                    </div>
                  </div>
                  <div className="med-status">active</div>
                </div>
              ))}
            </div>

            {patient.labResults.length > 0 && (
              <div className="content-section">
                <h3>Recent Lab Results</h3>
                <div className="lab-results">
                  {patient.labResults.map((result, idx) => (
                    <div key={idx} className={`lab-item ${result.status}`}>
                      <span className="test-name">{result.testName}</span>
                      <span className="test-value">{result.value} {result.unit}</span>
                      <span className="test-ref">Ref: {result.referenceRange}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="tab-pane">
            <div className="visit-history">
              <h3>Visit History</h3>
              {patient.visitHistory.map((visit, idx) => (
                <div key={idx} className="visit-item">
                  <div className="visit-date">{formatFullDate(visit.date)}</div>
                  <div className="visit-details">
                    <div className="visit-type">{visit.type}</div>
                    <div className="visit-reason">{visit.reason}</div>
                    <div className="visit-notes">{visit.notes}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="content-section">
              <h3>Communication History</h3>
              <div className="communication-list">
                {patient.communicationLog.map((comm, idx) => (
                  <div key={idx} className="comm-item">
                    <span className="comm-type">{comm.type}</span>
                    <span className="comm-direction">{comm.direction === 'outbound' ? '→' : '←'}</span>
                    <span className="comm-message">{comm.message}</span>
                    <span className="comm-time">{formatTime(comm.timestamp)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Alerts Tab */}
        {activeTab === 'alerts' && (
          <div className="tab-pane">
            {patient.alerts.length > 0 ? (
              <div className="alerts-list">
                {patient.alerts.map((alert) => (
                  <div key={alert.id} className={`alert-detail ${alert.severity}`}>
                    <div className="alert-header">
                      <span className="alert-type">{alert.type}</span>
                      <span className="alert-severity">{alert.severity.toUpperCase()}</span>
                    </div>
                    <div className="alert-message">{alert.message}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>No active alerts for this patient</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============== HELPER FUNCTIONS ==============

function getAdherenceClass(rate) {
  if (rate >= 90) return 'excellent';
  if (rate >= 75) return 'good';
  if (rate >= 60) return 'fair';
  return 'poor';
}

function getRiskLevel(score) {
  if (score >= 0.7) return 'critical';
  if (score >= 0.5) return 'high';
  if (score >= 0.3) return 'moderate';
  return 'low';
}

function getTrendText(trend) {
  const text = {
    'improving': '📈 Improving',
    'stable': '➡️ Stable',
    'declining': '📉 Declining'
  };
  return text[trend] || 'Stable';
}

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

function formatFullDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function formatTime(date) {
  return new Date(date).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
}
