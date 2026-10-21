/**
 * Report Generation Utility Functions
 * Handles creation, formatting, and export of patient reports
 */

// Report types available
export const REPORT_TYPES = {
  COMPREHENSIVE: 'comprehensive',
  LAB_RESULTS: 'lab_results',
  MEDICATIONS: 'medications',
  ADHERENCE: 'adherence',
  SUMMARY: 'summary'
};

// Mock report data
const MOCK_REPORTS = [];

// Simulate network delay
const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 600));

/**
 * Generate comprehensive patient report
 * @param {string} patientId - Patient ID
 * @param {Object} options - Report options
 * @returns {Promise<Object>} Generated report
 */
export async function generatePatientReport(patientId, options = {}) {
  await delay();
  if (!patientId) throw new Error('Patient ID required');

  const {
    reportType = REPORT_TYPES.COMPREHENSIVE,
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    includeHistory = true,
    includeMedications = true,
    includeLabResults = true,
    format = 'pdf'
  } = options;

  if (!Object.values(REPORT_TYPES).includes(reportType)) {
    throw new Error('Invalid report type');
  }

  // Get patient data
  const patientData = getPatientReportData(patientId);
  
  const report = {
    id: `report-${Date.now()}`,
    patientId,
    reportType,
    title: generateReportTitle(reportType, patientData.patientName),
    generatedDate: new Date(),
    startDate,
    endDate,
    format,
    pages: Math.floor(Math.random() * 5) + 5,
    status: 'completed',
    data: patientData,
    sections: []
  };

  // Add sections based on report type
  if (reportType === REPORT_TYPES.COMPREHENSIVE) {
    report.sections = ['patient_info', 'health_summary', 'medications', 'lab_results', 'visit_history', 'adherence'];
  } else if (reportType === REPORT_TYPES.LAB_RESULTS) {
    report.sections = ['patient_info', 'lab_results'];
  } else if (reportType === REPORT_TYPES.MEDICATIONS) {
    report.sections = ['patient_info', 'medications'];
  } else if (reportType === REPORT_TYPES.ADHERENCE) {
    report.sections = ['patient_info', 'adherence', 'health_summary'];
  } else if (reportType === REPORT_TYPES.SUMMARY) {
    report.sections = ['patient_info', 'health_summary', 'medications', 'visit_history'];
  }

  MOCK_REPORTS.push(report);
  return report;
}

/**
 * Get report data for a patient
 * @param {string} patientId - Patient ID
 * @returns {Object} Patient report data
 */
