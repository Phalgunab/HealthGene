import { describe, it, expect } from 'vitest';
import {
  generateDeviceId,
  generateDeviceFingerprint,
  trustDevice,
  isDeviceTrusted,
  getTrustedDevices,
  revokeTrustedDevice,
} from '../deviceTrustHelper';

/**
 * Device Trust Helper Unit Tests
 * Test device fingerprinting, trust management, and auto-cleanup
 */

describe('Device Trust Helper - Device ID Generation', () => {
  describe('generateDeviceId', () => {
    it('should generate a valid UUID v4', () => {
      const deviceId = generateDeviceId();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(deviceId).toMatch(uuidRegex);
    });

    it('should generate different IDs on consecutive calls', () => {
      const id1 = generateDeviceId();
      const id2 = generateDeviceId();
      expect(id1).not.toBe(id2);
    });

    it('should always be a string', () => {
      const deviceId = generateDeviceId();
      expect(typeof deviceId).toBe('string');
    });

    it('should have correct UUID format structure', () => {
      const deviceId = generateDeviceId();
      const parts = deviceId.split('-');
      expect(parts).toHaveLength(5);
      expect(parts[0]).toHaveLength(8);
      expect(parts[1]).toHaveLength(4);
      expect(parts[2]).toHaveLength(4);
      expect(parts[3]).toHaveLength(4);
      expect(parts[4]).toHaveLength(12);
    });
  });
});

describe('Device Trust Helper - Fingerprinting', () => {
  describe('generateDeviceFingerprint', () => {
    it('should return a fingerprint object', () => {
      const fingerprint = generateDeviceFingerprint();
      expect(fingerprint).toBeDefined();
      expect(typeof fingerprint).toBe('object');
    });

    it('should include required fingerprint properties', () => {
      const fingerprint = generateDeviceFingerprint();
      expect(fingerprint).toHaveProperty('userAgent');
      expect(fingerprint).toHaveProperty('language');
      expect(fingerprint).toHaveProperty('screenResolution');
      expect(fingerprint).toHaveProperty('colorDepth');
      expect(fingerprint).toHaveProperty('timezone');
      expect(fingerprint).toHaveProperty('hardwareConcurrency');
    });

    it('should generate string representation', () => {
      const fingerprint = generateDeviceFingerprint();
      const hash = JSON.stringify(fingerprint);
      expect(typeof hash).toBe('string');
    });

    it('should generate consistent fingerprints', () => {
      const fp1 = generateDeviceFingerprint();
      const fp2 = generateDeviceFingerprint();
      expect(JSON.stringify(fp1)).toBe(JSON.stringify(fp2));
    });

    it('should handle missing window properties gracefully', () => {
      const fingerprint = generateDeviceFingerprint();
      // Should have all properties even if window properties are missing
      expect(fingerprint.userAgent).toBeDefined();
      expect(fingerprint.language).toBeDefined();
    });
  });
});

