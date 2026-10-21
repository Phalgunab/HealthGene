import React, { useState } from 'react';
import { logProviderAction } from '../../utils/providerDashboard';

/**
 * QuickActionsBar
 * Provider action buttons for patient interactions
 */
export default function QuickActionsBar({ patientId, patientName }) {
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState(null);

  /**
   * Handle action click
   */
  async function handleAction(actionType) {
    try {
      setActionLoading(true);
      
      await logProviderAction('provider-123', patientId, actionType, {
        patientName: patientName
      });

      setActionMessage(`${actionType.replace('_', ' ')} initiated for ${patientName}`);
      setShowActionMenu(false);

      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Action error:', err);
    } finally {
      setActionLoading(false);
    }
  }

  return (
    <div className="quick-actions-bar">
      <div className="actions-menu">
        <button
          className="action-btn message-btn"
          onClick={() => handleAction('send_message')}
          title="Send message to patient"
        >
          💬 Message
        </button>
        <button
          className="action-btn call-btn"
          onClick={() => handleAction('schedule_call')}
          title="Schedule video call"
        >
          📞 Call
        </button>
        <button
          className="action-btn report-btn"
          onClick={() => handleAction('generate_report')}
          title="Generate patient report"
        >
          📄 Report
        </button>
        <button
          className="action-btn appointment-btn"
          onClick={() => handleAction('schedule_appointment')}
          title="Schedule appointment"
        >
          📅 Appointment
        </button>
      </div>

      {actionMessage && (
        <div className="action-feedback">
          ✓ {actionMessage}
        </div>
      )}
    </div>
  );
}
