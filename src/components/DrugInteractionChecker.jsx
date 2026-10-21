import React, { useState, useEffect } from 'react';
import {
  checkAllInteractions,
  getSeverityColor,
  getSeverityLabel,
  shouldWarnImmediately,
  getAlternatives,
} from '../utils/drugInteractionValidator';
import { medicationManager } from '../utils/firestoreHealthDataManager';
import '../styles/DrugInteractionChecker.css';

const DrugInteractionChecker = ({ userId }) => {
  const [medications, setMedications] = useState([]);
  const [interactions, setInteractions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedInteraction, setExpandedInteraction] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [dismissedInteractions, setDismissedInteractions] = useState(new Set());

  useEffect(() => {
    if (userId) {
      fetchMedicationsAndCheckInteractions();
    }
  }, [userId]);

  const fetchMedicationsAndCheckInteractions = async () => {
    try {
      setLoading(true);
      setError('');

      const activeMeds = await medicationManager.getAll(userId);
      const active = activeMeds.filter((med) => med.status === 'Active');

      setMedications(active);

      // Check for interactions
      if (active.length > 1) {
        const foundInteractions = checkAllInteractions(active);
        setInteractions(foundInteractions);
      } else {
        setInteractions([]);
      }
    } catch (err) {
      setError('Failed to check drug interactions: ' + err.message);
      console.error('Interaction check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissInteraction = (interactionId) => {
    const newDismissed = new Set(dismissedInteractions);
    newDismissed.add(interactionId);
    setDismissedInteractions(newDismissed);
  };

  const handleReviewInteraction = (interactionId) => {
    // In a production app, this would open a modal with full details
    setExpandedInteraction(expandedInteraction === interactionId ? null : interactionId);
  };

  const filteredInteractions = interactions.filter((interaction) => {
    if (dismissedInteractions.has(interaction.id)) return false;
    if (filterSeverity === 'all') return true;
    return interaction.severity === filterSeverity;
  });

  const criticalCount = interactions.filter((i) => i.severity === 'critical').length;
  const severeCount = interactions.filter((i) => i.severity === 'severe').length;
  const moderateCount = interactions.filter((i) => i.severity === 'moderate').length;
  const mildCount = interactions.filter((i) => i.severity === 'mild').length;

  return (
    <div className="drug-interaction-checker">
      <div className="checker-header">
        <h2>Drug Interaction Checker</h2>
        <p className="subtitle">Checking {medications.length} active medications</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Checking for drug interactions...</p>
        </div>
      ) : medications.length < 2 ? (
        <div className="empty-state">
          <p>Add at least 2 active medications to check for interactions.</p>
          <p className="hint">You currently have {medications.length} active medication(s).</p>
        </div>
      ) : (
        <>
          <div className="interaction-stats">
            {criticalCount > 0 && (
              <div className="stat-badge critical">
                <span className="icon">🔴</span>
                <span className="text">Critical: {criticalCount}</span>
              </div>
            )}
            {severeCount > 0 && (
              <div className="stat-badge severe">
                <span className="icon">🟠</span>
                <span className="text">Severe: {severeCount}</span>
              </div>
            )}
            {moderateCount > 0 && (
              <div className="stat-badge moderate">
                <span className="icon">🟡</span>
                <span className="text">Moderate: {moderateCount}</span>
              </div>
            )}
            {mildCount > 0 && (
              <div className="stat-badge mild">
                <span className="icon">⚪</span>
                <span className="text">Mild: {mildCount}</span>
              </div>
            )}
            {interactions.length === 0 && (
              <div className="stat-badge safe">
                <span className="icon">✅</span>
                <span className="text">No Interactions Found</span>
              </div>
            )}
          </div>

          {interactions.length > 0 && (
            <div className="filter-controls">
              <button
                className={`filter-btn ${filterSeverity === 'all' ? 'active' : ''}`}
                onClick={() => setFilterSeverity('all')}
              >
                All ({interactions.length})
              </button>
              {criticalCount > 0 && (
                <button
                  className={`filter-btn critical ${filterSeverity === 'critical' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('critical')}
                >
                  Critical ({criticalCount})
                </button>
              )}
              {severeCount > 0 && (
                <button
                  className={`filter-btn severe ${filterSeverity === 'severe' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('severe')}
                >
                  Severe ({severeCount})
                </button>
              )}
              {moderateCount > 0 && (
                <button
                  className={`filter-btn moderate ${filterSeverity === 'moderate' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('moderate')}
                >
                  Moderate ({moderateCount})
                </button>
              )}
              {mildCount > 0 && (
                <button
                  className={`filter-btn mild ${filterSeverity === 'mild' ? 'active' : ''}`}
                  onClick={() => setFilterSeverity('mild')}
                >
                  Mild ({mildCount})
                </button>
              )}
            </div>
          )}

          {filteredInteractions.length === 0 && interactions.length > 0 ? (
            <div className="no-filtered-interactions">
              <p>No interactions found in selected severity level.</p>
            </div>
          ) : (
            <div className="interactions-list">
              {filteredInteractions.map((interaction) => (
                <div
                  key={interaction.id}
                  className={`interaction-card severity-${interaction.severity}`}
                  style={{
                    borderLeftColor: getSeverityColor(interaction.severity),
                  }}
                >
                  <div className="card-header">
                    <div className="header-left">
                      <h4 className="interaction-title">
                        {interaction.drug1} + {interaction.drug2}
                      </h4>
                      <span
                        className="severity-badge"
                        style={{
                          backgroundColor: getSeverityColor(interaction.severity),
                        }}
                      >
                        {getSeverityLabel(interaction.severity)}
                      </span>
                    </div>
                    <div className="header-right">
                      <button
                        className="btn-expand"
                        onClick={() => handleReviewInteraction(interaction.id)}
                      >
                        {expandedInteraction === interaction.id ? '▼' : '▶'} Details
                      </button>
                      <button
                        className="btn-dismiss"
                        onClick={() => handleDismissInteraction(interaction.id)}
                      >
                        ✕ Dismiss
                      </button>
                    </div>
                  </div>

                  <div className="card-body">
                    <div className="interaction-description">
                      <h5>Interaction:</h5>
                      <p>{interaction.interaction}</p>
                    </div>

                    <div className="recommendation">
                      <h5>🩺 Recommendation:</h5>
                      <p>{interaction.recommendation}</p>
                    </div>

                    {shouldWarnImmediately(interaction.severity) && (
                      <div className="urgent-warning">
                        <span className="warning-icon">⚠️</span>
                        <span className="warning-text">
                          This is a serious interaction. Consult your doctor immediately.
                        </span>
                      </div>
                    )}
                  </div>

                  {expandedInteraction === interaction.id && (
                    <div className="card-expanded">
                      <div className="expanded-section">
                        <h5>Related Conditions</h5>
                        {interaction.relatedConditions && interaction.relatedConditions.length > 0 ? (
                          <ul>
                            {interaction.relatedConditions.map((condition, idx) => (
                              <li key={idx}>{condition}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="no-data">No specific conditions listed.</p>
                        )}
                      </div>

                      <div className="expanded-section">
                        <h5>Alternative Options</h5>
                        {interaction.recommendation.toLowerCase().includes('alternative') ? (
                          <p className="alternative-note">{interaction.recommendation}</p>
                        ) : (
                          <p className="no-alternatives">See recommendation above for guidance.</p>
                        )}
                      </div>

                      <div className="expanded-section">
                        <h5>Next Steps</h5>
                        <ol>
                          <li>Discuss this interaction with your doctor</li>
                          <li>Review the recommendation above</li>
                          <li>Do not stop medications without medical advice</li>
                          <li>Ask about alternative medications if appropriate</li>
                          <li>Monitor for symptoms mentioned</li>
                        </ol>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="medications-summary">
            <h3>Active Medications Being Checked</h3>
            <div className="med-list">
              {medications.map((med, idx) => (
                <div key={idx} className="med-badge">
                  <span className="med-name">{med.medicationName}</span>
                  <span className="med-dosage">{med.dosage}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="disclaimer">
            <p>
              <strong>Disclaimer:</strong> This tool provides educational information about potential drug interactions.
              It is not a substitute for professional medical advice. Always consult your healthcare provider or
              pharmacist before making changes to your medications.
            </p>
          </div>

          <button className="btn-refresh" onClick={fetchMedicationsAndCheckInteractions}>
            🔄 Refresh Interactions
          </button>
        </>
      )}
    </div>
  );
};

export default DrugInteractionChecker;
