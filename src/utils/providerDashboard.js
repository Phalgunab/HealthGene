/**
 * Provider Dashboard Utilities
 * Comprehensive utilities for provider-side patient discovery, metrics, and notifications
 * Includes mock data with network delay simulation for realistic testing
 */

// Mock patient data for development
const MOCK_PATIENTS = [
  {
    id: 'patient-001',
    name: 'John Anderson',
    dateOfBirth: '1975-03-15',
    phone: '555-0101',
    email: 'john.anderson@email.com',
    medications: ['Metformin 500mg', 'Lisinopril 10mg', 'Atorvastatin 20mg'],
    conditions: ['Type 2 Diabetes', 'Hypertension', 'High Cholesterol'],
    adherenceRate: 87,
    adherenceTrend: 'improving', // improving, stable, declining
    lastVisit: new Date('2026-10-15'),
    nextAppointment: new Date('2026-11-05'),
    alerts: [
      { id: 'alert-1', type: 'warning', message: 'Missed doses detected (2 days)', severity: 'medium' },
      { id: 'alert-2', type: 'info', message: 'Lab results available', severity: 'low' }
    ],
    riskScore: 0.35, // 0-1 scale, higher = higher risk
    lastAdherenceUpdate: new Date('2026-10-20'),
    communicationPreference: 'email',
    insuranceProvider: 'BlueCross BlueShield'
  },
  {
    id: 'patient-002',
    name: 'Sarah Mitchell',
    dateOfBirth: '1982-07-22',
    phone: '555-0102',
    email: 'sarah.mitchell@email.com',
    medications: ['Levothyroxine 75mcg', 'Aspirin 81mg'],
    conditions: ['Hypothyroidism', 'Cardiovascular Prevention'],
    adherenceRate: 95,
    adherenceTrend: 'stable',
    lastVisit: new Date('2026-10-10'),
    nextAppointment: new Date('2026-11-10'),
    alerts: [],
    riskScore: 0.15,
    lastAdherenceUpdate: new Date('2026-10-20'),
    communicationPreference: 'sms',
    insuranceProvider: 'Aetna'
  },
  {
    id: 'patient-003',
    name: 'Michael Chen',
    dateOfBirth: '1968-11-08',
    phone: '555-0103',
    email: 'mchen@email.com',
    medications: ['Insulin Glargine', 'Metformin 1000mg', 'Ramipril 5mg', 'Rosuvastatin 10mg'],
    conditions: ['Type 1 Diabetes', 'Chronic Kidney Disease Stage 2', 'Hypertension'],
    adherenceRate: 72,
    adherenceTrend: 'declining',
    lastVisit: new Date('2026-10-08'),
    nextAppointment: new Date('2026-10-28'),
    alerts: [
      { id: 'alert-1', type: 'critical', message: 'Critical adherence drop: 92% → 72%', severity: 'high' },
      { id: 'alert-2', type: 'warning', message: 'Blood glucose readings elevated', severity: 'high' },
      { id: 'alert-3', type: 'info', message: 'Medication refill needed', severity: 'medium' }
    ],
    riskScore: 0.72,
    lastAdherenceUpdate: new Date('2026-10-20'),
    communicationPreference: 'phone',
    insuranceProvider: 'United Healthcare'
  },
  {
    id: 'patient-004',
    name: 'Emma Rodriguez',
    dateOfBirth: '1990-05-30',
    phone: '555-0104',
    email: 'emma.r@email.com',
    medications: ['Omeprazole 20mg', 'Ibuprofen PRN'],
    conditions: ['GERD', 'Occasional Migraines'],
    adherenceRate: 98,
    adherenceTrend: 'stable',
    lastVisit: new Date('2026-09-20'),
    nextAppointment: new Date('2026-12-15'),
    alerts: [],
    riskScore: 0.08,
    lastAdherenceUpdate: new Date('2026-10-20'),
    communicationPreference: 'email',
    insuranceProvider: 'Kaiser Permanente'
  },
  {
    id: 'patient-005',
    name: 'James Thompson',
    dateOfBirth: '1958-09-12',
    phone: '555-0105',
    email: 'jthompson@email.com',
    medications: ['Warfarin 5mg', 'Metoprolol 50mg', 'Digoxin 0.25mg'],
    conditions: ['Atrial Fibrillation', 'Heart Failure', 'Hypertension'],
    adherenceRate: 91,
    adherenceTrend: 'improving',
    lastVisit: new Date('2026-10-12'),
    nextAppointment: new Date('2026-10-26'),
    alerts: [
      { id: 'alert-1', type: 'warning', message: 'INR monitoring due', severity: 'medium' }
    ],
    riskScore: 0.58,
    lastAdherenceUpdate: new Date('2026-10-20'),
    communicationPreference: 'phone',
    insuranceProvider: 'Cigna'
  },
  {
    id: 'patient-006',
    name: 'Lisa Wang',
    dateOfBirth: '1985-12-25',
    phone: '555-0106',
    email: 'lisa.wang@email.com',
    medications: ['Metformin XR 1000mg', 'Sitagliptin 100mg', 'Atorvastatin 40mg'],
    conditions: ['Type 2 Diabetes', 'Prediabetes Progression', 'Dyslipidemia'],
    adherenceRate: 84,
    adherenceTrend: 'stable',
    lastVisit: new Date('2026-10-14'),
    nextAppointment: new Date('2026-11-14'),
    alerts: [
      { id: 'alert-1', type: 'info', message: 'A1C results available', severity: 'low' }
    ],
    riskScore: 0.42,
    lastAdherenceUpdate: new Date('2026-10-20'),
    communicationPreference: 'email',
    insuranceProvider: 'BCBS'
  }
];

