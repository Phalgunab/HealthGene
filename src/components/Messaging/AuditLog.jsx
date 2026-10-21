import React, { useState, useEffect } from 'react';
import { getAuditLog, getActionsByProvider, getActionsByPatient, getComplianceReport, formatAuditEntry } from '@/utils/auditLogging';

/**
 * AuditLog Component
 * Displays comprehensive audit trail of provider actions
 */
const AuditLog = ({ 
  providerId = 'provider-123', 
  patientId = null,
  days = 30 
}) => {
  const [auditLog, setAuditLog] = useState([]);
  const [filteredLog, setFilteredLog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('all'); // all, provider, patient, type
  const [actionTypeFilter, setActionTypeFilter] = useState('');
  const [viewMode, setViewMode] = useState('table'); // table, timeline
  const [complianceData, setComplianceData] = useState(null);

  // Load audit log on mount
  useEffect(() => {
    loadAuditLog();
  }, []);

  // Apply filters when log or filters change
  useEffect(() => {
    applyFilters();
  }, [auditLog, filterType, actionTypeFilter]);

  // Load audit log
  const loadAuditLog = async () => {
    try {
      setLoading(true);
      let data;

      if (patientId && filterType === 'patient') {
        data = await getActionsByPatient(patientId, days);
      } else {
        data = await getActionsByProvider(providerId, days);
      }

      setAuditLog(data);

      // Get compliance report
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const endDate = new Date();
      const compliance = await getComplianceReport(providerId, startDate, endDate);
      setComplianceData(compliance);

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load audit log');
      console.error('Audit log loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = () => {
    let results = [...auditLog];

    if (actionTypeFilter) {
      results = results.filter((entry) => entry.actionType === actionTypeFilter);
    }

    setFilteredLog(results);
  };

  // Download audit log as CSV
  const handleDownloadAuditLog = () => {
    const csv = [
      ['Timestamp', 'Provider', 'Action', 'Patient', 'Status'].join(','),
      ...filteredLog.map((entry) =>
        [
          entry.timestamp.toLocaleString(),
          entry.providerName,
          entry.actionDescription,
          entry.patientName || 'N/A',
          entry.status
        ].join(',')
      )
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `audit-log-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Render loading state
  if (loading) {
    return (
      <div className="audit-log loading">
        <div className="loading-spinner"></div>
        <p>Loading audit log...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="audit-log error">
        <p>❌ {error}</p>
        <button onClick={loadAuditLog} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="audit-log">
      {/* Header */}
      <div className="audit-header">
        <h2>Audit Trail</h2>
        <p className="audit-subtitle">Provider action log ({filteredLog.length} entries)</p>
      </div>

      {/* Compliance Summary */}
      {complianceData && (
        <div className="compliance-summary">
          <div className="summary-card">
            <span className="label">Total Actions</span>
            <span className="value">{complianceData.totalActions}</span>
          </div>
          <div className="summary-card">
            <span className="label">Unique Patients</span>
            <span className="value">{complianceData.uniquePatientsAccessed}</span>
          </div>
          <div className="summary-card">
            <span className="label">Report Period</span>
            <span className="value">{complianceData.reportPeriod}</span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="audit-controls">
        <div className="filter-group">
          <select
            value={actionTypeFilter}
            onChange={(e) => setActionTypeFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">All Actions</option>
            <option value="message_sent">Messages Sent</option>
            <option value="patient_accessed">Patient Accessed</option>
            <option value="report_generated">Reports Generated</option>
            <option value="prescription_issued">Prescriptions Issued</option>
            <option value="access_granted">Access Granted</option>
            <option value="access_revoked">Access Revoked</option>
          </select>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
            title="Table view"
          >
            📊
          </button>
          <button
            className={`view-btn ${viewMode === 'timeline' ? 'active' : ''}`}
            onClick={() => setViewMode('timeline')}
            title="Timeline view"
          >
            📅
          </button>
          <button
            className="download-btn"
            onClick={handleDownloadAuditLog}
            title="Download as CSV"
          >
            ⬇️ CSV
          </button>
        </div>
      </div>

      {/* Audit Log Content */}
      {filteredLog.length === 0 ? (
        <div className="empty-state">
          <p>No audit log entries found</p>
        </div>
      ) : (
        <>
          {/* Table View */}
          {viewMode === 'table' && (
            <div className="audit-table-container">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Action</th>
                    <th>Provider</th>
                    <th>Patient</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLog.map((entry) => (
                    <tr key={entry.id} className={`severity-${entry.severity}`}>
                      <td className="timestamp">{entry.formattedTime}</td>
                      <td className="action">
                        <span className="action-icon">{entry.actionIcon}</span>
                        <span className="action-desc">{entry.actionDescription}</span>
                      </td>
                      <td className="provider">{entry.providerName}</td>
                      <td className="patient">{entry.patientName || '—'}</td>
                      <td className="status">
                        <span className={`status-badge status-${entry.status}`}>
                          {entry.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Timeline View */}
          {viewMode === 'timeline' && (
            <div className="audit-timeline">
              {filteredLog.map((entry) => (
                <div key={entry.id} className={`timeline-item severity-${entry.severity}`}>
                  <div className="timeline-marker">
                    <span className="marker-icon">{entry.actionIcon}</span>
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{entry.actionDescription}</h4>
                      <span className="timeline-time">{entry.formattedTime}</span>
                    </div>
                    <div className="timeline-details">
                      <p><strong>Provider:</strong> {entry.providerName}</p>
                      {entry.patientName && <p><strong>Patient:</strong> {entry.patientName}</p>}
                      <p><strong>Status:</strong> {entry.status}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer */}
      <div className="audit-footer">
        <p className="footer-text">
          Showing {filteredLog.length} of {auditLog.length} entries
        </p>
      </div>
    </div>
  );
};

export default AuditLog;