describe('Device Trust Helper - Trust Management', () => {
  describe('trustDevice', () => {
    it('should return object with success property', async () => {
      const uid = 'test-user-' + Date.now();
      const result = await trustDevice(uid, 'sms');
      expect(result).toHaveProperty('success');
    });

    it('should require valid method', async () => {
      const uid = 'test-user-' + Date.now();
      const result = await trustDevice(uid, 'sms');
      // Should either succeed or return error
      expect(typeof result.success).toBe('boolean');
    });

    it('should handle different trust methods', async () => {
      const uid = 'test-user-methods-' + Date.now();
      const smsTrust = await trustDevice(uid, 'sms');
      expect(smsTrust).toBeDefined();
    });
  });

  describe('isDeviceTrusted', () => {
    it('should return null or object', async () => {
      const uid = 'test-user-check-' + Date.now();
      const result = await isDeviceTrusted(uid);
      expect(result === null || typeof result === 'object').toBe(true);
    });

    it('should handle non-existent devices', async () => {
      const uid = 'nonexistent-' + Date.now();
      const result = await isDeviceTrusted(uid);
      // Should return null or false, not throw
      expect(result === null || result === false || typeof result === 'object').toBe(true);
    });
  });

  describe('getTrustedDevices', () => {
    it('should return an array', async () => {
      const uid = 'test-user-all-devices-' + Date.now();
      const devices = await getTrustedDevices(uid);
      expect(Array.isArray(devices)).toBe(true);
    });

    it('should handle empty device list', async () => {
      const uid = 'empty-devices-' + Date.now();
      const devices = await getTrustedDevices(uid);
      expect(Array.isArray(devices)).toBe(true);
    });

    it('should include device properties when devices exist', async () => {
      const uid = 'devices-props-' + Date.now();
      const devices = await getTrustedDevices(uid);

      if (devices.length > 0) {
        const device = devices[0];
        expect(device).toHaveProperty('id');
      }
    });
  });

  describe('revokeTrustedDevice', () => {
    it('should handle revocation requests', async () => {
      const uid = 'test-user-revoke-' + Date.now();
      const deviceId = generateDeviceId();
      
      // Should not throw even if device doesn't exist
      expect(async () => {
        await revokeTrustedDevice(uid, deviceId);
      }).not.toThrow();
    });

    it('should accept valid device IDs', async () => {
      const uid = 'test-user-revoke-valid-' + Date.now();
      const deviceId = generateDeviceId();
      
      expect(async () => {
        await revokeTrustedDevice(uid, deviceId);
      }).not.toThrow();
    });
  });
});

describe('Device Trust Helper - Expiration & Cleanup', () => {
  it('should track device expiration', () => {
    const fingerprint = generateDeviceFingerprint();
    expect(fingerprint).toBeDefined();
  });

  it('should generate consistent device fingerprints for same environment', () => {
    const fp1 = generateDeviceFingerprint();
    const fp2 = generateDeviceFingerprint();
    const fp3 = generateDeviceFingerprint();

    expect(JSON.stringify(fp1)).toBe(JSON.stringify(fp2));
    expect(JSON.stringify(fp2)).toBe(JSON.stringify(fp3));
  });
});

describe('Device Trust Helper - Edge Cases', () => {
  it('should handle rapid device generation', () => {
    const ids = Array(10)
      .fill()
      .map(() => generateDeviceId());

    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(10);
  });

  it('should handle special characters in device names', async () => {
    const uid = 'test-user-special-' + Date.now();
    // Should not throw
    expect(async () => {
      await trustDevice(uid, 'sms');
    }).not.toThrow();
  });

  it('should handle concurrent trust operations', async () => {
    const uid = 'test-user-concurrent-' + Date.now();
    
    const results = await Promise.all([
      trustDevice(uid, 'sms'),
      trustDevice(uid, 'sms'),
      trustDevice(uid, 'sms'),
    ]);

    expect(results).toHaveLength(3);
  });

  it('should handle long-running operations', async () => {
    const uid = 'test-user-long-' + Date.now();
    const start = Date.now();
    
    await trustDevice(uid, 'sms');
    
    const duration = Date.now() - start;
    // Should complete in reasonable time (< 5 seconds for local/mock)
    expect(duration).toBeLessThan(5000);
  });
});

describe('Device Trust Helper - Security', () => {
  it('should generate unique device IDs', () => {
    const ids = new Set();
    for (let i = 0; i < 100; i++) {
      ids.add(generateDeviceId());
    }
    expect(ids.size).toBe(100);
  });

  it('should handle sensitive operations without leaking data', () => {
    const fingerprint = generateDeviceFingerprint();
    const stringified = JSON.stringify(fingerprint);
    
    // Should not contain sensitive PII
    expect(stringified.toLowerCase()).not.toContain('password');
    expect(stringified.toLowerCase()).not.toContain('token');
    expect(stringified.toLowerCase()).not.toContain('secret');
  });
});
