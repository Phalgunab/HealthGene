/**
 * MedicationManager Component
 * Track all medications with dosage, frequency, and adherence
 */

import React, { useState, useEffect } from 'react';
import { medicationManager } from '../utils/firestoreHealthDataManager';
import {
  validateMedicationName,
  validateMedicationDosage,
  formatDate,
  formatDateForInput,
} from '../utils/healthDataValidation';

const MedicationManager = () => {
  const [loading, setLoading] = useState(false);
  const [medications, setMedications] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [filterActive, setFilterActive] = useState(true);

  const [formData, setFormData] = useState({
    medicationName: '',
    genericName: '',
    dosage: { value: '', unit: '' },
    frequency: 'Once daily',
    route: 'Oral',
    indication: '',
    startDate: '',
    endDate: '',
    prescribedBy: { name: '', specialization: '', date: '' },
    pharmacy: { name: '', phone: '', address: '' },
    refillsRemaining: '',
    nextRefillDate: '',
    sideEffects: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Every 4 hours',
    'Every 6 hours',
    'Every 8 hours',
    'Every 12 hours',
    'As needed',
    'Weekly',
    'Monthly',
  ];

  const routeOptions = ['Oral', 'Injection', 'Topical', 'Inhalation', 'Rectum', 'Sublingual'];
  const unitOptions = ['mg', 'g', 'mcg', 'ml', 'l', 'tablet', 'capsule', 'drop', 'units'];

  useEffect(() => {
    loadMedications();
  }, [filterActive]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = filterActive
        ? await medicationManager.getActiveMedications()
        : await medicationManager.getAllMedications();
      setMedications(data);
    } catch (err) {
      setError('Failed to load medications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    const nameValidation = validateMedicationName(formData.medicationName);
    if (!nameValidation.isValid) {
      errors.medicationName = nameValidation.errors[0];
    }

    const dosageValidation = validateMedicationDosage(
      parseFloat(formData.dosage.value),
      formData.dosage.unit
    );
    if (!dosageValidation.isValid) {
      errors.dosage = dosageValidation.errors[0];
    }

    if (!formData.frequency) {
      errors.frequency = 'Frequency is required';
    }

    if (!formData.route) {
      errors.route = 'Route is required';
    }

    if (!formData.startDate) {
      errors.startDate = 'Start date is required';
    } else if (new Date(formData.startDate) > new Date()) {
      errors.startDate = 'Start date cannot be in the future';
    }

    if (formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      errors.endDate = 'End date must be after start date';
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
        dosage: {
          ...formData.dosage,
          value: parseFloat(formData.dosage.value),
        },
        refillsRemaining: formData.refillsRemaining
          ? parseInt(formData.refillsRemaining)
          : null,
        sideEffects: formData.sideEffects
          .split(',')
          .map(s => s.trim())
          .filter(s => s),
      };

      if (editingId) {
        await medicationManager.updateMedication(editingId, dataToSave);
        setSuccess('Medication updated successfully!');
      } else {
        await medicationManager.addMedication(dataToSave);
        setSuccess('Medication added successfully!');
      }

      setFormData({
        medicationName: '',
        genericName: '',
        dosage: { value: '', unit: '' },
        frequency: 'Once daily',
        route: 'Oral',
        indication: '',
        startDate: '',
        endDate: '',
        prescribedBy: { name: '', specialization: '', date: '' },
        pharmacy: { name: '', phone: '', address: '' },
        refillsRemaining: '',
        nextRefillDate: '',
        sideEffects: '',
        notes: '',
      });
      setEditingId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadMedications();
    } catch (err) {
      setError('Failed to save medication: ' + err.message);
    }
  };

  const handleEdit = (medication) => {
    setFormData({
      ...medication,
      dosage: medication.dosage || { value: '', unit: '' },
      prescribedBy: medication.prescribedBy || { name: '', specialization: '', date: '' },
      pharmacy: medication.pharmacy || { name: '', phone: '', address: '' },
      sideEffects: (medication.sideEffects || []).join(', '),
      refillsRemaining: medication.refillsRemaining ? String(medication.refillsRemaining) : '',
    });
    setEditingId(medication.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this medication?')) {
      try {
        await medicationManager.deleteMedication(id);
        setSuccess('Medication deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadMedications();
      } catch (err) {
        setError('Failed to delete medication: ' + err.message);
      }
    }
  };

  const handleMarkAdherence = async (medicationId, date, taken) => {
    try {
      await medicationManager.logAdherence(medicationId, date, taken);
      setSuccess('Adherence logged!');
      setTimeout(() => setSuccess(''), 3000);
      loadMedications();
    } catch (err) {
      setError('Failed to log adherence: ' + err.message);
    }
  };

  return (
    <div className="medication-manager">
      <style>{`
        .medication-manager {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .manager-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
        }

        .manager-header h1 {
          font-size: 28px;
          color: #333;
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 10px;
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

        .medications-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 20px;
        }

        .medication-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
        }

        .medication-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .medication-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 5px;
        }

        .medication-generic {
          font-size: 12px;
          color: #666;
          margin-bottom: 10px;
          font-style: italic;
        }

        .dosage-badge {
          display: inline-block;
          background: #e0e7ff;
          color: #3730a3;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 10px;
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

        .active-badge {
          display: inline-block;
          background: #dcfce7;
          color: #166534;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .inactive-badge {
          display: inline-block;
          background: #f3f4f6;
          color: #6b7280;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 10px;
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

        .empty-state p {
          font-size: 16px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 600;
          color: #333;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 2px solid #e0e0e0;
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

      <div className="manager-header">
        <h1>💊 Medications</h1>
        <div className="header-actions">
          <button
            className="btn btn-primary"
            onClick={() => {
              setShowForm(!showForm);
              setEditingId(null);
              setFormData({
                medicationName: '',
                genericName: '',
                dosage: { value: '', unit: '' },
                frequency: 'Once daily',
                route: 'Oral',
                indication: '',
                startDate: '',
                endDate: '',
                prescribedBy: { name: '', specialization: '', date: '' },
                pharmacy: { name: '', phone: '', address: '' },
                refillsRemaining: '',
                nextRefillDate: '',
                sideEffects: '',
                notes: '',
              });
            }}
          >
            {showForm ? '✕ Cancel' : '+ Add Medication'}
          </button>
        </div>
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
            {editingId ? 'Edit Medication' : 'Add New Medication'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Basic Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Medication Name *</label>
                  <input
                    type="text"
                    name="medicationName"
                    value={formData.medicationName}
                    onChange={handleInputChange}
                    placeholder="e.g., Aspirin"
                  />
                  {validationErrors.medicationName && (
                    <span className="error-message">{validationErrors.medicationName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Generic Name</label>
                  <input
                    type="text"
                    name="genericName"
                    value={formData.genericName}
                    onChange={handleInputChange}
                    placeholder="e.g., Acetylsalicylic acid"
                  />
                </div>

                <div className="form-group">
                  <label>Dosage Value *</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.dosage.value}
                    onChange={e => handleNestedChange('dosage', 'value', e.target.value)}
                    placeholder="100"
                  />
                  {validationErrors.dosage && (
                    <span className="error-message">{validationErrors.dosage}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Unit *</label>
                  <select
                    value={formData.dosage.unit}
                    onChange={e => handleNestedChange('dosage', 'unit', e.target.value)}
                  >
                    <option value="">Select unit</option>
                    {unitOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Frequency *</label>
                  <select
                    name="frequency"
                    value={formData.frequency}
                    onChange={handleInputChange}
                  >
                    {frequencyOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Route *</label>
                  <select
                    name="route"
                    value={formData.route}
                    onChange={handleInputChange}
                  >
                    {routeOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Dates & Refills</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formatDateForInput(formData.startDate)}
                    onChange={handleInputChange}
                  />
                  {validationErrors.startDate && (
                    <span className="error-message">{validationErrors.startDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>End Date (if discontinued)</label>
                  <input
                    type="date"
                    name="endDate"
                    value={formatDateForInput(formData.endDate)}
                    onChange={handleInputChange}
                  />
                  {validationErrors.endDate && (
                    <span className="error-message">{validationErrors.endDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Refills Remaining</label>
                  <input
                    type="number"
                    name="refillsRemaining"
                    value={formData.refillsRemaining}
                    onChange={handleInputChange}
                    placeholder="0"
                  />
                </div>

                <div className="form-group">
                  <label>Next Refill Date</label>
                  <input
                    type="date"
                    name="nextRefillDate"
                    value={formatDateForInput(formData.nextRefillDate)}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Additional Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Indication (Why taking it)</label>
                  <input
                    type="text"
                    name="indication"
                    value={formData.indication}
                    onChange={handleInputChange}
                    placeholder="e.g., Heart disease prevention"
                  />
                </div>

                <div className="form-group">
                  <label>Side Effects (comma separated)</label>
                  <input
                    type="text"
                    name="sideEffects"
                    value={formData.sideEffects}
                    onChange={handleInputChange}
                    placeholder="e.g., Nausea, Dizziness"
                  />
                </div>

                <div className="form-group">
                  <label>Doctor Name</label>
                  <input
                    type="text"
                    value={formData.prescribedBy.name}
                    onChange={e =>
                      handleNestedChange('prescribedBy', 'name', e.target.value)
                    }
                    placeholder="Doctor name"
                  />
                </div>

                <div className="form-group">
                  <label>Pharmacy Name</label>
                  <input
                    type="text"
                    value={formData.pharmacy.name}
                    onChange={e =>
                      handleNestedChange('pharmacy', 'name', e.target.value)
                    }
                    placeholder="Pharmacy name"
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
                {editingId ? 'Update Medication' : 'Add Medication'}
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
          className={`filter-tab ${filterActive ? 'active' : ''}`}
          onClick={() => setFilterActive(true)}
        >
          Active ({medications.filter(m => m.active).length})
        </div>
        <div
          className={`filter-tab ${!filterActive ? 'active' : ''}`}
          onClick={() => setFilterActive(false)}
        >
          All ({medications.length})
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading medications...</div>
      ) : medications.length === 0 ? (
        <div className="empty-state">
          <p>No medications recorded yet</p>
          <p>Add your first medication to get started</p>
        </div>
      ) : (
        <div className="medications-grid">
          {medications.map(med => (
            <div key={med.id} className="medication-card">
              <div className="medication-name">{med.medicationName}</div>
              {med.genericName && (
                <div className="medication-generic">{med.genericName}</div>
              )}

              <span className={med.active ? 'active-badge' : 'inactive-badge'}>
                {med.active ? 'Active' : 'Discontinued'}
              </span>

              <div className="dosage-badge">
                {med.dosage?.value} {med.dosage?.unit}
              </div>

              <div className="info-row">
                <span className="info-label">Frequency:</span>
                <span className="info-value">{med.frequency}</span>
              </div>

              <div className="info-row">
                <span className="info-label">Route:</span>
                <span className="info-value">{med.route}</span>
              </div>

              {med.indication && (
                <div className="info-row">
                  <span className="info-label">Indication:</span>
                  <span className="info-value">{med.indication}</span>
                </div>
              )}

              {med.startDate && (
                <div className="info-row">
                  <span className="info-label">Started:</span>
                  <span className="info-value">{formatDate(med.startDate)}</span>
                </div>
              )}

              {med.refillsRemaining !== undefined && (
                <div className="info-row">
                  <span className="info-label">Refills:</span>
                  <span className="info-value">{med.refillsRemaining} left</span>
                </div>
              )}

              <div className="card-actions">
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleEdit(med)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleDelete(med.id)}
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

export default MedicationManager;
