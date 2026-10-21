/**
 * Provider Authentication Utilities
 * Handles provider signup, login, verification, and license validation
 * Phase 2 Sprint 5: Healthcare Provider Integration
 */

// Provider specialty options
export const PROVIDER_SPECIALTIES = [
  'Cardiologist',
  'Dermatologist',
  'Endocrinologist',
  'Family Medicine',
  'General Practitioner',
  'Gastroenterologist',
  'Nephrologist',
  'Neurologist',
  'Oncologist',
  'Orthopedist',
  'Otolaryngologist (ENT)',
  'Pulmonologist',
  'Rheumatologist',
  'Psychiatrist',
  'Pharmacist',
  'Nurse Practitioner',
  'Physician Assistant',
  'Other'
];

// Provider organization types
export const PROVIDER_ORG_TYPES = [
  'Hospital',
  'Clinic',
  'Private Practice',
  'Medical Center',
  'Health System',
  'Pharmacy',
  'Telehealth Provider',
  'Other'
];

// Access levels for patient data
export const ACCESS_LEVELS = {
  FULL: 'full',                      // All data
  ADHERENCE_ONLY: 'adherence_only',  // Only adherence tracking
  READ_ONLY: 'read_only',            // View only, no messaging
  CUSTOM: 'custom'                   // Select specific data types
};

// Data types that can be shared
export const SHAREABLE_DATA_TYPES = [
  'medications',
  'adherence',
  'adherence_trends',
  'barriers',
  'interventions',
  'lab_results',
  'medical_history',
  'all_data'
];

// Default shared data types by access level
export const DEFAULT_SHARED_DATA = {
  full: ['medications', 'adherence', 'adherence_trends', 'barriers', 'interventions', 'lab_results', 'medical_history'],
  adherence_only: ['medications', 'adherence', 'adherence_trends', 'barriers', 'interventions'],
  read_only: ['medications', 'adherence', 'lab_results'],
  custom: []
};

/**
 * Validate provider email format
 */
export const validateProviderEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * Requirements: 8+ chars, at least one uppercase, one number, one special char
 */
export const validatePasswordStrength = (password) => {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const strength = Object.values(checks).filter(Boolean).length;
  const score = (strength / 5) * 100;

  return {
    isValid: checks.length && checks.uppercase && checks.lowercase && checks.number,
    score,
    checks,
    message: {
      length: checks.length ? '✓ At least 8 characters' : '✗ At least 8 characters required',
      uppercase: checks.uppercase ? '✓ Contains uppercase letter' : '✗ Add uppercase letter',
      lowercase: checks.lowercase ? '✓ Contains lowercase letter' : '✗ Add lowercase letter',
      number: checks.number ? '✓ Contains number' : '✗ Add number',
      special: checks.special ? '✓ Contains special character' : '✗ Add special character'
    }
  };
};

/**
 * Validate license number format (mock validation)
 * Format: XX-XXXXXX-XXXX (varies by state/country)
 */
export const validateLicenseNumber = (licenseNumber) => {
  // Remove any spaces or dashes
  const cleaned = licenseNumber.replace(/[\s-]/g, '');
  
  // Basic validation: at least 6 alphanumeric characters
  if (!/^[A-Z0-9]{6,}$/i.test(cleaned)) {
    return {
      isValid: false,
      error: 'License number must contain at least 6 alphanumeric characters'
    };
  }

  // Mock validation check (in production, call state medical board API)
  // Simulate a valid license check
  const mockValidLicenses = ['MD123456', 'DO654321', 'NP789012', 'PA345678'];
  const isInMockList = mockValidLicenses.some(lic => cleaned.toUpperCase().includes(lic));

  return {
    isValid: true,
    cleaned,
    verified: isInMockList, // In production: call API
    message: isInMockList ? 'License verified' : 'License format valid (verification pending)'
  };
};

/**
 * Validate provider profile data
 */
