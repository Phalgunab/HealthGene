import React from 'react';
import { getPermissionLevelDetails, getAccessDataTypes } from '../../utils/accessManagement';

/**
 * PermissionLevelSelector Component
 * Reusable component for selecting and displaying permission levels
 */
const PermissionLevelSelector = ({
  selectedLevel,
  onLevelChange,
  onCustomPermissionChange,
  customPermissions = []
}) => {
  const permissionLevels = ['Full', 'AdherenceOnly', 'ReadOnly', 'Custom'];
  const allDataTypes = ['medications', 'adherence', 'adherence_trends', 'barriers', 'interventions', 'lab_results', 'medical_history'];

  const dataTypeLabels = {
    medications: '💊 Medications',
    adherence: '📊 Adherence Metrics',
    adherence_trends: '📈 Adherence Trends',
    barriers: '🚧 Identified Barriers',
    interventions: '💡 Recommended Interventions',
    lab_results: '🧪 Lab Results',
    medical_history: '📋 Medical History'
  };

  return (
    <div className="permission-level-selector">
      {/* Permission Level Buttons */}
      <div className="level-buttons">
        {permissionLevels.map((level) => {
          const details = getPermissionLevelDetails(level);
          return (
            <div key={level} className="level-option">
              <input
                type="radio"
                id={`level-${level}`}
                name="permission-level"
                value={level}
                checked={selectedLevel === level}
                onChange={(e) => onLevelChange(e.target.value)}
              />
              <label htmlFor={`level-${level}`} className="level-button">
                <div className="level-header">
                  <span className="level-icon">
                    {level === 'Full' && '👁️'}
                    {level === 'AdherenceOnly' && '📊'}
                    {level === 'ReadOnly' && '🔒'}
                    {level === 'Custom' && '⚙️'}
                  </span>
                  <span className="level-name">{details.label}</span>
                </div>
                <div className="level-description">{details.description}</div>
              </label>
            </div>
          );
        })}
      </div>

      {/* Custom Permissions Selector */}
      {selectedLevel === 'Custom' && (
        <div className="custom-permissions-section">
          <label className="custom-label">Select Data Types to Share</label>
          <p className="custom-help">Choose which data types this provider can access</p>
          
          <div className="data-types-grid">
            {allDataTypes.map((dataType) => (
              <div key={dataType} className="data-type-checkbox">
                <input
                  type="checkbox"
                  id={`data-type-${dataType}`}
                  checked={customPermissions.includes(dataType)}
                  onChange={() => onCustomPermissionChange(dataType)}
                />
                <label htmlFor={`data-type-${dataType}`}>
                  {dataTypeLabels[dataType]}
                </label>
              </div>
            ))}
          </div>

          {customPermissions.length > 0 && (
            <div className="selected-types">
              <p className="selected-label">Selected: {customPermissions.length} data type(s)</p>
              <div className="selected-tags">
                {customPermissions.map((type) => (
                  <span key={type} className="selected-tag">
                    {dataTypeLabels[type].split(' ')[0]}
                    <button
                      type="button"
                      className="tag-remove"
                      onClick={() => onCustomPermissionChange(type)}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PermissionLevelSelector;
