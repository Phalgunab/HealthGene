/**
 * AllergyTracker Component
 * Track allergies and adverse reactions with severity indicators
 */

import React, { useState, useEffect } from 'react';
import { allergyManager } from '../utils/firestoreHealthDataManager';
import {
  validateAllergyName,
  validateAllergySeverity,
  ALLERGY_SEVERITY_LEVELS,
  formatDate,
  formatDateForInput,
} from '../utils/healthDataValidation';

const AllergyTracker = () => {
  const [loading, setLoading] = useState(false);
  const [allergies, setAllergies] = useState([]);
  const [criticalAllergies, setCriticalAllergies] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    allergyName: '',
    allergyType: 'Medication',
    reactionType: '',
    severity: 'Moderate',
    dateDiscovered: '',
    symptoms: '',
    management: '',
    safeAlternatives: '',
    notes: '',
    confirmed: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const allergyTypeOptions = ['Medication', 'Food', 'Environmental', 'Other'];
  const reactionTypeOptions = [
    'Rash',
    'Anaphylaxis',
    'GI upset',
    'Breathing difficulty',
    'Swelling',
    'Itching',
    'Hives',
    'Other',
  ];

  const severityColors = {
    Mild: '#10b981',
    Moderate: '#f59e0b',
    Severe: '#ef4444',
    'Life-threatening': '#7c2d12',
  };

  useEffect(() => {
    loadAllergies();
  }, []);

  const loadAllergies = async () => {
    try {
      setLoading(true);
      const [allData, criticalData] = await Promise.all([
        allergyManager.getAllAllergies(),
        allergyManager.getCriticalAllergies(),
      ]);
      setAllergies(allData);
      setCriticalAllergies(criticalData);
    } catch (err) {
      setError('Failed to load allergies: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    const nameValidation = validateAllergyName(formData.allergyName);
    if (!nameValidation.isValid) {
      errors.allergyName = nameValidation.errors[0];
    }

    const severityValidation = validateAllergySeverity(formData.severity);
    if (!severityValidation.isValid) {
      errors.severity = severityValidation.errors[0];
    }

    if (!formData.allergyType) {
      errors.allergyType = 'Allergy type is required';
    }

    if (!formData.reactionType) {
      errors.reactionType = 'Reaction type is required';
    }

    if (!formData.dateDiscovered) {
      errors.dateDiscovered = 'Date discovered is required';
    } else if (new Date(formData.dateDiscovered) > new Date()) {
      errors.dateDiscovered = 'Date cannot be in the future';
    }

    if (!formData.symptoms) {
      errors.symptoms = 'At least one symptom is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fix validation errors');
      return;
    }

    try {
      const dataToSave = {
        ...formData,
        symptoms: formData.symptoms
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
        safeAlternatives: formData.safeAlternatives
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
      };

      if (editingId) {
        await allergyManager.updateAllergy(editingId, dataToSave);
        setSuccess('Allergy updated successfully!');
      } else {
        await allergyManager.addAllergy(dataToSave);
        setSuccess('Allergy added successfully!');
      }

      setFormData({
        allergyName: '',
        allergyType: 'Medication',
        reactionType: '',
        severity: 'Moderate',
        dateDiscovered: '',
        symptoms: '',
        management: '',
        safeAlternatives: '',
        notes: '',
        confirmed: false,
      });
      setEditingId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadAllergies();
    } catch (err) {
      setError('Failed to save allergy: ' + err.message);
    }
  };

  const handleEdit = (allergy) => {
    setFormData({
      ...allergy,
      symptoms: (allergy.symptoms || []).join(', '),
      safeAlternatives: (allergy.safeAlternatives || []).join(', '),
    });
    setEditingId(allergy.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this allergy record?')) {
      try {
        await allergyManager.deleteAllergy(id);
        setSuccess('Allergy deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadAllergies();
      } catch (err) {
        setError('Failed to delete allergy: ' + err.message);
      }
    }
  };

  return (
    <div className="allergy-tracker">
      <style>{`
        .allergy-tracker {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .tracker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .tracker-header h1 {
          font-size: 28px;
          color: #333;
          margin: 0;
        }

        .btn {
          padding: 10px 16px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary {
          background: #2563eb;
          color: white;
        }

        .btn-primary:hover {
          background: #1d4ed8;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-sm {
          padding: 6px 12px;
          font-size: 12px;
        }

        .btn-danger {
          background: #ef4444;
          color: white;
        }

        .btn-danger:hover {
          background: #dc2626;
        }

        .alert {
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 20px;
          display: flex;
          gap: 10px;
          align-items: flex-start;
        }

        .alert-error {
          background: #fee2e2;
          border-left: 4px solid #dc2626;
          color: #991b1b;
        }

        .alert-success {
          background: #dcfce7;
          border-left: 4px solid #16a34a;
          color: #166534;
        }

        .alert-warning {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          color: #92400e;
        }

        .critical-banner {
          background: #7c2d12;
          color: white;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 25px;
          border-left: 5px solid #dc2626;
        }

        .critical-banner h2 {
          margin: 0 0 10px 0;
          font-size: 18px;
        }

        .critical-allergies {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .critical-allergy-badge {
          background: rgba(255, 255, 255, 0.2);
          padding: 8px 12px;
          border-radius: 4px;
          border: 1px solid rgba(255, 255, 255, 0.5);
        }

        .form-container {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group label {
          font-size: 14px;
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
        }

        .form-group input,
        .form-group select,
        .form-group textarea {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
        }

        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 5px;
        }

        .allergies-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .allergy-card {
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
          border-left: 5px solid;
        }

        .allergy-card-mild {
          background: #f0fdf4;
          border-color: #10b981;
        }

        .allergy-card-moderate {
          background: #fffbeb;
          border-color: #f59e0b;
        }

        .allergy-card-severe {
          background: #fef2f2;
          border-color: #ef4444;
        }

        .allergy-card-critical {
          background: #fef2f2;
          border-color: #7c2d12;
          border-width: 3px;
          box-shadow: 0 0 0 3px rgba(124, 45, 18, 0.1);
        }

        .allergy-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .severity-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
        }

        .confirmed-badge {
          display: inline-block;
          background: #e0e7ff;
          color: #3730a3;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-left: 8px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 8px 0;
          border-bottom: 1px solid rgba(0, 0, 0, 0.05);
        }

        .info-label {
          font-weight: 500;
          color: #666;
        }

        .info-value {
          color: #333;
          text-align: right;
        }

        .symptoms-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0;
        }

        .symptom-tag {
          background: rgba(0, 0, 0, 0.08);
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
        }

        .alternatives-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0;
        }

        .alternative-tag {
          background: #dbeafe;
          color: #1e40af;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .card-actions button {
          flex: 1;
        }

        .loading {
          text-align: center;
          color: #666;
          padding: 40px 20px;
          font-size: 16px;
        }

        .empty-state {
          text-align: center;
          color: #999;
          padding: 60px 20px;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .form-section {
          margin-bottom: 20px;
        }
      `}</style>

      <div className="tracker-header">
        <h1>⚠️ Allergies</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              allergyName: '',
              allergyType: 'Medication',
              reactionType: '',
              severity: 'Moderate',
              dateDiscovered: '',
              symptoms: '',
              management: '',
              safeAlternatives: '',
              notes: '',
              confirmed: false,
            });
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Allergy'}
        </button>
      </div>

      {error && (
        <div className="alert alert-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>✓</span>
          <span>{success}</span>
        </div>
      )}

      {criticalAllergies.length > 0 && (
        <div className="critical-banner">
          <h2>🚨 Critical Allergies - Handle with Care</h2>
          <div className="critical-allergies">
            {criticalAllergies.map(allergy => (
              <div key={allergy.id} className="critical-allergy-badge">
                <strong>{allergy.allergyName}</strong>
                {allergy.reactionType && ` - ${allergy.reactionType}`}
              </div>
            ))}
          </div>
        </div>
      )}

      {showForm && (
        <div className="form-container">
          <h2 className="section-title">
            {editingId ? 'Edit Allergy' : 'Add New Allergy'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Allergy Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Allergy Name *</label>
                  <input
                    type="text"
                    name="allergyName"
                    value={formData.allergyName}
                    onChange={handleInputChange}
                    placeholder="e.g., Penicillin, Peanuts"
                  />
                  {validationErrors.allergyName && (
                    <span className="error-message">{validationErrors.allergyName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Type *</label>
                  <select
                    name="allergyType"
                    value={formData.allergyType}
                    onChange={handleInputChange}
                  >
                    {allergyTypeOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {validationErrors.allergyType && (
                    <span className="error-message">{validationErrors.allergyType}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Reaction Type *</label>
                  <select
                    name="reactionType"
                    value={formData.reactionType}
                    onChange={handleInputChange}
                  >
                    <option value="">Select reaction</option>
                    {reactionTypeOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {validationErrors.reactionType && (
                    <span className="error-message">{validationErrors.reactionType}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Severity *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                  >
                    {ALLERGY_SEVERITY_LEVELS.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {validationErrors.severity && (
                    <span className="error-message">{validationErrors.severity}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Date Discovered *</label>
                  <input
                    type="date"
                    name="dateDiscovered"
                    value={formatDateForInput(formData.dateDiscovered)}
                    onChange={handleInputChange}
                  />
                  {validationErrors.dateDiscovered && (
                    <span className="error-message">{validationErrors.dateDiscovered}</span>
                  )}
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    name="confirmed"
                    checked={formData.confirmed}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="confirmed">Doctor Confirmed</label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Symptoms & Management</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Symptoms (comma separated) *</label>
                  <input
                    type="text"
                    name="symptoms"
                    value={formData.symptoms}
                    onChange={handleInputChange}
                    placeholder="e.g., Hives, Itching, Difficulty breathing"
                  />
                  {validationErrors.symptoms && (
                    <span className="error-message">{validationErrors.symptoms}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Management</label>
                  <input
                    type="text"
                    name="management"
                    value={formData.management}
                    onChange={handleInputChange}
                    placeholder="How to manage if exposed"
                  />
                </div>

                <div className="form-group">
                  <label>Safe Alternatives (comma separated)</label>
                  <input
                    type="text"
                    name="safeAlternatives"
                    value={formData.safeAlternatives}
                    onChange={handleInputChange}
                    placeholder="e.g., Amoxicillin, Azithromycin"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes"
                  rows="3"
                />
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Allergy' : 'Add Allergy'}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading allergies...</div>
      ) : allergies.length === 0 ? (
        <div className="empty-state">
          <p>No allergies recorded yet</p>
          <p>Add your allergy information for safety</p>
        </div>
      ) : (
        <div className="allergies-grid">
          {allergies.map(allergy => {
            const cardClass =
              allergy.severity === 'Life-threatening'
                ? 'allergy-card-critical'
                : `allergy-card-${allergy.severity.toLowerCase()}`;

            return (
              <div key={allergy.id} className={`allergy-card ${cardClass}`}>
                <div className="allergy-name">
                  {allergy.allergyName}
                  {allergy.confirmed && <span className="confirmed-badge">✓ Confirmed</span>}
                </div>

                <div
                  className="severity-badge"
                  style={{ backgroundColor: severityColors[allergy.severity] }}
                >
                  {allergy.severity}
                </div>

                <div className="info-row">
                  <span className="info-label">Type:</span>
                  <span className="info-value">{allergy.allergyType}</span>
                </div>

                <div className="info-row">
                  <span className="info-label">Reaction:</span>
                  <span className="info-value">{allergy.reactionType}</span>
                </div>

                {allergy.symptoms && allergy.symptoms.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Symptoms:</span>
                  </div>
                )}
                {allergy.symptoms && (
                  <div className="symptoms-list">
                    {allergy.symptoms.map((symptom, idx) => (
                      <div key={idx} className="symptom-tag">
                        {symptom}
                      </div>
                    ))}
                  </div>
                )}

                {allergy.management && (
                  <div className="info-row">
                    <span className="info-label">Management:</span>
                    <span className="info-value">{allergy.management}</span>
                  </div>
                )}

                {allergy.safeAlternatives && allergy.safeAlternatives.length > 0 && (
                  <div className="info-row">
                    <span className="info-label">Safe Alternatives:</span>
                  </div>
                )}
                {allergy.safeAlternatives && (
                  <div className="alternatives-list">
                    {allergy.safeAlternatives.map((alt, idx) => (
                      <div key={idx} className="alternative-tag">
                        {alt}
                      </div>
                    ))}
                  </div>
                )}

                <div className="card-actions">
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(allergy)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(allergy.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllergyTracker;
