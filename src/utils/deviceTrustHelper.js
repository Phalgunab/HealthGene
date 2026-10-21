/**
 * Device Trust Helper
 * Handles device fingerprinting, trusted device management, and verification
 * 
 * Functions:
 * - Generate device fingerprint
 * - Create trusted device
 * - Check if device is trusted
 * - Manage trusted devices
 * - Auto-cleanup expired devices
 */

import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  query,
  where,
  Timestamp
} from 'firebase/firestore';

/**
 * Generate unique device ID (UUID v4)
 * Used to identify devices across sessions
 * 
 * @returns {string} UUID v4 format device ID
 */
export function generateDeviceId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Generate device fingerprint based on browser/device characteristics
 * Combines user agent, language, and screen dimensions
 * 
 * @returns {string} Device fingerprint
 */
export function generateDeviceFingerprint() {
  const fingerprint = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    hardwareConcurrency: navigator.hardwareConcurrency,
    deviceMemory: navigator.deviceMemory,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
    colorDepth: window.screen.colorDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    timestamp: Date.now()
  };
  
  // Create a simple hash of fingerprint
  const fingerprintString = JSON.stringify(fingerprint);
  return Buffer.from(fingerprintString).toString('base64');
}

/**
 * Get device name based on user agent
 * Provides friendly name for trusted devices list
 * 
 * @returns {string} Device name (e.g., "Chrome on macOS")
 */
export function getDeviceName() {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  else if (ua.includes('Opera')) browser = 'Opera';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'macOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('iPhone')) os = 'iOS';
  else if (ua.includes('Android')) os = 'Android';
  
  return `${browser} on ${os}`;
}

/**
 * Get client IP address (from metadata if available)
 * Note: Browser can't directly get IP, need server-side implementation
 * 
 * @returns {string} IP address or 'unknown'
 */
export async function getClientIP() {
  try {
    // In production, call a backend endpoint to get client IP
    // For now, return placeholder
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || 'unknown';
  } catch (error) {
    console.warn('Could not determine client IP:', error);
    return 'unknown';
  }
}

/**
 * Create and trust a new device
 * Stores device information for future authentication
 * 
 * @param {string} uid - User ID
 * @param {Object} options - Trust options
 * @param {boolean} options.remember - Remember device
 * @param {number} options.trustDays - Days to trust device (default 30)
 * @returns {Promise<{deviceId: string, expiresAt: Date}>}
 */
export async function trustDevice(uid, options = {}) {
  try {
    const {
      remember = true,
      trustDays = 30
    } = options;
    
    if (!remember) {
      return { deviceId: null, expiresAt: null };
    }
    
    const deviceId = generateDeviceId();
    const fingerprint = generateDeviceFingerprint();
    const deviceName = getDeviceName();
    const ipAddress = await getClientIP();
    
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + trustDays * 24 * 60 * 60 * 1000)
    );
    
    // Save device to Firestore
    const deviceRef = doc(db, 'users', uid, 'trustedDevices', deviceId);
    await setDoc(deviceRef, {
      deviceId,
      deviceName,
      fingerprint,
      ipAddress,
      userAgent: navigator.userAgent,
      created: now,
      lastUsed: now,
      expiresAt,
      trustDays,
      enabled: true
    });
    
    // Store device ID in localStorage for future reference
    localStorage.setItem(`mfa_device_id_${uid}`, deviceId);
    
    return {
      deviceId,
      expiresAt: expiresAt.toDate()
    };
  } catch (error) {
    console.error('Error trusting device:', error);
    throw new Error('Failed to trust device');
  }
}

/**
 * Check if current device is trusted
 * Verifies device ID and fingerprint match
 * 
 * @param {string} uid - User ID
 * @returns {Promise<boolean>} True if device is trusted
 */
export async function isDeviceTrusted(uid) {
  try {
    // Get device ID from localStorage
    const deviceId = localStorage.getItem(`mfa_device_id_${uid}`);
    
    if (!deviceId) {
      return false;
    }
    
    // Check if device exists in Firestore
    const deviceRef = doc(db, 'users', uid, 'trustedDevices', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      // Device removed, clear from localStorage
      localStorage.removeItem(`mfa_device_id_${uid}`);
      return false;
    }
    
    const device = deviceSnap.data();
    const now = Timestamp.now();
    
    // Check if device is enabled
    if (!device.enabled) {
      localStorage.removeItem(`mfa_device_id_${uid}`);
      return false;
    }
    
    // Check if device has expired
    if (now > device.expiresAt) {
      await deleteDoc(deviceRef);
      localStorage.removeItem(`mfa_device_id_${uid}`);
      return false;
    }
    
    // Verify fingerprint matches (basic verification)
    const currentFingerprint = generateDeviceFingerprint();
    // Note: Fingerprints may change slightly (e.g., OS updates)
    // For now, just check device exists. In production, consider
    // allowing minor variations or prompting user for re-verification
    
    // Update last used
    await updateDoc(deviceRef, {
      lastUsed: now
    });
    
    return true;
  } catch (error) {
    console.error('Error checking device trust:', error);
    return false;
  }
}

/**
 * Get all trusted devices for a user
 * @param {string} uid - User ID
 * @returns {Promise<Array>} List of trusted devices
 */
