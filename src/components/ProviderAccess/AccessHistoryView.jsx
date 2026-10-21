import React, { useState, useEffect } from 'react';
import { getAccessHistory } from '../../utils/accessManagement';

/**
 * AccessHistoryView Component
 * Displays access history and audit logs for provider data access
 */
const AccessHistoryView = ({ userId }) => {
  // State Management
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter State
  const [eventTypeFilter, setEventTypeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load history on mount
  useEffect(() => {
    loadHistory();
  }, [userId]);

  /**
   * Load access history
   */
  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAccessHistory(userId);
      setHistory(data);
    } catch (err) {
      setError('Failed to load access history');
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Filter history based on selected filters
   */
  const getFilteredHistory = () => {
    let filtered = history;

    if (eventTypeFilter !== 'all') {
      filtered = filtered.filter(event => event.type === eventTypeFilter);
    }

    if (startDate) {
      const start = new Date(startDate);
      filtered = filtered.filter(event => new Date(event.timestamp) >= start);
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(event => new Date(event.timestamp) <= end);
    }

    return filtered;
  };

  /**
   * Get event type icon and color
   */
  const getEventTypeInfo = (type) => {
    const info = {
      granted: { icon: '✓', label: 'Access Granted', color: '#10b981' },
      revoked: { icon: '✕', label: 'Access Revoked', color: '#ef4444' },
      updated: { icon: '⟳', label: 'Permission Updated', color: '#3b82f6' },
      accessed: { icon: '👁', label: 'Data Accessed', color: '#f59e0b' }
    };
    return info[type] || info.accessed;
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateStr = date.toDateString();
    const todayStr = today.toDateString();
    const yesterdayStr = yesterday.toDateString();

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    if (dateStr === todayStr) {
      return `Today at ${timeStr}`;
    } else if (dateStr === yesterdayStr) {
      return `Yesterday at ${timeStr}`;
    } else {
      return `${date.toLocaleDateString()} at ${timeStr}`;
    }
  };

  const filteredHistory = getFilteredHistory();

  return (
    <div className="access-history-view">
      {/* Filter Section */}
      <div className="history-filters">
        <select
          className="select-filter"
          value={eventTypeFilter}
          onChange={(e) => setEventTypeFilter(e.target.value)}
        >
          <option value="all">All Events</option>
          <option value="granted">Access Granted</option>
          <option value="revoked">Access Revoked</option>
          <option value="updated">Permission Updated</option>
          <option value="accessed">Data Accessed</option>
        </select>

        <input
          type="date"
          className="date-filter"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start Date"
        />

        <input
          type="date"
          className="date-filter"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          placeholder="End Date"
        />

        <button
          className="btn-secondary"
          onClick={() => {
            setEventTypeFilter('all');
            setStartDate('');
            setEndDate('');
          }}
        >
          Clear Filters
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading access history...</p>
        </div>
      ) : error ? (
        <div className="error-state">
          <p>{error}</p>
          <button className="btn-primary" onClick={loadHistory}>
            Try Again
          </button>
        </div>
      ) : filteredHistory.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No access history</h3>
          <p>There are no events matching your filter criteria.</p>
        </div>
      ) : (
        <div className="history-timeline">
          {filteredHistory.map((event, index) => {
            const eventInfo = getEventTypeInfo(event.type);
            return (
              <div key={event.id} className="history-event">
                <div className="event-marker">
                  <div
                    className="event-icon"
                    style={{ backgroundColor: eventInfo.color }}
                  >
                    {eventInfo.icon}
                  </div>
                  {index < filteredHistory.length - 1 && (
                    <div className="event-line"></div>
                  )}
                </div>

                <div className="event-content">
                  <div className="event-header">
                    <h4 className="event-title">
                      <span className="event-type-badge" style={{ color: eventInfo.color }}>
                        {eventInfo.label}
                      </span>
                    </h4>
                    <span className="event-time">{formatTimestamp(event.timestamp)}</span>
                  </div>

                  <div className="event-details">
                    <p className="event-description">{event.description}</p>
                    
                    {event.providerName && (
                      <div className="event-info-row">
                        <span className="event-label">Provider:</span>
                        <span className="event-value">{event.providerName}</span>
                      </div>
                    )}

                    {event.permissionLevel && (
                      <div className="event-info-row">
                        <span className="event-label">Permission Level:</span>
                        <span className="event-value">{event.permissionLevel}</span>
                      </div>
                    )}

                    {event.newLevel && (
                      <div className="event-info-row">
                        <span className="event-label">New Level:</span>
                        <span className="event-value">{event.newLevel}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Export Button */}
      {filteredHistory.length > 0 && (
        <div className="history-footer">
          <button className="btn-secondary">
            📥 Export as PDF
          </button>
        </div>
      )}
    </div>
  );
};

export default AccessHistoryView;
