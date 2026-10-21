import React, { useEffect, useState } from 'react';
import { X, ChevronDown, Check } from 'lucide-react';

/**
 * ConsentModal Component
 * Displays Privacy Policy, Terms of Service, and HIPAA Disclosure
 * Captures user consent before allowing app use
 * 
 * Props:
 *   isOpen: boolean - Whether modal is visible
 *   onAccept: function - Called when user accepts all terms
 *   onDecline: function - Called when user declines
 */
export function ConsentModal({ isOpen, onAccept, onDecline }) {
  const [activeTab, setActiveTab] = useState('privacy');
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedHIPAA, setAcceptedHIPAA] = useState(false);
  const [scrolledPrivacy, setScrolledPrivacy] = useState(false);
  const [scrolledTerms, setScrolledTerms] = useState(false);

  if (!isOpen) return null;

  const handlePrivacyScroll = (e) => {
    const element = e.target;
    // Check if scrolled close to bottom (90%)
    if (element.scrollHeight - element.scrollTop <= element.clientHeight * 1.1) {
      setScrolledPrivacy(true);
    }
  };

  const handleTermsScroll = (e) => {
    const element = e.target;
    // Check if scrolled close to bottom (90%)
    if (element.scrollHeight - element.scrollTop <= element.clientHeight * 1.1) {
      setScrolledTerms(true);
    }
  };

  const canAccept = acceptedPrivacy && acceptedTerms && acceptedHIPAA;

  const handleAccept = () => {
    if (canAccept) {
      // Save consent to localStorage
      localStorage.setItem('consentAccepted', JSON.stringify({
        privacy: true,
        terms: true,
        hipaa: true,
        timestamp: new Date().toISOString(),
        version: '1.0',
      }));
      onAccept();
    }
  };

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal">
        <div className="consent-header">
          <h2>Terms & Conditions</h2>
          <p>Please review and accept before using HealthGene</p>
        </div>

        {/* Tabs */}
        <div className="consent-tabs">
          <button
            className={`consent-tab ${activeTab === 'privacy' ? 'active' : ''}`}
            onClick={() => setActiveTab('privacy')}
          >
            Privacy Policy
          </button>
          <button
            className={`consent-tab ${activeTab === 'terms' ? 'active' : ''}`}
            onClick={() => setActiveTab('terms')}
          >
            Terms of Service
          </button>
          <button
            className={`consent-tab ${activeTab === 'hipaa' ? 'active' : ''}`}
            onClick={() => setActiveTab('hipaa')}
          >
            HIPAA Disclosure
          </button>
        </div>

        {/* Content */}
        <div className="consent-content">
          {/* Privacy Policy */}
          {activeTab === 'privacy' && (
            <div
              className="consent-text"
              onScroll={handlePrivacyScroll}
            >
              <h3>Privacy Policy</h3>
              <p>
                <strong>Last Updated: October 2026</strong>
              </p>

              <h4>1. Data We Collect</h4>
              <p>
                HealthGene collects health information you voluntarily enter into the app, including:
              </p>
              <ul>
                <li>Medical records and health data</li>
                <li>Doctor and hospital names</li>
                <li>Medical test results</li>
                <li>Personal notes about health</li>
                <li>Family member health information</li>
              </ul>

              <h4>2. How We Use Your Data</h4>
              <p>Your data is used solely to:</p>
              <ul>
                <li>Store and organize your health records</li>
                <li>Provide search and timeline features</li>
                <li>Generate health summaries</li>
                <li>Enable family sharing (if you choose)</li>
              </ul>

              <h4>3. Data Protection</h4>
              <p>
                We protect your data through:
              </p>
              <ul>
                <li>End-to-end encryption of all health records</li>
                <li>Secure authentication (password + optional biometric)</li>
                <li>Automatic logout after 15 minutes of inactivity</li>
                <li>Industry-standard security practices</li>
              </ul>

              <h4>4. Your Rights (GDPR)</h4>
              <p>
                If you're in the EU, you have the right to:
              </p>
              <ul>
                <li>Access all your data (export as CSV/JSON)</li>
                <li>Correct inaccurate data</li>
                <li>Delete your account and all data</li>
                <li>Withdraw consent at any time</li>
              </ul>

              <h4>5. Your Rights (CCPA)</h4>
              <p>
                If you're in California, you have the right to:
              </p>
              <ul>
                <li>Know what personal data is collected</li>
                <li>Delete your data (30-day grace period)</li>
                <li>Opt-out of data sales (we don't sell data)</li>
              </ul>

              <h4>6. Data Retention</h4>
              <p>
                Your data is retained as long as your account is active. After account deletion:
              </p>
              <ul>
                <li>30-day grace period to recover account</li>
                <li>After 30 days, all data is permanently deleted</li>
                <li>Backup copies deleted within 90 days</li>
              </ul>

              <h4>7. Third-Party Services</h4>
              <p>
                We use the following services:
              </p>
              <ul>
                <li><strong>Firebase:</strong> Database and authentication</li>
                <li><strong>Sentry:</strong> Error monitoring (non-sensitive)</li>
                <li><strong>TweetNaCl.js:</strong> Local encryption (no data sent)</li>
              </ul>

              <h4>8. Contact</h4>
              <p>
                For privacy questions, contact: privacy@healthgene.app
              </p>

              <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <strong>Note:</strong> This is a draft privacy policy. Please have it reviewed by a healthcare privacy attorney before publishing.
              </p>
            </div>
          )}

          {/* Terms of Service */}
          {activeTab === 'terms' && (
            <div
              className="consent-text"
              onScroll={handleTermsScroll}
            >
              <h3>Terms of Service</h3>
              <p>
                <strong>Last Updated: October 2026</strong>
              </p>

              <h4>1. Important Medical Disclaimer</h4>
              <p style={{ color: '#d32f2f', fontWeight: 'bold' }}>
                HealthGene is NOT a medical device and NOT a substitute for professional medical advice.
                This app is for personal health record management only.
              </p>

              <h4>2. Not Medical Advice</h4>
              <p>
                The information in this app is for educational purposes only. It is not intended to:
              </p>
              <ul>
                <li>Diagnose or treat any medical condition</li>
                <li>Provide medical advice or prescriptions</li>
                <li>Replace consultation with a healthcare provider</li>
                <li>Emergency medical service</li>
              </ul>
              <p>
                <strong>Always consult with a qualified healthcare provider for medical advice.</strong>
              </p>

              <h4>3. User Responsibilities</h4>
              <p>You agree to:</p>
              <ul>
                <li>Keep your login credentials confidential</li>
                <li>Only enter accurate health information</li>
                <li>Not share your account with others</li>
                <li>Notify us of unauthorized access immediately</li>
                <li>Use the app in compliance with applicable laws</li>
              </ul>

              <h4>4. Limitations of Liability</h4>
              <p>
                HealthGene is provided "as is" without warranties. We are not liable for:
              </p>
              <ul>
                <li>Data loss or corruption</li>
                <li>Service interruptions or downtime</li>
                <li>Any damages from medical decisions based on app data</li>
                <li>Third-party service failures (Firebase, etc.)</li>
              </ul>

              <h4>5. HIPAA Compliance Note</h4>
              <p>
                <strong>Important:</strong> HealthGene is currently <strong>NOT HIPAA-compliant</strong> by default.
                To use this app for Protected Health Information (PHI):
              </p>
              <ul>
                <li>You must implement additional security measures</li>
                <li>Consult with a healthcare compliance attorney</li>
                <li>Execute a Business Associate Agreement (BAA) with Firebase</li>
              </ul>

              <h4>6. Account Termination</h4>
              <p>
                We may terminate your account if you:
              </p>
              <ul>
                <li>Violate these terms</li>
                <li>Use the app unlawfully</li>
                <li>Abuse the service or other users</li>
              </ul>

              <h4>7. Dispute Resolution</h4>
              <p>
                Any disputes shall be resolved through:
              </p>
              <ul>
                <li>Good faith negotiation (30 days)</li>
                <li>Binding arbitration (if negotiation fails)</li>
                <li>Governed by applicable jurisdiction laws</li>
              </ul>

              <h4>8. Changes to Terms</h4>
              <p>
                We may update these terms. Continued use means you accept changes.
              </p>

              <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <strong>Note:</strong> This is a draft terms of service. Please have it reviewed by a healthcare attorney before publishing.
              </p>
            </div>
          )}

          {/* HIPAA Disclosure */}
          {activeTab === 'hipaa' && (
            <div className="consent-text">
              <h3>HIPAA Disclosure</h3>
              <p>
                <strong>Last Updated: October 2026</strong>
              </p>

              <div style={{ backgroundColor: '#fff3cd', padding: '12px', borderRadius: '4px', marginBottom: '16px' }}>
                <p style={{ margin: 0 }}>
                  <strong>⚠️ IMPORTANT:</strong> Read this disclosure carefully if you're storing Protected Health Information (PHI).
                </p>
              </div>

              <h4>What is HIPAA?</h4>
              <p>
                HIPAA (Health Insurance Portability and Accountability Act) is a US law that protects
                the privacy and security of health information. If you're a healthcare provider or health plan,
                you must comply with HIPAA.
              </p>

              <h4>HealthGene and HIPAA</h4>
              <p>
                <strong>HealthGene is NOT HIPAA-compliant by default.</strong>
              </p>
              <p>
                This means:
              </p>
              <ul>
                <li>❌ You cannot use HealthGene to store PHI for patients unless you execute a BAA</li>
                <li>❌ Healthcare providers must comply with additional HIPAA requirements</li>
                <li>❌ Data breaches are subject to HIPAA breach notification rules</li>
              </ul>

              <h4>To Make HealthGene HIPAA-Compliant</h4>
              <p>
                If you want to use HealthGene for healthcare operations:
              </p>
              <ol>
                <li>Consult with a healthcare compliance attorney</li>
                <li>Execute a Business Associate Agreement (BAA) with Firebase</li>
                <li>Implement end-to-end encryption</li>
                <li>Set up audit logging and monitoring</li>
                <li>Conduct a security risk assessment</li>
                <li>Implement access controls and role-based permissions</li>
              </ol>

              <h4>If You're Using This as a Patient</h4>
              <p>
                If you're an individual using HealthGene to manage your own health information:
              </p>
              <ul>
                <li>✅ You can store your personal health records</li>
                <li>✅ HIPAA does not apply (only applies to providers/plans)</li>
                <li>❌ But be aware that this app is not secure enough for sensitive PHI</li>
              </ul>

              <h4>Recommended Security Practices</h4>
              <p>
                Regardless of HIPAA requirements, follow these best practices:
              </p>
              <ul>
                <li>Enable biometric authentication (fingerprint/face)</li>
                <li>Use a strong, unique password (12+ characters)</li>
                <li>Enable 2FA if available</li>
                <li>Regularly review access logs</li>
                <li>Enable automatic logout after inactivity</li>
                <li>Keep your device software updated</li>
                <li>Use a secure internet connection (avoid public WiFi)</li>
              </ul>

              <h4>Questions?</h4>
              <p>
                For HIPAA compliance questions, contact your healthcare legal counsel.
              </p>

              <p style={{ marginTop: '20px', fontSize: '12px', color: '#666' }}>
                <strong>Note:</strong> This disclosure is informational only and not a substitute for legal advice.
                Consult with a qualified healthcare attorney for HIPAA compliance requirements.
              </p>
            </div>
          )}
        </div>

        {/* Checkboxes */}
        <div className="consent-checkboxes">
          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
              disabled={activeTab !== 'privacy' || !scrolledPrivacy}
            />
            <span>I accept the Privacy Policy</span>
          </label>

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              disabled={activeTab !== 'terms' || !scrolledTerms}
            />
            <span>I accept the Terms of Service</span>
          </label>

          <label className="consent-checkbox">
            <input
              type="checkbox"
              checked={acceptedHIPAA}
              onChange={(e) => setAcceptedHIPAA(e.target.checked)}
            />
            <span>I understand the HIPAA Disclosure and acknowledge this app is not HIPAA-compliant by default</span>
          </label>
        </div>

        {/* Status Messages */}
        {!scrolledPrivacy && activeTab === 'privacy' && (
          <div className="consent-message" style={{ color: '#1976d2' }}>
            <ChevronDown size={16} /> Please scroll to the bottom to accept
          </div>
        )}
        {!scrolledTerms && activeTab === 'terms' && (
          <div className="consent-message" style={{ color: '#1976d2' }}>
            <ChevronDown size={16} /> Please scroll to the bottom to accept
          </div>
        )}

        {/* Buttons */}
        <div className="consent-actions">
          <button className="consent-decline" onClick={onDecline}>
            Decline & Exit
          </button>
          <button
            className={`consent-accept ${canAccept ? '' : 'disabled'}`}
            onClick={handleAccept}
            disabled={!canAccept}
          >
            <Check size={18} />
            Accept All & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConsentModal;
