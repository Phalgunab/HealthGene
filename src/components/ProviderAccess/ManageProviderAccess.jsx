import React, { useState, useEffect } from 'react';
import {
  getProviderAccessList,
  grantProviderAccess,
  revokeProviderAccess,
  updateAccessLevel,
  getAccessHistory,
  formatPermissionLevel
} from '../../utils/accessManagement';
import GrantAccessModal from './GrantAccessModal';
import AccessHistoryView from './AccessHistoryView';
import ProviderCard from './ProviderCard';
import '../styles/ProviderAccess.css';

/**
 * ManageProviderAccess Component
 * Patient-facing interface for managing healthcare provider access
 * Allows patients to:
 * - View all providers with current access
 * - Grant new providers access
 * - Revoke access from providers
 * - Update permission levels
 * - View access history
 */
const ManageProviderAccess = ({ userId = 'patient_123' }) => {
  // Active Tab State
  const [activeTab, setActiveTab] = useState('active'); // 'active' or 'history'

  // Provider List State
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name'); // 'name', 'accessed', 'level'
  const [filterLevel, setFilterLevel] = useState('all'); // 'all', 'Full', 'AdherenceOnly', 'ReadOnly', 'Custom'

  // Modal State
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  // Revoke Confirmation State
  const [confirmRevoke, setConfirmRevoke] = useState(null);
  const [revokeLoading, setRevokeLoading] = useState(false);

  // Success Message State
  const [successMessage, setSuccessMessage] = useState(null);

  // Load providers on mount
  useEffect(() => {
    loadProviders();
  }, [userId]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  /**
   * Load provider access list from database
   */
  const loadProviders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProviderAccessList(userId);
      setProviders(data);
    } catch (err) {
      setError('Failed to load providers. Please try again.');
      console.error('Error loading providers:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter providers based on search term and filter level
   */
  const getFilteredProviders = () => {
    let filtered = providers;

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(provider =>
        provider.name.toLowerCase().includes(searchLower) ||
        provider.specialty.toLowerCase().includes(searchLower) ||
        provider.organization.toLowerCase().includes(searchLower)
      );
    }

    // Apply permission level filter
    if (filterLevel !== 'all') {
      filtered = filtered.filter(provider => provider.permissionLevel === filterLevel);
    }

    // Apply sorting
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'accessed') {
      filtered.sort((a, b) => new Date(b.lastAccessed) - new Date(a.lastAccessed));
    } else if (sortBy === 'level') {
      const levelOrder = { Full: 0, AdherenceOnly: 1, ReadOnly: 2, Custom: 3 };
      filtered.sort((a, b) => levelOrder[a.permissionLevel] - levelOrder[b.permissionLevel]);
    }

    return filtered;
  };

  /**
   * Handle grant access button click
   */
  const handleGrantAccess = () => {
    setShowGrantModal(true);
  };

  /**
   * Handle provider selected in modal
   */
  const handleProviderSelected = async (providerData) => {
    try {
      await grantProviderAccess(
        userId,
        providerData.providerId,
        providerData.permissionLevel,
        providerData.customPermissions
      );
      
      // Reload providers list
      await loadProviders();
      setShowGrantModal(false);
      setSuccessMessage(`Access granted to ${providerData.providerName}`);
    } catch (err) {
      setError('Failed to grant access. Please try again.');
      console.error('Error granting access:', err);
    }
  };

  /**
   * Handle revoke access button click
   */
  const handleRevokeClick = (provider) => {
    setConfirmRevoke(provider);
  };

  /**
   * Confirm and execute revoke access
   */
  const handleConfirmRevoke = async () => {
    try {
      setRevokeLoading(true);
      await revokeProviderAccess(userId, confirmRevoke.id);
      
      // Reload providers list
      await loadProviders();
      setConfirmRevoke(null);
      setSuccessMessage(`Access revoked for ${confirmRevoke.name}`);
    } catch (err) {
      setError('Failed to revoke access. Please try again.');
      console.error('Error revoking access:', err);
    } finally {
      setRevokeLoading(false);
    }
  };

  /**
   * Handle update permission level
   */
  const handleUpdateLevel = async (provider, newLevel) => {
    try {
      await updateAccessLevel(userId, provider.id, newLevel);
      
      // Reload providers list
      await loadProviders();
      setSuccessMessage(`Permission level updated for ${provider.name}`);
    } catch (err) {
      setError('Failed to update permission level. Please try again.');
      console.error('Error updating permission level:', err);
    }
  };

  const filteredProviders = getFilteredProviders();

  return (
    <div className="manage-provider-access">
      {/* Header */}
      <div className="access-header">
        <div>
          <h1>Manage Provider Access</h1>
          <p className="access-subtitle">
            Control which healthcare providers can access your medical information
          </p>
        </div>
        <button 
          className="btn-grant-access"
          onClick={handleGrantAccess}
        >
          <span className="icon">+</span>
          Grant New Access
        </button>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="success-message">
          <span className="icon">✓</span>
          {successMessage}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="icon">!</span>
          {error}
          <button 
            className="btn-close-error"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="access-tabs">
        <button
          className={`tab ${activeTab === 'active' ? 'active' : ''}`}
          onClick={() => setActiveTab('active')}
        >
          <span className="tab-icon">👥</span>
          Active Providers
          <span className="tab-badge">{providers.length}</span>
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <span className="tab-icon">📋</span>
          Access History
        </button>
      </div>

      {/* Active Providers Tab */}
      {activeTab === 'active' && (
        <div className="active-providers-section">
          {/* Search & Filter Bar */}
          <div className="search-filter-bar">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search providers by name, specialty..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>

            <div className="filter-controls">
              <select
                className="select-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="name">Sort by Name</option>
                <option value="accessed">Sort by Last Accessed</option>
                <option value="level">Sort by Permission Level</option>
              </select>

              <select
                className="select-filter"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value)}
              >
                <option value="all">All Permission Levels</option>
                <option value="Full">Full Access</option>
                <option value="AdherenceOnly">Adherence Only</option>
                <option value="ReadOnly">Read Only</option>
                <option value="Custom">Custom</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading providers...</p>
            </div>
          ) : filteredProviders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">👥</div>
              <h3>No providers found</h3>
              <p>
                {providers.length === 0
                  ? 'You haven\'t granted access to any providers yet.'
                  : 'No providers match your search criteria.'}
              </p>
              {providers.length === 0 && (
                <button 
                  className="btn-primary"
                  onClick={handleGrantAccess}
                >
                  Grant Provider Access
                </button>
              )}
            </div>
          ) : (
            <div className="providers-grid">
              {filteredProviders.map((provider) => (
                <ProviderCard
                  key={provider.id}
                  provider={provider}
                  onRevoke={handleRevokeClick}
                  onUpdateLevel={handleUpdateLevel}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Access History Tab */}
      {activeTab === 'history' && (
        <AccessHistoryView userId={userId} />
      )}

      {/* Grant Access Modal */}
      {showGrantModal && (
        <GrantAccessModal
          userId={userId}
          onClose={() => setShowGrantModal(false)}
          onProviderSelected={handleProviderSelected}
        />
      )}

      {/* Revoke Confirmation Modal */}
      {confirmRevoke && (
        <div className="modal-overlay" onClick={() => setConfirmRevoke(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h2>Revoke Access?</h2>
            <p>
              Are you sure you want to revoke access for <strong>{confirmRevoke.name}</strong>?
            </p>
            <p className="confirm-warning">
              They will no longer be able to view your medical information.
            </p>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => setConfirmRevoke(null)}
                disabled={revokeLoading}
              >
                Cancel
              </button>
              <button
                className="btn-danger"
                onClick={handleConfirmRevoke}
                disabled={revokeLoading}
              >
                {revokeLoading ? 'Revoking...' : 'Revoke Access'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageProviderAccess;
