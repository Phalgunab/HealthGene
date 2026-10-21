/**
 * Access Management Utilities
 * Handles patient-side provider access management including:
 * - Granting/revoking provider access
 * - Permission level management
 * - Access history logging
 * - Provider search and validation
 * 
 * Firestore Integration: Uses users/{uid}/providerAccess and users/{uid}/accessAudit
 */

import { db } from '../firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  Timestamp,
  serverTimestamp,
  writeBatch,
  onSnapshot
} from 'firebase/firestore';

/**
 * Validate access permission data structure
 */
export const validateAccessPermission = (permissionData) => {
  const errors = {};

  if (!permissionData.providerId || typeof permissionData.providerId !== 'string') {
    errors.providerId = 'Valid provider ID is required';
  }

  const validLevels = ['Full', 'AdherenceOnly', 'ReadOnly', 'Custom'];
  if (!validLevels.includes(permissionData.permissionLevel)) {
    errors.permissionLevel = 'Valid permission level is required';
  }

  if (permissionData.permissionLevel === 'Custom') {
    if (!Array.isArray(permissionData.customPermissions) || permissionData.customPermissions.length === 0) {
      errors.customPermissions = 'At least one data type must be selected for custom permissions';
    }

    const validDataTypes = ['medications', 'adherence', 'adherence_trends', 'barriers', 'interventions', 'lab_results', 'medical_history'];
    const invalidTypes = permissionData.customPermissions.filter(type => !validDataTypes.includes(type));
    if (invalidTypes.length > 0) {
      errors.customPermissions = `Invalid data types: ${invalidTypes.join(', ')}`;
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get list of providers with current access from Firestore
 * Real implementation - queries providerAccess collection
 */
export const getProviderAccessListFromFirestore = async (userId) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const accessRef = collection(db, 'users', userId, 'providerAccess');
    const q = query(
      accessRef,
      where('status', '==', 'active'),
      orderBy('grantedDate', 'desc')
    );

    const snapshot = await getDocs(q);
    const providers = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      providers.push({
        accessId: doc.id,
        id: data.providerId,
        name: data.providerName,
        specialty: data.providerSpecialty,
        organization: data.providerOrganization || 'Not specified',
        email: data.providerEmail,
        permissionLevel: data.permissionLevel,
        lastAccessed: data.lastAccessDate ? new Date(data.lastAccessDate.seconds * 1000) : null,
        grantedDate: new Date(data.grantedDate.seconds * 1000),
        expirationDate: data.expirationDate ? new Date(data.expirationDate.seconds * 1000) : null,
        npi: data.providerNPI || 'N/A',
        avatar: data.providerName.split(' ').map(n => n[0]).join(''),
        notes: data.notes || ''
      });
    }

    return providers;
  } catch (error) {
    console.error('Error fetching provider access list from Firestore:', error);
    throw error;
  }
};

/**
 * Get single provider access record from Firestore
 */
export const getProviderAccessRecord = async (userId, accessId) => {
  try {
    const docRef = doc(db, 'users', userId, 'providerAccess', accessId);
    const docSnapshot = await getDoc(docRef);

    if (!docSnapshot.exists()) {
      throw new Error('Access record not found');
    }

    return {
      accessId: docSnapshot.id,
      ...docSnapshot.data()
    };
  } catch (error) {
    console.error('Error fetching provider access record:', error);
    throw error;
  }
};

/**
 * Grant provider access - writes to Firestore
 */
