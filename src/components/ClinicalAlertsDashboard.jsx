/**
 * Clinical Alerts Dashboard
 * Unified view for Drug Interaction Checker and Lab Abnormality Alerts
 * Phase 2: Clinical Decision Support System
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle2, Info, Zap, TrendingDown, TrendingUp,
  Filter, Settings, RefreshCw, Clock, ShieldAlert
} from 'lucide-react';
import DrugInteractionChecker from './DrugInteractionChecker';
import LabAbnormalityAlert from './LabAbnormalityAlert';
import '../styles/ClinicalAlertsDashboard.css';

const ClinicalAlertsDashboard = ({ userId, medications = [], labResults = [] }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [criticalAlertsCount, setCriticalAlertsCount] = useState(0);
  const [warningAlertsCount, setWarningAlertsCount] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [expandedView, setExpandedView] = useState(null);

  useEffect(() => {
    setLastUpdated(new Date());
  }, [medications, labResults]);

  const handleRefresh = () => {
    setLastUpdated(new Date());
  };

  return (
    <div className="clinical-alerts-dashboard">
      {/* Header */}
      <div className="alerts-header">
        <div className="alerts-title-section">
          <div className="alerts-title">
            <ShieldAlert size={28} className="alerts-icon-main" />
            <div>
              <h2>Clinical Alerts & Recommendations</h2>
              <p className="subtitle">Real-time monitoring of drug interactions and lab abnormalities</p>
            </div>
          </div>
        </div>
        <div className="alerts-actions">
          <button
            className="icon-btn refresh-btn"
            onClick={handleRefresh}
            title="Refresh data"
            aria-label="Refresh alerts"
          >
            <RefreshCw size={18} />
          </button>
          <div className="last-updated">
            <Clock size={14} />
            <span>Updated {lastUpdated.toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Alert Status Summary */}
      <div className="alerts-summary-grid">
        <div className="summary-card critical">
          <div className="summary-icon">
            <AlertCircle size={24} />
          </div>
          <div className="summary-content">
            <h3>Critical Alerts</h3>
            <p className="summary-value">{criticalAlertsCount}</p>
            <span className="summary-label">Requires immediate attention</span>
          </div>
        </div>

        <div className="summary-card warning">
          <div className="summary-icon">
            <Zap size={24} />
          </div>
          <div className="summary-content">
            <h3>Warnings</h3>
            <p className="summary-value">{warningAlertsCount}</p>
            <span className="summary-label">Monitor closely</span>
          </div>
        </div>

        <div className="summary-card info">
          <div className="summary-icon">
            <Info size={24} />
          </div>
          <div className="summary-content">
            <h3>Medications</h3>
            <p className="summary-value">{medications.length}</p>
            <span className="summary-label">Active medications being tracked</span>
          </div>
        </div>

        <div className="summary-card success">
          <div className="summary-icon">
            <CheckCircle2 size={24} />
          </div>
          <div className="summary-content">
            <h3>Lab Monitoring</h3>
            <p className="summary-value">{labResults.length}</p>
            <span className="summary-label">Recent results analyzed</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="alerts-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>Overview</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'interactions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interactions')}
        >
          <span>Drug Interactions</span>
          {criticalAlertsCount > 0 && <span className="badge critical">{criticalAlertsCount}</span>}
        </button>
        <button
          className={`tab-button ${activeTab === 'labs' ? 'active' : ''}`}
          onClick={() => setActiveTab('labs')}
        >
          <span>Lab Abnormalities</span>
          {warningAlertsCount > 0 && <span className="badge warning">{warningAlertsCount}</span>}
        </button>
      </div>

      {/* Tab Content */}
      <div className="alerts-content">
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-section">
              <div className="section-header">
                <h3>Clinical Decision Support</h3>
                <p>Integrated analysis of your medications and lab results</p>
              </div>

              <div className="overview-grid">
                <div className="overview-card">
                  <div className="card-header">
                    <Zap size={20} className="text-warning" />
                    <h4>Drug Interaction Monitoring</h4>
                  </div>
                  <div className="card-body">
                    <p>Real-time detection of potentially dangerous drug interactions when you add multiple medications.</p>
                    <ul className="feature-list">
                      <li>✓ 60+ documented interactions</li>
                      <li>✓ Severity classification (Critical, Severe, Moderate, Mild)</li>
                      <li>✓ Clinical recommendations</li>
                      <li>✓ Alternative medication suggestions</li>
                    </ul>
                  </div>
                  <button
                    className="card-cta"
                    onClick={() => setActiveTab('interactions')}
                  >
                    View Details →
                  </button>
                </div>

                <div className="overview-card">
                  <div className="card-header">
                    <TrendingDown size={20} className="text-info" />
                    <h4>Lab Result Analysis</h4>
                  </div>
                  <div className="card-body">
                    <p>Automatic abnormality detection and trend analysis for 40+ common lab tests.</p>
                    <ul className="feature-list">
                      <li>✓ 40+ lab tests covered</li>
                      <li>✓ Abnormality detection with severity levels</li>
                      <li>✓ Trend analysis (up/down/stable)</li>
                      <li>✓ Clinical interpretation guides</li>
                    </ul>
                  </div>
                  <button
                    className="card-cta"
                    onClick={() => setActiveTab('labs')}
                  >
                    View Details →
                  </button>
                </div>
              </div>

              <div className="clinical-info-box">
                <div className="info-icon">
                  <Info size={20} />
                </div>
                <div className="info-content">
                  <h5>Important Disclaimer</h5>
                  <p>
                    This clinical decision support system is designed to provide informational guidance only.
                    It does not replace professional medical advice, diagnosis, or treatment from qualified healthcare providers.
                    Always consult with your physician or pharmacist before making any changes to your medications or treatment plan.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'interactions' && (
          <div className="interactions-content">
            <DrugInteractionChecker
              medications={medications}
              userId={userId}
            />
          </div>
        )}

        {activeTab === 'labs' && (
          <div className="labs-content">
            <LabAbnormalityAlert
              labResults={labResults}
              userId={userId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ClinicalAlertsDashboard;
