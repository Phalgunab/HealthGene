/**
 * WebAuthn/FIDO2 Helper Utilities for Biometric Authentication
 * Implements W3C Web Authentication API for fingerprint/face ID
 */

/**
 * Base64URL encoding (RFC 4648 § 5)
 * Used for encoding binary data in credential options
 */
export function base64urlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Base64URL decoding
 * Reverses the encoding process
 */
export function base64urlDecode(str) {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }

  try {
    return Uint8Array.from(atob(output), c => c.charCodeAt(0));
  } catch (error) {
    throw new Error(`Invalid base64url string: ${error.message}`);
  }
}

/**
 * Generate a cryptographically secure random challenge
 * Required for WebAuthn security (prevents replay attacks)
 */
export function generateChallenge(length = 32) {
  const challenge = new Uint8Array(length);
  crypto.getRandomValues(challenge);
  return challenge;
}

/**
 * Check if WebAuthn is supported in browser
 */
export function isWebAuthnSupported() {
  return !!(
    window.PublicKeyCredential &&
    navigator.credentials &&
    navigator.credentials.create &&
    navigator.credentials.get
  );
}

/**
 * Check if platform authenticator (fingerprint/face) is available
 * Note: This check is asynchronous and may take time
 */
export async function isPlatformAuthenticatorAvailable() {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    return await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch (error) {
    console.warn('Error checking platform authenticator:', error);
    return false;
  }
}

/**
 * Create credential creation options for enrollment
 * These options are sent to the client to register a new credential
 */
export function createCredentialOptions({
  userId,
  userName,
  userDisplayName,
  attestation = 'none',
  timeout = 60000,
} = {}) {
  if (!userId || !userName || !userDisplayName) {
    throw new Error('Missing required user information for credential creation');
  }

  const challenge = generateChallenge(32);

  return {
    challenge,
    rp: {
      name: 'MyFamilyHealth',
      id: getDomain(),
    },
    user: {
      id: new TextEncoder().encode(userId),
      name: userName,
      displayName: userDisplayName,
    },
    pubKeyCredParams: [
      { alg: -7, type: 'public-key' }, // ES256 (ECDSA with SHA-256)
      { alg: -257, type: 'public-key' }, // RS256 (RSA PKCS v1.5 with SHA-256)
      { alg: -8, type: 'public-key' }, // EdDSA (EdDSA signature algorithms)
    ],
    authenticatorSelection: {
      authenticatorAttachment: 'platform', // Use built-in authenticator
      userVerification: 'preferred', // Require biometric/PIN verification
      residentKey: 'preferred', // Allow resident credentials
    },
    timeout,
    attestation,
  };
}

/**
 * Create assertion options for authentication
 * These options are sent to the client to authenticate with existing credential
 */
export function createAssertionOptions({
  allowCredentials = [],
  timeout = 60000,
  userVerification = 'preferred',
} = {}) {
  const challenge = generateChallenge(32);

  return {
    challenge,
    timeout,
    rpId: getDomain(),
    userVerification,
    allowCredentials: allowCredentials.map(credentialId => ({
      type: 'public-key',
      id: typeof credentialId === 'string' ? base64urlDecode(credentialId) : credentialId,
      transports: ['internal'], // Platform authenticator
    })),
  };
}

/**
 * Get the domain for RP ID
 * For localhost, must use 'localhost' (not 127.0.0.1)
 * For production, use the domain without port
 */
function getDomain() {
  const hostname = window.location.hostname;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'localhost';
  }
  
  // Remove port if present
  return hostname.split(':')[0];
}

/**
 * Verify the credential creation response
 * Client-side validation before sending to server
 */
export function verifyCredentialCreationResponse(credentialResponse, challenge) {
  if (!credentialResponse) {
    throw new Error('No credential created');
  }

  if (!credentialResponse.id) {
    throw new Error('Invalid credential: missing id');
  }

  if (!credentialResponse.response || !credentialResponse.response.clientDataJSON) {
    throw new Error('Invalid credential: missing clientData');
  }

  // Decode and verify clientDataJSON contains correct challenge
  const clientDataJSON = JSON.parse(
    new TextDecoder().decode(credentialResponse.response.clientDataJSON)
  );

  if (clientDataJSON.type !== 'webauthn.create') {
    throw new Error('Invalid credential: wrong type');
  }

  const decodedChallenge = base64urlDecode(clientDataJSON.challenge);
  const challengeMatches = arraysEqual(decodedChallenge, challenge);
  
  if (!challengeMatches) {
    throw new Error('Invalid credential: challenge mismatch');
  }

  if (clientDataJSON.origin !== window.location.origin) {
    throw new Error('Invalid credential: origin mismatch');
  }

  return true;
}

/**
 * Verify the credential assertion response
 * Client-side validation before sending to server
 */