// Network delay simulation (realistic 600-1200ms)
const delay = (ms = 800) => new Promise(resolve => setTimeout(resolve, ms + Math.random() * 400));

/**
 * Get list of patients the provider has access to
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>} - Array of patient objects
 */
export async function getProviderPatients(providerId) {
  await delay();
  
  if (!providerId || typeof providerId !== 'string') {
    throw new Error('Invalid provider ID');
  }
  
  // Return all patients with additional metadata
  return MOCK_PATIENTS.map(patient => ({
    ...patient,
    age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
    alertCount: patient.alerts.length,
    riskLevel: getRiskLevel(patient.riskScore),
    status: 'active'
  }));
}

/**
 * Get detailed patient information
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} - Comprehensive patient data
 */
export async function getPatientDetail(patientId) {
  await delay();
  
  if (!patientId) {
    throw new Error('Patient ID required');
  }
  
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);
  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }
  
  // Generate detailed adherence history (last 30 days)
  const adherenceHistory = generateAdherenceHistory(patient.adherenceRate);
  
  // Generate lab results
  const labResults = generateLabResults(patient.conditions);
  
  return {
    ...patient,
    age: new Date().getFullYear() - new Date(patient.dateOfBirth).getFullYear(),
    adherenceHistory,
    labResults,
    vitals: generateVitals(patient),
    prescriptions: generatePrescriptions(patient.medications),
    visitHistory: generateVisitHistory(patient.id),
    communicationLog: generateCommunicationLog(patient.id)
  };
}

/**
 * Search for patients by name or ID
 * @param {string} searchTerm - Search query
 * @returns {Promise<Array>} - Matching patients
 */
export async function searchPatients(searchTerm) {
  await delay(500); // Faster for search
  
  if (!searchTerm || typeof searchTerm !== 'string') {
    return [];
  }
  
  const term = searchTerm.toLowerCase();
  return MOCK_PATIENTS.filter(p => 
    p.name.toLowerCase().includes(term) ||
    p.id.toLowerCase().includes(term) ||
    p.email.toLowerCase().includes(term)
  ).slice(0, 10); // Return top 10 results
}

/**
 * Get patient alerts and notifications
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} - Patient alerts
 */
