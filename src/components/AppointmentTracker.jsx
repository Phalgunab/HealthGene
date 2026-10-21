/**
 * AppointmentTracker Component
 * Track doctor appointments, findings, and follow-ups
 */

import React, { useState, useEffect } from 'react';
import { appointmentManager } from '../utils/firestoreHealthDataManager';
import {
  formatDate,
  formatDateForInput,
  validateFutureDate,
} from '../utils/healthDataValidation';

const AppointmentTracker = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState([]);
  const [upcomingOnly, setUpcomingOnly] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    doctorName: '',
    specialization: '',
    hospital: { name: '', city: '', address: '', phone: '' },
    appointmentDate: '',
    appointmentTime: '',
    reason: '',
    findings: '',
    diagnosis: '',
    prescriptions: '',
    labOrders: '',
    nextAppointmentDate: '',
    notes: '',
    attended: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const specializationOptions = [
    'General Practitioner',
    'Cardiologist',
    'Dermatologist',
    'Gastroenterologist',
    'Orthopedist',
    'Neurologist',
    'Endocrinologist',
    'Pediatrician',
    'Psychiatrist',
    'Pulmonologist',
    'Other',
  ];

  useEffect(() => {
    loadAppointments();
  }, [upcomingOnly]);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      let data;
      if (upcomingOnly) {
        data = await appointmentManager.getUpcomingAppointments();
      } else {
        data = await appointmentManager.getAllAppointments();
      }
      setAppointments(data);
    } catch (err) {
      setError('Failed to load appointments: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.doctorName || formData.doctorName.trim().length < 2) {
      errors.doctorName = 'Doctor name is required (minimum 2 characters)';
    }

    if (!formData.specialization) {
      errors.specialization = 'Specialization is required';
    }

    if (!formData.hospital.name) {
      errors.hospitalName = 'Hospital/Clinic name is required';
    }

    if (!formData.appointmentDate) {
      errors.appointmentDate = 'Appointment date is required';
    } else {
      const dateValidation = validateFutureDate(formData.appointmentDate);
      if (!dateValidation.isValid && !editingId) {
        errors.appointmentDate = dateValidation.errors[0];
      }
    }

    if (!formData.appointmentTime) {
      errors.appointmentTime = 'Appointment time is required';
    } else if (!/^\d{2}:\d{2}$/.test(formData.appointmentTime)) {
      errors.appointmentTime = 'Time must be in HH:MM format';
    }

    if (!formData.reason) {
      errors.reason = 'Reason for appointment is required';
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
        diagnosis: formData.diagnosis
          .split(',')
          .map(d => d.trim())
          .filter(d => d),
        labOrders: formData.labOrders
          .split(',')
          .map(l => l.trim())
          .filter(l => l),
      };

      if (editingId) {
        await appointmentManager.updateAppointment(editingId, dataToSave);
        setSuccess('Appointment updated successfully!');
      } else {
        await appointmentManager.addAppointment(dataToSave);
        setSuccess('Appointment added successfully!');
      }

      setFormData({
        doctorName: '',
        specialization: '',
        hospital: { name: '', city: '', address: '', phone: '' },
        appointmentDate: '',
        appointmentTime: '',
        reason: '',
        findings: '',
        diagnosis: '',
        prescriptions: '',
        labOrders: '',
        nextAppointmentDate: '',
        notes: '',
        attended: false,
      });
      setEditingId(null);
      setShowForm(false);
      setTimeout(() => setSuccess(''), 3000);
      loadAppointments();
    } catch (err) {
      setError('Failed to save appointment: ' + err.message);
    }
  };

  const handleEdit = (appointment) => {
    setFormData({
      ...appointment,
      hospital: appointment.hospital || { name: '', city: '', address: '', phone: '' },
      diagnosis: (appointment.diagnosis || []).join(', '),
      labOrders: (appointment.labOrders || []).join(', '),
    });
    setEditingId(appointment.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      try {
        await appointmentManager.deleteAppointment(id);
        setSuccess('Appointment deleted successfully!');
        setTimeout(() => setSuccess(''), 3000);
        loadAppointments();
      } catch (err) {
        setError('Failed to delete appointment: ' + err.message);
      }
    }
  };

  const handleMarkAttended = async (appointment) => {
    try {
      await appointmentManager.updateAppointment(appointment.id, {
        attended: !appointment.attended,
      });
      setSuccess(`Appointment marked as ${!appointment.attended ? 'attended' : 'not attended'}`);
      setTimeout(() => setSuccess(''), 3000);
      loadAppointments();
    } catch (err) {
      setError('Failed to update appointment: ' + err.message);
    }
  };

  const isUpcoming = appointmentDate => {
    return new Date(appointmentDate) > new Date();
  };

  return (
    <div className="appointment-tracker">
      <style>{`
        .appointment-tracker {
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

        .btn-success {
          background: #10b981;
          color: white;
        }

        .btn-success:hover {
          background: #059669;
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

        .form-group input[type="checkbox"] {
          width: auto;
          margin-right: 8px;
        }

        .checkbox-group {
          display: flex;
          align-items: center;
          margin-top: 10px;
        }

        .error-message {
          color: #dc2626;
          font-size: 12px;
          margin-top: 5px;
        }

        .appointments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .appointment-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 20px;
          transition: all 0.2s;
          border-left: 4px solid #2563eb;
        }

        .appointment-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .appointment-card.past {
          border-left-color: #6b7280;
        }

        .appointment-card.attended {
          border-left-color: #10b981;
        }

        .appointment-card.missed {
          border-left-color: #ef4444;
        }

        .appointment-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 15px;
        }

        .doctor-info {
          display: flex;
          flex-direction: column;
        }

        .doctor-name {
          font-size: 18px;
          font-weight: 600;
          color: #333;
        }

        .doctor-spec {
          font-size: 13px;
          color: #666;
          font-style: italic;
        }

        .appointment-status {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
        }

        .upcoming-badge {
          background: #dbeafe;
          color: #1e40af;
        }

        .attended-badge {
          background: #dcfce7;
          color: #166534;
        }

        .missed-badge {
          background: #fee2e2;
          color: #991b1b;
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
          min-width: 120px;
        }

        .info-value {
          color: #333;
          text-align: right;
          flex: 1;
        }

        .findings-section {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 6px;
          margin: 12px 0;
          border-left: 3px solid #2563eb;
        }

        .findings-label {
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
          font-size: 13px;
        }

        .findings-content {
          font-size: 13px;
          color: #666;
          line-height: 1.5;
        }

        .tags-row {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin: 8px 0;
        }

        .tag {
          background: #e0e7ff;
          color: #3730a3;
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
          flex-wrap: wrap;
        }

        .card-actions button {
          flex: 1;
          min-width: 100px;
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
        <h1>📅 Appointments</h1>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              doctorName: '',
              specialization: '',
              hospital: { name: '', city: '', address: '', phone: '' },
              appointmentDate: '',
              appointmentTime: '',
              reason: '',
              findings: '',
              diagnosis: '',
              prescriptions: '',
              labOrders: '',
              nextAppointmentDate: '',
              notes: '',
              attended: false,
            });
          }}
        >
          {showForm ? '✕ Cancel' : '+ Schedule Appointment'}
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
            {editingId ? 'Edit Appointment' : 'Schedule New Appointment'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-section">
              <h3 className="section-title">Doctor & Hospital Information</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Doctor Name *</label>
                  <input
                    type="text"
                    name="doctorName"
                    value={formData.doctorName}
                    onChange={handleInputChange}
                    placeholder="Doctor name"
                  />
                  {validationErrors.doctorName && (
                    <span className="error-message">{validationErrors.doctorName}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Specialization *</label>
                  <select
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                  >
                    <option value="">Select specialization</option>
                    {specializationOptions.map(opt => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {validationErrors.specialization && (
                    <span className="error-message">{validationErrors.specialization}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Hospital/Clinic Name *</label>
                  <input
                    type="text"
                    value={formData.hospital.name}
                    onChange={e => handleNestedChange('hospital', 'name', e.target.value)}
                    placeholder="Hospital or clinic name"
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
                  <label>Address</label>
                  <input
                    type="text"
                    value={formData.hospital.address}
                    onChange={e => handleNestedChange('hospital', 'address', e.target.value)}
                    placeholder="Street address"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.hospital.phone}
                    onChange={e => handleNestedChange('hospital', 'phone', e.target.value)}
                    placeholder="Contact number"
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Appointment Details</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Appointment Date *</label>
                  <input
                    type="date"
                    name="appointmentDate"
                    value={formatDateForInput(formData.appointmentDate)}
                    onChange={handleInputChange}
                  />
                  {validationErrors.appointmentDate && (
                    <span className="error-message">{validationErrors.appointmentDate}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Appointment Time *</label>
                  <input
                    type="time"
                    name="appointmentTime"
                    value={formData.appointmentTime}
                    onChange={handleInputChange}
                  />
                  {validationErrors.appointmentTime && (
                    <span className="error-message">{validationErrors.appointmentTime}</span>
                  )}
                </div>

                <div className="form-group">
                  <label>Reason for Visit *</label>
                  <input
                    type="text"
                    name="reason"
                    value={formData.reason}
                    onChange={handleInputChange}
                    placeholder="e.g., Regular checkup, Heart pain"
                  />
                  {validationErrors.reason && (
                    <span className="error-message">{validationErrors.reason}</span>
                  )}
                </div>

                <div className="form-group checkbox-group">
                  <input
                    type="checkbox"
                    name="attended"
                    checked={formData.attended}
                    onChange={handleInputChange}
                  />
                  <label htmlFor="attended">Mark as Attended</label>
                </div>
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Visit Findings & Outcomes</h3>
              <div className="form-group">
                <label>Doctor's Findings</label>
                <textarea
                  name="findings"
                  value={formData.findings}
                  onChange={handleInputChange}
                  placeholder="What the doctor observed and noted"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Diagnosis (comma separated)</label>
                <input
                  type="text"
                  name="diagnosis"
                  value={formData.diagnosis}
                  onChange={handleInputChange}
                  placeholder="e.g., Hypertension, Allergic rhinitis"
                />
              </div>

              <div className="form-group">
                <label>Prescriptions Given</label>
                <textarea
                  name="prescriptions"
                  value={formData.prescriptions}
                  onChange={handleInputChange}
                  placeholder="Medications prescribed by doctor"
                  rows="2"
                />
              </div>

              <div className="form-group">
                <label>Lab Orders (comma separated)</label>
                <input
                  type="text"
                  name="labOrders"
                  value={formData.labOrders}
                  onChange={handleInputChange}
                  placeholder="e.g., Blood test, Chest X-ray"
                />
              </div>
            </div>

            <div className="form-section">
              <h3 className="section-title">Follow-up</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Next Appointment Date</label>
                  <input
                    type="date"
                    name="nextAppointmentDate"
                    value={formatDateForInput(formData.nextAppointmentDate)}
                    onChange={handleInputChange}
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
                  rows="2"
                />
              </div>
            </div>

            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editingId ? 'Update Appointment' : 'Schedule Appointment'}
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
          className={`filter-tab ${upcomingOnly ? 'active' : ''}`}
          onClick={() => setUpcomingOnly(true)}
        >
          Upcoming
        </div>
        <div
          className={`filter-tab ${!upcomingOnly ? 'active' : ''}`}
          onClick={() => setUpcomingOnly(false)}
        >
          All Appointments
        </div>
      </div>

      {loading ? (
        <div className="loading">Loading appointments...</div>
      ) : appointments.length === 0 ? (
        <div className="empty-state">
          <p>No appointments scheduled</p>
          <p>Schedule your first appointment to keep track of visits</p>
        </div>
      ) : (
        <div className="appointments-list">
          {appointments.map(appointment => {
            const isUpcomingApt = isUpcoming(appointment.appointmentDate);
            const cardClass = appointment.attended
              ? 'attended'
              : isUpcomingApt
                ? ''
                : 'past';

            return (
              <div key={appointment.id} className={`appointment-card ${cardClass}`}>
                <div className="appointment-header">
                  <div className="doctor-info">
                    <div className="doctor-name">{appointment.doctorName}</div>
                    <div className="doctor-spec">{appointment.specialization}</div>
                  </div>
                  <div className="appointment-status">
                    {isUpcomingApt && <span className="status-badge upcoming-badge">Upcoming</span>}
                    {appointment.attended && (
                      <span className="status-badge attended-badge">Attended</span>
                    )}
                    {!isUpcomingApt && !appointment.attended && (
                      <span className="status-badge missed-badge">Not Attended</span>
                    )}
                  </div>
                </div>

                <div className="info-row">
                  <span className="info-label">Date & Time:</span>
                  <span className="info-value">
                    {formatDate(appointment.appointmentDate)} at {appointment.appointmentTime}
                  </span>
                </div>

                {appointment.hospital?.name && (
                  <div className="info-row">
                    <span className="info-label">Location:</span>
                    <span className="info-value">
                      {appointment.hospital.name}
                      {appointment.hospital.city && `, ${appointment.hospital.city}`}
                    </span>
                  </div>
                )}

                <div className="info-row">
                  <span className="info-label">Reason:</span>
                  <span className="info-value">{appointment.reason}</span>
                </div>

                {appointment.findings && (
                  <div className="findings-section">
                    <div className="findings-label">Doctor's Findings:</div>
                    <div className="findings-content">{appointment.findings}</div>
                  </div>
                )}

                {appointment.diagnosis && appointment.diagnosis.length > 0 && (
                  <div>
                    <div className="findings-label">Diagnosis:</div>
                    <div className="tags-row">
                      {appointment.diagnosis.map((diag, idx) => (
                        <div key={idx} className="tag">
                          {diag}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {appointment.prescriptions && (
                  <div className="findings-section">
                    <div className="findings-label">Prescriptions:</div>
                    <div className="findings-content">{appointment.prescriptions}</div>
                  </div>
                )}

                {appointment.labOrders && appointment.labOrders.length > 0 && (
                  <div>
                    <div className="findings-label">Lab Orders:</div>
                    <div className="tags-row">
                      {appointment.labOrders.map((lab, idx) => (
                        <div key={idx} className="tag">
                          {lab}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="card-actions">
                  <button
                    className={`btn btn-sm ${appointment.attended ? 'btn-secondary' : 'btn-success'}`}
                    onClick={() => handleMarkAttended(appointment)}
                  >
                    {appointment.attended ? 'Mark Not Attended' : 'Mark Attended'}
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleEdit(appointment)}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(appointment.id)}
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

export default AppointmentTracker;