export function verifyCredentialAssertionResponse(assertionResponse, challenge) {
  if (!assertionResponse) {
    throw new Error('No assertion response');
  }

  if (!assertionResponse.response || !assertionResponse.response.clientDataJSON) {
    throw new Error('Invalid assertion: missing clientData');
  }

  // Decode and verify clientDataJSON
  const clientDataJSON = JSON.parse(
    new TextDecoder().decode(assertionResponse.response.clientDataJSON)
  );

  if (clientDataJSON.type !== 'webauthn.get') {
    throw new Error('Invalid assertion: wrong type');
  }

  const decodedChallenge = base64urlDecode(clientDataJSON.challenge);
  const challengeMatches = arraysEqual(decodedChallenge, challenge);
  
  if (!challengeMatches) {
    throw new Error('Invalid assertion: challenge mismatch');
  }

  if (clientDataJSON.origin !== window.location.origin) {
    throw new Error('Invalid assertion: origin mismatch');
  }

  return true;
}

/**
 * Convert credential to storable format
 * Extracts necessary information for database storage
 */
export function credentialToStorageFormat(credentialResponse, name = 'My device') {
  if (!credentialResponse || !credentialResponse.id) {
    throw new Error('Invalid credential format');
  }

  return {
    id: credentialResponse.id, // ArrayBuffer
    idEncoded: base64urlEncode(credentialResponse.id), // Base64URL for storage
    name,
    transports: credentialResponse.response.getTransports?.() || ['internal'],
    type: 'platform',
    created: new Date().toISOString(),
    counter: 0,
  };
}

/**
 * Create credential for enrollment
 * Calls browser API to register biometric credential
 */
export async function createCredential(options) {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  try {
    // Convert challenge to ArrayBuffer for API
    const optionsWithBuffer = {
      ...options,
      challenge: options.challenge instanceof Uint8Array 
        ? options.challenge 
        : new Uint8Array(options.challenge),
      user: {
        ...options.user,
        id: options.user.id instanceof Uint8Array
          ? options.user.id
          : new TextEncoder().encode(options.user.id),
      },
    };

    const credential = await navigator.credentials.create({
      publicKey: optionsWithBuffer,
    });

    if (!credential) {
      throw new Error('User cancelled biometric enrollment or operation timed out');
    }

    return credential;
  } catch (error) {
    // Handle specific errors
    if (error.name === 'NotAllowedError') {
      throw new Error('Biometric enrollment was cancelled or timed out');
    }
    if (error.name === 'NotSupportedError') {
      throw new Error('Your device does not support biometric authentication');
    }
    if (error.name === 'InvalidStateError') {
      throw new Error('This device is already registered. Please use a different device.');
    }
    
    throw error;
  }
}

/**
 * Get assertion (authenticate with credential)
 * Calls browser API to verify biometric
 */
export async function getAssertion(options) {
  if (!isWebAuthnSupported()) {
    throw new Error('WebAuthn is not supported in this browser');
  }

  try {
    // Convert challenge to ArrayBuffer for API
    const optionsWithBuffer = {
      ...options,
      challenge: options.challenge instanceof Uint8Array
        ? options.challenge
        : new Uint8Array(options.challenge),
      allowCredentials: options.allowCredentials.map(cred => ({
        type: 'public-key',
        id: cred.id instanceof Uint8Array ? cred.id : base64urlDecode(cred.id),
        transports: cred.transports || ['internal'],
      })),
    };

    const assertion = await navigator.credentials.get({
      publicKey: optionsWithBuffer,
    });

    if (!assertion) {
      throw new Error('User cancelled biometric authentication or operation timed out');
    }

    return assertion;
  } catch (error) {
    // Handle specific errors
    if (error.name === 'NotAllowedError') {
      throw new Error('Biometric authentication was cancelled or no matching credential found');
    }
    if (error.name === 'NotSupportedError') {
      throw new Error('Your device does not support biometric authentication');
    }
    if (error.name === 'SecurityError') {
      throw new Error('WebAuthn operation blocked due to security policy');
    }
    
    throw error;
  }
}

/**
 * Helper: Compare two Uint8Array for equality
 */
function arraysEqual(a, b) {
  if (!(a instanceof Uint8Array) || !(b instanceof Uint8Array)) {
    return false;
  }
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

/**
 * Format credential type for display
 */
export function formatCredentialType(type = 'fingerprint') {
  const types = {
    fingerprint: '👆 Fingerprint',
    face: '👤 Face ID',
    platform: '📱 Device',
    default: '🔐 Biometric',
  };
  return types[type] || types.default;
}

/**
 * Get human-readable error message
 */
export function getErrorMessage(error) {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    // Extract clean message
    const message = error.message;
    
    if (message.includes('platform')) {
      return 'Your device does not support biometric authentication';
    }
    if (message.includes('cancelled') || message.includes('NotAllowed')) {
      return 'Authentication was cancelled';
    }
    if (message.includes('timeout')) {
      return 'Authentication timed out. Please try again.';
    }
    if (message.includes('challenge')) {
      return 'Authentication failed due to a security check';
    }
    if (message.includes('origin')) {
      return 'Authentication failed due to origin mismatch';
    }
    
    return message;
  }

  return 'An error occurred during authentication';
}