export async function getPatientAlerts(patientId) {
  await delay();
  
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);
  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }
  
  return patient.alerts.map(alert => ({
    ...alert,
    patientId,
    patientName: patient.name,
    timestamp: new Date(),
    read: false,
    actionRequired: ['critical', 'warning'].includes(alert.type)
  }));
}

/**
 * Get provider's dashboard statistics
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} - Dashboard stats
 */
export async function getDashboardStats(providerId) {
  await delay();
  
  const patients = MOCK_PATIENTS;
  const allAlerts = patients.flatMap(p => p.alerts);
  
  return {
    totalPatients: patients.length,
    activeAlerts: allAlerts.length,
    highRiskPatients: patients.filter(p => p.riskScore > 0.6).length,
    averageAdherence: Math.round(
      patients.reduce((sum, p) => sum + p.adherenceRate, 0) / patients.length
    ),
    patientsAtRisk: patients.filter(p => p.riskScore > 0.5).length,
    appointmentsToday: patients.filter(p => 
      p.nextAppointment.toDateString() === new Date().toDateString()
    ).length,
    appointmentsThisWeek: patients.filter(p => {
      const daysUntil = Math.floor((p.nextAppointment - new Date()) / (1000 * 60 * 60 * 24));
      return daysUntil > 0 && daysUntil <= 7;
    }).length,
    criticalAlerts: allAlerts.filter(a => a.severity === 'high').length,
    warningAlerts: allAlerts.filter(a => a.severity === 'medium').length
  };
}

/**
 * Get patients by adherence status
 * @param {string} status - 'excellent' | 'good' | 'fair' | 'poor'
 * @returns {Promise<Array>} - Filtered patients
 */
export async function getPatientsByAdherence(status) {
  await delay();
  
  const adherenceRanges = {
    'excellent': { min: 90, max: 100 },
    'good': { min: 75, max: 89 },
    'fair': { min: 60, max: 74 },
    'poor': { min: 0, max: 59 }
  };
  
  const range = adherenceRanges[status];
  if (!range) {
    throw new Error('Invalid adherence status');
  }
  
  return MOCK_PATIENTS.filter(p => 
    p.adherenceRate >= range.min && p.adherenceRate <= range.max
  );
}

/**
 * Get patients sorted by metric
 * @param {string} sortBy - 'name' | 'adherence' | 'risk' | 'lastVisit' | 'alerts'
 * @param {string} order - 'asc' | 'desc'
 * @returns {Promise<Array>} - Sorted patients
 */
export async function getPatientsSorted(sortBy = 'name', order = 'asc') {
  await delay();
  
  const patients = [...MOCK_PATIENTS];
  
  const comparators = {
    'name': (a, b) => a.name.localeCompare(b.name),
    'adherence': (a, b) => b.adherenceRate - a.adherenceRate,
    'risk': (a, b) => b.riskScore - a.riskScore,
    'lastVisit': (a, b) => new Date(b.lastVisit) - new Date(a.lastVisit),
    'alerts': (a, b) => b.alerts.length - a.alerts.length
  };
  
  const comparator = comparators[sortBy];
  if (!comparator) {
    throw new Error('Invalid sort field');
  }
  
  patients.sort(comparator);
  return order === 'desc' ? patients.reverse() : patients;
}

/**
 * Get adherence comparison data for multiple patients
 * @param {Array<string>} patientIds - Patient IDs to compare
 * @returns {Promise<Array>} - Comparison data
 */
export async function comparePatientAdherence(patientIds) {
  await delay();
  
  if (!Array.isArray(patientIds) || patientIds.length === 0) {
    throw new Error('At least one patient ID required');
  }
  
  return MOCK_PATIENTS
    .filter(p => patientIds.includes(p.id))
    .map(p => ({
      patientId: p.id,
      name: p.name,
      adherenceRate: p.adherenceRate,
      adherenceTrend: p.adherenceTrend,
      riskScore: p.riskScore,
      lastUpdate: p.lastAdherenceUpdate,
      alertCount: p.alerts.length
    }));
}