function getPatientReportData(patientId) {
  const patients = {
    'PA-001': {
      id: 'PA-001',
      patientName: 'Michael Chen',
      age: 62,
      gender: 'Male',
      conditions: ['Type 1 Diabetes', 'Kidney Disease', 'Hypertension'],
      medications: [
        { name: 'Insulin Glargine', dose: '20 units', frequency: 'Once daily', status: 'Active' },
        { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', status: 'Active' },
        { name: 'Metformin', dose: '500mg', frequency: 'Twice daily', status: 'Active' }
      ],
      labResults: [
        { test: 'Hemoglobin A1c', value: '7.2%', reference: '< 7%', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { test: 'Creatinine', value: '1.8 mg/dL', reference: '0.6-1.2', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { test: 'Glucose', value: '145 mg/dL', reference: '70-100', date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) }
      ],
      adherence: 72,
      riskScore: 0.68,
      lastVisit: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
    },
    'PA-002': {
      id: 'PA-002',
      patientName: 'John Anderson',
      age: 45,
      gender: 'Male',
      conditions: ['Diabetes', 'Hypertension', 'High Cholesterol'],
      medications: [
        { name: 'Metformin', dose: '1000mg', frequency: 'Twice daily', status: 'Active' },
        { name: 'Amlodipine', dose: '5mg', frequency: 'Once daily', status: 'Active' },
        { name: 'Atorvastatin', dose: '20mg', frequency: 'Once daily', status: 'Active' }
      ],
      labResults: [
        { test: 'Hemoglobin A1c', value: '6.8%', reference: '< 7%', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { test: 'Total Cholesterol', value: '180 mg/dL', reference: '< 200', date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
        { test: 'Blood Pressure', value: '130/80 mmHg', reference: '< 130/80', date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      ],
      adherence: 87,
      riskScore: 0.52,
      lastVisit: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000)
    },
    'PA-003': {
      id: 'PA-003',
      patientName: 'Sarah Mitchell',
      age: 38,
      gender: 'Female',
      conditions: ['Hypothyroidism', 'Cardiovascular Prevention'],
      medications: [
        { name: 'Levothyroxine', dose: '75 mcg', frequency: 'Once daily', status: 'Active' },
        { name: 'Aspirin', dose: '81mg', frequency: 'Once daily', status: 'Active' }
      ],
      labResults: [
        { test: 'TSH', value: '2.1 mIU/L', reference: '0.4-4.0', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        { test: 'T4', value: '7.8 ng/dL', reference: '4.5-12', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      ],
      adherence: 95,
      riskScore: 0.15,
      lastVisit: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    },
    'PA-004': {
      id: 'PA-004',
      patientName: 'Emma Rodriguez',
      age: 32,
      gender: 'Female',
      conditions: ['GERD', 'Occasional Migraines'],
      medications: [
        { name: 'Omeprazole', dose: '20mg', frequency: 'Once daily', status: 'Active' },
        { name: 'Sumatriptan', dose: '100mg', frequency: 'As needed', status: 'Active' }
      ],
      labResults: [
        { test: 'H. pylori', value: 'Negative', reference: 'Negative', date: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) }
      ],
      adherence: 98,
      riskScore: 0.08,
      lastVisit: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000)
    },
    'PA-005': {
      id: 'PA-005',
      patientName: 'James Thompson',
      age: 70,
      gender: 'Male',
      conditions: ['Atrial Fibrillation', 'Heart Failure', 'Hypertension'],
      medications: [
        { name: 'Warfarin', dose: '5mg', frequency: 'Once daily', status: 'Active' },
        { name: 'Furosemide', dose: '40mg', frequency: 'Once daily', status: 'Active' },
        { name: 'Metoprolol', dose: '50mg', frequency: 'Twice daily', status: 'Active' }
      ],
      labResults: [
        { test: 'INR', value: '2.3', reference: '2.0-3.0', date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        { test: 'BNP', value: '450 pg/mL', reference: '< 100', date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      ],
      adherence: 91,
      riskScore: 0.72,
      lastVisit: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
    },
    'PA-006': {
      id: 'PA-006',
      patientName: 'Lisa Wang',
      age: 55,
      gender: 'Female',
      conditions: ['Type 2 Diabetes', 'Prediabetes', 'Dyslipidemia'],
      medications: [
        { name: 'Metformin', dose: '1500mg', frequency: 'Twice daily', status: 'Active' },
        { name: 'Simvastatin', dose: '40mg', frequency: 'Once daily', status: 'Active' }
      ],
      labResults: [
        { test: 'Hemoglobin A1c', value: '6.9%', reference: '< 7%', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) },
        { test: 'LDL Cholesterol', value: '125 mg/dL', reference: '< 100', date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000) }
      ],
      adherence: 84,
      riskScore: 0.48,
      lastVisit: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    }
  };

  return patients[patientId] || patients['PA-001'];
}

/**
 * Generate report title based on type
 * @param {string} reportType - Report type
 * @param {string} patientName - Patient name
 * @returns {string} Report title
 */
function generateReportTitle(reportType, patientName) {
  const titles = {
    [REPORT_TYPES.COMPREHENSIVE]: `Comprehensive Health Report - ${patientName}`,
    [REPORT_TYPES.LAB_RESULTS]: `Lab Results Report - ${patientName}`,
    [REPORT_TYPES.MEDICATIONS]: `Medication Summary - ${patientName}`,
    [REPORT_TYPES.ADHERENCE]: `Adherence Analysis - ${patientName}`,
    [REPORT_TYPES.SUMMARY]: `30-Day Health Summary - ${patientName}`
  };

  return titles[reportType] || `Patient Report - ${patientName}`;
}

/**
 * Get all available report types
 * @returns {Array} List of report types with descriptions
 */
export async function getReportTypes() {
  await delay();
  
  return [
    {
      id: REPORT_TYPES.COMPREHENSIVE,
      name: 'Comprehensive Health Report',
      description: 'Complete patient health overview with all data',
      icon: '📋'
    },
    {
      id: REPORT_TYPES.LAB_RESULTS,
      name: 'Lab Results Report',
      description: 'Detailed lab test results and analysis',
      icon: '🧪'
    },
    {
      id: REPORT_TYPES.MEDICATIONS,
      name: 'Medication Summary',
      description: 'Current medications and prescriptions',
      icon: '💊'
    },
    {
      id: REPORT_TYPES.ADHERENCE,
      name: 'Adherence Analysis',
      description: 'Medication adherence trends and metrics',
      icon: '📈'
    },
    {
      id: REPORT_TYPES.SUMMARY,
      name: '30-Day Health Summary',
      description: 'Recent health status overview',
      icon: '📅'
    }
  ];
}

/**
 * Get generated report history
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} List of generated reports
 */
export async function getReportHistory(patientId) {
  await delay();
  if (!patientId) throw new Error('Patient ID required');

  return MOCK_REPORTS
    .filter(r => r.patientId === patientId)
    .map(r => ({
      id: r.id,
      patientId: r.patientId,
      reportType: r.reportType,
      title: r.title,
      generatedDate: r.generatedDate,
      status: r.status
    }))
    .sort((a, b) => b.generatedDate - a.generatedDate);
}

/**
 * Download report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Report download info
 */
export async function downloadReport(reportId) {
  await delay();
  if (!reportId) throw new Error('Report ID required');

  const report = MOCK_REPORTS.find(r => r.id === reportId);
  if (!report) throw new Error('Report not found');

  return {
    reportId,
    fileName: `${report.title.replace(/\s+/g, '_')}.pdf`,
    url: `https://firebasestorage.googleapis.com/reports/${reportId}.pdf`,
    size: Math.floor(Math.random() * 5000) + 1000, // KB
    format: 'PDF',
    status: 'ready'
  };
}

/**
 * Share report with patient
 * @param {string} reportId - Report ID
 * @param {string} patientEmail - Patient email
 * @returns {Promise<Object>} Share result
 */
export async function shareReportWithPatient(reportId, patientEmail) {
  await delay();
  if (!reportId || !patientEmail) throw new Error('Report ID and patient email required');

  const report = MOCK_REPORTS.find(r => r.id === reportId);
  if (!report) throw new Error('Report not found');

  return {
    reportId,
    sharedWith: patientEmail,
    sharedDate: new Date(),
    status: 'sent',
    message: `Report "${report.title}" shared with ${patientEmail}`
  };
}

/**
 * Get report preview data
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Report preview
 */
export async function getReportPreview(reportId) {
  await delay();
  if (!reportId) throw new Error('Report ID required');

  const report = MOCK_REPORTS.find(r => r.id === reportId);
  if (!report) throw new Error('Report not found');

  return {
    id: report.id,
    title: report.title,
    generatedDate: report.generatedDate,
    patientName: report.data.patientName,
    pages: report.pages,
    sections: report.sections,
    format: report.format,
    status: report.status
  };
}

/**
 * Format report for PDF display
 * @param {Object} report - Report object
 * @returns {Object} Formatted report
 */
export function formatReportPDF(report) {
  return {
    ...report,
    formattedTitle: report.title,
    formattedDate: report.generatedDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }),
    formattedTime: report.generatedDate.toLocaleTimeString(),
    pageCount: report.pages,
    sectionCount: report.sections.length
  };
}

/**
 * Archive report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Archive result
 */
export async function archiveReport(reportId) {
  await delay();
  if (!reportId) throw new Error('Report ID required');

  const report = MOCK_REPORTS.find(r => r.id === reportId);
  if (!report) throw new Error('Report not found');

  report.archived = true;
  report.archivedDate = new Date();

  return {
    reportId,
    archived: true,
    archivedDate: report.archivedDate
  };
}

/**
 * Delete report
 * @param {string} reportId - Report ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteReport(reportId) {
  await delay();
  if (!reportId) throw new Error('Report ID required');

  const index = MOCK_REPORTS.findIndex(r => r.id === reportId);
  if (index === -1) throw new Error('Report not found');

  MOCK_REPORTS.splice(index, 1);

  return {
    reportId,
    deleted: true
  };
}
