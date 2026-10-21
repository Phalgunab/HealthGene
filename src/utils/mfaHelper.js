/**
 * MFA Helper Utility
 * Handles OTP generation, verification, device trust, and backup codes
 * 
 * Functions:
 * - OTP generation and verification
 * - Backup code generation and management
 * - Device trust validation
 * - Rate limiting for OTP attempts
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
 * Generate a random 6-digit OTP
 * @returns {string} 6-digit OTP
 */
export function generateOTP() {
  const otp = Math.floor(Math.random() * 1000000);
  return otp.toString().padStart(6, '0');
}

/**
 * Simple hash function for OTP (in production, use bcrypt or crypto)
 * For development, we'll use a basic SHA-256 simulation
 * @param {string} otp - OTP to hash
 * @returns {string} Hashed OTP
 */
export async function hashOTP(otp) {
  // In production, use bcrypt: await bcrypt.hash(otp, 10)
  // For now, use basic encoding
  const encoder = new TextEncoder();
  const data = encoder.encode(otp);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

/**
 * Verify OTP against hash
 * @param {string} otp - OTP to verify
 * @param {string} hashedOTP - Hashed OTP to compare against
 * @returns {Promise<boolean>} True if OTP matches
 */
export async function verifyOTPHash(otp, hashedOTP) {
  const hash = await hashOTP(otp);
  return hash === hashedOTP;
}

/**
 * Send OTP to user (SMS or Email)
 * Stores OTP session in Firestore for verification
 * 
 * @param {string} uid - User ID
 * @param {string} method - 'sms' or 'email'
 * @param {string} contact - Phone number (for SMS) or email (for email)
 * @returns {Promise<{sessionId: string, expiresIn: number, otp: string}>}
 */
export async function sendOTP(uid, method, contact) {
  try {
    // Generate OTP
    const otp = generateOTP();
    const hashedOTP = await hashOTP(otp);
    
    // Create session ID
    const sessionId = `${uid}_${Date.now()}`;
    const now = Timestamp.now();
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + 5 * 60000)); // 5 minutes
    
    // Store OTP session in Firestore
    const mfaSessionRef = doc(db, 'users', uid, 'mfaSessions', sessionId);
    await setDoc(mfaSessionRef, {
      otp: hashedOTP,
      method,
      contact, // Masked in real app
      createdAt: now,
      expiresAt,
      attempts: 0,
      maxAttempts: 5,
      verified: false,
      used: false
    });
    
    // In production, send via SMS or Email
    // For now, return OTP for testing (remove in production)
    console.log(`[MFA] ${method.toUpperCase()} OTP for testing: ${otp}`);
    
    return {
      sessionId,
      expiresIn: 300, // 5 minutes in seconds
      otp // Remove in production
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw new Error('Failed to send OTP');
  }
}

/**
 * Verify OTP entered by user
 * Validates OTP, checks expiration, rate limits attempts
 * 
 * @param {string} uid - User ID
 * @param {string} sessionId - MFA session ID
 * @param {string} otp - OTP entered by user
 * @returns {Promise<{verified: boolean, message: string}>}
 */
export async function verifyOTP(uid, sessionId, otp) {
  try {
    const mfaSessionRef = doc(db, 'users', uid, 'mfaSessions', sessionId);
    const mfaSessionSnap = await getDoc(mfaSessionRef);
    
    if (!mfaSessionSnap.exists()) {
      return { verified: false, message: 'Session not found' };
    }
    
    const session = mfaSessionSnap.data();
    
    // Check if already verified
    if (session.verified) {
      return { verified: false, message: 'OTP already used' };
    }
    
    // Check expiration
    const now = Timestamp.now();
    if (now > session.expiresAt) {
      await deleteDoc(mfaSessionRef);
      return { verified: false, message: 'OTP expired' };
    }
    
    // Check attempts
    if (session.attempts >= session.maxAttempts) {
      await deleteDoc(mfaSessionRef);
      return { verified: false, message: 'Too many attempts. Try again later.' };
    }
    
    // Verify OTP
    const isValid = await verifyOTPHash(otp, session.otp);
    
    if (isValid) {
      // Mark as verified
      await updateDoc(mfaSessionRef, {
        verified: true,
        verifiedAt: Timestamp.now()
      });
      return { verified: true, message: 'OTP verified' };
    } else {
      // Increment attempts
      await updateDoc(mfaSessionRef, {
        attempts: session.attempts + 1
      });
      const remaining = session.maxAttempts - session.attempts - 1;
      return {
        verified: false,
        message: `Invalid OTP. ${remaining} attempts remaining.`
      };
    }
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw new Error('Failed to verify OTP');
  }
}

/**
 * Generate backup codes for account recovery
 * Returns 10 random 8-character codes
 * 
 * @returns {string[]} Array of 10 backup codes
 */
