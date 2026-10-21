/**
 * Provider Signup Component
 * Multi-step healthcare provider registration
 * Phase 2 Sprint 5: Healthcare Provider Integration
 */

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, Mail, User, Briefcase, AlertCircle, Loader, CheckCircle2, ArrowRight, ArrowLeft, Shield } from 'lucide-react';
import {
  validateProviderEmail,
  validatePasswordStrength,
  validateLicenseNumber,
  validateHIPAAConsent,
  PROVIDER_SPECIALTIES,
  PROVIDER_ORG_TYPES,
  SECURITY_QUESTIONS,
} from '../../utils/providerAuth';
import '../../styles/ProviderAuth.css';

const ProviderSignup = ({ onSignupSuccess, onNavigateToLogin }) => {
  const [step, setStep] = useState(1); // 1-5
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Step 1: Email & Password
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  
  // Step 2: Professional Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [licenseState, setLicenseState] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [organizationType, setOrganizationType] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  
  // Step 3: Organization Details
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [npiNumber, setNpiNumber] = useState('');
  
  // Step 4: Security Questions
  const [selectedQuestions, setSelectedQuestions] = useState(['', '', '']);
  const [answers, setAnswers] = useState(['', '', '']);
  
  // Step 5: HIPAA & MFA
  const [hipaaConsents, setHipaaConsents] = useState({
    terms: false,
    privacy: false,
    hipaa: false,
    dataHandling: false,
    responsibilities: false
  });
  const [enableMFA, setEnableMFA] = useState(true);
  const [mfaSecret, setMfaSecret] = useState('');
  
  // Validation errors
  const [errors, setErrors] = useState({});

  const validateStep = () => {
    const newErrors = {};

    if (step === 1) {
      if (!email) newErrors.email = 'Email is required';
      else if (!validateProviderEmail(email)) newErrors.email = 'Invalid email format';
      
      if (!password) newErrors.password = 'Password is required';
      else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      
      if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      
      if (!termsAccepted) newErrors.terms = 'You must accept the terms';
    } else if (step === 2) {
      if (!firstName) newErrors.firstName = 'First name is required';
      if (!lastName) newErrors.lastName = 'Last name is required';
      if (!licenseNumber) newErrors.licenseNumber = 'License number is required';
      if (!licenseState) newErrors.licenseState = 'License state is required';
      if (!specialty) newErrors.specialty = 'Specialty is required';
      if (!organizationType) newErrors.organizationType = 'Organization type is required';
      if (!organizationName) newErrors.organizationName = 'Organization name is required';
    } else if (step === 3) {
      if (!address) newErrors.address = 'Address is required';
      if (!phone) newErrors.phone = 'Phone number is required';
      if (!yearsExperience) newErrors.yearsExperience = 'Years of experience is required';
      if (!npiNumber) newErrors.npiNumber = 'NPI number is required';
    } else if (step === 4) {
      if (selectedQuestions.some(q => !q)) newErrors.questions = 'Select 3 security questions';
      if (answers.some(a => !a)) newErrors.answers = 'Answer all security questions';
    } else if (step === 5) {
      const consent = validateHIPAAConsent(hipaaConsents);
      if (!consent.isValid) newErrors.hipaa = consent.message;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setError('');
      if (step < 5) setStep(step + 1);
      else handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      const providerData = {
        email,
        password,
        firstName,
        lastName,
        licenseNumber,
        licenseState,
        specialty,
        organizationType,
        organizationName,
        address,
        phone,
        yearsExperience,
        npiNumber,
        securityAnswers: selectedQuestions.map((q, i) => ({ question: q, answer: answers[i] })),
        hipaaConsent: hipaaConsents,
        mfaEnabled: enableMFA,
      };

      setSuccess('Provider account created successfully!');
      setTimeout(() => {
        if (onSignupSuccess) onSignupSuccess(providerData);
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = validatePasswordStrength(password);

  return (
    <div className="provider-auth-container">
      <div className="provider-auth-card">
        {/* Progress Indicator */}
        <div className="provider-signup-progress">
          {[1, 2, 3, 4, 5].map((s) => (
            <div key={s} className={`progress-step ${s <= step ? 'active' : ''} ${s < step ? 'completed' : ''}`}>
              <div className="step-circle">{s < step ? '✓' : s}</div>
              <span className="step-label">
                {s === 1 && 'Account'}
                {s === 2 && 'Professional'}
                {s === 3 && 'Organization'}
                {s === 4 && 'Security'}
                {s === 5 && 'Confirm'}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="provider-alert alert-error">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="provider-alert alert-success">
            <CheckCircle2 size={20} />
            <span>{success}</span>
          </div>
        )}

        {/* Step 1: Email & Password */}
        {step === 1 && (
          <div className="provider-step">
            <h2>Create Your Account</h2>
            <p className="step-description">Secure provider portal access with email verification</p>

            <div className="form-group">
              <label htmlFor="email">Professional Email *</label>
              <div className="input-wrapper">
                <Mail size={18} />
                <input
                  id="email"
                  type="email"
                  placeholder="you@hospital.com"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: '' }); }}
                  className={errors.email ? 'error' : ''}
                  disabled={loading}
                  autoFocus
                />
              </div>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">Password *</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: '' }); }}
                  className={errors.password ? 'error' : ''}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="icon-button">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && <span className="error-text">{errors.password}</span>}

              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div className="strength-fill" style={{ width: `${passwordStrength.score}%`, backgroundColor: passwordStrength.score < 40 ? '#dc2626' : passwordStrength.score < 70 ? '#f59e0b' : '#16a34a' }}></div>
                  </div>
                  <span className="strength-text">Strength: {passwordStrength.score.toFixed(0)}%</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password *</label>
              <div className="input-wrapper">
                <Lock size={18} />
                <input
                  id="confirmPassword"
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => { setConfirmPassword(e.target.value); if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' }); }}
                  className={errors.confirmPassword ? 'error' : ''}
                  disabled={loading}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="icon-button">
                  {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}
            </div>

            <div className="checkbox-group">
              <input
                id="terms"
                type="checkbox"
                checked={termsAccepted}
                onChange={(e) => { setTermsAccepted(e.target.checked); if (errors.terms) setErrors({ ...errors, terms: '' }); }}
                disabled={loading}
              />
              <label htmlFor="terms">
                I accept the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>
              </label>
            </div>
            {errors.terms && <span className="error-text">{errors.terms}</span>}
          </div>
        )}

        {/* Step 2: Professional Information */}
        {step === 2 && (
          <div className="provider-step">
            <h2>Professional Information</h2>
            <p className="step-description">Verify your healthcare credentials</p>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">First Name *</label>
                <input
                  id="firstName"
                  type="text"
                  placeholder="First name"
                  value={firstName}
                  onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors({ ...errors, firstName: '' }); }}
                  className={errors.firstName ? 'error' : ''}
                  disabled={loading}
                  autoFocus
                />
                {errors.firstName && <span className="error-text">{errors.firstName}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="lastName">Last Name *</label>
                <input
                  id="lastName"
                  type="text"
                  placeholder="Last name"
                  value={lastName}
                  onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors({ ...errors, lastName: '' }); }}
                  className={errors.lastName ? 'error' : ''}
                  disabled={loading}
                />
                {errors.lastName && <span className="error-text">{errors.lastName}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="specialty">Specialty *</label>
                <select
                  id="specialty"
                  value={specialty}
                  onChange={(e) => { setSpecialty(e.target.value); if (errors.specialty) setErrors({ ...errors, specialty: '' }); }}
                  className={errors.specialty ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select specialty...</option>
                  {PROVIDER_SPECIALTIES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                {errors.specialty && <span className="error-text">{errors.specialty}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="licenseNumber">Medical License Number *</label>
                <input
                  id="licenseNumber"
                  type="text"
                  placeholder="License number"
                  value={licenseNumber}
                  onChange={(e) => { setLicenseNumber(e.target.value); if (errors.licenseNumber) setErrors({ ...errors, licenseNumber: '' }); }}
                  className={errors.licenseNumber ? 'error' : ''}
                  disabled={loading}
                />
                {errors.licenseNumber && <span className="error-text">{errors.licenseNumber}</span>}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="licenseState">License State *</label>
                <select
                  id="licenseState"
                  value={licenseState}
                  onChange={(e) => { setLicenseState(e.target.value); if (errors.licenseState) setErrors({ ...errors, licenseState: '' }); }}
                  className={errors.licenseState ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select state...</option>
                  {['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'].map(state => <option key={state} value={state}>{state}</option>)}
                </select>
                {errors.licenseState && <span className="error-text">{errors.licenseState}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="organizationType">Organization Type *</label>
                <select
                  id="organizationType"
                  value={organizationType}
                  onChange={(e) => { setOrganizationType(e.target.value); if (errors.organizationType) setErrors({ ...errors, organizationType: '' }); }}
                  className={errors.organizationType ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select type...</option>
                  {PROVIDER_ORG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                {errors.organizationType && <span className="error-text">{errors.organizationType}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="organizationName">Organization Name *</label>
              <input
                id="organizationName"
                type="text"
                placeholder="Hospital or clinic name"
                value={organizationName}
                onChange={(e) => { setOrganizationName(e.target.value); if (errors.organizationName) setErrors({ ...errors, organizationName: '' }); }}
                className={errors.organizationName ? 'error' : ''}
                disabled={loading}
              />
              {errors.organizationName && <span className="error-text">{errors.organizationName}</span>}
            </div>
          </div>
        )}

        {/* Step 3: Organization Details */}
        {step === 3 && (
          <div className="provider-step">
            <h2>Organization Details</h2>
            <p className="step-description">Complete your facility information</p>

            <div className="form-group">
              <label htmlFor="address">Organization Address *</label>
              <input
                id="address"
                type="text"
                placeholder="Street address"
                value={address}
                onChange={(e) => { setAddress(e.target.value); if (errors.address) setErrors({ ...errors, address: '' }); }}
                className={errors.address ? 'error' : ''}
                disabled={loading}
                autoFocus
              />
              {errors.address && <span className="error-text">{errors.address}</span>}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Contact Phone *</label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={phone}
                  onChange={(e) => { setPhone(e.target.value); if (errors.phone) setErrors({ ...errors, phone: '' }); }}
                  className={errors.phone ? 'error' : ''}
                  disabled={loading}
                />
                {errors.phone && <span className="error-text">{errors.phone}</span>}
              </div>
              <div className="form-group">
                <label htmlFor="yearsExperience">Years of Experience *</label>
                <input
                  id="yearsExperience"
                  type="number"
                  min="0"
                  max="70"
                  placeholder="Years"
                  value={yearsExperience}
                  onChange={(e) => { setYearsExperience(e.target.value); if (errors.yearsExperience) setErrors({ ...errors, yearsExperience: '' }); }}
                  className={errors.yearsExperience ? 'error' : ''}
                  disabled={loading}
                />
                {errors.yearsExperience && <span className="error-text">{errors.yearsExperience}</span>}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="npiNumber">NPI Number (National Provider ID) *</label>
              <input
                id="npiNumber"
                type="text"
                placeholder="10-digit NPI number"
                value={npiNumber}
                onChange={(e) => { setNpiNumber(e.target.value); if (errors.npiNumber) setErrors({ ...errors, npiNumber: '' }); }}
                className={errors.npiNumber ? 'error' : ''}
                disabled={loading}
                maxLength="10"
              />
              {errors.npiNumber && <span className="error-text">{errors.npiNumber}</span>}
            </div>
          </div>
        )}

        {/* Step 4: Security Questions */}
        {step === 4 && (
          <div className="provider-step">
            <h2>Security Questions</h2>
            <p className="step-description">Set up account recovery questions</p>

            {[0, 1, 2].map((index) => (
              <div key={index} className="security-question-group">
                <label>Security Question {index + 1} *</label>
                <select
                  value={selectedQuestions[index]}
                  onChange={(e) => {
                    const newQuestions = [...selectedQuestions];
                    newQuestions[index] = e.target.value;
                    setSelectedQuestions(newQuestions);
                  }}
                  className={errors.questions ? 'error' : ''}
                  disabled={loading}
                >
                  <option value="">Select a question...</option>
                  {SECURITY_QUESTIONS.filter(q => !selectedQuestions.includes(q) || selectedQuestions[index] === q).map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
                
                {selectedQuestions[index] && (
                  <input
                    type="text"
                    placeholder="Your answer"
                    value={answers[index]}
                    onChange={(e) => {
                      const newAnswers = [...answers];
                      newAnswers[index] = e.target.value;
                      setAnswers(newAnswers);
                    }}
                    disabled={loading}
                    className="answer-input"
                  />
                )}
              </div>
            ))}
            {errors.questions && <span className="error-text">{errors.questions}</span>}
          </div>
        )}

        {/* Step 5: HIPAA & MFA */}
        {step === 5 && (
          <div className="provider-step">
            <h2>HIPAA Compliance & Security</h2>
            <p className="step-description">Final setup for secure healthcare provider access</p>

            <div className="hipaa-section">
              <h3><Shield size={20} /> HIPAA Agreements</h3>
              
              {[
                { key: 'terms', label: 'Terms of Service' },
                { key: 'privacy', label: 'Privacy Policy' },
                { key: 'hipaa', label: 'HIPAA Compliance Agreement' },
                { key: 'dataHandling', label: 'Secure Data Handling Standards' },
                { key: 'responsibilities', label: 'Professional Responsibilities' }
              ].map(item => (
                <div key={item.key} className="checkbox-group hipaa-checkbox">
                  <input
                    id={item.key}
                    type="checkbox"
                    checked={hipaaConsents[item.key]}
                    onChange={(e) => {
                      setHipaaConsents({ ...hipaaConsents, [item.key]: e.target.checked });
                      if (errors.hipaa) setErrors({ ...errors, hipaa: '' });
                    }}
                    disabled={loading}
                  />
                  <label htmlFor={item.key}>{item.label}</label>
                </div>
              ))}
              {errors.hipaa && <span className="error-text">{errors.hipaa}</span>}
            </div>

            <div className="mfa-section">
              <h3><Lock size={20} /> Two-Factor Authentication</h3>
              <div className="checkbox-group">
                <input
                  id="enableMFA"
                  type="checkbox"
                  checked={enableMFA}
                  onChange={(e) => setEnableMFA(e.target.checked)}
                  disabled={loading}
                />
                <label htmlFor="enableMFA">Enable MFA with authenticator app (Google Authenticator, Authy, Microsoft Authenticator)</label>
              </div>
              {enableMFA && (
                <div className="mfa-setup-info">
                  <p>📱 After registration, you'll be prompted to set up your authenticator app for account security.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Form Navigation */}
        <div className="provider-form-footer">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1 || loading}
            className="btn-secondary"
          >
            <ArrowLeft size={18} /> Back
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? <Loader size={18} className="animate-spin" /> : null}
            {step === 5 ? 'Complete Registration' : 'Next'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </div>

        {/* Login Link */}
        <div className="provider-auth-footer">
          Already have an account? <a href="#" onClick={() => onNavigateToLogin && onNavigateToLogin()}>Sign in here</a>
        </div>
      </div>

      {/* Security Sidebar */}
      <div className="provider-auth-sidebar">
        <h3>Security Features</h3>
        <ul>
          <li>✓ Professional email verification</li>
          <li>✓ Strong password encryption</li>
          <li>✓ License validation system</li>
          <li>✓ Security questions setup</li>
          <li>✓ HIPAA compliance ready</li>
          <li>✓ Two-factor authentication</li>
          <li>✓ Secure audit logging</li>
          <li>✓ Data access controls</li>
        </ul>
      </div>
    </div>
  );
};

export default ProviderSignup;
