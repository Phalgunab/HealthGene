import React from 'react';

/**
 * AlertNotifications
 * Displays provider notifications and alerts from patients
 */
export default function AlertNotifications({ notifications, expandedId, onToggleExpand }) {
  const criticalAlerts = notifications.filter(n => n.severity === 'high');
  const warningAlerts = notifications.filter(n => n.severity === 'medium');
  const infoAlerts = notifications.filter(n => n.severity === 'low');

  return (
    <div className="alert-notifications">
      <div className="alerts-header">
        <h2>📢 Active Alerts ({notifications.length})</h2>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <div className="alerts-section critical">
          <div className="section-title">
            🚨 Critical ({criticalAlerts.length})
          </div>
          {criticalAlerts.map(alert => (
            <div 
              key={`${alert.patientId}-${alert.id}`}
              className={`alert-item critical ${expandedId === alert.id ? 'expanded' : ''}`}
              onClick={() => onToggleExpand(expandedId === alert.id ? null : alert.id)}
            >
              <div className="alert-content">
                <div className="alert-title">
                  {alert.patientName} - {alert.message}
                </div>
                <div className="alert-meta">
                  Patient ID: {alert.patientId}
                </div>
              </div>
              <div className="alert-indicator">⚠️</div>
            </div>
          ))}
        </div>
      )}

      {/* Warning Alerts */}
      {warningAlerts.length > 0 && (
        <div className="alerts-section warning">
          <div className="section-title">
            ⚠️ Warnings ({warningAlerts.length})
          </div>
          {warningAlerts.map(alert => (
            <div 
              key={`${alert.patientId}-${alert.id}`}
              className={`alert-item warning ${expandedId === alert.id ? 'expanded' : ''}`}
              onClick={() => onToggleExpand(expandedId === alert.id ? null : alert.id)}
            >
              <div className="alert-content">
                <div className="alert-title">
                  {alert.patientName} - {alert.message}
                </div>
                <div className="alert-meta">
                  Patient ID: {alert.patientId}
                </div>
              </div>
              <div className="alert-indicator">!</div>
            </div>
          ))}
        </div>
      )}

      {/* Info Alerts */}
      {infoAlerts.length > 0 && (
        <div className="alerts-section info">
          <div className="section-title">
            ℹ️ Information ({infoAlerts.length})
          </div>
          {infoAlerts.map(alert => (
            <div 
              key={`${alert.patientId}-${alert.id}`}
              className={`alert-item info ${expandedId === alert.id ? 'expanded' : ''}`}
              onClick={() => onToggleExpand(expandedId === alert.id ? null : alert.id)}
            >
              <div className="alert-content">
                <div className="alert-title">
                  {alert.patientName} - {alert.message}
                </div>
                <div className="alert-meta">
                  Patient ID: {alert.patientId}
                </div>
              </div>
              <div className="alert-indicator">i</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
