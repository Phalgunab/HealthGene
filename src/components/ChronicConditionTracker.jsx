/**
 * ChronicConditionTracker Component
 * Track ongoing medical conditions with status and review dates
 */

import React, { useState, useEffect } from 'react';
import { chronicConditionManager } from '../utils/firestoreHealthDataManager';
import {
  formatDate,
  formatDateForInput,
} from '../utils/healthDataValidation';

const ChronicConditionTracker = () => {
  const [loading, setLoading] = useState(false);
  const [conditions, setConditions] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('Active');

  const [formData, setFormData] = useState({
    conditionName: '',
    icd10Code: '',
    dateOfDiagnosis: '',
    status: 'Active',
    severity: 'Moderate',
    affectedOrgan: '',
    currentTreatment: '',
    doctor: { name: '', specialization: '' },
    lastReviewDate: '',
    nextReviewDate: '',
    complications: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const statusOptions = ['Active', 'In remission', 'Resolved'];
  const severityOptions = ['Mild', 'Moderate', 'Severe'];

  useEffect(() => {
    loadConditions();
  }, [filterStatus]);

  const loadConditions = async () => {
    try {
      setLoading(true);
      const data =
        filterStatus === 'Active'
          ? await chronicConditionManager.getActiveConditions()
          : await chronicConditionManager.getAllConditions();
      setConditions(data);
    } catch (err) {
      setError('Failed to load conditions: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.conditionName || formData.conditionName.trim().length < 2) {
      errors.conditionName = 'Condition name is required (minimum 2 characters)';
    }

    if (!formData.dateOfDiagnosis) {
      errors.dateOfDiagnosis = 'Date of diagnosis is required';
    } else if (new Date(formData.dateOfDiagnosis) > new Date()) {
      errors.dateOfDiagnosis = 'Date cannot be in the future';
    }

    if (!formData.status) {
      errors.status = 'Status is required';
    }

    if (!formData.severity) {
      errors.severity = 'Severity is required';
    }

    if (
      formData.lastReviewDate &&
      formData.nextReviewDate &&
      new Date(formData.lastReviewDate) >= new Date(formData.nextReviewDate)
    ) {
      errors.nextReviewDate = 'Next review date must be after last review date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleNestedChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
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
        complications: formData.complications
          .split(',')
          .map(c => c.trim())
          .filter(c => c),
      };

      if (editingId) {
        await chronicConditionManager.updateCondition(editingId, dataToSave);
        setSuccess('Condition updated successfully!');
      } else {
        await chronicConditionManager.addCondition(dataToSave);
        setSuccess('Condition added successfully!');
      }

      setFormData({
        conditionName: '',
        icd10Code: '',
        dateOfDiagnosis: '',
        status: 'Active',
        severity: 'Moderate',
        affectedOrgan: '',
        currentTreatment: '',
        doctor: { name: '', specialization: '' },
        lastReviewDate: '',
        nextReviewDate: '',
        complications: '',
        notes: '',
      });
      setEditingId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadConditions();
    } catch (err) {
      setError('Failed to save condition: ' + err.message);
    }
  };

  const handleEdit = (condition) => {
    setFormData({
      ...condition,
      doctor: condition.doctor || { name: '', specialization: '' },
      complications: (condition.complications || []).join(', '),
    });
    setEditingId(condition.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this condition?')) {
      try {
        await chronicConditionManager.deleteCondition(id);
        setSuccess('Condition deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadConditions();
      } catch (err) {
        setError('Failed to delete condition: ' + err.message);
      }
    }
  };

  const getSeverityColor = severity => {
    switch (severity) {
      case 'Mild':
        return '#10b981';
      case 'Moderate':
        return '#f59e0b';
      case 'Severe':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  const isReviewOverdue = nextReviewDate => {
    if (!nextReviewDate) return false;
    return new Date(nextReviewDate) < new Date();
  };

  return (
    <div className="chronic-condition-tracker">
      <style>{`
        .chronic-condition-tracker {
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

        .filter-tabs {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .filter-tab {
          padding: 8px 16px;
          border: 2px solid #e0e0e0;
          background: white;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        .filter-tab.active {
          border-color: #2563eb;
          background: #eff6ff;
          color: #2563eb;
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

        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 5px;
        }

        .conditions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .condition-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .condition-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .condition-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }

        .badges-row {
          display: flex;
          gap: 8px;
          margin-bottom: 15px;
          flex-wrap: wrap;
        }

        .badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .status-badge {
          background: #e0e7ff;
          color: #3730a3;
        }

        .severity-badge {
          color: white;
        }

        .overdue-badge {
          background: #fef2f2;
          color: #991b1b;
          border: 1px solid #fca5a5;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          padding: 8px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .info-label {
          font-weight: 500;
          color: #666;
        }

        .info-value {
          color: #333;
          text-align: right;
        }

        .complications-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0;
        }

        .complication-tag {
          background: #fef2f2;
          color: #991b1b;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 12px;
        }

        .card-actions {
          display: flex;
          gap: 8px;
          margin-top: 15px;
          padding-top: 15px;
          border-top: 1px solid #e0e0e0;
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
        <h1>🏥 Chronic Conditions</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              conditionName: '',
              icd10Code: '',
              dateOfDiagnosis: '',
              status: 'Active',
              severity: 'Moderate',
              affectedOrgan: '',
              currentTreatment: '',
              doctor: { name: '', specialization: '' },
              lastReviewDate: '',
              nextReviewDate: '',
              complications: '',
              notes: '',
            });
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Condition'}
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

      {showForm && (
        <div className="form-container">
          <h2 className="section-title">
            {editingId ? 'Edit Condition' : 'Add New Chronic Condition'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Condition Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Condition Name *</label>
                  <input
                    type="text"
                    name="conditionName"
                    value={formData.conditionName}
                    onChange={handleInputChange}
                    placeholder="e.g., Type 2 Diabetes"
                  />
                  {validationErrors.conditionName && (
                    <span className="error-message">{validationErrors.conditionName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>ICD-10 Code</label>
                  <input
                    type="text"
                    name="icd10Code"
                    value={formData.icd10Code}
                    onChange={handleInputChange}
                    placeholder="e.g., E11"
                  />
                </div>

                <div className="form-group">
                  <label>Date of Diagnosis *</label>
                  <input
                    type="date"
                    name="dateOfDiagnosis"
                    value={formatDateForInput(formData.dateOfDiagnosis)}
                    onChange={handleInputChange}
                  />
                  {validationErrors.dateOfDiagnosis && (
                    <span className="error-message">{validationErrors.dateOfDiagnosis}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    {statusOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {validationErrors.status && (
                    <span className="error-message">{validationErrors.status}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Severity *</label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleInputChange}
                  >
                    {severityOptions.map(opt => (
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
                  <label>Affected Organ</label>
                  <input
                    type="text"
                    name="affectedOrgan"
                    value={formData.affectedOrgan}
                    onChange={handleInputChange}
                    placeholder="e.g., Pancreas"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Treatment & Doctor</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Current Treatment</label>
                  <input
                    type="text"
                    name="currentTreatment"
                    value={formData.currentTreatment}
                    onChange={handleInputChange}
                    placeholder="e.g., Metformin, Insulin"
                  />
                </div>

                <div className="form-group">
                  <label>Doctor Name</label>
                  <input
                    type="text"
                    value={formData.doctor.name}
                    onChange={e => handleNestedChange('doctor', 'name', e.target.value)}
                    placeholder="Doctor name"
                  />
                </div>

                <div className="form-group">
                  <label>Doctor Specialization</label>
                  <input
                    type="text"
                    value={formData.doctor.specialization}
                    onChange={e =>
                      handleNestedChange('doctor', 'specialization', e.target.value)
                    }
                    placeholder="e.g., Endocrinologist"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Reviews & Follow-up</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Last Review Date</label>
                  <input
                    type="date"
                    name="lastReviewDate"
                    value={formatDateForInput(formData.lastReviewDate)}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label>Next Review Date</label>
                  <input
                    type="date"
                    name="nextReviewDate"
                    value={formatDateForInput(formData.nextReviewDate)}
                    onChange={handleInputChange}
                  />
                  {validationErrors.nextReviewDate && (
                    <span className="error-message">{validationErrors.nextReviewDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Complications (comma separated)</label>
                  <input
                    type="text"
                    name="complications"
                    value={formData.complications}
                    onChange={handleInputChange}
                    placeholder="e.g., Diabetic retinopathy, Neuropathy"
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
                {editingId ? 'Update Condition' : 'Add Condition'}
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

      <div className="filter-tabs">
        <div
          className={`filter-tab ${filterStatus === 'Active' ? 'active' : ''}`}
          onClick={() => setFilterStatus('Active')}
        >
          Active Only
        </div>
        <div
          className={`filter-tab ${filterStatus === 'All' ? 'active' : ''}`}
          onClick={() => setFilterStatus('All')}
        >
          All Conditions
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading chronic conditions...</div>
      ) : conditions.length === 0 ? (
        <div className="empty-state">
          <p>No chronic conditions recorded yet</p>
          <p>Add your chronic condition information for better health management</p>
        </div>
      ) : (
        <div className="conditions-grid">
          {conditions.map(condition => (
            <div key={condition.id} className="condition-card">
              <div className="condition-name">{condition.conditionName}</div>

              <div className="badges-row">
                <span className="badge status-badge">{condition.status}</span>
                <span
                  className="badge severity-badge"
                  style={{ backgroundColor: getSeverityColor(condition.severity) }}
                >
                  {condition.severity}
                </span>
                {condition.nextReviewDate && isReviewOverdue(condition.nextReviewDate) && (
                  <span className="badge overdue-badge">⚠️ Review Overdue</span>
                )}
              </div>

              {condition.icd10Code && (
                <div className="info-row">
                  <span className="info-label">ICD-10:</span>
                  <span className="info-value">{condition.icd10Code}</span>
                </div>
              )}

              <div className="info-row">
                <span className="info-label">Diagnosed:</span>
                <span className="info-value">{formatDate(condition.dateOfDiagnosis)}</span>
              </div>

              {condition.affectedOrgan && (
                <div className="info-row">
                  <span className="info-label">Affected Organ:</span>
                  <span className="info-value">{condition.affectedOrgan}</span>
                </div>
              )}

              {condition.currentTreatment && (
                <div className="info-row">
                  <span className="info-label">Treatment:</span>
                  <span className="info-value">{condition.currentTreatment}</span>
                </div>
              )}

              {condition.doctor?.name && (
                <div className="info-row">
                  <span className="info-label">Doctor:</span>
                  <span className="info-value">{condition.doctor.name}</span>
                </div>
              )}

              {condition.lastReviewDate && (
                <div className="info-row">
                  <span className="info-label">Last Review:</span>
                  <span className="info-value">{formatDate(condition.lastReviewDate)}</span>
                </div>
              )}

              {condition.nextReviewDate && (
                <div className="info-row">
                  <span className="info-label">Next Review:</span>
                  <span className="info-value">{formatDate(condition.nextReviewDate)}</span>
                </div>
              )}

              {condition.complications && condition.complications.length > 0 && (
                <>
                  <div className="info-row">
                    <span className="info-label">Complications:</span>
                  </div>
                  <div className="complications-list">
                    {condition.complications.map((comp, idx) => (
                      <div key={idx} className="complication-tag">
                        {comp}
                      </div>
                    ))}
                  </div>
                </>
              )}

              <div className="card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(condition)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(condition.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChronicConditionTracker;
