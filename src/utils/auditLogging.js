/**
 * Audit Logging Utility Functions
 * Tracks all provider actions for compliance and security
 */

// Mock audit log entries
const AUDIT_LOG = [];

// Action types
export const ACTION_TYPES = {
  MESSAGE_SENT: 'message_sent',
  MESSAGE_READ: 'message_read',
  REPORT_GENERATED: 'report_generated',
  REPORT_DOWNLOADED: 'report_downloaded',
  REPORT_SHARED: 'report_shared',
  PATIENT_ACCESSED: 'patient_accessed',
  PATIENT_DATA_VIEWED: 'patient_data_viewed',
  PRESCRIPTION_ISSUED: 'prescription_issued',
  ALERT_GENERATED: 'alert_generated',
  ACCESS_GRANTED: 'access_granted',
  ACCESS_REVOKED: 'access_revoked',
  APPOINTMENT_SCHEDULED: 'appointment_scheduled',
  APPOINTMENT_CANCELLED: 'appointment_cancelled',
  NOTES_ADDED: 'notes_added',
  EXPORT_PERFORMED: 'export_performed'
};

// Simulate network delay
const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 400 + 400));

/**
 * Log a provider action
 * @param {string} providerId - Provider ID
 * @param {string} actionType - Type of action
 * @param {string} patientId - Patient ID (if applicable)
 * @param {Object} details - Additional details
 * @returns {Promise<Object>} Logged entry
 */
export async function logProviderAction(providerId, actionType, patientId = null, details = {}) {
  await delay();
  
  if (!providerId || !actionType) {
    throw new Error('Provider ID and action type required');
  }

  if (!Object.values(ACTION_TYPES).includes(actionType)) {
    throw new Error(`Invalid action type: ${actionType}`);
  }

  const logEntry = {
    id: `audit-${Date.now()}`,
    timestamp: new Date(),
    providerId,
    actionType,
    patientId,
    details: {
      ip: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      ...details
    },
    status: 'logged'
  };

  AUDIT_LOG.push(logEntry);

  return {
    id: logEntry.id,
    timestamp: logEntry.timestamp,
    status: 'logged'
  };
}

/**
 * Get audit log entries
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Audit log entries
 */
export async function getAuditLog(filters = {}) {
  await delay();
  
  const {
    providerId = null,
    patientId = null,
    actionType = null,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    limit = 100
  } = filters;

  let results = AUDIT_LOG.filter(entry => {
    const inDateRange = entry.timestamp >= startDate && entry.timestamp <= endDate;
    const matchesProvider = !providerId || entry.providerId === providerId;
    const matchesPatient = !patientId || entry.patientId === patientId;
    const matchesAction = !actionType || entry.actionType === actionType;

    return inDateRange && matchesProvider && matchesPatient && matchesAction;
  });

  return results
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(entry => formatAuditEntry(entry));
}

/**
 * Get actions by provider
 * @param {string} providerId - Provider ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Provider actions
 */
export async function getActionsByProvider(providerId, days = 30) {
  await delay();
  if (!providerId) throw new Error('Provider ID required');

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return getAuditLog({
    providerId,
    startDate,
    limit: 500
  });
}

/**
 * Get actions on a specific patient
 * @param {string} patientId - Patient ID
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Patient access actions
 */
export async function getActionsByPatient(patientId, days = 30) {
  await delay();
  if (!patientId) throw new Error('Patient ID required');

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return getAuditLog({
    patientId,
    startDate,
    limit: 500
  });
}

/**
 * Get actions by type
 * @param {string} actionType - Action type
 * @param {number} days - Number of days to look back
 * @returns {Promise<Array>} Filtered actions
 */
export async function getActionsByType(actionType, days = 30) {
  await delay();
  if (!actionType) throw new Error('Action type required');

  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return getAuditLog({
    actionType,
    startDate,
    limit: 500
  });
}

/**
 * Get actions for compliance reporting
 * @param {string} providerId - Provider ID
 * @param {Date} startDate - Report start date
 * @param {Date} endDate - Report end date
 * @returns {Promise<Object>} Compliance report
 */
