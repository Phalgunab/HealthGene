import React, { useState, useEffect } from 'react';
import {
  healthProfileManager,
  medicationManager,
  allergyManager,
  chronicConditionManager,
  surgeryManager,
  appointmentManager,
  labResultManager,
} from '../utils/firestoreHealthDataManager';
import '../styles/StructuredDataDashboard.css';

const StructuredDataDashboard = ({ userId }) => {
  const [dashboardData, setDashboardData] = useState({
    healthProfile: null,
    medications: [],
    allergies: [],
    conditions: [],
    surgeries: [],
    appointments: [],
    labResults: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('all');
  const [exportFormat, setExportFormat] = useState('pdf');

  useEffect(() => {
    if (userId) {
      fetchDashboardData();
    }
  }, [userId]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [profile, meds, allergies, conditions, surgeries, appointments, labs] = await Promise.all([
        healthProfileManager.get(userId),
        medicationManager.getAll(userId),
        allergyManager.getAll(userId),
        chronicConditionManager.getAll(userId),
        surgeryManager.getAll(userId),
        appointmentManager.getAll(userId),
        labResultManager.getAll(userId),
      ]);

      setDashboardData({
        healthProfile: profile,
        medications: meds || [],
        allergies: allergies || [],
        conditions: conditions || [],
        surgeries: surgeries || [],
        appointments: appointments || [],
        labResults: labs || [],
      });
    } catch (err) {
      setError('Failed to load dashboard data: ' + err.message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionPercentage = () => {
    let completedItems = 0;
    let totalItems = 0;

    if (dashboardData.healthProfile) {
      completedItems++;
      totalItems++;
    }
    if (dashboardData.medications.length > 0) {
      completedItems++;
      totalItems++;
    }
    if (dashboardData.allergies.length > 0) {
      completedItems++;
      totalItems++;
    }
    if (dashboardData.conditions.length > 0) {
      completedItems++;
      totalItems++;
    }
    if (dashboardData.surgeries.length > 0) {
      completedItems++;
      totalItems++;
    }
    if (dashboardData.appointments.length > 0) {
      completedItems++;
      totalItems++;
    }
    if (dashboardData.labResults.length > 0) {
      completedItems++;
      totalItems++;
    }

    return totalItems === 0 ? 0 : Math.round((completedItems / totalItems) * 100);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return dashboardData.appointments
      .filter((apt) => new Date(apt.appointmentDate) >= now)
      .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate))
      .slice(0, 5);
  };

  const getRecentLabResults = () => {
    return dashboardData.labResults
      .sort((a, b) => new Date(b.testDate) - new Date(a.testDate))
      .slice(0, 5);
  };

  const getCriticalAlerts = () => {
    const alerts = [];

    const criticalAllergies = dashboardData.allergies.filter((a) => a.severity === 'Life-threatening');
    if (criticalAllergies.length > 0) {
      alerts.push({
        type: 'critical',
        icon: '⚠️',
        message: `${criticalAllergies.length} critical allergy(ies) identified`,
        count: criticalAllergies.length,
      });
    }

    const abnormalLabResults = dashboardData.labResults.filter((l) => l.status !== 'normal');
    if (abnormalLabResults.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '⚡',
        message: `${abnormalLabResults.length} abnormal lab result(s)`,
        count: abnormalLabResults.length,
      });
    }

    const overdueMeds = dashboardData.medications.filter(
      (m) => m.status === 'Active' && m.refillDate && new Date(m.refillDate) < new Date()
    );
    if (overdueMeds.length > 0) {
      alerts.push({
        type: 'warning',
        icon: '💊',
        message: `${overdueMeds.length} medication(s) need refill`,
        count: overdueMeds.length,
      });
    }

    const overdueConditionReviews = dashboardData.conditions.filter(
      (c) => c.nextReviewDate && new Date(c.nextReviewDate) < new Date()
    );
    if (overdueConditionReviews.length > 0) {
      alerts.push({
        type: 'info',
        icon: '📋',
        message: `${overdueConditionReviews.length} condition review(s) overdue`,
        count: overdueConditionReviews.length,
      });
    }

    return alerts;
  };

  const getRecentActivities = () => {
    const activities = [];

    dashboardData.medications.forEach((med) => {
      activities.push({
        type: 'medication',
        title: `Added medication: ${med.medicationName}`,
        date: med.createdAt || new Date().toISOString(),
        icon: '💊',
      });
    });

    dashboardData.allergies.forEach((allergy) => {
      activities.push({
        type: 'allergy',
        title: `Recorded allergy: ${allergy.allergyType}`,
        date: allergy.createdAt || new Date().toISOString(),
        icon: '🚫',
      });
    });

    dashboardData.appointments.forEach((apt) => {
      activities.push({
        type: 'appointment',
        title: `Scheduled appointment with ${apt.doctorName}`,
        date: apt.appointmentDate,
        icon: '📅',
      });
    });

    dashboardData.labResults.forEach((lab) => {
      activities.push({
        type: 'lab',
        title: `Completed lab: ${lab.testName}`,
        date: lab.testDate,
        icon: '🧪',
      });
    });

    return activities
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 8);
  };

  const handleExport = () => {
    const summaryData = {
      exportDate: new Date().toISOString(),
      profile: dashboardData.healthProfile,
      medications: dashboardData.medications.length,
      allergies: dashboardData.allergies.length,
      conditions: dashboardData.conditions.length,
      surgeries: dashboardData.surgeries.length,
      appointments: dashboardData.appointments.length,
      labResults: dashboardData.labResults.length,
      completionPercentage: getCompletionPercentage(),
    };

    if (exportFormat === 'json') {
      const dataStr = JSON.stringify(summaryData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      downloadFile(dataBlob, 'health_summary.json');
    } else {
      const csvContent = generateCSVContent();
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      downloadFile(dataBlob, 'health_summary.csv');
    }
  };

  const generateCSVContent = () => {
    let csv = 'Health Data Summary Export\n';
    csv += `Export Date,${new Date().toISOString()}\n\n`;

    csv += 'OVERVIEW\n';
    csv += `Total Medications,${dashboardData.medications.length}\n`;
    csv += `Total Allergies,${dashboardData.allergies.length}\n`;
    csv += `Total Conditions,${dashboardData.conditions.length}\n`;
    csv += `Total Surgeries,${dashboardData.surgeries.length}\n`;
    csv += `Total Appointments,${dashboardData.appointments.length}\n`;
    csv += `Total Lab Results,${dashboardData.labResults.length}\n`;
    csv += `Data Completion,${getCompletionPercentage()}%\n\n`;

    csv += 'ACTIVE MEDICATIONS\n';
    csv += 'Medication Name,Dosage,Frequency,Status\n';
    dashboardData.medications
      .filter((m) => m.status === 'Active')
      .forEach((med) => {
        csv += `"${med.medicationName}","${med.dosage}","${med.frequency}","${med.status}"\n`;
      });

    csv += '\nALLERGIES\n';
    csv += 'Allergy Type,Severity,Status\n';
    dashboardData.allergies.forEach((allergy) => {
      csv += `"${allergy.allergyType}","${allergy.severity}","Recorded"\n`;
    });

    csv += '\nCHRONIC CONDITIONS\n';
    csv += 'Condition,Status,ICD-10 Code\n';
    dashboardData.conditions.forEach((condition) => {
      csv += `"${condition.conditionName}","${condition.status}","${condition.icd10Code || 'N/A'}"\n`;
    });

    return csv;
  };

  const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (loading) {
    return (
      <div className="dashboard">
        <div className="loading-screen">
          <div className="spinner"></div>
          <p>Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  const completionPercentage = getCompletionPercentage();
  const criticalAlerts = getCriticalAlerts();
  const upcomingAppointments = getUpcomingAppointments();
  const recentLabResults = getRecentLabResults();
  const recentActivities = getRecentActivities();

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Health Dashboard</h1>
          <p className="subtitle">Your comprehensive health overview</p>
        </div>
        <div className="header-actions">
          <button className="btn-refresh" onClick={fetchDashboardData}>
            🔄 Refresh
          </button>
          <select
            value={exportFormat}
            onChange={(e) => setExportFormat(e.target.value)}
            className="export-select"
          >
            <option value="json">JSON</option>
            <option value="csv">CSV</option>
          </select>
          <button className="btn-export" onClick={handleExport}>
            📥 Export Summary
          </button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="completion-section">
        <h3>Data Completeness</h3>
        <div className="progress-container">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercentage}%` }}></div>
          </div>
          <div className="progress-text">
            <span className="percentage">{completionPercentage}% Complete</span>
            <p className="hint">Add more health data to improve your profile completeness</p>
          </div>
        </div>
      </div>

      {criticalAlerts.length > 0 && (
        <div className="alerts-section">
          <h3>Health Alerts</h3>
          <div className="alerts-grid">
            {criticalAlerts.map((alert, idx) => (
              <div key={idx} className={`alert-card alert-${alert.type}`}>
                <div className="alert-icon">{alert.icon}</div>
                <div className="alert-content">
                  <p className="alert-message">{alert.message}</p>
                  <span className="alert-count">{alert.count} item{alert.count !== 1 ? 's' : ''}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="overview-section">
        <h3>Health Overview</h3>
        <div className="statistics-grid">
          <div className="stat-box">
            <div className="stat-icon">💊</div>
            <div className="stat-info">
              <h4>Medications</h4>
              <p className="stat-number">{dashboardData.medications.length}</p>
              <p className="stat-label">
                {dashboardData.medications.filter((m) => m.status === 'Active').length} active
              </p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🚫</div>
            <div className="stat-info">
              <h4>Allergies</h4>
              <p className="stat-number">{dashboardData.allergies.length}</p>
              <p className="stat-label">
                {dashboardData.allergies.filter((a) => a.severity === 'Life-threatening').length} critical
              </p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">📋</div>
            <div className="stat-info">
              <h4>Conditions</h4>
              <p className="stat-number">{dashboardData.conditions.length}</p>
              <p className="stat-label">
                {dashboardData.conditions.filter((c) => c.status === 'Active').length} active
              </p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🏥</div>
            <div className="stat-info">
              <h4>Surgeries</h4>
              <p className="stat-number">{dashboardData.surgeries.length}</p>
              <p className="stat-label">Documented procedures</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h4>Appointments</h4>
              <p className="stat-number">{getUpcomingAppointments().length}</p>
              <p className="stat-label">Upcoming</p>
            </div>
          </div>

          <div className="stat-box">
            <div className="stat-icon">🧪</div>
            <div className="stat-info">
              <h4>Lab Results</h4>
              <p className="stat-number">{dashboardData.labResults.length}</p>
              <p className="stat-label">
                {dashboardData.labResults.filter((l) => l.status !== 'normal').length} abnormal
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="two-column-layout">
        <div className="appointments-section">
          <h3>📅 Upcoming Appointments</h3>
          {upcomingAppointments.length === 0 ? (
            <div className="empty-state">
              <p>No upcoming appointments scheduled</p>
            </div>
          ) : (
            <div className="appointments-list">
              {upcomingAppointments.map((apt) => (
                <div key={apt.id} className="appointment-item">
                  <div className="appointment-date">
                    {new Date(apt.appointmentDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="appointment-details">
                    <h4>{apt.doctorName}</h4>
                    <p>{apt.hospitalClinic}</p>
                    <span className="appointment-time">
                      {new Date(apt.appointmentDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="lab-results-section">
          <h3>🧪 Recent Lab Results</h3>
          {recentLabResults.length === 0 ? (
            <div className="empty-state">
              <p>No lab results recorded yet</p>
            </div>
          ) : (
            <div className="lab-results-list">
              {recentLabResults.map((lab) => (
                <div key={lab.id} className={`lab-result-item lab-${lab.status}`}>
                  <div className="lab-test-name">{lab.testName}</div>
                  <div className="lab-value">
                    {lab.value} {lab.unit}
                  </div>
                  <div className="lab-reference">
                    Ref: {lab.referenceMin} - {lab.referenceMax}
                  </div>
                  <div className={`lab-status lab-status-${lab.status}`}>
                    {lab.status.toUpperCase()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="activities-section">
        <h3>📝 Recent Activities</h3>
        {recentActivities.length === 0 ? (
          <div className="empty-state">
            <p>No activities yet. Start adding your health data!</p>
          </div>
        ) : (
          <div className="timeline">
            {recentActivities.map((activity, idx) => (
              <div key={idx} className="timeline-item">
                <div className="timeline-icon">{activity.icon}</div>
                <div className="timeline-content">
                  <p>{activity.title}</p>
                  <span className="timeline-date">
                    {new Date(activity.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="quick-actions-section">
        <h3>Quick Actions</h3>
        <div className="quick-actions-grid">
          <button className="quick-action-btn">
            <span className="action-icon">💊</span>
            <span className="action-label">Add Medication</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">🚫</span>
            <span className="action-label">Add Allergy</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📋</span>
            <span className="action-label">Add Condition</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">📅</span>
            <span className="action-label">Schedule Appointment</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">🧪</span>
            <span className="action-label">Add Lab Result</span>
          </button>
          <button className="quick-action-btn">
            <span className="action-icon">🏥</span>
            <span className="action-label">Document Surgery</span>
          </button>
        </div>
      </div>

      {dashboardData.healthProfile && (
        <div className="profile-snapshot">
          <h3>Profile Snapshot</h3>
          <div className="snapshot-content">
            <div className="snapshot-row">
              <span className="label">Name:</span>
              <span className="value">{dashboardData.healthProfile.firstName} {dashboardData.healthProfile.lastName}</span>
            </div>
            <div className="snapshot-row">
              <span className="label">Age:</span>
              <span className="value">{new Date().getFullYear() - new Date(dashboardData.healthProfile.dateOfBirth).getFullYear()} years</span>
            </div>
            <div className="snapshot-row">
              <span className="label">Blood Type:</span>
              <span className="value">{dashboardData.healthProfile.bloodType || 'Not recorded'}</span>
            </div>
            <div className="snapshot-row">
              <span className="label">BMI:</span>
              <span className="value">
                {dashboardData.healthProfile.height && dashboardData.healthProfile.weight
                  ? (
                      (dashboardData.healthProfile.weight /
                        ((dashboardData.healthProfile.height / 100) ** 2)).toFixed(1)
                    )
                  : 'Not calculated'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StructuredDataDashboard;
