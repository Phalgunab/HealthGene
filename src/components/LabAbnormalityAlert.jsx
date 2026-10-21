import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import {
  generateLabAnalysisReport,
  LAB_REFERENCE_RANGES,
  ABNORMALITY_SEVERITY
} from '../utils/labAbnormalityDetector';
import '../styles/LabAbnormalityAlert.css';

/**
 * LabAbnormalityAlert Component
 * Displays and manages lab result abnormalities
 * Shows critical alerts, trends, recommendations
 */
const LabAbnormalityAlert = () => {
  const [abnormalities, setAbnormalities] = useState([]);
  const [filteredAbnormalities, setFilteredAbnormalities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [expandedCards, setExpandedCards] = useState({});
  const [dismissedAlerts, setDismissedAlerts] = useState(new Set());
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    moderate: 0,
    total: 0
  });

  // Fetch lab results and analyze for abnormalities
  useEffect(() => {
    fetchAndAnalyzeLabResults();
  }, []);

  // Filter abnormalities when severity filter changes
  useEffect(() => {
    filterAbnormalities();
  }, [abnormalities, selectedSeverity, dismissedAlerts]);

  const fetchAndAnalyzeLabResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setError('User not authenticated');
        setLoading(false);
        return;
      }

      // Fetch all lab results
      const labResultsRef = collection(db, `users/${user.uid}/labs`);
      const labQuery = query(labResultsRef, orderBy('date', 'desc'));
      const snapshot = await getDocs(labQuery);

      const results = [];
      const testNames = new Set();

      snapshot.forEach((doc) => {
        const data = doc.data();
        testNames.add(data.testName);
        results.push({
          id: doc.id,
          ...data
        });
      });

      // Analyze each unique test for abnormalities
      const analyzedAbnormalities = [];
      const statsCounts = {
        critical: 0,
        high: 0,
        moderate: 0,
        total: 0
      };

      testNames.forEach((testName) => {
        const testResults = results
          .filter((r) => r.testName === testName)
          .sort((a, b) => new Date(b.date) - new Date(a.date));

        if (testResults.length === 0) return;

        const latestResult = testResults[0];
        const historicalValues = testResults.map((r) => ({
          value: r.value,
          date: r.date
        }));

        // Generate analysis report
        const report = generateLabAnalysisReport({
          testName,
          value: latestResult.value,
          date: latestResult.date,
          historicalValues
        });

        // Only include abnormal results
        if (report.interpretation.severity !== ABNORMALITY_SEVERITY.NORMAL) {
          analyzedAbnormalities.push({
            id: latestResult.id,
            ...report,
            latestResult,
            historicalCount: testResults.length
          });

          statsCounts.total++;
          if (report.interpretation.severity === ABNORMALITY_SEVERITY.CRITICAL) {
            statsCounts.critical++;
          } else if (report.interpretation.severity === ABNORMALITY_SEVERITY.HIGH) {
            statsCounts.high++;
          } else if (report.interpretation.severity === ABNORMALITY_SEVERITY.MODERATE) {
            statsCounts.moderate++;
          }
        }
      });

      // Sort by severity (critical first)
      analyzedAbnormalities.sort((a, b) => {
        const severityOrder = {
          [ABNORMALITY_SEVERITY.CRITICAL]: 0,
          [ABNORMALITY_SEVERITY.HIGH]: 1,
          [ABNORMALITY_SEVERITY.MODERATE]: 2,
          [ABNORMALITY_SEVERITY.MILD]: 3
        };
        return severityOrder[a.interpretation.severity] - severityOrder[b.interpretation.severity];
      });

      setAbnormalities(analyzedAbnormalities);
      setStats(statsCounts);
    } catch (err) {
      console.error('Error fetching lab results:', err);
      setError('Failed to load lab results');
    } finally {
      setLoading(false);
    }
  };

  const filterAbnormalities = () => {
    let filtered = abnormalities;

    // Filter by severity
    if (selectedSeverity !== 'ALL') {
      filtered = filtered.filter(
        (item) => item.interpretation.severity === selectedSeverity
      );
    }

    // Remove dismissed alerts
    filtered = filtered.filter((item) => !dismissedAlerts.has(item.id));

    setFilteredAbnormalities(filtered);
  };

  const toggleExpandCard = (id) => {
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const dismissAlert = (id) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.add(id);
    setDismissedAlerts(newDismissed);
  };

  const undismissAlert = (id) => {
    const newDismissed = new Set(dismissedAlerts);
    newDismissed.delete(id);
    setDismissedAlerts(newDismissed);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case ABNORMALITY_SEVERITY.CRITICAL:
        return '#c0392b';
      case ABNORMALITY_SEVERITY.HIGH:
        return '#e74c3c';
      case ABNORMALITY_SEVERITY.MODERATE:
        return '#f39c12';
      case ABNORMALITY_SEVERITY.MILD:
        return '#f1c40f';
      default:
        return '#95a5a6';
    }
  };

  if (loading) {
    return (
      <div className="lab-abnormality-alert">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Analyzing lab results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lab-abnormality-alert">
      {/* Header */}
      <div className="alert-header">
        <h2>Lab Abnormality Alerts</h2>
        <p className="subtitle">
          Monitor and manage abnormal lab results with clinical recommendations
        </p>
      </div>

      {/* Error Message */}
      {error && <div className="error-message">{error}</div>}

      {/* Statistics */}
      <div className="alert-stats">
        <div className="stat-badge critical" title="Critical abnormalities">
          <span className="icon">🔴</span>
          <div className="stat-content">
            <div className="stat-value">{stats.critical}</div>
            <div className="stat-label">Critical</div>
          </div>
        </div>
        <div className="stat-badge high" title="High abnormalities">
          <span className="icon">🟠</span>
          <div className="stat-content">
            <div className="stat-value">{stats.high}</div>
            <div className="stat-label">High</div>
          </div>
        </div>
        <div className="stat-badge moderate" title="Moderate abnormalities">
          <span className="icon">🟡</span>
          <div className="stat-content">
            <div className="stat-value">{stats.moderate}</div>
            <div className="stat-label">Moderate</div>
          </div>
        </div>
        <div className="stat-badge total" title="Total abnormalities">
          <span className="icon">📊</span>
          <div className="stat-content">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <button
          className={`filter-btn ${selectedSeverity === 'ALL' ? 'active' : ''}`}
          onClick={() => setSelectedSeverity('ALL')}
        >
          All ({abnormalities.length - dismissedAlerts.size})
        </button>
        <button
          className={`filter-btn critical ${
            selectedSeverity === ABNORMALITY_SEVERITY.CRITICAL ? 'active' : ''
          }`}
          onClick={() => setSelectedSeverity(ABNORMALITY_SEVERITY.CRITICAL)}
        >
          🔴 Critical
        </button>
        <button
          className={`filter-btn high ${
            selectedSeverity === ABNORMALITY_SEVERITY.HIGH ? 'active' : ''
          }`}
          onClick={() => setSelectedSeverity(ABNORMALITY_SEVERITY.HIGH)}
        >
          🟠 High
        </button>
        <button
          className={`filter-btn moderate ${
            selectedSeverity === ABNORMALITY_SEVERITY.MODERATE ? 'active' : ''
          }`}
          onClick={() => setSelectedSeverity(ABNORMALITY_SEVERITY.MODERATE)}
        >
          🟡 Moderate
        </button>
        {dismissedAlerts.size > 0 && (
          <button
            className="filter-btn dismissed"
            onClick={() => setDismissedAlerts(new Set())}
            title="Show dismissed alerts"
          >
            Show Dismissed ({dismissedAlerts.size})
          </button>
        )}
      </div>

      {/* Alerts List */}
      {filteredAbnormalities.length === 0 && dismissedAlerts.size === 0 ? (
        <div className="empty-state">
          <p>✅ All lab results are within normal ranges!</p>
          <p className="hint">
            Maintain regular check-ups to monitor your health status
          </p>
        </div>
      ) : filteredAbnormalities.length === 0 ? (
        <div className="empty-state">
          <p>No {selectedSeverity !== 'ALL' ? selectedSeverity.toLowerCase() : ''} abnormalities</p>
          <p className="hint">All alerts in this category have been dismissed</p>
        </div>
      ) : (
        <div className="abnormality-list">
          {filteredAbnormalities.map((abnormality) => (
            <div
              key={abnormality.id}
              className="abnormality-card"
              style={{
                borderLeftColor: getSeverityColor(abnormality.interpretation.severity)
              }}
            >
              {/* Card Header */}
              <div className="card-header">
                <div className="header-left">
                  <h3 className="test-name">{abnormality.testName}</h3>
                  <span className="severity-badge" style={{
                    backgroundColor: getSeverityColor(abnormality.interpretation.severity)
                  }}>
                    {abnormality.interpretation.emoji} {abnormality.interpretation.status}
                  </span>
                  {abnormality.category && (
                    <span className="category-badge">{abnormality.category}</span>
                  )}
                </div>
                <div className="header-right">
                  <button
                    className="btn-expand"
                    onClick={() => toggleExpandCard(abnormality.id)}
                  >
                    {expandedCards[abnormality.id] ? 'Hide Details' : 'Show Details'}
                  </button>
                  <button
                    className="btn-dismiss"
                    onClick={() => dismissAlert(abnormality.id)}
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              {/* Card Body */}
              <div className="card-body">
                {/* Current Value */}
                <div className="value-section">
                  <div className="current-value">
                    <span className="value-number">{abnormality.value}</span>
                    <span className="value-unit">{abnormality.unit}</span>
                  </div>
                  <div className="reference-range">
                    <span className="label">Normal Range:</span>
                    <span className="range">
                      {abnormality.referenceRange.min} - {abnormality.referenceRange.max}
                    </span>
                  </div>
                </div>

                {/* Interpretation */}
                <div className="interpretation-section">
                  <p className="interpretation-text">
                    {abnormality.interpretation.description}
                  </p>
                </div>

                {/* Trend Info */}
                {abnormality.trend && abnormality.trend.resultCount > 1 && (
                  <div className="trend-section">
                    <div className="trend-indicator">
                      <span className="trend-direction">
                        {abnormality.trend.direction === 'INCREASING' ? '📈' : '📉'}
                      </span>
                      <span className="trend-text">
                        {abnormality.trend.description}
                      </span>
                    </div>
                  </div>
                )}

                {/* Expanded Content */}
                {expandedCards[abnormality.id] && (
                  <div className="card-expanded">
                    {/* Clinical Recommendations */}
                    <div className="expanded-section">
                      <h5>🏥 Clinical Recommendations</h5>
                      <ul>
                        {abnormality.recommendations.recommendations.map((rec, idx) => (
                          <li key={idx}>{rec}</li>
                        ))}
                      </ul>
                    </div>

                    {/* Next Steps */}
                    <div className="expanded-section">
                      <h5>📋 Next Steps</h5>
                      <ol>
                        {abnormality.recommendations.nextSteps.map((step, idx) => (
                          <li key={idx}>{step}</li>
                        ))}
                      </ol>
                    </div>

                    {/* Related Conditions */}
                    {abnormality.relatedConditions && abnormality.relatedConditions.length > 0 && (
                      <div className="expanded-section">
                        <h5>⚕️ Possible Related Conditions</h5>
                        <ul>
                          {abnormality.relatedConditions.map((condition, idx) => (
                            <li key={idx}>{condition}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Checkup Recommendation */}
                    {abnormality.nextCheckup && (
                      <div className="checkup-section">
                        <span className="checkup-icon">📅</span>
                        <span className="checkup-text">
                          {abnormality.nextCheckup.recommendation}
                        </span>
                      </div>
                    )}

                    {/* Historical Data */}
                    {abnormality.historicalCount > 1 && (
                      <div className="expanded-section">
                        <h5>📊 Historical Data</h5>
                        <p className="historical-text">
                          {abnormality.historicalCount} results on file
                          {abnormality.trend && (
                            <>
                              {' • '}
                              {abnormality.trend.percentChange > 0 ? 'Increased' : 'Decreased'} by{' '}
                              {Math.abs(abnormality.trend.percentChange)}% over{' '}
                              {abnormality.trend.resultCount} tests
                            </>
                          )}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Medical Disclaimer */}
      <div className="medical-disclaimer">
        <span className="disclaimer-icon">⚠️</span>
        <p>
          This analysis is for informational purposes only and should not replace professional
          medical advice. Always consult with your healthcare provider to discuss abnormal lab
          results and appropriate treatment options.
        </p>
      </div>

      {/* Refresh Button */}
      <button className="btn-refresh" onClick={fetchAndAnalyzeLabResults}>
        🔄 Refresh Analysis
      </button>
    </div>
  );
};

export default LabAbnormalityAlert;
