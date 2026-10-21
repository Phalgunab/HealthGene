/**
 * Medication Adherence Tracker Component
 * Phase 2 Sprint 4
 * 
 * Comprehensive medication adherence tracking and monitoring system
 * with insights, interventions, and progress visualization
 */

import React, { useState, useEffect } from 'react';
import {
  CheckCircle2, XCircle, TrendingUp, TrendingDown, AlertCircle, 
  Pill, Calendar, BarChart3, Lightbulb, Clock, Filter, Plus,
  ChevronDown, Target, AlertTriangle, Heart
} from 'lucide-react';
import {
  calculateAdherenceScore,
  analyzeAdherencePatterns,
  identifyNonAdherenceBarriers,
  generateAdherenceInterventions,
  calculateAdherenceRiskScore,
  generateAdherenceInsights,
  getAdherenceTargets,
} from '../utils/adherenceAnalyzer';
import '../styles/MedicationAdherenceTracker.css';

const MedicationAdherenceTracker = ({ 
  userId, 
  medications = [], 
  userProfile = {},
  adherenceHistory = [] 
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMedication, setSelectedMedication] = useState(null);
  const [adherenceData, setAdherenceData] = useState([]);
  const [adherenceScore, setAdherenceScore] = useState(null);
  const [patterns, setPatterns] = useState(null);
  const [barriers, setBarriers] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [insights, setInsights] = useState([]);
  const [riskScore, setRiskScore] = useState(null);
  const [expandedIntervention, setExpandedIntervention] = useState(null);
  const [expandedBarrier, setExpandedBarrier] = useState(null);
  const [dateFilter, setDateFilter] = useState('30days');

  // Initialize and calculate adherence metrics
  useEffect(() => {
    calculateAdherenceMetrics();
  }, [medications, adherenceHistory, userProfile]);

  const calculateAdherenceMetrics = () => {
    // Calculate adherence score
    const score = calculateAdherenceScore(adherenceHistory, 30);
    setAdherenceScore(score);

    // Analyze patterns
    const patternsData = analyzeAdherencePatterns(adherenceHistory);
    setPatterns(patternsData);

    // Identify barriers
    const barriersList = identifyNonAdherenceBarriers(
      medications[0] || {},
      userProfile,
      adherenceHistory
    );
    setBarriers(barriersList);

    // Generate interventions
    const interventionsList = generateAdherenceInterventions(score, barriersList);
    setInterventions(interventionsList);

    // Generate insights
    const insightsList = generateAdherenceInsights(score, adherenceHistory, medications);
    setInsights(insightsList);

    // Calculate risk score
    const risk = calculateAdherenceRiskScore(
      medications.length,
      userProfile.age || 50,
      userProfile.conditions || [],
      score.percentage
    );
    setRiskScore(risk);
  };

  const getScoreColor = (score) => {
    if (!score) return '#999';
    if (score >= 90) return '#22c55e';
    if (score >= 75) return '#3b82f6';
    if (score >= 50) return '#ffc107';
    return '#ff6b6b';
  };

  const getScoreCategory = (score) => {
    if (!score) return 'No data';
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 50) return 'Fair';
    return 'Poor';
  };

  return (
    <div className="medication-adherence-tracker">
      {/* Header */}
      <div className="adherence-header">
        <div className="adherence-title">
          <Pill size={28} className="adherence-icon-main" />
          <div>
            <h2>Medication Adherence Tracking</h2>
            <p className="subtitle">Monitor and improve your medication compliance</p>
          </div>
        </div>
      </div>

      {/* Adherence Score Summary */}
      {adherenceScore && (
        <div className="adherence-summary-section">
          <div className="adherence-main-card">
            <div className="score-display">
              <div className="score-circle" style={{ borderColor: getScoreColor(adherenceScore.percentage) }}>
                <div className="score-value">{adherenceScore.percentage}%</div>
                <div className="score-label">Adherence</div>
              </div>

              <div className="score-details">
                <div className="detail-row">
                  <span className="detail-label">Category</span>
                  <span className="detail-value" style={{ color: getScoreColor(adherenceScore.percentage) }}>
                    {getScoreCategory(adherenceScore.percentage)}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Doses Taken</span>
                  <span className="detail-value">{adherenceScore.dosesTaken}/{adherenceScore.dosesExpected}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Doses Missed</span>
                  <span className="detail-value" style={{ color: '#ff6b6b' }}>{adherenceScore.dosesMissed}</span>
                </div>
                {adherenceScore.trend && (
                  <div className="detail-row">
                    <span className="detail-label">Trend</span>
                    <span className="detail-value">
                      {adherenceScore.trend === 'improving' && <TrendingUp size={16} className="trend-up" />}
                      {adherenceScore.trend === 'declining' && <TrendingDown size={16} className="trend-down" />}
                      {adherenceScore.trend === 'stable' && <span style={{ color: '#3b82f6' }}>Stable</span>}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <p className="score-message">{adherenceScore.message}</p>
          </div>

          {/* Risk Score Card */}
          {riskScore && (
            <div className={`risk-card ${riskScore.category.toLowerCase().replace(' ', '-')}`}>
              <div className="risk-header">
                <AlertTriangle size={20} />
                <h3>Adherence Risk</h3>
              </div>
              <div className="risk-score-display">
                <div className="risk-number">{riskScore.score}</div>
                <div className="risk-category">{riskScore.category}</div>
              </div>
              <p className="risk-explanation">{riskScore.explanation}</p>
            </div>
          )}
        </div>
      )}

      {/* Insights */}
      {insights && insights.length > 0 && (
        <div className="adherence-insights-section">
          <h3>Health Insights</h3>
          <div className="insights-grid">
            {insights.map((insight, idx) => (
              <div key={idx} className={`insight-card ${insight.type}`}>
                <div className="insight-icon">
                  {insight.type === 'positive' && <CheckCircle2 size={20} />}
                  {insight.type === 'warning' && <AlertCircle size={20} />}
                  {insight.type === 'alert' && <AlertTriangle size={20} />}
                  {insight.type === 'info' && <Lightbulb size={20} />}
                </div>
                <div className="insight-content">
                  <h4>{insight.title}</h4>
                  <p>{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="adherence-tabs">
        <button
          className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <span>Overview</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'tracking' ? 'active' : ''}`}
          onClick={() => setActiveTab('tracking')}
        >
          <span>Daily Tracking</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'patterns' ? 'active' : ''}`}
          onClick={() => setActiveTab('patterns')}
        >
          <span>Patterns</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'barriers' ? 'active' : ''}`}
          onClick={() => setActiveTab('barriers')}
        >
          <span>Barriers</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'interventions' ? 'active' : ''}`}
          onClick={() => setActiveTab('interventions')}
        >
          <span>Interventions</span>
        </button>
      </div>

      {/* Tab Content */}
      <div className="adherence-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-content">
            <div className="overview-section">
              <h3>Medication Summary</h3>
              {medications && medications.length > 0 ? (
                <div className="medications-list">
                  {medications.map((med, idx) => (
                    <div key={idx} className="medication-item">
                      <div className="med-info">
                        <h4>{med.medicationName || med.name}</h4>
                        <p className="med-detail">
                          {med.dosage && `${med.dosage.value} ${med.dosage.unit}`}
                          {med.frequency && ` • ${med.frequency}`}
                        </p>
                        {med.indication && <p className="med-indication">For: {med.indication}</p>}
                      </div>
                      <div className="med-actions">
                        <button className="med-btn">Log Dose</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <Pill size={40} />
                  <p>No medications added yet</p>
                  <p className="empty-detail">Add medications to track adherence</p>
                </div>
              )}
            </div>

            <div className="overview-section adherence-targets-section">
              <h3>Adherence Targets</h3>
              <div className="target-grid">
                {medications.map((med, idx) => {
                  const target = getAdherenceTargets(med.indication ? [med.indication] : []);
                  return (
                    <div key={idx} className="target-card">
                      <div className="target-header">
                        <Target size={18} />
                        <h4>{med.medicationName || med.name}</h4>
                      </div>
                      <div className="target-value">{target}%</div>
                      <p className="target-description">Recommended adherence for optimal outcomes</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tracking Tab */}
        {activeTab === 'tracking' && (
          <div className="tracking-content">
            <div className="tracking-header">
              <h3>Daily Medication Log</h3>
              <div className="date-filter">
                <Calendar size={16} />
                <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)}>
                  <option value="7days">Last 7 days</option>
                  <option value="30days">Last 30 days</option>
                  <option value="90days">Last 90 days</option>
                </select>
              </div>
            </div>

            {medications && medications.length > 0 ? (
              <div className="tracking-grid">
                {medications.map((med, idx) => (
                  <div key={idx} className="medication-tracking-card">
                    <div className="tracking-med-header">
                      <h4>{med.medicationName || med.name}</h4>
                      <span className="med-dosage">{med.dosage?.value} {med.dosage?.unit}</span>
                    </div>

                    <div className="tracking-controls">
                      <button className="track-btn taken">
                        <CheckCircle2 size={18} />
                        <span>Dose Taken</span>
                      </button>
                      <button className="track-btn missed">
                        <XCircle size={18} />
                        <span>Dose Missed</span>
                      </button>
                    </div>

                    <div className="tracking-date">
                      <Clock size={14} />
                      <span>{new Date().toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Calendar size={40} />
                <p>No medications to track</p>
              </div>
            )}
          </div>
        )}

        {/* Patterns Tab */}
        {activeTab === 'patterns' && patterns && (
          <div className="patterns-content">
            <h3>Adherence Patterns</h3>

            {patterns.commonMissedDays && patterns.commonMissedDays.length > 0 && (
              <div className="pattern-section">
                <h4>Days with Lower Adherence</h4>
                <div className="days-grid">
                  {patterns.commonMissedDays.map((dayData, idx) => (
                    <div key={idx} className="day-card warning">
                      <div className="day-name">{dayData.day}</div>
                      <div className="day-rate">{dayData.adherenceRate}%</div>
                      <div className="day-missed">Missed: {dayData.count}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {patterns.dayOfWeekTrends && (
              <div className="pattern-section">
                <h4>Weekly Adherence Overview</h4>
                <div className="weekly-chart">
                  {Object.entries(patterns.dayOfWeekTrends).map(([day, counts]) => {
                    const rate = Math.round((counts.taken / (counts.taken + counts.missed)) * 100);
                    return (
                      <div key={day} className="day-bar">
                        <div className="bar-label">{day.slice(0, 3)}</div>
                        <div className="bar-container">
                          <div
                            className="bar-fill"
                            style={{
                              height: `${rate}%`,
                              backgroundColor: rate >= 90 ? '#22c55e' : rate >= 75 ? '#3b82f6' : '#ffc107',
                            }}
                          />
                        </div>
                        <div className="bar-percentage">{rate}%</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {patterns.patterns && patterns.patterns.length > 0 && (
              <div className="pattern-section">
                <h4>Identified Patterns</h4>
                {patterns.patterns.map((pattern, idx) => (
                  <div key={idx} className="pattern-item">
                    <AlertCircle size={16} className="pattern-icon" />
                    <div className="pattern-text">
                      <strong>{pattern.type}</strong> {pattern.detail}
                      <p className="pattern-rec">{pattern.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Barriers Tab */}
        {activeTab === 'barriers' && barriers && (
          <div className="barriers-content">
            <h3>Adherence Barriers</h3>

            {barriers.length > 0 ? (
              <div className="barriers-list">
                {barriers.map((barrier, idx) => (
                  <div key={idx} className={`barrier-card ${barrier.severity}`}>
                    <div
                      className="barrier-header"
                      onClick={() => setExpandedBarrier(expandedBarrier === idx ? null : idx)}
                    >
                      <div className="barrier-type">{barrier.type}</div>
                      <div className="barrier-factor">{barrier.factor}</div>
                      <span className={`barrier-severity ${barrier.severity}`}>
                        {barrier.severity.toUpperCase()}
                      </span>
                      <ChevronDown size={18} className={`expand-icon ${expandedBarrier === idx ? 'open' : ''}`} />
                    </div>

                    {expandedBarrier === idx && (
                      <div className="barrier-suggestion">
                        <h5>Suggestion:</h5>
                        <p>{barrier.suggestion}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Heart size={40} />
                <p>No significant barriers identified</p>
                <p className="empty-detail">Keep maintaining your excellent adherence!</p>
              </div>
            )}
          </div>
        )}

        {/* Interventions Tab */}
        {activeTab === 'interventions' && interventions && (
          <div className="interventions-content">
            <h3>Recommended Actions</h3>
            <p className="interventions-intro">
              Implement these strategies to improve your medication adherence and health outcomes.
            </p>

            {interventions.length > 0 ? (
              <div className="interventions-list">
                {interventions.map((intervention, idx) => (
                  <div key={idx} className={`intervention-card priority-${intervention.priority}`}>
                    <div
                      className="intervention-header"
                      onClick={() => setExpandedIntervention(expandedIntervention === idx ? null : idx)}
                    >
                      <div className="intervention-priority">
                        <span className={`priority-badge ${intervention.priority === 1 ? 'urgent' : 'standard'}`}>
                          {intervention.priority === 1 ? 'HIGH' : 'MEDIUM'}
                        </span>
                      </div>
                      <div className="intervention-title-section">
                        <h4>{intervention.title}</h4>
                        <p className="intervention-reason">{intervention.reason}</p>
                      </div>
                      <ChevronDown size={18} className={`expand-icon ${expandedIntervention === idx ? 'open' : ''}`} />
                    </div>

                    {expandedIntervention === idx && (
                      <div className="intervention-details">
                        <div className="detail-section">
                          <h5>Description</h5>
                          <p>{intervention.description}</p>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Effectiveness:</span>
                          <span className={`effectiveness ${intervention.effectiveness.toLowerCase()}`}>
                            {intervention.effectiveness}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Implementation Effort:</span>
                          <span className={`effort ${intervention.effort.toLowerCase()}`}>
                            {intervention.effort}
                          </span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Timeline:</span>
                          <span className="timeline">{intervention.timeframe}</span>
                        </div>
                        <button className="intervention-action">Get Started →</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <CheckCircle2 size={40} />
                <p>Great job!</p>
                <p className="empty-detail">You have excellent adherence. Keep up the good work!</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Clinical Disclaimer */}
      <div className="adherence-disclaimer">
        <div className="disclaimer-icon">
          <AlertCircle size={20} />
        </div>
        <div className="disclaimer-text">
          <h5>Important Notice</h5>
          <p>
            This adherence tracking tool is for informational purposes only. If you are having difficulty
            taking your medications, please discuss with your healthcare provider or pharmacist. Never change
            your medication regimen without professional guidance.
          </p>
        </div>
      </div>
    </div>
  );
};

export default MedicationAdherenceTracker;
