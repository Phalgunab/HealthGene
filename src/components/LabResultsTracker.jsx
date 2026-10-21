import React, { useState, useEffect } from 'react';
import { labResultManager } from '../utils/firestoreHealthDataManager';
import { validateLabResult } from '../utils/healthDataValidation';
import '../styles/LabResultsTracker.css';

const LabResultsTracker = ({ userId }) => {
  const [labResults, setLabResults] = useState([]);
  const [formData, setFormData] = useState({
    testName: '',
    testDate: '',
    value: '',
    unit: '',
    referenceMin: '',
    referenceMax: '',
    status: 'normal',
    notes: '',
    loincCode: '',
    attachmentUrl: '',
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filterTab, setFilterTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const commonLabTests = [
    { name: 'Complete Blood Count (CBC)', loincCode: '58410-2', units: ['cells/µL', 'g/dL', '%'] },
    { name: 'Blood Glucose', loincCode: '2345-7', units: ['mg/dL', 'mmol/L'] },
    { name: 'Total Cholesterol', loincCode: '2093-3', units: ['mg/dL', 'mmol/L'] },
    { name: 'Triglycerides', loincCode: '2571-8', units: ['mg/dL', 'mmol/L'] },
    { name: 'HDL Cholesterol', loincCode: '2085-9', units: ['mg/dL', 'mmol/L'] },
    { name: 'LDL Cholesterol', loincCode: '2089-1', units: ['mg/dL', 'mmol/L'] },
    { name: 'Creatinine', loincCode: '2160-0', units: ['mg/dL', 'µmol/L'] },
    { name: 'BUN (Blood Urea Nitrogen)', loincCode: '3094-0', units: ['mg/dL', 'mmol/L'] },
    { name: 'Sodium', loincCode: '2951-2', units: ['mEq/L', 'mmol/L'] },
    { name: 'Potassium', loincCode: '2823-3', units: ['mEq/L', 'mmol/L'] },
    { name: 'Calcium', loincCode: '2000-8', units: ['mg/dL', 'mmol/L'] },
    { name: 'Magnesium', loincCode: '2635-8', units: ['mg/dL', 'mmol/L'] },
    { name: 'Phosphorus', loincCode: '2777-7', units: ['mg/dL', 'mmol/L'] },
    { name: 'AST (Aspartate Aminotransferase)', loincCode: '1920-8', units: ['U/L'] },
    { name: 'ALT (Alanine Aminotransferase)', loincCode: '1742-6', units: ['U/L'] },
    { name: 'Alkaline Phosphatase', loincCode: '1994-3', units: ['U/L'] },
    { name: 'Bilirubin, Total', loincCode: '1975-2', units: ['mg/dL', 'µmol/L'] },
    { name: 'Albumin', loincCode: '1863-0', units: ['g/dL', 'g/L'] },
    { name: 'TSH (Thyroid Stimulating Hormone)', loincCode: '3016-3', units: ['mIU/L', 'mU/L'] },
    { name: 'Free T4', loincCode: '3024-7', units: ['ng/dL', 'pmol/L'] },
    { name: 'Hemoglobin A1c', loincCode: '4548-4', units: ['%', 'mmol/mol'] },
  ];

  const referenceRanges = {
    'Complete Blood Count (CBC)': { min: 0, max: 10, unit: 'cells/µL' },
    'Blood Glucose': { min: 70, max: 100, unit: 'mg/dL' },
    'Total Cholesterol': { min: 0, max: 200, unit: 'mg/dL' },
    'Triglycerides': { min: 0, max: 150, unit: 'mg/dL' },
    'HDL Cholesterol': { min: 40, max: 300, unit: 'mg/dL' },
    'LDL Cholesterol': { min: 0, max: 100, unit: 'mg/dL' },
    'Creatinine': { min: 0.7, max: 1.3, unit: 'mg/dL' },
    'BUN (Blood Urea Nitrogen)': { min: 7, max: 20, unit: 'mg/dL' },
    'Sodium': { min: 136, max: 145, unit: 'mEq/L' },
    'Potassium': { min: 3.5, max: 5.0, unit: 'mEq/L' },
    'Calcium': { min: 8.5, max: 10.2, unit: 'mg/dL' },
    'Magnesium': { min: 1.7, max: 2.2, unit: 'mg/dL' },
    'Phosphorus': { min: 2.5, max: 4.5, unit: 'mg/dL' },
    'AST (Aspartate Aminotransferase)': { min: 10, max: 40, unit: 'U/L' },
    'ALT (Alanine Aminotransferase)': { min: 7, max: 56, unit: 'U/L' },
    'Alkaline Phosphatase': { min: 30, max: 120, unit: 'U/L' },
    'Bilirubin, Total': { min: 0.1, max: 1.2, unit: 'mg/dL' },
    'Albumin': { min: 3.5, max: 5.0, unit: 'g/dL' },
    'TSH (Thyroid Stimulating Hormone)': { min: 0.4, max: 4.0, unit: 'mIU/L' },
    'Free T4': { min: 0.8, max: 1.8, unit: 'ng/dL' },
    'Hemoglobin A1c': { min: 0, max: 5.6, unit: '%' },
  };

  useEffect(() => {
    if (userId) {
      fetchLabResults();
    }
  }, [userId]);

  const fetchLabResults = async () => {
    try {
      setLoading(true);
      const results = await labResultManager.getAll(userId);
      setLabResults(results);
      setError('');
    } catch (err) {
      setError('Failed to fetch lab results: ' + err.message);
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestNameChange = (e) => {
    const testName = e.target.value;
    setFormData(prev => {
      const newData = { ...prev, testName };
      
      const selectedTest = commonLabTests.find(t => t.name === testName);
      if (selectedTest) {
        newData.loincCode = selectedTest.loincCode;
        const range = referenceRanges[testName];
        if (range) {
          newData.referenceMin = range.min;
          newData.referenceMax = range.max;
          newData.unit = range.unit;
        }
      }
      
      return newData;
    });
  };

  const detectAbnormalStatus = (value, min, max) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return 'normal';
    
    if (numValue < min) return 'low';
    if (numValue > max) return 'high';
    return 'normal';
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      if (name === 'value' && newData.referenceMin && newData.referenceMax) {
        newData.status = detectAbnormalStatus(
          value,
          parseFloat(newData.referenceMin),
          parseFloat(newData.referenceMax)
        );
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const validation = validateLabResult(formData);
    if (!validation.isValid) {
      setError(validation.errors.join(', '));
      return;
    }

    try {
      setLoading(true);
      
      const dataToSave = {
        testName: formData.testName,
        testDate: formData.testDate,
        value: parseFloat(formData.value),
        unit: formData.unit,
        referenceMin: parseFloat(formData.referenceMin),
        referenceMax: parseFloat(formData.referenceMax),
        status: formData.status,
        notes: formData.notes,
        loincCode: formData.loincCode,
        attachmentUrl: formData.attachmentUrl,
        createdAt: new Date().toISOString(),
      };

      if (editingId) {
        await labResultManager.update(userId, editingId, dataToSave);
        setSuccess('Lab result updated successfully!');
      } else {
        await labResultManager.add(userId, dataToSave);
        setSuccess('Lab result added successfully!');
      }

      setFormData({
        testName: '',
        testDate: '',
        value: '',
        unit: '',
        referenceMin: '',
        referenceMax: '',
        status: 'normal',
        notes: '',
        loincCode: '',
        attachmentUrl: '',
      });
      setEditingId(null);
      
      await fetchLabResults();
    } catch (err) {
      setError('Failed to save lab result: ' + err.message);
      console.error('Save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (result) => {
    setFormData({
      testName: result.testName,
      testDate: result.testDate,
      value: result.value.toString(),
      unit: result.unit,
      referenceMin: result.referenceMin.toString(),
      referenceMax: result.referenceMax.toString(),
      status: result.status,
      notes: result.notes || '',
      loincCode: result.loincCode || '',
      attachmentUrl: result.attachmentUrl || '',
    });
    setEditingId(result.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this lab result?')) {
      try {
        setLoading(true);
        await labResultManager.delete(userId, id);
        setSuccess('Lab result deleted successfully!');
        await fetchLabResults();
      } catch (err) {
        setError('Failed to delete lab result: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      testName: '',
      testDate: '',
      value: '',
      unit: '',
      referenceMin: '',
      referenceMax: '',
      status: 'normal',
      notes: '',
      loincCode: '',
      attachmentUrl: '',
    });
    setEditingId(null);
  };

  const filteredResults = labResults.filter(result => {
    const matchesTab =
      filterTab === 'all' ||
      (filterTab === 'abnormal' && result.status !== 'normal') ||
      (filterTab === 'normal' && result.status === 'normal') ||
      (filterTab === 'recent' && new Date(result.testDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));

    const matchesSearch =
      result.testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.loincCode.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesTab && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'high': return '#e74c3c';
      case 'low': return '#f39c12';
      case 'normal': return '#27ae60';
      default: return '#95a5a6';
    }
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const abnormalCount = labResults.filter(r => r.status !== 'normal').length;
  const completionPercentage = labResults.length > 0 ? 100 : 0;

  return (
    <div className="lab-results-tracker">
      <div className="tracker-header">
        <h2>Lab Results Tracker</h2>
        <div className="stats-overview">
          <div className="stat-card">
            <span className="stat-label">Total Results</span>
            <span className="stat-value">{labResults.length}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Abnormal Results</span>
            <span className="stat-value" style={{ color: abnormalCount > 0 ? '#e74c3c' : '#27ae60' }}>
              {abnormalCount}
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Data Completeness</span>
            <span className="stat-value">{completionPercentage}%</span>
          </div>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <div className="form-section">
        <h3>{editingId ? 'Edit Lab Result' : 'Add New Lab Result'}</h3>
        <form onSubmit={handleSubmit} className="lab-result-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="testName">Test Name *</label>
              <select
                id="testName"
                name="testName"
                value={formData.testName}
                onChange={handleTestNameChange}
                required
              >
                <option value="">Select a test or enter custom name</option>
                {commonLabTests.map((test, idx) => (
                  <option key={idx} value={test.name}>{test.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="testDate">Test Date *</label>
              <input
                type="date"
                id="testDate"
                name="testDate"
                value={formData.testDate}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="value">Value *</label>
              <input
                type="number"
                id="value"
                name="value"
                value={formData.value}
                onChange={handleInputChange}
                step="0.01"
                placeholder="Enter numeric value"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="unit">Unit *</label>
              <input
                type="text"
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleInputChange}
                placeholder="e.g., mg/dL, U/L"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="referenceMin">Reference Min *</label>
              <input
                type="number"
                id="referenceMin"
                name="referenceMin"
                value={formData.referenceMin}
                onChange={handleInputChange}
                step="0.01"
                placeholder="Minimum normal value"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="referenceMax">Reference Max *</label>
              <input
                type="number"
                id="referenceMax"
                name="referenceMax"
                value={formData.referenceMax}
                onChange={handleInputChange}
                step="0.01"
                placeholder="Maximum normal value"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="loincCode">LOINC Code</label>
              <input
                type="text"
                id="loincCode"
                name="loincCode"
                value={formData.loincCode}
                onChange={handleInputChange}
                placeholder="e.g., 2345-7"
              />
            </div>
            <div className="form-group">
              <label htmlFor="attachmentUrl">Report URL</label>
              <input
                type="url"
                id="attachmentUrl"
                name="attachmentUrl"
                value={formData.attachmentUrl}
                onChange={handleInputChange}
                placeholder="Link to lab report PDF"
              />
            </div>
          </div>

          <div className="form-group full-width">
            <label htmlFor="notes">Notes</label>
            <textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows="3"
              placeholder="Additional observations or doctor recommendations..."
            />
          </div>

          <div className="status-display">
            <span>Status: </span>
            <span
              className="status-badge"
              style={{
                backgroundColor: getStatusColor(formData.status),
                color: 'white',
              }}
            >
              {getStatusLabel(formData.status)}
            </span>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving...' : editingId ? 'Update Result' : 'Add Result'}
            </button>
            {editingId && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="results-section">
        <h3>Lab Results History</h3>

        <div className="filter-controls">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search by test name or LOINC code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-tabs">
            <button
              className={`filter-tab ${filterTab === 'all' ? 'active' : ''}`}
              onClick={() => setFilterTab('all')}
            >
              All ({labResults.length})
            </button>
            <button
              className={`filter-tab ${filterTab === 'abnormal' ? 'active' : ''}`}
              onClick={() => setFilterTab('abnormal')}
            >
              Abnormal ({abnormalCount})
            </button>
            <button
              className={`filter-tab ${filterTab === 'normal' ? 'active' : ''}`}
              onClick={() => setFilterTab('normal')}
            >
              Normal ({labResults.length - abnormalCount})
            </button>
            <button
              className={`filter-tab ${filterTab === 'recent' ? 'active' : ''}`}
              onClick={() => setFilterTab('recent')}
            >
              Last 30 Days
            </button>
          </div>
        </div>

        {loading && !labResults.length ? (
          <div className="loading-state">Loading lab results...</div>
        ) : filteredResults.length === 0 ? (
          <div className="empty-state">
            <p>No lab results found. {searchTerm && 'Try a different search term or '}Add your first lab result above!</p>
          </div>
        ) : (
          <div className="results-grid">
            {filteredResults.map((result) => (
              <div
                key={result.id}
                className="result-card"
                style={{
                  borderLeftColor: getStatusColor(result.status),
                }}
              >
                <div className="card-header">
                  <div className="test-info">
                    <h4>{result.testName}</h4>
                    <p className="test-date">
                      {new Date(result.testDate).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(result.status),
                      color: 'white',
                    }}
                  >
                    {getStatusLabel(result.status)}
                  </span>
                </div>

                <div className="card-body">
                  <div className="result-value">
                    <span className="label">Result:</span>
                    <span className="value">
                      {result.value} {result.unit}
                    </span>
                  </div>

                  <div className="reference-range">
                    <span className="label">Reference Range:</span>
                    <span className="value">
                      {result.referenceMin} - {result.referenceMax} {result.unit}
                    </span>
                  </div>

                  {result.loincCode && (
                    <div className="loinc-code">
                      <span className="label">LOINC:</span>
                      <span className="value">{result.loincCode}</span>
                    </div>
                  )}

                  {result.notes && (
                    <div className="notes">
                      <span className="label">Notes:</span>
                      <p>{result.notes}</p>
                    </div>
                  )}

                  {result.attachmentUrl && (
                    <div className="attachment">
                      <a
                        href={result.attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="attachment-link"
                      >
                        📄 View Lab Report
                      </a>
                    </div>
                  )}
                </div>

                <div className="card-footer">
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(result)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(result.id)}
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LabResultsTracker;