export const validateProviderProfile = (profile) => {
  const errors = {};

  if (!profile.fullName || profile.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters)';
  }

  if (!profile.email || !validateProviderEmail(profile.email)) {
    errors.email = 'Valid email is required';
  }

  if (!profile.password) {
    errors.password = 'Password is required';
  } else {
    const strength = validatePasswordStrength(profile.password);
    if (!strength.isValid) {
      errors.password = 'Password does not meet strength requirements';
    }
  }

  if (profile.password !== profile.passwordConfirm) {
    errors.passwordConfirm = 'Passwords do not match';
  }

  if (!profile.licenseNumber || profile.licenseNumber.trim().length === 0) {
    errors.licenseNumber = 'License number is required';
  } else {
    const licenseValidation = validateLicenseNumber(profile.licenseNumber);
    if (!licenseValidation.isValid) {
      errors.licenseNumber = licenseValidation.error;
    }
  }

  if (!profile.specialty || profile.specialty.trim().length === 0) {
    errors.specialty = 'Specialty is required';
  }

  if (!profile.organization || profile.organization.trim().length === 0) {
    errors.organization = 'Organization name is required';
  }

  if (!profile.organizationType || profile.organizationType.trim().length === 0) {
    errors.organizationType = 'Organization type is required';
  }

  if (profile.phoneNumber && !/^\+?[\d\s\-()]{10,}$/.test(profile.phoneNumber)) {
    errors.phoneNumber = 'Valid phone number is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generate security questions for provider
 */
export const SECURITY_QUESTIONS = [
  'What was the name of your first pet?',
  'What city were you born in?',
  'What is your mother\'s maiden name?',
  'What was your first car?',
  'What is the name of the hospital where you completed your residency?',
  'What was the name of your first supervisor?',
  'What medical school did you attend?',
  'What year did you obtain your medical license?'
];

/**
 * Validate security question answers
 */
export const validateSecurityAnswers = (answers) => {
  if (!Array.isArray(answers) || answers.length !== 2) {
    return { isValid: false, error: 'Two security question answers required' };
  }

  for (let i = 0; i < answers.length; i++) {
    if (!answers[i].question || answers[i].question.trim().length === 0) {
      return { isValid: false, error: `Question ${i + 1} not selected` };
    }
    if (!answers[i].answer || answers[i].answer.trim().length < 2) {
      return { isValid: false, error: `Answer ${i + 1} must be at least 2 characters` };
    }
  }

  return { isValid: true };
};

/**
 * Create provider profile object
 */
export const createProviderProfile = (data) => {
  return {
    providerId: data.providerId,
    fullName: data.fullName.trim(),
    email: data.email.toLowerCase().trim(),
    licenseNumber: data.licenseNumber.toUpperCase().trim(),
    specialty: data.specialty,
    organization: data.organization.trim(),
    organizationType: data.organizationType,
    phoneNumber: data.phoneNumber || '',
    verified: false,
    emailVerified: false,
    licenseVerified: false,
    securityQuestionsSet: false,
    mfaEnabled: false,
    createdAt: new Date().toISOString(),
    lastUpdated: new Date().toISOString(),
    status: 'pending_verification', // pending_verification, verified, suspended
    metadata: {
      registrationComplete: false,
      profileComplete: false,
      mfaSetupComplete: false,
      agreedToTerms: false,
      hipaaAgreed: false
    }
  };
};

/**
 * Validate HIPAA agreement
 */
export const validateHIPAAConsent = (consentData) => {
  const errors = {};

  if (!consentData.agreeTerms) {
    errors.agreeTerms = 'You must agree to the Terms of Service';
  }

  if (!consentData.agreePrivacy) {
    errors.agreePrivacy = 'You must agree to the Privacy Policy';
  }

  if (!consentData.agreeHIPAA) {
    errors.agreeHIPAA = 'You must agree to HIPAA compliance requirements';
  }

  if (!consentData.agreeDataHandling) {
    errors.agreeDataHandling = 'You must agree to secure data handling practices';
  }

  if (consentData.acknowledgeResponsibilities !== true) {
    errors.acknowledgeResponsibilities = 'You must acknowledge your responsibilities';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Generate provider authentication token
 */
export const generateProviderToken = (providerId, email, specialty) => {
  return {
    providerId,
    email,
    specialty,
    role: 'provider',
    issuedAt: new Date().toISOString(),
    expiresIn: 24 * 60 * 60 * 1000 // 24 hours
  };
};

/**
 * Log provider authentication event
 */
export const logProviderAuthEvent = (providerId, event, metadata = {}) => {
  return {
    providerId,
    event, // signup, login, logout, mfa_setup, password_change, etc
    timestamp: new Date().toISOString(),
    metadata
  };
};

/**
 * Provider registration workflow
 */
export class ProviderRegistrationManager {
  constructor() {
    this.currentStep = 1;
    this.totalSteps = 4;
    this.profile = {};
    this.securityQuestions = [];
    this.hipaaConsent = {};
  }

  getCurrentStep() {
    return this.currentStep;
  }

  getTotalSteps() {
    return this.totalSteps;
  }

  getProgress() {
    return (this.currentStep / this.totalSteps) * 100;
  }

  setBasicInfo(data) {
    const validation = validateProviderProfile(data);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    this.profile = { ...this.profile, ...data };
    this.currentStep = 2;
    return { success: true, message: 'Basic information saved' };
  }

  setSecurityQuestions(answers) {
    const validation = validateSecurityAnswers(answers);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }
    this.securityQuestions = answers;
    this.currentStep = 3;
    return { success: true, message: 'Security questions configured' };
  }

  setHIPAAConsent(consentData) {
    const validation = validateHIPAAConsent(consentData);
    if (!validation.isValid) {
      return { success: false, errors: validation.errors };
    }
    this.hipaaConsent = consentData;
    this.currentStep = 4;
    return { success: true, message: 'HIPAA agreement accepted' };
  }

  completeRegistration() {
    if (this.currentStep !== this.totalSteps) {
      return { success: false, error: 'All steps must be completed' };
    }

    return {
      success: true,
      profile: this.profile,
      securityQuestions: this.securityQuestions,
      hipaaConsent: this.hipaaConsent,
      message: 'Registration completed successfully'
    };
  }

  reset() {
    this.currentStep = 1;
    this.profile = {};
    this.securityQuestions = [];
    this.hipaaConsent = {};
  }
}

/**
 * Validate signup form at each step
 */
export const validateSignupStep = (step, data) => {
  const errors = {};

  if (step === 1) {
    // Email & Password validation
    if (!data.email) errors.email = 'Email is required';
    else if (!validateProviderEmail(data.email)) errors.email = 'Invalid email format';
    
    if (!data.password) errors.password = 'Password is required';
    else {
      const strength = validatePasswordStrength(data.password);
      if (!strength.isValid) errors.password = 'Password must contain uppercase, lowercase, number, and special character';
    }
    
    if (data.password !== data.confirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (!data.termsAccepted) errors.terms = 'You must accept the terms';
  } else if (step === 2) {
    // Professional information validation
    if (!data.firstName) errors.firstName = 'First name is required';
    if (!data.lastName) errors.lastName = 'Last name is required';
    if (!data.specialty) errors.specialty = 'Specialty is required';
    if (!data.organizationType) errors.organizationType = 'Organization type is required';
    if (!data.organizationName) errors.organizationName = 'Organization name is required';
    if (!data.licenseNumber) errors.licenseNumber = 'License number is required';
    if (!data.licenseState) errors.licenseState = 'License state is required';
  } else if (step === 3) {
    // Organization details validation
    if (!data.address) errors.address = 'Address is required';
    if (!data.phone) errors.phone = 'Phone number is required';
    if (!data.yearsExperience) errors.yearsExperience = 'Years of experience is required';
    if (!data.npiNumber) errors.npiNumber = 'NPI number is required';
    else if (!/^\d{10}$/.test(data.npiNumber)) errors.npiNumber = 'NPI must be 10 digits';
  } else if (step === 4) {
    // Security questions validation
    if (!data.selectedQuestions || data.selectedQuestions.length !== 3) {
      errors.questions = 'Select 3 security questions';
    }
    if (!data.answers || data.answers.some(a => !a)) {
      errors.answers = 'Answer all security questions';
    }
  } else if (step === 5) {
    // HIPAA consent validation
    const consent = validateHIPAAConsent(data.hipaaConsents);
    if (!consent.isValid) errors.hipaa = consent.message;
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Validate entire signup form
 */
export const validateSignupForm = (formData) => {
  const errors = {};
  
  // Validate step 1
  const step1 = validateSignupStep(1, formData);
  if (!step1.isValid) Object.assign(errors, step1.errors);
  
  // Validate step 2
  const step2 = validateSignupStep(2, formData);
  if (!step2.isValid) Object.assign(errors, step2.errors);
  
  // Validate step 3
  const step3 = validateSignupStep(3, formData);
  if (!step3.isValid) Object.assign(errors, step3.errors);
  
  // Validate step 4
  const step4 = validateSignupStep(4, formData);
  if (!step4.isValid) Object.assign(errors, step4.errors);
  
  // Validate step 5
  const step5 = validateSignupStep(5, formData);
  if (!step5.isValid) Object.assign(errors, step5.errors);

  return { isValid: Object.keys(errors).length === 0, errors };
};

/**
 * Create complete provider profile from signup form
 */
export const createSignupProfile = (formData) => {
  return {
    email: formData.email,
    password: formData.password,
    firstName: formData.firstName,
    lastName: formData.lastName,
    fullName: `${formData.firstName} ${formData.lastName}`,
    licenseNumber: formData.licenseNumber,
    licenseState: formData.licenseState,
    specialty: formData.specialty,
    organizationType: formData.organizationType,
    organizationName: formData.organizationName,
    address: formData.address,
    phone: formData.phone,
    yearsExperience: parseInt(formData.yearsExperience),
    npiNumber: formData.npiNumber,
    securityQuestions: formData.selectedQuestions.map((q, i) => ({
      question: q,
      answer: formData.answers[i],
      index: i + 1
    })),
    hipaaConsent: formData.hipaaConsents,
    mfaEnabled: formData.enableMFA,
    createdAt: new Date().toISOString(),
    status: 'pending_verification',
    accessLevel: 'full',
    isActive: false
  };
};

/**
 * Simulate provider signup API call
 */
export const submitProviderSignup = async (formData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const validation = validateSignupForm(formData);
      if (!validation.isValid) {
        reject(new Error('Form validation failed'));
        return;
      }

      const profile = createSignupProfile(formData);
      
      // Simulate API call success
      resolve({
        success: true,
        provider: profile,
        message: 'Provider account created. Please verify your email.',
        verificationRequired: true
      });
    }, 1500);
  });
};

/**
 * Default export
 */
export default {
  PROVIDER_SPECIALTIES,
  PROVIDER_ORG_TYPES,
  ACCESS_LEVELS,
  SHAREABLE_DATA_TYPES,
  DEFAULT_SHARED_DATA,
  SECURITY_QUESTIONS,
  validateProviderEmail,
  validatePasswordStrength,
  validateLicenseNumber,
  validateProviderProfile,
  validateSecurityAnswers,
  validateHIPAAConsent,
  validateSignupStep,
  validateSignupForm,
  createSignupProfile,
  submitProviderSignup,
  createProviderProfile,
  generateProviderToken,
  logProviderAuthEvent,
  ProviderRegistrationManager
};