export function generateBackupCodes() {
  const codes = [];
  for (let i = 0; i < 10; i++) {
    const code = Array(8)
      .fill(0)
      .map(() => Math.random().toString(36).charAt(2))
      .join('')
      .toUpperCase()
      .slice(0, 8);
    codes.push(code);
  }
  return codes;
}

/**
 * Hash backup codes before storing
 * @param {string[]} codes - Backup codes to hash
 * @returns {Promise<string[]>} Hashed codes
 */
export async function hashBackupCodes(codes) {
  const hashed = [];
  for (const code of codes) {
    const hash = await hashOTP(code); // Reuse OTP hash function
    hashed.push(hash);
  }
  return hashed;
}

/**
 * Save backup codes to Firestore
 * @param {string} uid - User ID
 * @param {string[]} codes - Backup codes (unhashed)
 * @returns {Promise<void>}
 */
export async function saveBackupCodes(uid, codes) {
  try {
    const hashedCodes = await hashBackupCodes(codes);
    
    const backupCodesRef = doc(db, 'users', uid, 'mfaSettings', 'backupCodes');
    await setDoc(backupCodesRef, {
      codes: hashedCodes,
      used: [],
      generated: Timestamp.now(),
      count: codes.length
    });
  } catch (error) {
    console.error('Error saving backup codes:', error);
    throw new Error('Failed to save backup codes');
  }
}

/**
 * Verify and use a backup code
 * Marks code as used, prevents reuse
 * 
 * @param {string} uid - User ID
 * @param {string} code - Backup code to verify
 * @returns {Promise<{valid: boolean, message: string}>}
 */
export async function verifyBackupCode(uid, code) {
  try {
    const backupCodesRef = doc(db, 'users', uid, 'mfaSettings', 'backupCodes');
    const backupCodesSnap = await getDoc(backupCodesRef);
    
    if (!backupCodesSnap.exists()) {
      return { valid: false, message: 'No backup codes found' };
    }
    
    const backupData = backupCodesSnap.data();
    
    // Check if code is already used
    if (backupData.used.includes(code)) {
      return { valid: false, message: 'Backup code already used' };
    }
    
    // Find and verify code
    let isValid = false;
    for (const hashedCode of backupData.codes) {
      if (await verifyOTPHash(code, hashedCode)) {
        isValid = true;
        break;
      }
    }
    
    if (isValid) {
      // Mark as used
      await updateDoc(backupCodesRef, {
        used: [...backupData.used, code]
      });
      return { valid: true, message: 'Backup code verified' };
    } else {
      return { valid: false, message: 'Invalid backup code' };
    }
  } catch (error) {
    console.error('Error verifying backup code:', error);
    throw new Error('Failed to verify backup code');
  }
}

/**
 * Get remaining backup codes count
 * @param {string} uid - User ID
 * @returns {Promise<number>} Number of unused codes
 */
export async function getBackupCodesRemaining(uid) {
  try {
    const backupCodesRef = doc(db, 'users', uid, 'mfaSettings', 'backupCodes');
    const backupCodesSnap = await getDoc(backupCodesRef);
    
    if (!backupCodesSnap.exists()) {
      return 0;
    }
    
    const backupData = backupCodesSnap.data();
    return backupData.count - backupData.used.length;
  } catch (error) {
    console.error('Error getting backup codes count:', error);
    return 0;
  }
}

/**
 * Check if user is rate limited for OTP requests
 * Prevents abuse of OTP generation
 * 
 * @param {string} uid - User ID
 * @returns {Promise<{allowed: boolean, remainingTime?: number}>}
 */
export async function checkOTPRateLimit(uid) {
  try {
    const rateLimitRef = doc(db, 'users', uid, 'mfaSettings', 'otpRateLimit');
    const rateLimitSnap = await getDoc(rateLimitRef);
    
    const now = Timestamp.now();
    
    // If no rate limit record, allow
    if (!rateLimitSnap.exists()) {
      // Create rate limit record
      await setDoc(rateLimitRef, {
        lastOTPAt: now,
        otpCount: 1,
        countResetAt: Timestamp.fromDate(
          new Date(Date.now() + 60 * 60 * 1000) // 1 hour
        )
      });
      return { allowed: true };
    }
    
    const rateLimit = rateLimitSnap.data();
    
    // Check if hour has passed
    if (now > rateLimit.countResetAt) {
      // Reset counter
      await updateDoc(rateLimitRef, {
        otpCount: 1,
        lastOTPAt: now,
        countResetAt: Timestamp.fromDate(
          new Date(Date.now() + 60 * 60 * 1000)
        )
      });
      return { allowed: true };
    }
    
    // Check if max OTPs per hour reached (3)
    if (rateLimit.otpCount >= 3) {
      const remainingTime = Math.ceil(
        (rateLimit.countResetAt.toDate() - now.toDate()) / 1000
      );
      return { allowed: false, remainingTime };
    }
    
    // Check minimum interval (30 seconds)
    const secondsSinceLastOTP = Math.floor(
      (now.toDate() - rateLimit.lastOTPAt.toDate()) / 1000
    );
    if (secondsSinceLastOTP < 30) {
      const remainingTime = 30 - secondsSinceLastOTP;
      return { allowed: false, remainingTime };
    }
    
    // Update counter
    await updateDoc(rateLimitRef, {
      otpCount: rateLimit.otpCount + 1,
      lastOTPAt: now
    });
    
    return { allowed: true };
  } catch (error) {
    console.error('Error checking OTP rate limit:', error);
    return { allowed: false };
  }
}