/**
 * Log provider action (view, message, etc.)
 * @param {string} providerId - Provider ID
 * @param {string} patientId - Patient ID
 * @param {string} action - Action type
 * @param {Object} metadata - Additional data
 * @returns {Promise<Object>} - Logged action
 */
export async function logProviderAction(providerId, patientId, action, metadata = {}) {
  await delay();
  
  if (!providerId || !patientId || !action) {
    throw new Error('Provider ID, Patient ID, and action are required');
  }
  
  return {
    id: `action-${Date.now()}`,
    providerId,
    patientId,
    action,
    timestamp: new Date(),
    metadata,
    status: 'logged'
  };
}

/**
 * Get provider notifications
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>} - Provider notifications
 */
export async function getProviderNotifications(providerId) {
  await delay();
  
  const allAlerts = MOCK_PATIENTS.flatMap(p => 
    p.alerts.map(a => ({
      ...a,
      patientId: p.id,
      patientName: p.name
    }))
  );
  
  return allAlerts.sort((a, b) => {
    const severityOrder = { 'high': 1, 'medium': 2, 'low': 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
}

/**
 * Get risk assessment for patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} - Risk assessment data
 */
export async function getPatientRiskAssessment(patientId) {
  await delay();
  
  const patient = MOCK_PATIENTS.find(p => p.id === patientId);
  if (!patient) {
    throw new Error(`Patient ${patientId} not found`);
  }
  
  const riskFactors = [];
  
  if (patient.adherenceRate < 80) {
    riskFactors.push({
      factor: 'Low Adherence',
      weight: 0.3,
      description: `Current adherence: ${patient.adherenceRate}%`
    });
  }
  
  if (patient.adherenceTrend === 'declining') {
    riskFactors.push({
      factor: 'Declining Trend',
      weight: 0.2,
      description: 'Adherence is worsening over time'
    });
  }
  
  if (patient.conditions.length > 2) {
    riskFactors.push({
      factor: 'Multiple Conditions',
      weight: 0.25,
      description: `${patient.conditions.length} chronic conditions`
    });
  }
  
  if (patient.alerts.length > 0) {
    riskFactors.push({
      factor: 'Active Alerts',
      weight: 0.15,
      description: `${patient.alerts.length} active alerts`
    });
  }
  
  if (patient.medications.length > 3) {
    riskFactors.push({
      factor: 'Complex Medication Regimen',
      weight: 0.1,
      description: `${patient.medications.length} medications`
    });
  }
  
  return {
    patientId,
    riskScore: patient.riskScore,
    riskLevel: getRiskLevel(patient.riskScore),
    riskFactors,
    recommendations: generateRiskRecommendations(patient),
    nextReview: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
}

/**
 * Get patient communication history
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} - Communication log
 */
export async function getPatientCommunications(patientId) {
  await delay();
  
  if (!patientId) {
    throw new Error('Patient ID required');
  }
  
  return generateCommunicationLog(patientId);
}

/**
 * Send message to patient
 * @param {string} providerId - Provider ID
 * @param {string} patientId - Patient ID
 * @param {string} message - Message content
 * @returns {Promise<Object>} - Sent message
 */
export async function sendMessageToPatient(providerId, patientId, message) {
  await delay();
  
  if (!providerId || !patientId || !message) {
    throw new Error('Provider ID, Patient ID, and message are required');
  }
  
  if (message.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }
  
  return {
    id: `msg-${Date.now()}`,
    providerId,
    patientId,
    message,
    timestamp: new Date(),
    status: 'sent',
    readAt: null
  };
}

// ============== HELPER FUNCTIONS ==============

/**
 * Convert risk score to risk level
 */
function getRiskLevel(riskScore) {
  if (riskScore >= 0.7) return 'critical';
  if (riskScore >= 0.5) return 'high';
  if (riskScore >= 0.3) return 'moderate';
  return 'low';
}

/**
 * Generate adherence history for the last 30 days
 */
function generateAdherenceHistory(baseRate) {
  const history = [];
  const today = new Date();
  
  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    
    // Add some variance to the rate
    const variance = (Math.random() - 0.5) * 10;
    const rate = Math.max(0, Math.min(100, baseRate + variance));
    
    history.push({
      date: date.toISOString().split('T')[0],
      adherenceRate: Math.round(rate),
      dosesExpected: Math.floor(Math.random() * 4) + 1,
      dosesTaken: Math.floor(Math.random() * 5)
    });
  }
  
  return history;
}

/**
 * Generate lab results
 */
function generateLabResults(conditions) {
  const results = [];
  
  if (conditions.some(c => c.includes('Diabetes'))) {
    results.push({
      testName: 'HbA1c',
      value: '7.2',
      unit: '%',
      referenceRange: '<5.7',
      status: 'elevated',
      date: new Date('2026-10-15')
    });
  }
  
  if (conditions.some(c => c.includes('Cholesterol') || c.includes('Dyslipidemia'))) {
    results.push({
      testName: 'Total Cholesterol',
      value: '215',
      unit: 'mg/dL',
      referenceRange: '<200',
      status: 'elevated',
      date: new Date('2026-10-15')
    });
  }
  
  if (conditions.some(c => c.includes('Kidney'))) {
    results.push({
      testName: 'Creatinine',
      value: '1.4',
      unit: 'mg/dL',
      referenceRange: '0.7-1.3',
      status: 'elevated',
      date: new Date('2026-10-15')
    });
  }
  
  return results;
}

/**
 * Generate vitals
 */
function generateVitals(patient) {
  return {
    bloodPressure: '138/88',
    heartRate: '72 bpm',
    temperature: '98.6°F',
    weight: '185 lbs',
    height: '5\' 10"',
    bmi: '26.5',
    lastMeasured: new Date('2026-10-15')
  };
}

/**
 * Generate prescriptions
 */
function generatePrescriptions(medications) {
  return medications.map((med, idx) => ({
    id: `rx-${idx}`,
    medication: med,
    dosage: med,
    frequency: 'Once daily',
    prescribedDate: new Date('2026-09-15'),
    refillsRemaining: Math.floor(Math.random() * 5),
    lastRefilled: new Date('2026-10-01')
  }));
}

/**
 * Generate visit history
 */
function generateVisitHistory(patientId) {
  return [
    {
      date: new Date('2026-10-15'),
      type: 'In-person',
      reason: 'Regular checkup',
      notes: 'Patient doing well, adherence improving'
    },
    {
      date: new Date('2026-09-20'),
      type: 'Telehealth',
      reason: 'Medication adjustment',
      notes: 'Increased Metformin dose due to elevated glucose'
    },
    {
      date: new Date('2026-08-15'),
      type: 'In-person',
      reason: 'Annual physical',
      notes: 'All vitals stable'
    }
  ];
}

/**
 * Generate communication log
 */
function generateCommunicationLog(patientId) {
  return [
    {
      id: 'comm-1',
      type: 'SMS',
      direction: 'outbound',
      message: 'Reminder: Take your medications',
      timestamp: new Date('2026-10-20T09:00:00'),
      status: 'delivered'
    },
    {
      id: 'comm-2',
      type: 'Email',
      direction: 'inbound',
      message: 'Lab results are ready for review',
      timestamp: new Date('2026-10-19T14:30:00'),
      status: 'read'
    },
    {
      id: 'comm-3',
      type: 'Phone',
      direction: 'outbound',
      message: 'Follow-up call regarding adherence',
      timestamp: new Date('2026-10-18T10:00:00'),
      status: 'completed'
    }
  ];
}

/**
 * Generate risk recommendations
 */
function generateRiskRecommendations(patient) {
  const recommendations = [];
  
  if (patient.adherenceRate < 80) {
    recommendations.push('Increase medication reminders frequency');
    recommendations.push('Consider simplified medication regimen');
  }
  
  if (patient.alerts.length > 0) {
    recommendations.push('Schedule medication review appointment');
  }
  
  if (patient.riskScore > 0.5) {
    recommendations.push('Implement intensive monitoring program');
    recommendations.push('Consider care coordinator involvement');
  }
  
  return recommendations;
}
