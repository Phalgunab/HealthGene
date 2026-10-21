/**
 * Privacy Policy & Terms Acceptance Component
 * Required for provider registration
 */

import React, { useState } from 'react';
import { CheckCircle2, AlertCircle, X, ChevronDown, ChevronUp } from 'lucide-react';

const PrivacyPolicyModal = ({
  isOpen,
  onAccept,
  onDecline,
  title = 'Terms & Privacy Policy',
  showCheckbox = true,
  compact = false
}) => {
  const [accepted, setAccepted] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});

  if (!isOpen) return null;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const sections = [
    {
      id: 'privacy',
      title: 'Privacy Policy',
      content: `
        We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and otherwise handle your information.

        DATA COLLECTION:
        • Personal information (name, email, phone, credentials)
        • Medical records and health information
        • Device information and usage patterns
        • Authentication and security data

        DATA USAGE:
        • Providing healthcare services
        • Patient care coordination
        • Communication and notifications
        • Security and fraud prevention
        • Compliance with regulations (HIPAA, GDPR)

        DATA PROTECTION:
        • End-to-end encryption for sensitive data
        • Secure Firebase backend
        • Regular security audits
        • Restricted access controls
        • Automated data backups

        USER RIGHTS:
        • Access your personal data
        • Request data corrections
        • Request data deletion (with legal obligations)
        • Opt-out of communications
        • Data portability
      `
    },
    {
      id: 'terms',
      title: 'Terms of Service',
      content: `
        By using HealthGene, you agree to these Terms of Service.

        SERVICE PROVISION:
        • We provide a platform for health information management
        • Services are provided on an "as-is" basis
        • We reserve the right to modify services
        • We may suspend services for maintenance or security

        USER RESPONSIBILITIES:
        • Maintain confidentiality of login credentials
        • Provide accurate information
        • Use the service legally and ethically
        • Comply with all applicable regulations
        • Report security vulnerabilities responsibly

        LIABILITY LIMITATIONS:
        • We are not liable for unauthorized access due to user negligence
        • We limit liability for service interruptions
        • Users assume responsibility for backup copies
        • Medical advice comes from licensed providers only

        INTELLECTUAL PROPERTY:
        • HealthGene platform is our property
        • Users retain rights to their medical records
        • Permitted fair use for personal/educational purposes
      `
    },
    {
      id: 'compliance',
      title: 'HIPAA & Regulatory Compliance',
      content: `
        We comply with healthcare regulations to protect your data.

        HIPAA COMPLIANCE:
        • Business Associate Agreements (BAA)
        • Secure encryption (AES-256)
        • Access controls and audit logs
        • Breach notification procedures
        • Minimum necessary principle

        DATA RETENTION:
        • Medical records retained per regulatory requirements
        • Inactive accounts deleted after 2 years (with notice)
        • Backups retained for 30 days
        • Compliance with state data retention laws

        SECURITY MEASURES:
        • Two-factor authentication
        • Biometric security options
        • Session timeouts (15 minutes)
        • API rate limiting
        • Network security (SSL/TLS)

        THIRD-PARTY SHARING:
        • No sale of personal data
        • Sharing only with patient consent
        • Business associates under BAAs
        • Law enforcement (when legally required)
        • Emergency situations (when necessary)
      `
    },
    {
      id: 'rights',
      title: 'Your Rights & Responsibilities',
      content: `
        PATIENT RIGHTS:
        • Right to access your medical information
        • Right to request amendments
        • Right to request restrictions
        • Right to confidential communications
        • Right to receive a copy of privacy practices

        PROVIDER OBLIGATIONS:
        • Maintain provider credentials and licenses
        • Keep professional liability insurance
        • Follow clinical best practices
        • Report adverse events
        • Maintain continuing education

        DATA ACCESS:
        • Only authorized providers can access records
        • Access logs are maintained
        • Family members with permission
        • Emergency access protocols
        • Data export available anytime

        CONSEQUENCES OF VIOLATION:
        • Account suspension or termination
        • Legal action for data misuse
        • Regulatory penalties
        • Liability for damages
      `
    }
  ];

  return (
    <div className="privacy-modal-overlay">
      <div className={`privacy-modal-container ${compact ? 'compact' : ''}`}>
        {/* Header */}
        <div className="privacy-modal-header">
          <h2 className="privacy-modal-title">{title}</h2>
          <button
            onClick={onDecline}
            className="privacy-modal-close"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="privacy-modal-content">
          {sections.map(section => (
            <div key={section.id} className="privacy-section">
              <button
                onClick={() => toggleSection(section.id)}
                className="privacy-section-header"
              >
                <span className="privacy-section-title">{section.title}</span>
                {expandedSections[section.id] ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {expandedSections[section.id] && (
                <div className="privacy-section-content">
                  {section.content.split('\n').map((line, idx) => (
                    <p key={idx}>{line}</p>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Disclaimer */}
          <div className="privacy-disclaimer">
            <AlertCircle size={20} />
            <div>
              <strong>Important:</strong> By accepting, you confirm that you have read and agree to our Privacy Policy, Terms of Service, and HIPAA Compliance practices. These terms are legally binding.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="privacy-modal-footer">
          {showCheckbox && (
            <label className="privacy-checkbox-label">
              <input
                type="checkbox"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="privacy-checkbox"
              />
              <span>I agree to all terms and policies</span>
            </label>
          )}

          <div className="privacy-button-group">
            <button
              onClick={onDecline}
              className="privacy-btn-decline"
            >
              Decline
            </button>
            <button
              onClick={() => {
                if (showCheckbox && !accepted) {
                  return;
                }
                onAccept();
              }}
              disabled={showCheckbox && !accepted}
              className="privacy-btn-accept"
            >
              <CheckCircle2 size={18} />
              Accept & Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyModal;