/**
 * Clean up expired OTP sessions
 * Runs periodically to remove stale sessions
 * 
 * @param {string} uid - User ID
 * @returns {Promise<number>} Number of sessions deleted
 */
export async function cleanupExpiredOTPSessions(uid) {
  try {
    const mfaSessionsRef = collection(db, 'users', uid, 'mfaSessions');
    const q = query(
      mfaSessionsRef,
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
    console.error('Error cleaning up OTP sessions:', error);
    return 0;
  }
}

/**
 * Save MFA settings
 * @param {string} uid - User ID
 * @param {Object} settings - MFA settings
 * @returns {Promise<void>}
 */
export async function saveMFASettings(uid, settings) {
  try {
    const mfaSettingsRef = doc(db, 'users', uid, 'mfaSettings', 'config');
    await setDoc(mfaSettingsRef, {
      ...settings,
      updated: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error saving MFA settings:', error);
    throw new Error('Failed to save MFA settings');
  }
}

/**
 * Get MFA settings
 * @param {string} uid - User ID
 * @returns {Promise<Object|null>} MFA settings or null
 */
export async function getMFASettings(uid) {
  try {
    const mfaSettingsRef = doc(db, 'users', uid, 'mfaSettings', 'config');
    const mfaSettingsSnap = await getDoc(mfaSettingsRef);
    
    if (mfaSettingsSnap.exists()) {
      return mfaSettingsSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting MFA settings:', error);
    return null;
  }
}

/**
 * Regenerate backup codes
 * @param {string} uid - User ID
 * @param {string} password - User's password for verification
 * @returns {Promise<Object>} - { success: boolean, codes: string[], message: string }
 */
export async function regenerateBackupCodes(uid, password) {
  try {
    // In production, verify password with Firebase Authentication
    // For now, accept any non-empty password
    if (!password) {
      return { success: false, message: 'Password is required' };
    }

    const newCodes = generateBackupCodes();
    const hashedCodes = await hashBackupCodes(newCodes);
    
    await saveBackupCodes(uid, hashedCodes);
    
    return {
      success: true,
      codes: newCodes,
      message: 'Backup codes regenerated successfully'
    };
  } catch (error) {
    console.error('Error regenerating backup codes:', error);
    return {
      success: false,
      message: error.message || 'Failed to regenerate backup codes'
    };
  }
}

/**
 * Get trusted devices
 * @param {string} uid - User ID
 * @returns {Promise<Array>} - Array of trusted devices
 */
export async function getTrustedDevices(uid) {
  try {
    const devicesRef = collection(db, 'users', uid, 'trustedDevices');
    const querySnapshot = await getDocs(devicesRef);
    const devices = [];
    querySnapshot.forEach((doc) => {
      devices.push({
        id: doc.id,
        ...doc.data()
      });
    });
    return devices;
  } catch (error) {
    console.error('Error getting trusted devices:', error);
    return [];
  }
}

/**
 * Revoke a trusted device
 * @param {string} uid - User ID
 * @param {string} deviceId - Device ID to revoke
 * @returns {Promise<void>}
 */
export async function revokeTrustedDevice(uid, deviceId) {
  try {
    const deviceRef = doc(db, 'users', uid, 'trustedDevices', deviceId);
    await setDoc(deviceRef, {
      enabled: false,
      revokedAt: Timestamp.now()
    }, { merge: true });
  } catch (error) {
    console.error('Error revoking device:', error);
    throw new Error('Failed to revoke device');
  }
}

export default {
  generateOTP,
  hashOTP,
  verifyOTPHash,
  sendOTP,
  verifyOTP,
  generateBackupCodes,
  hashBackupCodes,
  saveBackupCodes,
  verifyBackupCode,
  getBackupCodesRemaining,
  checkOTPRateLimit,
  cleanupExpiredOTPSessions,
  saveMFASettings,
  getMFASettings,
  regenerateBackupCodes,
  getTrustedDevices,
  revokeTrustedDevice
};