export async function getComplianceReport(providerId, startDate, endDate) {
  await delay();
  if (!providerId || !startDate || !endDate) {
    throw new Error('Provider ID, start date, and end date required');
  }

  const actions = await getAuditLog({
    providerId,
    startDate,
    endDate,
    limit: 1000
  });

  const actionCounts = {};
  Object.values(ACTION_TYPES).forEach(type => {
    actionCounts[type] = actions.filter(a => a.actionType === type).length;
  });

  const uniquePatients = new Set(actions.map(a => a.patientId).filter(Boolean));

  return {
    providerId,
    reportPeriod: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
    totalActions: actions.length,
    actionCounts,
    uniquePatientsAccessed: uniquePatients.size,
    lastAction: actions[0]?.timestamp || null,
    firstAction: actions[actions.length - 1]?.timestamp || null
  };
}

/**
 * Get access history for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} Patient access history
 */
export async function getPatientAccessHistory(patientId) {
  await delay();
  if (!patientId) throw new Error('Patient ID required');

  const actions = await getAuditLog({
    patientId,
    limit: 1000
  });

  return actions
    .filter(a => [ACTION_TYPES.PATIENT_ACCESSED, ACTION_TYPES.PATIENT_DATA_VIEWED].includes(a.actionType))
    .map(a => ({
      ...a,
      actionDescription: getActionDescription(a.actionType)
    }));
}

/**
 * Get data export audit trail
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>} Export actions
 */
export async function getExportAuditTrail(providerId) {
  await delay();
  if (!providerId) throw new Error('Provider ID required');

  return getAuditLog({
    providerId,
    actionType: ACTION_TYPES.EXPORT_PERFORMED,
    limit: 100
  });
}

/**
 * Format audit entry for display
 * @param {Object} entry - Audit log entry
 * @returns {Object} Formatted entry
 */
export function formatAuditEntry(entry) {
  return {
    id: entry.id,
    timestamp: entry.timestamp,
    formattedTime: formatAuditTime(entry.timestamp),
    providerId: entry.providerId,
    providerName: getProviderName(entry.providerId),
    patientId: entry.patientId,
    patientName: getPatientName(entry.patientId),
    actionType: entry.actionType,
    actionDescription: getActionDescription(entry.actionType),
    actionIcon: getActionIcon(entry.actionType),
    details: entry.details,
    status: entry.status,
    severity: getActionSeverity(entry.actionType)
  };
}

/**
 * Get action description
 * @param {string} actionType - Action type
 * @returns {string} Description
 */
export function getActionDescription(actionType) {
  const descriptions = {
    [ACTION_TYPES.MESSAGE_SENT]: 'Sent message to patient',
    [ACTION_TYPES.MESSAGE_READ]: 'Read message from patient',
    [ACTION_TYPES.REPORT_GENERATED]: 'Generated patient report',
    [ACTION_TYPES.REPORT_DOWNLOADED]: 'Downloaded patient report',
    [ACTION_TYPES.REPORT_SHARED]: 'Shared report with patient',
    [ACTION_TYPES.PATIENT_ACCESSED]: 'Accessed patient record',
    [ACTION_TYPES.PATIENT_DATA_VIEWED]: 'Viewed patient data',
    [ACTION_TYPES.PRESCRIPTION_ISSUED]: 'Issued prescription',
    [ACTION_TYPES.ALERT_GENERATED]: 'Generated clinical alert',
    [ACTION_TYPES.ACCESS_GRANTED]: 'Granted patient access',
    [ACTION_TYPES.ACCESS_REVOKED]: 'Revoked patient access',
    [ACTION_TYPES.APPOINTMENT_SCHEDULED]: 'Scheduled appointment',
    [ACTION_TYPES.APPOINTMENT_CANCELLED]: 'Cancelled appointment',
    [ACTION_TYPES.NOTES_ADDED]: 'Added clinical notes',
    [ACTION_TYPES.EXPORT_PERFORMED]: 'Exported patient data'
  };

  return descriptions[actionType] || actionType;
}

/**
 * Get action icon
 * @param {string} actionType - Action type
 * @returns {string} Icon emoji
 */
