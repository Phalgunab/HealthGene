/**
 * HealthProfile Component
 * Central health profile with demographics and vital information
 * Allows users to enter and manage their core health information
 */

import React, { useState, useEffect } from 'react';
import { healthProfileManager } from '../utils/firestoreHealthDataManager';
import {
  validateDateOfBirth,
  validateHeight,
  validateWeight,
  validateBloodPressure,
  validateHeartRate,
  validateTemperature,
  validatePhoneNumber,
  validateEmail,
  calculateBMI,
  getBMICategory,
  calculateAge,
  formatDate,
  formatDateForInput,
} from '../utils/healthDataValidation';

const HealthProfile = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showVitals, setShowVitals] = useState(false);

  const [profile, setProfile] = useState({
    dateOfBirth: '',
    bloodType: 'O+',
    height: '',
    weight: '',
    gender: 'Male',
    maritalStatus: '',
    ethnicity: '',
    occupation: '',
    bloodPressure: { systolic: '', diastolic: '', date: '' },
    heartRate: '',
    temperature: '',
    emergencyContact: { name: '', phone: '', relation: '' },
    primaryPhysician: { name: '', phone: '', specialization: '' },
    insuranceProvider: '',
    policyNumber: '',
  });

  const [validationErrors, setValidationErrors] = useState({});

  const bloodTypeOptions = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      setLoading(true);
      const existingProfile = await healthProfileManager.getProfile();
      if (existingProfile) {
        setProfile(existingProfile);
      }
    } catch (err) {
      setError('Failed to load profile: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (profile.dateOfBirth) {
      const dobValidation = validateDateOfBirth(profile.dateOfBirth);
      if (!dobValidation.isValid) {
        errors.dateOfBirth = dobValidation.errors[0];
      }
    }

    if (profile.height) {
      const heightValidation = validateHeight(parseFloat(profile.height));
      if (!heightValidation.isValid) {
        errors.height = heightValidation.errors[0];
      }
    }

    if (profile.weight) {
      const weightValidation = validateWeight(parseFloat(profile.weight));
      if (!weightValidation.isValid) {
        errors.weight = weightValidation.errors[0];
      }
    }

    if (profile.bloodPressure.systolic || profile.bloodPressure.diastolic) {
      const bpValidation = validateBloodPressure(
        parseInt(profile.bloodPressure.systolic),
        parseInt(profile.bloodPressure.diastolic)
      );
      if (!bpValidation.isValid) {
        errors.bloodPressure = bpValidation.errors[0];
      }
    }

    if (profile.heartRate) {
      const hrValidation = validateHeartRate(parseInt(profile.heartRate));
      if (!hrValidation.isValid) {
        errors.heartRate = hrValidation.errors[0];
      }
    }

    if (profile.temperature) {
      const tempValidation = validateTemperature(parseFloat(profile.temperature));
      if (!tempValidation.isValid) {
        errors.temperature = tempValidation.errors[0];
      }
    }

    if (profile.emergencyContact.phone) {
      const phoneValidation = validatePhoneNumber(profile.emergencyContact.phone);
      if (!phoneValidation.isValid) {
        errors.emergencyPhone = phoneValidation.errors[0];
      }
    }

    if (profile.primaryPhysician.phone) {
      const phoneValidation = validatePhoneNumber(profile.primaryPhysician.phone);
      if (!phoneValidation.isValid) {
        errors.physicianPhone = phoneValidation.errors[0];
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
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
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      setError('Please fix validation errors');
      return;
    }

    try {
      setSaving(true);
      setError('');
      await healthProfileManager.upsertProfile(profile);
      setSuccess('Profile saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save profile: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const age = profile.dateOfBirth ? calculateAge(profile.dateOfBirth) : null;
  const bmi =
    profile.height && profile.weight
      ? calculateBMI(parseFloat(profile.weight), parseFloat(profile.height))
      : null;
  const bmiCategory = bmi ? getBMICategory(bmi) : null;

  if (loading) {
    return (
      <div className="health-profile-container">
        <div className="loading">Loading health profile...</div>
      </div>
    );
  }

  return (
    <div className="health-profile-container">
      <style>{`
        .health-profile-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
        }

        .profile-header {
          margin-bottom: 30px;
        }

        .profile-header h1 {
          font-size: 28px;
          color: #333;
          margin-bottom: 5px;
        }

        .profile-summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .summary-card {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 8px;
          border-left: 4px solid #2563eb;
        }

        .summary-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .summary-value {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .form-section {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 18px;
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
        .form-group select {
          padding: 10px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 14px;
          font-family: inherit;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }

        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 5px;
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

        .vital-toggle {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .btn {
          padding: 10px 20px;
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

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #333;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .form-row-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .nested-group {
          background: #f9f9f9;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #e0e0e0;
        }

        .nested-group-title {
          font-weight: 600;
          color: #333;
          margin-bottom: 10px;
          font-size: 14px;
        }

        .button-group {
          display: flex;
          gap: 10px;
          margin-top: 30px;
        }
      `}</style>

      <div className="profile-header">
        <h1>🏥 Health Profile</h1>
        <p>Manage your personal health information</p>
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

      <div className="profile-summary">
        {age !== null && (
          <div className="summary-card">
            <div className="summary-label">Age</div>
            <div className="summary-value">{age} years</div>
          </div>
        )}
        {bmi !== null && (
          <div className="summary-card">
            <div className="summary-label">BMI</div>
            <div className="summary-value">
              {bmi} ({bmiCategory})
            </div>
          </div>
        )}
        {profile.bloodType && (
          <div className="summary-card">
            <div className="summary-label">Blood Type</div>
            <div className="summary-value">{profile.bloodType}</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        {/* Basic Information */}
        <div className="form-section">
          <h2 className="section-title">Basic Information</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Date of Birth *</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formatDateForInput(profile.dateOfBirth)}
                onChange={handleProfileChange}
              />
              {validationErrors.dateOfBirth && (
                <span className="error-message">{validationErrors.dateOfBirth}</span>
              )}
            </div>

            <div className="form-group">
              <label>Gender</label>
              <select name="gender" value={profile.gender} onChange={handleProfileChange}>
                {genderOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Blood Type</label>
              <select
                name="bloodType"
                value={profile.bloodType}
                onChange={handleProfileChange}
              >
                {bloodTypeOptions.map(opt => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Marital Status</label>
              <input
                type="text"
                name="maritalStatus"
                value={profile.maritalStatus}
                onChange={handleProfileChange}
                placeholder="e.g., Single, Married, Divorced"
              />
            </div>

            <div className="form-group">
              <label>Ethnicity</label>
              <input
                type="text"
                name="ethnicity"
                value={profile.ethnicity}
                onChange={handleProfileChange}
                placeholder="e.g., Indian, European"
              />
            </div>

            <div className="form-group">
              <label>Occupation</label>
              <input
                type="text"
                name="occupation"
                value={profile.occupation}
                onChange={handleProfileChange}
                placeholder="Your profession"
              />
            </div>
          </div>
        </div>

        {/* Body Measurements */}
        <div className="form-section">
          <h2 className="section-title">Body Measurements</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Height (cm) *</label>
              <input
                type="number"
                name="height"
                step="0.1"
                value={profile.height}
                onChange={handleProfileChange}
                placeholder="150-200"
              />
              {validationErrors.height && (
                <span className="error-message">{validationErrors.height}</span>
              )}
            </div>

            <div className="form-group">
              <label>Weight (kg) *</label>
              <input
                type="number"
                name="weight"
                step="0.1"
                value={profile.weight}
                onChange={handleProfileChange}
                placeholder="40-150"
              />
              {validationErrors.weight && (
                <span className="error-message">{validationErrors.weight}</span>
              )}
            </div>
          </div>
        </div>

        {/* Vital Signs */}
        <div className="form-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
            <h2 className="section-title" style={{ margin: 0 }}>
              Vital Signs
            </h2>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowVitals(!showVitals)}
            >
              {showVitals ? 'Hide' : 'Show'}
            </button>
          </div>

          {showVitals && (
            <div className="form-grid">
              <div className="form-group">
                <label>Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={profile.bloodPressure.systolic}
                  onChange={e =>
                    handleNestedChange('bloodPressure', 'systolic', e.target.value)
                  }
                  placeholder="90-140"
                />
              </div>

              <div className="form-group">
                <label>Diastolic BP (mmHg)</label>
                <input
                  type="number"
                  value={profile.bloodPressure.diastolic}
                  onChange={e =>
                    handleNestedChange('bloodPressure', 'diastolic', e.target.value)
                  }
                  placeholder="60-90"
                />
              </div>

              <div className="form-group">
                <label>Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={profile.heartRate}
                  onChange={e => handleProfileChange({ target: { name: 'heartRate', value: e.target.value } })}
                  placeholder="60-100"
                />
                {validationErrors.heartRate && (
                  <span className="error-message">{validationErrors.heartRate}</span>
                )}
              </div>

              <div className="form-group">
                <label>Temperature (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={profile.temperature}
                  onChange={e => handleProfileChange({ target: { name: 'temperature', value: e.target.value } })}
                  placeholder="36.5-37.5"
                />
                {validationErrors.temperature && (
                  <span className="error-message">{validationErrors.temperature}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Emergency Contact */}
        <div className="form-section">
          <h2 className="section-title">Emergency Contact</h2>

          <div className="nested-group">
            <div className="nested-group-title">Contact Information</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={profile.emergencyContact.name}
                  onChange={e =>
                    handleNestedChange('emergencyContact', 'name', e.target.value)
                  }
                  placeholder="Contact person name"
                />
              </div>

              <div className="form-group">
                <label>Relationship</label>
                <input
                  type="text"
                  value={profile.emergencyContact.relation}
                  onChange={e =>
                    handleNestedChange('emergencyContact', 'relation', e.target.value)
                  }
                  placeholder="e.g., Spouse, Parent, Sibling"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profile.emergencyContact.phone}
                  onChange={e =>
                    handleNestedChange('emergencyContact', 'phone', e.target.value)
                  }
                  placeholder="Contact number"
                />
                {validationErrors.emergencyPhone && (
                  <span className="error-message">{validationErrors.emergencyPhone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Primary Physician */}
        <div className="form-section">
          <h2 className="section-title">Primary Physician</h2>

          <div className="nested-group">
            <div className="nested-group-title">Doctor Information</div>
            <div className="form-grid">
              <div className="form-group">
                <label>Doctor Name</label>
                <input
                  type="text"
                  value={profile.primaryPhysician.name}
                  onChange={e =>
                    handleNestedChange('primaryPhysician', 'name', e.target.value)
                  }
                  placeholder="Full name"
                />
              </div>

              <div className="form-group">
                <label>Specialization</label>
                <input
                  type="text"
                  value={profile.primaryPhysician.specialization}
                  onChange={e =>
                    handleNestedChange('primaryPhysician', 'specialization', e.target.value)
                  }
                  placeholder="e.g., General Practitioner, Cardiologist"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={profile.primaryPhysician.phone}
                  onChange={e =>
                    handleNestedChange('primaryPhysician', 'phone', e.target.value)
                  }
                  placeholder="Contact number"
                />
                {validationErrors.physicianPhone && (
                  <span className="error-message">{validationErrors.physicianPhone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Insurance Information */}
        <div className="form-section">
          <h2 className="section-title">Insurance Information</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Insurance Provider</label>
              <input
                type="text"
                name="insuranceProvider"
                value={profile.insuranceProvider}
                onChange={handleProfileChange}
                placeholder="Insurance company name"
              />
            </div>

            <div className="form-group">
              <label>Policy Number</label>
              <input
                type="text"
                name="policyNumber"
                value={profile.policyNumber}
                onChange={handleProfileChange}
                placeholder="Policy number"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="button-group">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default HealthProfile;