export const grantProviderAccessFirestore = async (userId, providerData, permissionLevel, customPermissions = [], expirationDays = null) => {
  try {
    if (!userId || !providerData.id) throw new Error('User ID and Provider ID are required');

    const accessId = `access_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const grantedDate = Timestamp.now();
    let expirationDate = null;

    if (expirationDays) {
      const expDate = new Date();
      expDate.setDate(expDate.getDate() + expirationDays);
      expirationDate = Timestamp.fromDate(expDate);
    }

    // Create access record
    const accessRecord = {
      patientId: userId,
      providerId: providerData.id,
      providerEmail: providerData.email,
      providerName: providerData.name,
      providerSpecialty: providerData.specialty,
      providerOrganization: providerData.organization || '',
      providerNPI: providerData.npi || '',
      permissionLevel,
      customPermissions: permissionLevel === 'Custom' ? customPermissions : [],
      grantedDate,
      expirationDate,
      lastAccessDate: null,
      status: 'active',
      notes: '',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Create audit log entry
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditEntry = {
      patientId: userId,
      providerId: providerData.id,
      action: 'granted',
      actionDate: grantedDate,
      actionBy: 'patient',
      permissionLevel,
      reason: 'Patient granted access',
      timestamp: serverTimestamp()
    };

    // Write both documents in transaction
    const batch = writeBatch(db);

    const accessDocRef = doc(db, 'users', userId, 'providerAccess', accessId);
    const auditDocRef = doc(db, 'users', userId, 'accessAudit', auditId);

    batch.set(accessDocRef, accessRecord);
    batch.set(auditDocRef, auditEntry);

    await batch.commit();

    return {
      success: true,
      accessId,
      message: `Access granted to ${providerData.name}`
    };
  } catch (error) {
    console.error('Error granting provider access:', error);
    throw error;
  }
};

/**
 * Revoke provider access - updates Firestore
 */
export const revokeProviderAccessFirestore = async (userId, accessId, reason = '') => {
  try {
    if (!userId || !accessId) throw new Error('User ID and Access ID are required');

    const accessDocRef = doc(db, 'users', userId, 'providerAccess', accessId);
    
    // Get current access record for audit
    const accessDoc = await getDoc(accessDocRef);
    if (!accessDoc.exists()) {
      throw new Error('Access record not found');
    }

    const accessData = accessDoc.data();

    // Create audit log entry
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditEntry = {
      patientId: userId,
      providerId: accessData.providerId,
      action: 'revoked',
      actionDate: Timestamp.now(),
      actionBy: 'patient',
      permissionLevel: accessData.permissionLevel,
      reason: reason || 'Patient revoked access',
      timestamp: serverTimestamp()
    };

    // Write both updates in transaction
    const batch = writeBatch(db);

    batch.update(accessDocRef, {
      status: 'revoked',
      updatedAt: serverTimestamp()
    });

    const auditDocRef = doc(db, 'users', userId, 'accessAudit', auditId);
    batch.set(auditDocRef, auditEntry);

    await batch.commit();

    return {
      success: true,
      message: 'Provider access revoked successfully'
    };
  } catch (error) {
    console.error('Error revoking provider access:', error);
    throw error;
  }
};

/**
 * Update permission level for existing access
 */
export const updateAccessLevelFirestore = async (userId, accessId, newLevel, customPermissions = [], reason = '') => {
  try {
    if (!userId || !accessId) throw new Error('User ID and Access ID are required');

    const accessDocRef = doc(db, 'users', userId, 'providerAccess', accessId);
    
    // Get current access record
    const accessDoc = await getDoc(accessDocRef);
    if (!accessDoc.exists()) {
      throw new Error('Access record not found');
    }

    const accessData = accessDoc.data();

    // Create audit log entry
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const auditEntry = {
      patientId: userId,
      providerId: accessData.providerId,
      action: 'updated',
      actionDate: Timestamp.now(),
      actionBy: 'patient',
      permissionLevel: newLevel,
      reason: reason || `Permission level changed from ${accessData.permissionLevel} to ${newLevel}`,
      timestamp: serverTimestamp()
    };

    // Write both updates
    const batch = writeBatch(db);

    batch.update(accessDocRef, {
      permissionLevel: newLevel,
      customPermissions: newLevel === 'Custom' ? customPermissions : [],
      updatedAt: serverTimestamp()
    });

    const auditDocRef = doc(db, 'users', userId, 'accessAudit', auditId);
    batch.set(auditDocRef, auditEntry);

    await batch.commit();

    return {
      success: true,
      message: 'Permission level updated successfully'
    };
  } catch (error) {
    console.error('Error updating access level:', error);
    throw error;
  }
};

/**
 * Get access history from Firestore
 */
export const getAccessHistoryFromFirestore = async (userId, filters = {}) => {
  try {
    if (!userId) throw new Error('User ID is required');

    const auditRef = collection(db, 'users', userId, 'accessAudit');
    let q = query(auditRef, orderBy('actionDate', 'desc'), limit(100));

    const snapshot = await getDocs(q);
    let events = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      events.push({
        id: doc.id,
        type: data.action,
        providerId: data.providerId,
        providerName: data.providerName || 'Unknown',
        permissionLevel: data.permissionLevel,
        timestamp: new Date(data.actionDate.seconds * 1000),
        description: formatAuditDescription(data.action, data.providerName, data.permissionLevel),
        reason: data.reason,
        actionBy: data.actionBy
      });
    }

    // Apply filters
    if (filters.eventType) {
      events = events.filter(e => e.type === filters.eventType);
    }

    if (filters.providerId) {
      events = events.filter(e => e.providerId === filters.providerId);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      events = events.filter(e => e.timestamp >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      events = events.filter(e => e.timestamp <= endDate);
    }

    return events;
  } catch (error) {
    console.error('Error fetching access history:', error);
    throw error;
  }
};

/**
 * Helper to format audit description
 */
const formatAuditDescription = (action, providerName, permissionLevel) => {
  switch (action) {
    case 'granted':
      return `Access granted to ${providerName} - ${permissionLevel}`;
    case 'revoked':
      return `Access revoked from ${providerName}`;
    case 'updated':
      return `Permission updated for ${providerName} - ${permissionLevel}`;
    case 'accessed':
      return `${providerName} accessed your data`;
    default:
      return `Action: ${action}`;
  }
};

/**
 * Search for providers by email or name from providers collection
 */
export const searchProvidersFirestore = async (searchTerm, searchLimit = 10) => {
  try {
    if (!searchTerm || searchTerm.length < 2) {
      return [];
    }

    // Query providers collection
    const providersRef = collection(db, 'providers');
    const q = query(
      providersRef,
      where('status', '==', 'verified'),
      limit(searchLimit)
    );

    const snapshot = await getDocs(q);
    const results = [];

    for (const doc of snapshot.docs) {
      const data = doc.data();
      const searchLower = searchTerm.toLowerCase();
      
      // Filter results by search term
      if (
        data.fullName?.toLowerCase().includes(searchLower) ||
        data.email?.toLowerCase().includes(searchLower) ||
        data.specialization?.toLowerCase().includes(searchLower)
      ) {
        results.push({
          id: doc.id,
          name: data.fullName,
          email: data.email,
          specialty: data.specialization,
          organization: data.hospitalName || 'Not specified',
          npi: data.licenseNumber || 'N/A'
        });
      }
    }

    return results.slice(0, searchLimit);
  } catch (error) {
    console.error('Error searching providers:', error);
    // Fallback to mock data if Firestore fails
    return searchProvidersMock(searchTerm, searchLimit);
  }
};

/**
 * Listen to real-time changes in provider access
 */
export const onProviderAccessChange = (userId, callback) => {
  try {
    if (!userId) {
      callback([]);
      return () => {};
    }

    const accessRef = collection(db, 'users', userId, 'providerAccess');
    const q = query(
      accessRef,
      where('status', '==', 'active'),
      orderBy('grantedDate', 'desc')
    );

    return onSnapshot(q, (snapshot) => {
      const providers = [];
      
      for (const doc of snapshot.docs) {
        const data = doc.data();
        providers.push({
          accessId: doc.id,
          id: data.providerId,
          name: data.providerName,
          specialty: data.providerSpecialty,
          organization: data.providerOrganization || 'Not specified',
          email: data.providerEmail,
          permissionLevel: data.permissionLevel,
          lastAccessed: data.lastAccessDate ? new Date(data.lastAccessDate.seconds * 1000) : null,
          grantedDate: new Date(data.grantedDate.seconds * 1000),
          expirationDate: data.expirationDate ? new Date(data.expirationDate.seconds * 1000) : null,
          npi: data.providerNPI || 'N/A',
          avatar: data.providerName.split(' ').map(n => n[0]).join(''),
          notes: data.notes || ''
        });
      }

      callback(providers);
    }, (error) => {
      console.error('Error listening to provider access:', error);
      callback([]);
    });
  } catch (error) {
    console.error('Error setting up real-time listener:', error);
    return () => {};
  }
};

/**
 * Mock functions for fallback
 */
const searchProvidersMock = async (query, limit = 10) => {
  // Mock delay to simulate network request
  await new Promise(resolve => setTimeout(resolve, 600));

  const allProviders = [
    {
      id: 'prov_101',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@clinic.com',
      specialty: 'Cardiologist',
      organization: 'Heart & Wellness Clinic',
      npi: '1234567890'
    },
    {
      id: 'prov_102',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@diabetes.com',
      specialty: 'Endocrinologist',
      organization: 'Diabetes Care Center',
      npi: '0987654321'
    },
    {
      id: 'prov_103',
      name: 'Dr. James Wilson',
      email: 'james.wilson@community.com',
      specialty: 'Family Medicine',
      organization: 'Community Health Center',
      npi: '1111111111'
    },
    {
      id: 'prov_104',
      name: 'Dr. Maria Garcia',
      email: 'maria.garcia@skin.com',
      specialty: 'Dermatologist',
      organization: 'Skin Care Specialists',
      npi: '2222222222'
    },
    {
      id: 'prov_105',
      name: 'Nurse Practitioner Lisa Brown',
      email: 'lisa.brown@primary.com',
      specialty: 'Nurse Practitioner',
      organization: 'Primary Care Plus',
      npi: '1122334455'
    },
    {
      id: 'prov_106',
      name: 'Dr. Robert Taylor',
      email: 'robert.taylor@respiratory.com',
      specialty: 'Pulmonologist',
      organization: 'Respiratory Health Group',
      npi: '3333333333'
    }
  ];

  const searchLower = query.toLowerCase();
  return allProviders.filter(provider =>
    provider.name.toLowerCase().includes(searchLower) ||
    provider.email.toLowerCase().includes(searchLower) ||
    provider.specialty.toLowerCase().includes(searchLower)
  ).slice(0, limit);
};

/**
 * Grant access to a new provider (wrapper for Firestore)
 */
export const grantProviderAccess = grantProviderAccessFirestore;

/**
 * Revoke access from a provider (wrapper for Firestore)
 */
export const revokeProviderAccess = revokeProviderAccessFirestore;

/**
 * Update permission level for existing provider access (wrapper for Firestore)
 */
export const updateAccessLevel = updateAccessLevelFirestore;

/**
 * Get access history with optional filters (wrapper for Firestore)
 */
export const getAccessHistory = getAccessHistoryFromFirestore;

/**
 * Get list of providers with current access (wrapper for Firestore)
 */
export const getProviderAccessList = getProviderAccessListFromFirestore;

/**
 * Search for providers (wrapper for Firestore with fallback)
 */
export const searchProviders = searchProvidersFirestore;

/**
 * Search for providers by name or NPI
 * @deprecated Use searchProviders instead
 */
const searchProvidersMockLegacy = async (query, limit = 10) => {
  try {
    if (!query || query.length < 2) {
      return [];
    }

    // Mock delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 600));

    // Mock provider database
    const allProviders = [
      {
        id: 'prov_101',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        organization: 'Heart & Wellness Clinic',
        npi: '1234567890',
        licenseState: 'CA'
      },
      {
        id: 'prov_102',
        name: 'Dr. Michael Chen',
        specialty: 'Endocrinologist',
        organization: 'Diabetes Care Center',
        npi: '0987654321',
        licenseState: 'NY'
      },
      {
        id: 'prov_103',
        name: 'Dr. James Wilson',
        specialty: 'Family Medicine',
        organization: 'Community Health Center',
        npi: '1111111111',
        licenseState: 'TX'
      },
      {
        id: 'prov_104',
        name: 'Dr. Maria Garcia',
        specialty: 'Dermatologist',
        organization: 'Skin Care Specialists',
        npi: '2222222222',
        licenseState: 'FL'
      },
      {
        id: 'prov_105',
        name: 'Nurse Practitioner Lisa Brown',
        specialty: 'Nurse Practitioner',
        organization: 'Primary Care Plus',
        npi: '1122334455',
        licenseState: 'WA'
      },
      {
        id: 'prov_106',
        name: 'Dr. Robert Taylor',
        specialty: 'Pulmonologist',
        organization: 'Respiratory Health Group',
        npi: '3333333333',
        licenseState: 'IL'
      }
    ];

    // Search by name or NPI
    const searchLower = query.toLowerCase();
    const results = allProviders.filter(provider =>
      provider.name.toLowerCase().includes(searchLower) ||
      provider.npi.includes(query) ||
      provider.specialty.toLowerCase().includes(searchLower)
    ).slice(0, limit);

    return results;
  } catch (error) {
    console.error('Error searching providers:', error);
    throw error;
  }
};

/**
 * Calculate when access expires (annual expiration)
 */
export const calculateAccessExpiration = (grantedDate, expiryDays = 365) => {
  const granted = new Date(grantedDate);
  const expiration = new Date(granted);
  expiration.setDate(expiration.getDate() + expiryDays);
  return expiration;
};

/**
 * Get available data types for permission level
 */
export const getAccessDataTypes = (permissionLevel) => {
  const allDataTypes = ['medications', 'adherence', 'adherence_trends', 'barriers', 'interventions', 'lab_results', 'medical_history'];

  switch (permissionLevel) {
    case 'Full':
      return allDataTypes;
    case 'AdherenceOnly':
      return ['adherence', 'adherence_trends', 'barriers', 'interventions'];
    case 'ReadOnly':
      return allDataTypes;
    case 'Custom':
      return [];
    default:
      return [];
  }
};

/**
 * Get permission level details and description
 */
export const getPermissionLevelDetails = (level) => {
  const details = {
    Full: {
      label: 'Full Access',
      description: 'Provider can view all patient data including medications, adherence, lab results, and medical history. Can also send messages.',
      color: '#10b981',
      icon: 'eye'
    },
    AdherenceOnly: {
      label: 'Adherence Only',
      description: 'Provider can only view adherence metrics, trends, barriers, and recommendations. Ideal for adherence specialists.',
      color: '#3b82f6',
      icon: 'activity'
    },
    ReadOnly: {
      label: 'Read Only',
      description: 'Provider can view all data but cannot send messages or make changes. View-only access.',
      color: '#f59e0b',
      icon: 'eye-off'
    },
    Custom: {
      label: 'Custom',
      description: 'Select specific data types for this provider to access. More granular control.',
      color: '#a855f7',
      icon: 'settings'
    }
  };

  return details[level] || details.Custom;
};

/**
 * Log access event for audit trail
 */
export const logAccessEvent = async (userId, providerId, eventType, details = {}) => {
  try {
    // Mock delay
    await new Promise(resolve => setTimeout(resolve, 300));

    const accessEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      providerId,
      eventType,
      timestamp: new Date().toISOString(),
      details,
      ipAddress: '192.168.1.1', // Mock IP
      userAgent: navigator.userAgent
    };

    // In production, save to Firestore
    console.log('Access event logged:', accessEvent);

    return accessEvent;
  } catch (error) {
    console.error('Error logging access event:', error);
    throw error;
  }
};

/**
 * Check if provider access is still valid
 */
export const isAccessValid = (grantedDate, expiryDays = 365) => {
  const expiration = calculateAccessExpiration(grantedDate, expiryDays);
  return new Date() <= expiration;
};

/**
 * Format permission level for display
 */
export const formatPermissionLevel = (level) => {
  const mapping = {
    Full: 'Full Access',
    AdherenceOnly: 'Adherence Only',
    ReadOnly: 'Read Only',
    Custom: 'Custom'
  };
  return mapping[level] || level;
};

/**
 * Default export with all functions
 */
export default {
  validateAccessPermission,
  getProviderAccessList,
  getProviderAccessListFromFirestore,
  getProviderAccessRecord,
  grantProviderAccess,
  grantProviderAccessFirestore,
  revokeProviderAccess,
  revokeProviderAccessFirestore,
  updateAccessLevel,
  updateAccessLevelFirestore,
  getAccessHistory,
  getAccessHistoryFromFirestore,
  searchProviders,
  searchProvidersFirestore,
  onProviderAccessChange,
  calculateAccessExpiration,
  getAccessDataTypes,
  getPermissionLevelDetails,
  logAccessEvent,
  isAccessValid,
  formatPermissionLevel
};
