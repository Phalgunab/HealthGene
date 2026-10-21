/**
 * Provider Signup Component - Complete Refactored
 * Secure provider registration with credentials, profile, and policy acceptance
 * Dark Green theme with Firebase integration
 */

import React, { useState } from 'react';
import {
  User, Mail, Lock, Phone, Building2, Stethoscope, AlertCircle,
  Loader, CheckCircle2, ArrowRight, ArrowLeft, Shield, FileText
} from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, setDoc } from 'firebase/firestore';
import PrivacyPolicyModal from './PrivacyPolicyModal';
import '../../styles/ProviderAuth.css';

const ProviderSignup = ({ onSignupSuccess, onNavigateToLogin }) => {
  // Form steps: credentials, profile, policies, verification
  const [step, setStep] = useState('credentials');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Credentials state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile state
  const [fullName, setFullName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [phone, setPhone] = useState('');

  // Policies state
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);

  // Field errors
  const [fieldErrors, setFieldErrors] = useState({});

  // Validation helpers
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    // At least 8 chars, 1 uppercase, 1 number, 1 special char
    return password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*]/.test(password);
  };

  const validatePhone = (phone) => {
    return /^[\d+\-\s()]{10,}$/.test(phone.replace(/\s/g, ''));
  };

  const clearFieldError = (field) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    setError('');
  };

  // Step 1: Credentials validation
  const handleCredentialsNext = (e) => {
    e.preventDefault();
    const errors = {};

    // Email validation
    if (!email) {
      errors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (!validatePassword(password)) {
      errors.password = 'Password must be at least 8 characters with 1 uppercase letter, 1 number, and 1 special character';
    }

    // Confirm password validation
    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStep('profile');
  };

  // Step 2: Profile validation
  const handleProfileNext = (e) => {
    e.preventDefault();
    const errors = {};

    if (!fullName || fullName.trim().length < 2) {
      errors.fullName = 'Please enter your full name';
    }

    if (!specialization) {
      errors.specialization = 'Please select your specialization';
    }

    if (!licenseNumber || licenseNumber.trim().length < 5) {
      errors.licenseNumber = 'Please enter a valid license number';
    }

    if (!hospitalName || hospitalName.trim().length < 2) {
      errors.hospitalName = 'Please enter your hospital/clinic name';
    }

    if (!phone) {
      errors.phone = 'Phone number is required';
    } else if (!validatePhone(phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      return;
    }

    setFieldErrors({});
    setStep('policies');
  };

  // Step 3: Policies acceptance
  const handleAcceptPolicies = () => {
    setPoliciesAccepted(true);
    setShowPrivacyModal(false);
    setStep('verification');
  };

  // Step 4: Account creation
  const handleCreateAccount = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!policiesAccepted) {
      setError('You must accept the privacy policy and terms of service');
      return;
    }

    try {
      setLoading(true);
      setSuccess('Creating your provider account...');

      // Create Firebase user
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update user profile
      await updateProfile(user, {
        displayName: fullName,
      });

      // Save provider data to Firestore
      await setDoc(doc(db, 'providers', user.uid), {
        uid: user.uid,
        email: user.email,
        fullName,
        specialization,
        licenseNumber,
        hospitalName,
        phone,
        role: 'provider',
        status: 'pending_verification',
        policiesAccepted: true,
        acceptedAt: new Date().toISOString(),
        mfaEnabled: false,
        profileComplete: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      setSuccess('Account created successfully! Redirecting...');
      setTimeout(() => {
        onSignupSuccess({
          uid: user.uid,
          email: user.email,
          displayName: fullName,
          role: 'provider'
        });
      }, 2000);
    } catch (err) {
      setError(getErrorMessage(err.code));
      setStep('verification');
      console.error('Signup error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (errorCode) => {
    const errorMap = {
      'auth/email-already-in-use': 'This email is already registered. Please sign in or use a different email.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/weak-password': 'Password is too weak. Please use a stronger password.',
      'auth/network-request-failed': 'Network error. Please check your connection.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
    };
    return errorMap[errorCode] || 'Registration failed. Please try again.';
  };

  // Step 1: Credentials
  if (step === 'credentials') {
    return (
      <div className="provider-signup-container">
        <div className="provider-signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Register as Healthcare Provider</h1>
            <p className="signup-subtitle">Step 1 of 4: Create Your Account</p>
          </div>

          <form onSubmit={handleCredentialsNext} className="signup-form">
            {/* Email */}
            <div className="form-group">
              <label className="form-label">
                <Mail size={18} />
                Professional Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="your@hospital.com"
                className={`form-input ${fieldErrors.email ? 'error' : ''}`}
              />
              {fieldErrors.email && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.email}
                </div>
              )}
            </div>

            {/* Password */}
            <div className="form-group">
              <label className="form-label">
                <Lock size={18} />
                Password
              </label>
              <div className="password-input-group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    clearFieldError('password');
                  }}
                  placeholder="At least 8 characters"
                  className={`form-input ${fieldErrors.password ? 'error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              {fieldErrors.password && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.password}
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  clearFieldError('confirmPassword');
                }}
                placeholder="Re-enter your password"
                className={`form-input ${fieldErrors.confirmPassword ? 'error' : ''}`}
              />
              {fieldErrors.confirmPassword && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.confirmPassword}
                </div>
              )}
            </div>

            {error && (
              <div className="alert alert-error">
                <AlertCircle size={18} />
                {error}
              </div>
            )}

            <div className="form-button-group">
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="form-button-secondary"
              >
                <ArrowLeft size={18} />
                Back to Login
              </button>
              <button
                type="submit"
                className="form-button-primary"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 2: Profile
  if (step === 'profile') {
    const specializations = [
      'General Practice',
      'Cardiology',
      'Orthopedics',
      'Pediatrics',
      'Neurology',
      'Psychiatry',
      'Dermatology',
      'Surgery',
      'Other'
    ];

    return (
      <div className="provider-signup-container">
        <div className="provider-signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Professional Profile</h1>
            <p className="signup-subtitle">Step 2 of 4: Your Information</p>
          </div>

          <form onSubmit={handleProfileNext} className="signup-form">
            {/* Full Name */}
            <div className="form-group">
              <label className="form-label">
                <User size={18} />
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  clearFieldError('fullName');
                }}
                placeholder="Dr. John Doe"
                className={`form-input ${fieldErrors.fullName ? 'error' : ''}`}
              />
              {fieldErrors.fullName && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.fullName}
                </div>
              )}
            </div>

            {/* Specialization */}
            <div className="form-group">
              <label className="form-label">
                <Stethoscope size={18} />
                Medical Specialization
              </label>
              <select
                value={specialization}
                onChange={(e) => {
                  setSpecialization(e.target.value);
                  clearFieldError('specialization');
                }}
                className={`form-input ${fieldErrors.specialization ? 'error' : ''}`}
              >
                <option value="">Select your specialization</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
              {fieldErrors.specialization && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.specialization}
                </div>
              )}
            </div>

            {/* License Number */}
            <div className="form-group">
              <label className="form-label">
                <FileText size={18} />
                License Number
              </label>
              <input
                type="text"
                value={licenseNumber}
                onChange={(e) => {
                  setLicenseNumber(e.target.value);
                  clearFieldError('licenseNumber');
                }}
                placeholder="Medical license number"
                className={`form-input ${fieldErrors.licenseNumber ? 'error' : ''}`}
              />
              {fieldErrors.licenseNumber && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.licenseNumber}
                </div>
              )}
            </div>

            {/* Hospital/Clinic */}
            <div className="form-group">
              <label className="form-label">
                <Building2 size={18} />
                Hospital/Clinic Name
              </label>
              <input
                type="text"
                value={hospitalName}
                onChange={(e) => {
                  setHospitalName(e.target.value);
                  clearFieldError('hospitalName');
                }}
                placeholder="Your healthcare facility"
                className={`form-input ${fieldErrors.hospitalName ? 'error' : ''}`}
              />
              {fieldErrors.hospitalName && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.hospitalName}
                </div>
              )}
            </div>

            {/* Phone */}
            <div className="form-group">
              <label className="form-label">
                <Phone size={18} />
                Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  clearFieldError('phone');
                }}
                placeholder="+1 (555) 123-4567"
                className={`form-input ${fieldErrors.phone ? 'error' : ''}`}
              />
              {fieldErrors.phone && (
                <div className="form-error">
                  <AlertCircle size={16} />
                  {fieldErrors.phone}
                </div>
              )}
            </div>

            <div className="form-button-group">
              <button
                type="button"
                onClick={() => setStep('credentials')}
                className="form-button-secondary"
              >
                <ArrowLeft size={18} />
                Back
              </button>
              <button
                type="submit"
                className="form-button-primary"
              >
                <span>Next</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Step 3: Policies
  if (step === 'policies') {
    return (
      <div className="provider-signup-container">
        <div className="provider-signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Privacy & Terms</h1>
            <p className="signup-subtitle">Step 3 of 4: Review Policies</p>
          </div>

          <div className="policies-content">
            <div className="policy-card">
              <Shield size={24} />
              <h3>Privacy & Compliance</h3>
              <p>Your data is protected with HIPAA-compliant security measures and end-to-end encryption.</p>
            </div>

            <div className="policy-card">
              <FileText size={24} />
              <h3>Terms of Service</h3>
              <p>By using HealthGene, you agree to our terms of service and professional conduct standards.</p>
            </div>

            <button
              onClick={() => setShowPrivacyModal(true)}
              className="read-policies-btn"
            >
              Read Full Policies
            </button>

            <label className="checkbox-label large">
              <input
                type="checkbox"
                checked={policiesAccepted}
                onChange={(e) => setPoliciesAccepted(e.target.checked)}
              />
              <span>I accept the Privacy Policy and Terms of Service</span>
            </label>
          </div>

          <div className="form-button-group">
            <button
              onClick={() => setStep('profile')}
              className="form-button-secondary"
            >
              <ArrowLeft size={18} />
              Back
            </button>
            <button
              onClick={() => setStep('verification')}
              disabled={!policiesAccepted}
              className="form-button-primary"
            >
              <span>Next</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <PrivacyPolicyModal
          isOpen={showPrivacyModal}
          onAccept={handleAcceptPolicies}
          onDecline={() => setShowPrivacyModal(false)}
          showCheckbox={true}
        />
      </div>
    );
  }

  // Step 4: Verification & Account Creation
  if (step === 'verification') {
    return (
      <div className="provider-signup-container">
        <div className="provider-signup-card">
          <div className="signup-header">
            <h1 className="signup-title">Create Your Account</h1>
            <p className="signup-subtitle">Step 4 of 4: Confirm Details</p>
          </div>

          <div className="verification-summary">
            <div className="summary-item">
              <span className="label">Email:</span>
              <span className="value">{email}</span>
            </div>
            <div className="summary-item">
              <span className="label">Name:</span>
              <span className="value">{fullName}</span>
            </div>
            <div className="summary-item">
              <span className="label">Specialization:</span>
              <span className="value">{specialization}</span>
            </div>
            <div className="summary-item">
              <span className="label">Hospital:</span>
              <span className="value">{hospitalName}</span>
            </div>
          </div>

          {error && (
            <div className="alert alert-error">
              <AlertCircle size={18} />
              {error}
            </div>
          )}

          {success && (
            <div className="alert alert-success">
              <CheckCircle2 size={18} />
              {success}
            </div>
          )}

          <form onSubmit={handleCreateAccount} className="signup-form">
            <button
              type="submit"
              disabled={loading}
              className="form-button-primary"
            >
              {loading ? (
                <>
                  <Loader size={18} className="spinner" />
                  Creating Account...
                </>
              ) : (
                <>
                  <CheckCircle2 size={18} />
                  Create Account
                </>
              )}
            </button>
          </form>

          <div className="form-button-group">
            <button
              onClick={() => setStep('policies')}
              disabled={loading}
              className="form-link"
            >
              <ArrowLeft size={18} />
              Back to Policies
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ProviderSignup;