export function getActionIcon(actionType) {
  const icons = {
    [ACTION_TYPES.MESSAGE_SENT]: '💬',
    [ACTION_TYPES.MESSAGE_READ]: '👁️',
    [ACTION_TYPES.REPORT_GENERATED]: '📄',
    [ACTION_TYPES.REPORT_DOWNLOADED]: '⬇️',
    [ACTION_TYPES.REPORT_SHARED]: '🔗',
    [ACTION_TYPES.PATIENT_ACCESSED]: '🔓',
    [ACTION_TYPES.PATIENT_DATA_VIEWED]: '👁️',
    [ACTION_TYPES.PRESCRIPTION_ISSUED]: '💊',
    [ACTION_TYPES.ALERT_GENERATED]: '⚠️',
    [ACTION_TYPES.ACCESS_GRANTED]: '✅',
    [ACTION_TYPES.ACCESS_REVOKED]: '❌',
    [ACTION_TYPES.APPOINTMENT_SCHEDULED]: '📅',
    [ACTION_TYPES.APPOINTMENT_CANCELLED]: '🚫',
    [ACTION_TYPES.NOTES_ADDED]: '📝',
    [ACTION_TYPES.EXPORT_PERFORMED]: '📤'
  };

  return icons[actionType] || '📋';
}

/**
 * Get action severity for display
 * @param {string} actionType - Action type
 * @returns {string} Severity level
 */
export function getActionSeverity(actionType) {
  const severities = {
    [ACTION_TYPES.ACCESS_REVOKED]: 'high',
    [ACTION_TYPES.PRESCRIPTION_ISSUED]: 'high',
    [ACTION_TYPES.ALERT_GENERATED]: 'high',
    [ACTION_TYPES.REPORT_SHARED]: 'medium',
    [ACTION_TYPES.EXPORT_PERFORMED]: 'medium',
    [ACTION_TYPES.PATIENT_ACCESSED]: 'medium',
    [ACTION_TYPES.MESSAGE_SENT]: 'low',
    [ACTION_TYPES.NOTES_ADDED]: 'low'
  };

  return severities[actionType] || 'low';
}

/**
 * Format time for audit log display
 * @param {Date} timestamp - Timestamp
 * @returns {string} Formatted time
 */
export function formatAuditTime(timestamp) {
  return timestamp.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Get provider name by ID
 * @param {string} providerId - Provider ID
 * @returns {string} Provider name
 */
function getProviderName(providerId) {
  const providers = {
    'provider-123': 'Dr. Smith',
    'provider-001': 'Dr. Johnson',
    'provider-002': 'Dr. Williams'
  };

  return providers[providerId] || 'Unknown Provider';
}

/**
 * Get patient name by ID
 * @param {string} patientId - Patient ID
 * @returns {string} Patient name
 */
function getPatientName(patientId) {
  const patients = {
    'PA-001': 'Michael Chen',
    'PA-002': 'John Anderson',
    'PA-003': 'Sarah Mitchell',
    'PA-004': 'Emma Rodriguez',
    'PA-005': 'James Thompson',
    'PA-006': 'Lisa Wang'
  };

  return patients[patientId] || patientId;
}

/**
 * Add initial audit log entries for testing
 */
function initializeAuditLog() {
  const now = new Date();
  const actions = [
    { providerId: 'provider-123', actionType: ACTION_TYPES.MESSAGE_SENT, patientId: 'PA-001', hours: 2 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.PATIENT_ACCESSED, patientId: 'PA-002', hours: 4 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.REPORT_GENERATED, patientId: 'PA-003', hours: 6 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.APPOINTMENT_SCHEDULED, patientId: 'PA-004', hours: 8 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.PRESCRIPTION_ISSUED, patientId: 'PA-005', hours: 10 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.MESSAGE_SENT, patientId: 'PA-006', hours: 12 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.PATIENT_DATA_VIEWED, patientId: 'PA-001', hours: 24 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.EXPORT_PERFORMED, patientId: 'PA-002', hours: 30 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.ALERT_GENERATED, patientId: 'PA-003', hours: 36 },
    { providerId: 'provider-123', actionType: ACTION_TYPES.NOTES_ADDED, patientId: 'PA-004', hours: 48 }
  ];

  actions.forEach(action => {
    const logEntry = {
      id: `audit-${Date.now() + Math.random()}`,
      timestamp: new Date(now - action.hours * 60 * 60 * 1000),
      providerId: action.providerId,
      actionType: action.actionType,
      patientId: action.patientId,
      details: {
        ip: '192.168.1.100',
        userAgent: 'Mozilla/5.0'
      },
      status: 'logged'
    };

    AUDIT_LOG.push(logEntry);
  });
}

// Initialize audit log on module load
initializeAuditLog();
