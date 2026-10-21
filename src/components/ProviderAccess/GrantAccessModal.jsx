import React, { useState, useEffect } from 'react';
import {
  searchProviders,
  getAccessDataTypes,
  getPermissionLevelDetails
} from '../../utils/accessManagement';
import PermissionLevelSelector from './PermissionLevelSelector';

/**
 * GrantAccessModal Component
 * Modal interface for granting access to new healthcare providers
 * Allows patients to search for providers and set permission levels
 */
const GrantAccessModal = ({ userId, onClose, onProviderSelected }) => {
  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Selection State
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [permissionLevel, setPermissionLevel] = useState('Full');
  const [customPermissions, setCustomPermissions] = useState([]);

  // Terms State
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  /**
   * Handle search input change with debounce
   */
  useEffect(() => {
    const debounceTimer = setTimeout(async () => {
      if (searchQuery.trim().length >= 2) {
        try {
          setSearching(true);
          const results = await searchProviders(searchQuery, 10);
          setSearchResults(results);
          setShowResults(true);
        } catch (err) {
          setError('Failed to search providers');
          console.error('Error searching providers:', err);
        } finally {
          setSearching(false);
        }
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  /**
   * Handle provider selection from search results
   */
  const handleSelectProvider = (provider) => {
    setSelectedProvider(provider);
    setShowResults(false);
    setSearchQuery('');
    setCustomPermissions([]);
  };

  /**
   * Handle custom permissions change
   */
  const handleCustomPermissionChange = (dataType) => {
    setCustomPermissions(prev => {
      if (prev.includes(dataType)) {
        return prev.filter(type => type !== dataType);
      } else {
        return [...prev, dataType];
      }
    });
  };

  /**
   * Validate form before submission
   */
  const validateForm = () => {
    const errors = [];

    if (!selectedProvider) {
      errors.push('Please select a provider');
    }

    if (!permissionLevel) {
      errors.push('Please select a permission level');
    }

    if (permissionLevel === 'Custom' && customPermissions.length === 0) {
      errors.push('Please select at least one data type for custom permissions');
    }

    if (!agreeTerms) {
      errors.push('Please agree to the terms and conditions');
    }

    return errors;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (errors.length > 0) {
      setError(errors[0]);
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const providerData = {
        providerId: selectedProvider.id,
        providerName: selectedProvider.name,
        permissionLevel,
        customPermissions: permissionLevel === 'Custom' ? customPermissions : []
      };

      await onProviderSelected(providerData);
    } catch (err) {
      setError('Failed to grant access. Please try again.');
      console.error('Error submitting form:', err);
      setSubmitting(false);
    }
  };

  const availableDataTypes = getAccessDataTypes(permissionLevel);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content grant-access-modal" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2>Grant Provider Access</h2>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="modal-body">
          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="icon">!</span>
              {error}
            </div>
          )}

          {/* Step 1: Search for Provider */}
          <div className="form-section">
            <label className="form-label">
              <span>Search for Provider</span>
              <span className="required">*</span>
            </label>
            <p className="form-help">Search by provider name, specialty, or NPI number</p>

            {!selectedProvider ? (
              <div className="search-container">
                <div className="search-wrapper">
                  <input
                    type="text"
                    placeholder="Dr. Smith, Cardiologist, 1234567890..."
                    className="search-input-large"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={submitting}
                  />
                  {searching && <span className="search-spinner">⟳</span>}
                </div>

                {showResults && (
                  <div className="search-results">
                    {searchResults.length === 0 ? (
                      <div className="no-results">
                        No providers found. Try different search terms.
                      </div>
                    ) : (
                      <ul className="results-list">
                        {searchResults.map((provider) => (
                          <li
                            key={provider.id}
                            className="result-item"
                            onClick={() => handleSelectProvider(provider)}
                          >
                            <div className="result-avatar">{provider.name.charAt(0)}</div>
                            <div className="result-info">
                              <div className="result-name">{provider.name}</div>
                              <div className="result-details">
                                {provider.specialty} • {provider.organization}
                              </div>
                              <div className="result-npi">NPI: {provider.npi}</div>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="selected-provider">
                <div className="provider-display">
                  <div className="provider-avatar">{selectedProvider.name.charAt(0)}</div>
                  <div className="provider-info">
                    <div className="provider-name">{selectedProvider.name}</div>
                    <div className="provider-details">
                      {selectedProvider.specialty} • {selectedProvider.organization}
                    </div>
                    <div className="provider-npi">NPI: {selectedProvider.npi}</div>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-change-provider"
                  onClick={() => {
                    setSelectedProvider(null);
                    setSearchQuery('');
                  }}
                >
                  Change Provider
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Select Permission Level */}
          {selectedProvider && (
            <div className="form-section">
              <label className="form-label">
                <span>Select Permission Level</span>
                <span className="required">*</span>
              </label>
              <PermissionLevelSelector
                selectedLevel={permissionLevel}
                onLevelChange={setPermissionLevel}
                onCustomPermissionChange={handleCustomPermissionChange}
                customPermissions={customPermissions}
              />
            </div>
          )}

          {/* Step 3: Terms & Conditions */}
          {selectedProvider && (
            <div className="form-section">
              <div className="terms-checkbox">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={submitting}
                />
                <label htmlFor="agreeTerms">
                  I authorize {selectedProvider.name} to access my medical information
                  with the selected permission level. I understand this can be revoked
                  at any time.
                </label>
              </div>
            </div>
          )}
        </form>

        {/* Modal Footer */}
        <div className="modal-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={onClose}
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!selectedProvider || submitting}
          >
            {submitting ? 'Granting Access...' : 'Grant Access'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GrantAccessModal;
