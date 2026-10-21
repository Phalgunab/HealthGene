import React, { useState } from 'react';
import { formatPermissionLevel, getPermissionLevelDetails } from '../../utils/accessManagement';

/**
 * ProviderCard Component
 * Displays information about a provider with current access
 * Allows users to view details, update permissions, or revoke access
 */
const ProviderCard = ({ provider, onRevoke, onUpdateLevel }) => {
  const [showActions, setShowActions] = useState(false);
  const [showLevelMenu, setShowLevelMenu] = useState(false);

  const details = getPermissionLevelDetails(provider.permissionLevel);
  const lastAccessedDate = new Date(provider.lastAccessed);
  const now = new Date();
  const daysSinceAccess = Math.floor((now - lastAccessedDate) / (1000 * 60 * 60 * 24));

  const getLastAccessedText = () => {
    if (daysSinceAccess === 0) return 'Today';
    if (daysSinceAccess === 1) return 'Yesterday';
    if (daysSinceAccess < 7) return `${daysSinceAccess} days ago`;
    if (daysSinceAccess < 30) return `${Math.floor(daysSinceAccess / 7)} weeks ago`;
    return `${Math.floor(daysSinceAccess / 30)} months ago`;
  };

  const handleLevelChange = (newLevel) => {
    onUpdateLevel(provider, newLevel);
    setShowLevelMenu(false);
  };

  return (
    <div className="provider-card">
      {/* Card Header with Avatar */}
      <div className="card-header">
        <div className="provider-avatar">{provider.avatar}</div>
        <div className="provider-name-header">
          <h3>{provider.name}</h3>
          <p className="provider-specialty">{provider.specialty}</p>
        </div>
        <button
          className="btn-more"
          onClick={() => setShowActions(!showActions)}
        >
          ⋮
        </button>
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Organization */}
        <div className="info-row">
          <span className="info-label">🏥 Organization</span>
          <span className="info-value">{provider.organization}</span>
        </div>

        {/* Permission Level Badge */}
        <div className="info-row">
          <span className="info-label">🔐 Permission</span>
          <span
            className="permission-badge"
            style={{ backgroundColor: details.color }}
          >
            {formatPermissionLevel(provider.permissionLevel)}
          </span>
        </div>

        {/* Last Accessed */}
        <div className="info-row">
          <span className="info-label">📅 Last Accessed</span>
          <span className="info-value">{getLastAccessedText()}</span>
        </div>

        {/* Granted Date */}
        <div className="info-row">
          <span className="info-label">📝 Access Granted</span>
          <span className="info-value">
            {new Date(provider.grantedDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Card Footer */}
      <div className="card-footer">
        {/* Permission Description */}
        <p className="permission-description">{details.description}</p>
      </div>

      {/* Action Menu */}
      {showActions && (
        <div className="action-menu">
          <button
            className="action-item"
            onClick={() => {
              setShowLevelMenu(!showLevelMenu);
            }}
          >
            <span className="action-icon">🔧</span>
            Update Permission Level
          </button>

          {showLevelMenu && (
            <div className="level-submenu">
              {['Full', 'AdherenceOnly', 'ReadOnly', 'Custom'].map((level) => (
                <button
                  key={level}
                  className={`submenu-item ${level === provider.permissionLevel ? 'active' : ''}`}
                  onClick={() => handleLevelChange(level)}
                >
                  {formatPermissionLevel(level)}
                </button>
              ))}
            </div>
          )}

          <button
            className="action-item revoke"
            onClick={() => {
              onRevoke(provider);
              setShowActions(false);
            }}
          >
            <span className="action-icon">🚫</span>
            Revoke Access
          </button>
        </div>
      )}
    </div>
  );
};

export default ProviderCard;
