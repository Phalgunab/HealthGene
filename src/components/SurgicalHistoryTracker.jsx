/**
 * SurgicalHistoryTracker Component
 * Track all surgeries with dates, outcomes, and recovery information
 */

import React, { useState, useEffect } from 'react';
import { surgeryManager } from '../utils/firestoreHealthDataManager';
import {
  formatDate,
  formatDateForInput,
} from '../utils/healthDataValidation';

const SurgicalHistoryTracker = () => {
  const [loading, setLoading] = useState(false);
  const [surgeries, setSurgeries] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    surgeryName: '',
    date: '',
    hospital: { name: '', city: '', country: '' },
    surgeon: { name: '', specialization: '' },
    indication: '',
    duration: '',
    anesthesia: '',
    outcome: 'Successful',
    complications: '',
    recovery: { startDate: '', endDate: '', notes: '' },
    followUpDate: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const anesthesiaTypes = ['General', 'Local', 'Regional', 'Spinal', 'Epidural'];
  const outcomeOptions = ['Successful', 'Partial', 'Complicated'];

  useEffect(() => {
    loadSurgeries();
  }, []);

  const loadSurgeries = async () => {
    try {
      setLoading(true);
      const data = await surgeryManager.getAllSurgeries();
      setSurgeries(data);
    } catch (err) {
      setError('Failed to load surgeries: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.surgeryName || formData.surgeryName.trim().length < 2) {
      errors.surgeryName = 'Surgery name is required (minimum 2 characters)';
    }

    if (!formData.date) {
      errors.date = 'Surgery date is required';
    } else if (new Date(formData.date) > new Date()) {
      errors.date = 'Surgery date cannot be in the future';
    }

    if (!formData.hospital.name) {
      errors.hospitalName = 'Hospital name is required';
    }

    if (!formData.surgeon.name) {
      errors.surgeonName = 'Surgeon name is required';
    }

    if (formData.duration && (isNaN(parseInt(formData.duration)) || parseInt(formData.duration) <= 0)) {
      errors.duration = 'Duration must be a positive number';
    }

    if (
      formData.recovery.startDate &&
      formData.recovery.endDate &&
      new Date(formData.recovery.startDate) >= new Date(formData.recovery.endDate)
    ) {
      errors.recoveryEnd = 'Recovery end date must be after start date';
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
        duration: formData.duration ? parseInt(formData.duration) : null,
        complications: formData.complications
          .split(',')
          .map(c => c.trim())
          .filter(c => c),
      };

      if (editingId) {
        await surgeryManager.updateSurgery(editingId, dataToSave);
        setSuccess('Surgery record updated successfully!');
      } else {
        await surgeryManager.addSurgery(dataToSave);
        setSuccess('Surgery record added successfully!');
      }

      setFormData({
        surgeryName: '',
        date: '',
        hospital: { name: '', city: '', country: '' },
        surgeon: { name: '', specialization: '' },
        indication: '',
        duration: '',
        anesthesia: '',
        outcome: 'Successful',
        complications: '',
        recovery: { startDate: '', endDate: '', notes: '' },
        followUpDate: '',
        notes: '',
      });
      setEditingId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadSurgeries();
    } catch (err) {
      setError('Failed to save surgery record: ' + err.message);
    }
  };

  const handleEdit = (surgery) => {
    setFormData({
      ...surgery,
      duration: surgery.duration ? String(surgery.duration) : '',
      hospital: surgery.hospital || { name: '', city: '', country: '' },
      surgeon: surgery.surgeon || { name: '', specialization: '' },
      recovery: surgery.recovery || { startDate: '', endDate: '', notes: '' },
      complications: (surgery.complications || []).join(', '),
    });
    setEditingId(surgery.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this surgery record?')) {
      try {
        await surgeryManager.deleteSurgery(id);
        setSuccess('Surgery record deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadSurgeries();
      } catch (err) {
        setError('Failed to delete surgery record: ' + err.message);
      }
    }
  };

  const getOutcomeColor = outcome => {
    switch (outcome) {
      case 'Successful':
        return '#10b981';
      case 'Partial':
        return '#f59e0b';
      case 'Complicated':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="surgical-history-tracker">
      <style>{`
        .surgical-history-tracker {
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

        .surgeries-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .surgery-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .surgery-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .surgery-name {
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
          color: white;
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

        .nested-section {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
          margin-bottom: 15px;
        }

        .nested-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
          font-size: 14px;
        }
      `}</style>

      <div className="tracker-header">
        <h1>🏥 Surgical History</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              surgeryName: '',
              date: '',
              hospital: { name: '', city: '', country: '' },
              surgeon: { name: '', specialization: '' },
              indication: '',
              duration: '',
              anesthesia: '',
              outcome: 'Successful',
              complications: '',
              recovery: { startDate: '', endDate: '', notes: '' },
              followUpDate: '',
              notes: '',
            });
          }}
        >
          {showForm ? '✕ Cancel' : '+ Add Surgery'}
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
            {editingId ? 'Edit Surgery Record' : 'Add New Surgery'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Surgery Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Surgery Name *</label>
                  <input
                    type="text"
                    name="surgeryName"
                    value={formData.surgeryName}
                    onChange={handleInputChange}
                    placeholder="e.g., Appendectomy"
                  />
                  {validationErrors.surgeryName && (
                    <span className="error-message">{validationErrors.surgeryName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Surgery Date *</label>
                  <input
                    type="date"
                    name="date"
                    value={formatDateForInput(formData.date)}
                    onChange={handleInputChange}
                  />
                  {validationErrors.date && (
                    <span className="error-message">{validationErrors.date}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Outcome</label>
                  <select
                    name="outcome"
                    value={formData.outcome}
                    onChange={handleInputChange}
                  >
                    {outcomeOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Duration (minutes)</label>
                  <input
                    type="number"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="60"
                  />
                  {validationErrors.duration && (
                    <span className="error-message">{validationErrors.duration}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Anesthesia Type</label>
                  <select
                    name="anesthesia"
                    value={formData.anesthesia}
                    onChange={handleInputChange}
                  >
                    <option value="">Select anesthesia</option>
                    {anesthesiaTypes.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Indication (Reason for surgery)</label>
                  <input
                    type="text"
                    name="indication"
                    value={formData.indication}
                    onChange={handleInputChange}
                    placeholder="e.g., Acute appendicitis"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="nested-section">
                <div className="nested-title">Hospital Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Hospital Name *</label>
                    <input
                      type="text"
                      value={formData.hospital.name}
                      onChange={e => handleNestedChange('hospital', 'name', e.target.value)}
                      placeholder="Hospital name"
                    />
                    {validationErrors.hospitalName && (
                      <span className="error-message">{validationErrors.hospitalName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>City</label>
                    <input
                      type="text"
                      value={formData.hospital.city}
                      onChange={e => handleNestedChange('hospital', 'city', e.target.value)}
                      placeholder="City"
                    />
                  </div>

                  <div className="form-group">
                    <label>Country</label>
                    <input
                      type="text"
                      value={formData.hospital.country}
                      onChange={e =>
                        handleNestedChange('hospital', 'country', e.target.value)
                      }
                      placeholder="Country"
                    />
                  </div>
                </div>
              </div>

              <div className="nested-section">
                <div className="nested-title">Surgeon Information</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Surgeon Name *</label>
                    <input
                      type="text"
                      value={formData.surgeon.name}
                      onChange={e => handleNestedChange('surgeon', 'name', e.target.value)}
                      placeholder="Surgeon name"
                    />
                    {validationErrors.surgeonName && (
                      <span className="error-message">{validationErrors.surgeonName}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Specialization</label>
                    <input
                      type="text"
                      value={formData.surgeon.specialization}
                      onChange={e =>
                        handleNestedChange('surgeon', 'specialization', e.target.value)
                      }
                      placeholder="e.g., General Surgery"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Recovery & Follow-up</h3>
              <div className="nested-section">
                <div className="nested-title">Recovery Details</div>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Recovery Start Date</label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.recovery.startDate)}
                      onChange={e =>
                        handleNestedChange('recovery', 'startDate', e.target.value)
                      }
                    />
                  </div>

                  <div className="form-group">
                    <label>Recovery End Date</label>
                    <input
                      type="date"
                      value={formatDateForInput(formData.recovery.endDate)}
                      onChange={e => handleNestedChange('recovery', 'endDate', e.target.value)}
                    />
                    {validationErrors.recoveryEnd && (
                      <span className="error-message">{validationErrors.recoveryEnd}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Follow-up Date</label>
                    <input
                      type="date"
                      name="followUpDate"
                      value={formatDateForInput(formData.followUpDate)}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Recovery Notes</label>
                  <textarea
                    value={formData.recovery.notes}
                    onChange={e => handleNestedChange('recovery', 'notes', e.target.value)}
                    placeholder="Recovery progress and observations"
                    rows="2"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Complications (comma separated)</label>
                <input
                  type="text"
                  name="complications"
                  value={formData.complications}
                  onChange={handleInputChange}
                  placeholder="e.g., Infection, Bleeding"
                />
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Additional notes about the surgery"
                  rows="3"
                />
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Surgery Record' : 'Add Surgery Record'}
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
        <div className="loading">Loading surgical history...</div>
      ) : surgeries.length === 0 ? (
        <div className="empty-state">
          <p>No surgeries recorded yet</p>
          <p>Add your surgical history for comprehensive health records</p>
        </div>
      ) : (
        <div className="surgeries-grid">
          {surgeries.map(surgery => (
            <div key={surgery.id} className="surgery-card">
              <div className="surgery-name">{surgery.surgeryName}</div>

              <div className="badges-row">
                <span
                  className="badge"
                  style={{ backgroundColor: getOutcomeColor(surgery.outcome) }}
                >
                  {surgery.outcome}
                </span>
              </div>

              <div className="info-row">
                <span className="info-label">Date:</span>
                <span className="info-value">{formatDate(surgery.date)}</span>
              </div>

              {surgery.indication && (
                <div className="info-row">
                  <span className="info-label">Indication:</span>
                  <span className="info-value">{surgery.indication}</span>
                </div>
              )}

              {surgery.hospital?.name && (
                <div className="info-row">
                  <span className="info-label">Hospital:</span>
                  <span className="info-value">
                    {surgery.hospital.name}
                    {surgery.hospital.city && ` - ${surgery.hospital.city}`}
                  </span>
                </div>
              )}

              {surgery.surgeon?.name && (
                <div className="info-row">
                  <span className="info-label">Surgeon:</span>
                  <span className="info-value">{surgery.surgeon.name}</span>
                </div>
              )}

              {surgery.duration && (
                <div className="info-row">
                  <span className="info-label">Duration:</span>
                  <span className="info-value">{surgery.duration} minutes</span>
                </div>
              )}

              {surgery.anesthesia && (
                <div className="info-row">
                  <span className="info-label">Anesthesia:</span>
                  <span className="info-value">{surgery.anesthesia}</span>
                </div>
              )}

              {surgery.recovery?.endDate && (
                <div className="info-row">
                  <span className="info-label">Recovery Completed:</span>
                  <span className="info-value">{formatDate(surgery.recovery.endDate)}</span>
                </div>
              )}

              {surgery.complications && surgery.complications.length > 0 && (
                <>
                  <div className="info-row">
                    <span className="info-label">Complications:</span>
                  </div>
                  <div className="complications-list">
                    {surgery.complications.map((comp, idx) => (
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
                  onClick={() => handleEdit(surgery)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(surgery.id)}
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

export default SurgicalHistoryTracker;
