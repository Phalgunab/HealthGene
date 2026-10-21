import { describe, it, expect } from 'vitest';
import {
  generateOTP,
  generateBackupCodes,
  hashOTP,
  verifyOTPHash,
  checkOTPRateLimit,
  regenerateBackupCodes,
  getTrustedDevices,
} from '../mfaHelper';

/**
 * MFA Helper Unit Tests
 * Test OTP generation, verification, backup codes, and rate limiting
 */

describe('MFA Helper - OTP Functions', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit code', () => {
      const otp = generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different codes on consecutive calls', () => {
      const otp1 = generateOTP();
      const otp2 = generateOTP();
      expect(otp1).not.toBe(otp2);
    });

    it('should always be numeric', () => {
      for (let i = 0; i < 10; i++) {
        const otp = generateOTP();
        expect(parseInt(otp)).toBeGreaterThanOrEqual(0);
        expect(parseInt(otp)).toBeLessThan(1000000);
      }
    });
  });

  describe('OTP Hashing', () => {
    it('should hash OTP successfully', async () => {
      const otp = '123456';
      const hashedOTP = await hashOTP(otp);
      expect(hashedOTP).toBeDefined();
      expect(typeof hashedOTP).toBe('string');
      expect(hashedOTP).not.toBe(otp);
    });

    it('should produce consistent hashes for the same OTP', async () => {
      const otp = '123456';
      const hash1 = await hashOTP(otp);
      const hash2 = await hashOTP(otp);
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different OTPs', async () => {
      const hash1 = await hashOTP('123456');
      const hash2 = await hashOTP('654321');
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('OTP Verification', () => {
    it('should verify correct OTP', async () => {
      const otp = '123456';
      const hashedOTP = await hashOTP(otp);
      const result = await verifyOTPHash(otp, hashedOTP);
      expect(result).toBe(true);
    });

    it('should reject incorrect OTP', async () => {
      const correctOTP = '123456';
      const incorrectOTP = '654321';
      const hashedOTP = await hashOTP(correctOTP);
      const result = await verifyOTPHash(incorrectOTP, hashedOTP);
      expect(result).toBe(false);
    });

    it('should handle empty OTP', async () => {
      const hashedOTP = await hashOTP('123456');
      const result = await verifyOTPHash('', hashedOTP);
      expect(result).toBe(false);
    });
  });
});

describe('MFA Helper - Backup Codes', () => {
  describe('generateBackupCodes', () => {
    it('should generate 10 backup codes', () => {
      const codes = generateBackupCodes();
      expect(Array.isArray(codes)).toBe(true);
      expect(codes).toHaveLength(10);
    });

    it('should generate 8-character codes', () => {
      const codes = generateBackupCodes();
      codes.forEach(code => {
        expect(code).toHaveLength(8);
      });
    });

    it('should generate uppercase alphanumeric codes', () => {
      const codes = generateBackupCodes();
      codes.forEach(code => {
        expect(code).toMatch(/^[A-Z0-9]{8}$/);
      });
    });

    it('should generate unique codes', () => {
      const codes = generateBackupCodes();
      const uniqueCodes = new Set(codes);
      expect(uniqueCodes.size).toBe(10);
    });

    it('should generate different codes on consecutive calls', () => {
      const codes1 = generateBackupCodes();
      const codes2 = generateBackupCodes();
      const allCodesUnique = new Set([...codes1, ...codes2]);
      expect(allCodesUnique.size).toBe(20);
    });
  });

  describe('Backup Code Hashing', () => {
    it('should hash backup codes array', async () => {
      const codes = generateBackupCodes();
      const hashedCodes = await hashBackupCodes(codes);
      expect(Array.isArray(hashedCodes)).toBe(true);
      expect(hashedCodes).toHaveLength(10);
    });

    it('should hash each code individually', async () => {
      const codes = generateBackupCodes();
      const hashedCodes = await hashBackupCodes(codes);
      hashedCodes.forEach((hashedCode, idx) => {
        expect(hashedCode).not.toBe(codes[idx]);
      });
    });
  });
});

describe('MFA Helper - Backup Code Regeneration', () => {
  describe('regenerateBackupCodes', () => {
    it('should require password for regeneration', async () => {
      const uid = 'test-user-' + Date.now();
      const result = await regenerateBackupCodes(uid, '');
      expect(result.success).toBe(false);
      expect(result.message).toContain('Password is required');
    });

    it('should return result object with required properties', async () => {
      const uid = 'test-user-regen-' + Date.now();
      const result = await regenerateBackupCodes(uid, 'password123');
      
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('message');
    });
  });
});

describe('MFA Helper - Device Trust', () => {
  describe('getTrustedDevices', () => {
    it('should return an array', async () => {
      const uid = 'test-user-devices-' + Date.now();
      const result = await getTrustedDevices(uid);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle errors gracefully', async () => {
      const uid = 'nonexistent-user-' + Date.now();
      const result = await getTrustedDevices(uid);
      expect(Array.isArray(result)).toBe(true);
    });
  });
});

describe('MFA Helper - Edge Cases', () => {
  it('should handle concurrent OTP generations', async () => {
    const otps = await Promise.all([
      Promise.resolve(generateOTP()),
      Promise.resolve(generateOTP()),
      Promise.resolve(generateOTP()),
    ]);

    expect(otps).toHaveLength(3);
    otps.forEach(otp => {
      expect(otp).toMatch(/^\d{6}$/);
    });
  });

  it('should handle concurrent backup code generation', () => {
    const codes1 = generateBackupCodes();
    const codes2 = generateBackupCodes();
    const codes3 = generateBackupCodes();

    expect(codes1).toHaveLength(10);
    expect(codes2).toHaveLength(10);
    expect(codes3).toHaveLength(10);
  });
});