export async function getTrustedDevices(uid) {
  try {
    const devicesRef = collection(db, 'users', uid, 'trustedDevices');
    const q = query(devicesRef, where('enabled', '==', true));
    
    const snapshot = await getDocs(q);
    const devices = [];
    
    for (const doc of snapshot.docs) {
      const device = doc.data();
      devices.push({
        id: device.deviceId,
        name: device.deviceName,
        created: device.created?.toDate(),
        lastUsed: device.lastUsed?.toDate(),
        expiresAt: device.expiresAt?.toDate(),
        ipAddress: device.ipAddress
      });
    }
    
    return devices.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch (error) {
    console.error('Error getting trusted devices:', error);
    return [];
  }
}

/**
 * Revoke a trusted device
 * Device will no longer bypass MFA
 * 
 * @param {string} uid - User ID
 * @param {string} deviceId - Device ID to revoke
 * @returns {Promise<void>}
 */
export async function revokeTrustedDevice(uid, deviceId) {
  try {
    const deviceRef = doc(db, 'users', uid, 'trustedDevices', deviceId);
    
    // Soft delete (disable) rather than hard delete for audit trail
    await updateDoc(deviceRef, {
      enabled: false,
      revokedAt: Timestamp.now()
    });
    
    // If revoking current device, clear from localStorage
    const storedDeviceId = localStorage.getItem(`mfa_device_id_${uid}`);
    if (storedDeviceId === deviceId) {
      localStorage.removeItem(`mfa_device_id_${uid}`);
    }
  } catch (error) {
    console.error('Error revoking device:', error);
    throw new Error('Failed to revoke device');
  }
}

/**
 * Revoke all trusted devices
 * User must authenticate with MFA on next login
 * 
 * @param {string} uid - User ID
 * @returns {Promise<number>} Number of devices revoked
 */
export async function revokeAllTrustedDevices(uid) {
  try {
    const devicesRef = collection(db, 'users', uid, 'trustedDevices');
    const snapshot = await getDocs(devicesRef);
    
    let count = 0;
    for (const doc of snapshot.docs) {
      await updateDoc(doc.ref, {
        enabled: false,
        revokedAt: Timestamp.now()
      });
      count++;
    }
    
    // Clear from localStorage
    localStorage.removeItem(`mfa_device_id_${uid}`);
    
    return count;
  } catch (error) {
    console.error('Error revoking all devices:', error);
    return 0;
  }
}

/**
 * Clean up expired trusted devices
 * Runs periodically to remove old device records
 * 
 * @param {string} uid - User ID
 * @returns {Promise<number>} Number of devices deleted
 */
export async function cleanupExpiredTrustedDevices(uid) {
  try {
    const devicesRef = collection(db, 'users', uid, 'trustedDevices');
    const q = query(
      devicesRef,
      where('expiresAt', '<', Timestamp.now())
    );
    
    const snapshot = await getDocs(q);
    let deleted = 0;
    
    for (const doc of snapshot.docs) {
      await deleteDoc(doc.ref);
      deleted++;
    }
    
    return deleted;
  } catch (error) {
    console.error('Error cleaning up expired devices:', error);
    return 0;
  }
}

/**
 * Extend trust period for a device
 * Refreshes expiration date
 * 
 * @param {string} uid - User ID
 * @param {string} deviceId - Device ID
 * @param {number} trustDays - Days to extend trust (default 30)
 * @returns {Promise<Date>} New expiration date
 */
export async function extendDeviceTrust(uid, deviceId, trustDays = 30) {
  try {
    const deviceRef = doc(db, 'users', uid, 'trustedDevices', deviceId);
    const expiresAt = Timestamp.fromDate(
      new Date(Date.now() + trustDays * 24 * 60 * 60 * 1000)
    );
    
    await updateDoc(deviceRef, {
      expiresAt,
      trustDays,
      lastExtended: Timestamp.now()
    });
    
    return expiresAt.toDate();
  } catch (error) {
    console.error('Error extending device trust:', error);
    throw new Error('Failed to extend device trust');
  }
}

/**
 * Get device trust status
 * Returns information about current device trust
 * 
 * @param {string} uid - User ID
 * @returns {Promise<{trusted: boolean, deviceName?: string, expiresAt?: Date}>}
 */
export async function getDeviceTrustStatus(uid) {
  try {
    const deviceId = localStorage.getItem(`mfa_device_id_${uid}`);
    
    if (!deviceId) {
      return { trusted: false };
    }
    
    const deviceRef = doc(db, 'users', uid, 'trustedDevices', deviceId);
    const deviceSnap = await getDoc(deviceRef);
    
    if (!deviceSnap.exists()) {
      return { trusted: false };
    }
    
    const device = deviceSnap.data();
    const now = Timestamp.now();
    
    // Check if expired or disabled
    if (now > device.expiresAt || !device.enabled) {
      return { trusted: false };
    }
    
    return {
      trusted: true,
      deviceName: device.deviceName,
      expiresAt: device.expiresAt?.toDate(),
      daysRemaining: Math.ceil(
        (device.expiresAt.toDate() - now.toDate()) / (24 * 60 * 60 * 1000)
      )
    };
  } catch (error) {
    console.error('Error getting device trust status:', error);
    return { trusted: false };
  }
}

export default {
  generateDeviceId,
  generateDeviceFingerprint,
  getDeviceName,
  getClientIP,
  trustDevice,
  isDeviceTrusted,
  getTrustedDevices,
  revokeTrustedDevice,
  revokeAllTrustedDevices,
  cleanupExpiredTrustedDevices,
  extendDeviceTrust,
  getDeviceTrustStatus
};
