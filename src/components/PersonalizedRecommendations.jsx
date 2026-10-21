/**
 * Personalized Recommendations Component
 * Phase 2 Sprint 3
 * 
 * Displays personalized health recommendations based on user profile,
 * chronic conditions, medications, and lab results
 */

import React, { useState, useEffect } from 'react';
import {
  AlertCircle, CheckCircle2, TrendingUp, Target, Award,
  Heart, Zap, BookOpen, Filter, ChevronDown, Info
} from 'lucide-react';
import {
  calculateHealthRiskScore,
  generatePersonalizedRecommendations,
  calculatePreventiveHealthScore,
  getConditionGuidelines,
} from '../utils/recommendationEngine';
import '../styles/PersonalizedRecommendations.css';

const PersonalizedRecommendations = ({ 
  userId, 
  userProfile = {}, 
  conditions = [], 
  medications = [],
  labAbnormalities = [],
  age,
}) => {
  const [activeTab, setActiveTab] = useState('risk-assessment');
  const [expandedRecommendation, setExpandedRecommendation] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [riskScore, setRiskScore] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [preventiveScore, setPreventiveScore] = useState(null);
  const [guidelines, setGuidelines] = useState({});

  // Calculate health data on component mount or data change
  useEffect(() => {
    calculateHealthMetrics();
  }, [conditions, medications, labAbnormalities, age]);

  const calculateHealthMetrics = () => {
    // Calculate risk score
    const healthData = {
      age,
      conditions: conditions.map(c => typeof c === 'string' ? c : c.name),
      medications: medications.map(m => typeof m === 'string' ? m : m.name),
      labAbnormalities: labAbnormalities.map(lab => ({
        testName: lab.testName || lab.name,
        severity: lab.severity,
      })),
    };

    const risk = calculateHealthRiskScore(healthData);
    setRiskScore(risk);

    // Generate recommendations
    const recs = generatePersonalizedRecommendations(healthData);
    setRecommendations(recs);

    // Calculate preventive score
    const preventive = calculatePreventiveHealthScore({
      exerciseDaysPerWeek: 3,
      averageSleepHours: 7,
      dietQuality: 'Good',
      medicationAdherence: 85,
      daysSinceLastCheckup: 200,
    });
    setPreventiveScore(preventive);

    // Get guidelines for chronic conditions
    const guidelineMap = {};
    conditions.forEach(condition => {
      const condName = typeof condition === 'string' ? condition : condition.name;
      guidelineMap[condName] = getConditionGuidelines(condName);
    });
    setGuidelines(guidelineMap);
  };

  const getRecommendationsByCategory = () => {
    if (selectedCategory === 'all') return recommendations;
    return recommendations.filter(rec => rec.category === selectedCategory);
  };

  const getCategories = () => {
    const categories = new Set(['all']);
    recommendations.forEach(rec => {
      if (rec.category) categories.add(rec.category);
    });
    return Array.from(categories);
  };

  return (
    <div className="personalized-recommendations">
      {/* Header */}
      <div className="rec-header">
        <div className="rec-title-section">
          <div className="rec-title">
            <Target size={28} className="rec-icon-main" />
            <div>
              <h2>Personalized Health Recommendations</h2>
              <p className="subtitle">Evidence-based guidance tailored to your health profile</p>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Assessment Summary */}
      {riskScore && (
        <div className="rec-risk-summary">
          <div className="risk-card">
            <div className="risk-header">
              <AlertCircle size={24} className={`risk-icon ${riskScore.category.toLowerCase()}`} />
              <div>
                <h3>Overall Health Risk Assessment</h3>
                <p className="risk-category">{riskScore.category}</p>
              </div>
            </div>

            <div className="risk-score-display">
              <div className="score-circle">
                <div className="score-value">{riskScore.score}</div>
                <div className="score-label">/ 100</div>
              </div>
              <div className="risk-details">
                <p className="risk-explanation">{riskScore.explanation}</p>
                <div className="risk-factors">
                  <h4>Contributing Factors:</h4>
                  <ul>
                    {riskScore.factors.map((factor, idx) => (
                      <li key={idx}>
                        <span className="factor-name">{factor.factor}</span>
                        <span className="factor-score">+{factor.contribution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Preventive Health Score */}
          {preventiveScore && (
            <div className="preventive-card">
              <div className="preventive-header">
                <Award size={24} className="preventive-icon" />
                <h3>Preventive Health Score</h3>
              </div>

              <div className="preventive-score">
                <div className="score-display">
                  <div className="score-percentage">{preventiveScore.score}%</div>
                  <div className="score-category">{preventiveScore.category}</div>
                </div>

                <div className="preventive-areas">
                  {Object.entries(preventiveScore.areas).map(([area, data]) => (
                    <div key={area} className={`area-bar ${data.status.toLowerCase().replace(' ', '-')}`}>
                      <div className="area-name">{area.charAt(0).toUpperCase() + area.slice(1)}</div>
                      <div className="area-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${(data.score / 20) * 100}%` }} />
                        </div>
                      </div>
                      <div className="area-status">{data.status}</div>
                    </div>
                  ))}
                </div>

                {preventiveScore.nextSteps && (
                  <div className="next-steps">
                    <h4>Recommended Actions:</h4>
                    <ul>
                      {preventiveScore.nextSteps.map((step, idx) => (
                        <li key={idx}>
                          <CheckCircle2 size={16} />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="rec-tabs">
        <button
          className={`tab-button ${activeTab === 'risk-assessment' ? 'active' : ''}`}
          onClick={() => setActiveTab('risk-assessment')}
        >
          <span>Risk Assessment</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'recommendations' ? 'active' : ''}`}
          onClick={() => setActiveTab('recommendations')}
        >
          <span>Recommendations</span>
          <span className="badge">{recommendations.length}</span>
        </button>
        {Object.keys(guidelines).length > 0 && (
          <button
            className={`tab-button ${activeTab === 'guidelines' ? 'active' : ''}`}
            onClick={() => setActiveTab('guidelines')}
          >
            <span>Condition Guidelines</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      <div className="rec-content">
        {activeTab === 'risk-assessment' && (
          <div className="risk-assessment-content">
            <div className="assessment-section">
              <h3>Risk Factors Explained</h3>
              <div className="risk-explanation-box">
                <div className="risk-info">
                  <Info size={20} />
                  <div>
                    <p>
                      Your health risk score is calculated based on age, chronic conditions, medication complexity,
                      and lab abnormalities. This score helps identify areas where additional monitoring or preventive
                      measures may be beneficial.
                    </p>
                  </div>
                </div>
              </div>

              {riskScore && (
                <div className="risk-factors-detail">
                  {riskScore.factors.map((factor, idx) => (
                    <div key={idx} className="factor-detail">
                      <div className="factor-header">
                        <h4>{factor.factor}</h4>
                        <span className="factor-contribution">+{factor.contribution} points</span>
                      </div>
                      <div className="factor-description">
                        {getFactorExplanation(factor.factor)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="recommendations-content">
            {/* Category Filter */}
            <div className="rec-filter">
              <Filter size={16} />
              <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                {getCategories().map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'all' ? 'All Recommendations' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Recommendations List */}
            {getRecommendationsByCategory().length > 0 ? (
              <div className="rec-list">
                {getRecommendationsByCategory().map((rec, idx) => (
                  <div
                    key={idx}
                    className={`rec-item ${expandedRecommendation === idx ? 'expanded' : ''}`}
                  >
                    <div
                      className="rec-header"
                      onClick={() => setExpandedRecommendation(expandedRecommendation === idx ? null : idx)}
                    >
                      <div className="rec-icon">
                        <Heart size={20} />
                      </div>
                      <div className="rec-header-content">
                        <h4>{rec.title}</h4>
                        <p>{rec.description}</p>
                      </div>
                      <div className="rec-priority">
                        {rec.priority === 0 && <span className="priority-badge critical">Urgent</span>}
                        {rec.priority === 1 && <span className="priority-badge high">High Priority</span>}
                        {rec.priority === 2 && <span className="priority-badge medium">Medium</span>}
                        {rec.priority === 3 && <span className="priority-badge low">Low</span>}
                      </div>
                      <ChevronDown size={18} className="expand-icon" />
                    </div>

                    {expandedRecommendation === idx && (
                      <div className="rec-details">
                        <div className="rec-detail-section">
                          <h5>Evidence</h5>
                          <p>{rec.evidence}</p>
                        </div>
                        {rec.category && (
                          <div className="rec-detail-section">
                            <h5>Category</h5>
                            <p>{rec.category}</p>
                          </div>
                        )}
                        <div className="rec-actions">
                          <button className="rec-action-btn">Learn More</button>
                          <button className="rec-action-btn secondary">Mark as Done</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Zap size={32} />
                <p>No recommendations available</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'guidelines' && Object.keys(guidelines).length > 0 && (
          <div className="guidelines-content">
            {Object.entries(guidelines).map(([condition, guideline]) => (
              <div key={condition} className="guideline-card">
                <div className="guideline-header">
                  <h3>{condition}</h3>
                  <span className="guideline-type">Clinical Guidelines</span>
                </div>

                <div className="guideline-sections">
                  {guideline.targets && (
                    <div className="guideline-section">
                      <h4>Treatment Targets</h4>
                      {typeof guideline.targets === 'object' ? (
                        <ul>
                          {Object.entries(guideline.targets).map(([target, value]) => (
                            <li key={target}>
                              <strong>{target.replace(/_/g, ' ')}:</strong> {value}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p>{guideline.targets}</p>
                      )}
                    </div>
                  )}

                  {guideline.medications && (
                    <div className="guideline-section">
                      <h4>Common Medications</h4>
                      <ul>
                        {typeof guideline.medications === 'object' ? (
                          guideline.medications.map((med, idx) => (
                            <li key={idx}>{med}</li>
                          ))
                        ) : (
                          <li>{guideline.medications}</li>
                        )}
                      </ul>
                    </div>
                  )}

                  {guideline.monitoring && (
                    <div className="guideline-section">
                      <h4>Monitoring</h4>
                      <p>{guideline.monitoring}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clinical Disclaimer */}
      <div className="clinical-disclaimer">
        <div className="disclaimer-icon">
          <AlertCircle size={20} />
        </div>
        <div className="disclaimer-text">
          <h5>Important Medical Disclaimer</h5>
          <p>
            These personalized recommendations are generated based on your health data and evidence-based guidelines.
            They are for informational purposes only and do not replace professional medical advice, diagnosis, or treatment.
            Always consult with your healthcare provider before making significant changes to your health regimen.
            If you have concerns about your health, seek immediate medical attention.
          </p>
        </div>
      </div>
    </div>
  );
};

/**
 * Helper function to explain risk factors
 */
function getFactorExplanation(factor) {
  const explanations = {
    'Young adult (lower baseline risk)': 'Your age typically associates with lower baseline disease risk, allowing focus on prevention and healthy habit building.',
    'Middle age (moderate age-related risk)': 'As you age, regular screening and health monitoring become increasingly important.',
    'Pre-senior (elevated age-related risk)': 'This age group requires enhanced monitoring and preventive care to maintain optimal health.',
    'Senior (high age-related risk)': 'Comprehensive health monitoring and preventive measures are essential at this life stage.',
    'Hypertension': 'High blood pressure significantly increases risk of heart disease, stroke, and kidney disease. Strict monitoring and control are essential.',
    'Diabetes': 'Diabetes requires careful management to prevent complications affecting multiple organ systems.',
    'Coronary Artery Disease': 'History of CAD indicates substantial cardiovascular risk requiring intensive management.',
    'Chronic Kidney Disease': 'Progressive kidney disease requires specialized monitoring and treatment.',
    'Polypharmacy': 'Taking multiple medications increases risk of drug interactions and side effects. Regular review with your pharmacist is recommended.',
  };

  return explanations[factor] || 'This factor contributes to your overall health risk profile.';
}

export default PersonalizedRecommendations;
