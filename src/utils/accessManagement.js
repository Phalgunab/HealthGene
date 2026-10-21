/**
 * Access Management Utilities
 * Handles patient-side provider access management including:
 * - Granting/revoking provider access
 * - Permission level management
 * - Access history logging
 * - Provider search and validation
 */

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
 * Get list of providers with current access
 * Mock implementation - connects to Firestore in production
 */
export const getProviderAccessList = async (userId) => {
  try {
    // Mock delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data - in production, fetch from Firestore
    const mockProviders = [
      {
        id: 'prov_001',
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiologist',
        organization: 'Heart & Wellness Clinic',
        permissionLevel: 'Full',
        lastAccessed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        grantedDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        npi: '1234567890',
        avatar: 'SJ'
      },
      {
        id: 'prov_002',
        name: 'Dr. Michael Chen',
        specialty: 'Endocrinologist',
        organization: 'Diabetes Care Center',
        permissionLevel: 'AdherenceOnly',
        lastAccessed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        grantedDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        npi: '0987654321',
        avatar: 'MC'
      },
      {
        id: 'prov_003',
        name: 'Nurse Practitioner Lisa Brown',
        specialty: 'Nurse Practitioner',
        organization: 'Primary Care Plus',
        permissionLevel: 'ReadOnly',
        lastAccessed: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        grantedDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        npi: '1122334455',
        avatar: 'LB'
      }
    ];

    return mockProviders;
  } catch (error) {
    console.error('Error fetching provider access list:', error);
    throw error;
  }
};

/**
 * Grant access to a new provider
 */
export const grantProviderAccess = async (userId, providerId, permissionLevel, customPermissions = []) => {
  try {
    // Validate input
    const validation = validateAccessPermission({
      providerId,
      permissionLevel,
      customPermissions
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    // Mock delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Create access event
    const accessEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'granted',
      providerId,
      permissionLevel,
      customPermissions,
      timestamp: new Date().toISOString(),
      userId
    };

    // Mock logging
    console.log('Access granted:', accessEvent);

    return {
      success: true,
      event: accessEvent,
      message: 'Provider access granted successfully'
    };
  } catch (error) {
    console.error('Error granting provider access:', error);
    throw error;
  }
};

/**
 * Revoke access from a provider
 */
export const revokeProviderAccess = async (userId, providerId) => {
  try {
    if (!providerId || typeof providerId !== 'string') {
      throw new Error('Valid provider ID is required');
    }

    // Mock delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create access event
    const accessEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'revoked',
      providerId,
      timestamp: new Date().toISOString(),
      userId
    };

    // Mock logging
    console.log('Access revoked:', accessEvent);

    return {
      success: true,
      event: accessEvent,
      message: 'Provider access revoked successfully'
    };
  } catch (error) {
    console.error('Error revoking provider access:', error);
    throw error;
  }
};

/**
 * Update permission level for existing provider access
 */
export const updateAccessLevel = async (userId, providerId, newLevel, customPermissions = []) => {
  try {
    // Validate input
    const validation = validateAccessPermission({
      providerId,
      permissionLevel: newLevel,
      customPermissions
    });

    if (!validation.isValid) {
      throw new Error(`Validation failed: ${JSON.stringify(validation.errors)}`);
    }

    // Mock delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 1100));

    // Create access event
    const accessEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'updated',
      providerId,
      newLevel,
      customPermissions,
      timestamp: new Date().toISOString(),
      userId
    };

    // Mock logging
    console.log('Access level updated:', accessEvent);

    return {
      success: true,
      event: accessEvent,
      message: 'Permission level updated successfully'
    };
  } catch (error) {
    console.error('Error updating access level:', error);
    throw error;
  }
};

/**
 * Get access history with optional filters
 */
export const getAccessHistory = async (userId, filters = {}) => {
  try {
    // Mock delay to simulate network request
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock data
    const mockHistory = [
      {
        id: 'event_1',
        type: 'granted',
        providerId: 'prov_001',
        providerName: 'Dr. Sarah Johnson',
        permissionLevel: 'Full',
        timestamp: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Access granted to Dr. Sarah Johnson - Full access'
      },
      {
        id: 'event_2',
        type: 'granted',
        providerId: 'prov_002',
        providerName: 'Dr. Michael Chen',
        permissionLevel: 'AdherenceOnly',
        timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Access granted to Dr. Michael Chen - Adherence only'
      },
      {
        id: 'event_3',
        type: 'accessed',
        providerId: 'prov_001',
        providerName: 'Dr. Sarah Johnson',
        permissionLevel: 'Full',
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Dr. Sarah Johnson accessed patient data'
      },
      {
        id: 'event_4',
        type: 'granted',
        providerId: 'prov_003',
        providerName: 'Nurse Practitioner Lisa Brown',
        permissionLevel: 'ReadOnly',
        timestamp: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Access granted to Nurse Practitioner Lisa Brown - Read only'
      },
      {
        id: 'event_5',
        type: 'accessed',
        providerId: 'prov_002',
        providerName: 'Dr. Michael Chen',
        permissionLevel: 'AdherenceOnly',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        description: 'Dr. Michael Chen accessed patient data'
      }
    ];

    // Apply filters
    let filtered = mockHistory;

    if (filters.eventType) {
      filtered = filtered.filter(event => event.type === filters.eventType);
    }

    if (filters.providerId) {
      filtered = filtered.filter(event => event.providerId === filters.providerId);
    }

    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(event => new Date(event.timestamp) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(event => new Date(event.timestamp) <= endDate);
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  } catch (error) {
    console.error('Error fetching access history:', error);
    throw error;
  }
};

/**
 * Search for providers by name or NPI
 */
export const searchProviders = async (query, limit = 10) => {
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
  grantProviderAccess,
  revokeProviderAccess,
  updateAccessLevel,
  getAccessHistory,
  searchProviders,
  calculateAccessExpiration,
  getAccessDataTypes,
  getPermissionLevelDetails,
  logAccessEvent,
  isAccessValid,
  formatPermissionLevel
};
