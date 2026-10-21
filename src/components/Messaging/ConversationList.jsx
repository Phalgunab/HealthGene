import React, { useState, useEffect } from 'react';
import { getConversations, searchConversations, getUnreadCount, formatMessageTime } from '@/utils/messaging';

/**
 * ConversationList Component
 * Displays list of provider-patient conversations
 */
const ConversationList = ({ providerId = 'provider-123', onSelectConversation = null }) => {
  const [conversations, setConversations] = useState([]);
  const [filteredConversations, setFilteredConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [sortBy, setSortBy] = useState('recent'); // recent, name, unread

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  // Update filtered conversations when search changes
  useEffect(() => {
    applyFilters();
  }, [conversations, searchTerm, sortBy]);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoading(true);
      const data = await getConversations(providerId);
      setConversations(data);
      
      const unread = await getUnreadCount(providerId);
      setUnreadCount(unread);
      
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load conversations');
      console.error('Conversation loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply search and sort filters
  const applyFilters = async () => {
    let results = [...conversations];

    // Apply search
    if (searchTerm.trim()) {
      try {
        results = await searchConversations(providerId, searchTerm);
      } catch (err) {
        console.error('Search error:', err);
        results = conversations.filter(conv =>
          conv.patientName.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
    }

    // Apply sorting
    results.sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
      } else if (sortBy === 'name') {
        return a.patientName.localeCompare(b.patientName);
      } else if (sortBy === 'unread') {
        return b.unreadCount - a.unreadCount;
      }
      return 0;
    });

    setFilteredConversations(results);
  };

  // Handle conversation selection
  const handleSelectConversation = (conversation) => {
    setSelectedConvId(conversation.id);
    if (onSelectConversation) {
      onSelectConversation(conversation);
    }
  };

  // Render unread badge
  const renderUnreadBadge = (count) => {
    if (count === 0) return null;
    return <span className="unread-badge">{count > 99 ? '99+' : count}</span>;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="conversation-list loading">
        <div className="loading-spinner"></div>
        <p>Loading conversations...</p>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="conversation-list error">
        <div className="error-message">
          <p>❌ {error}</p>
          <button onClick={loadConversations} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render empty state
  if (filteredConversations.length === 0 && !searchTerm) {
    return (
      <div className="conversation-list empty">
        <div className="empty-state">
          <p className="empty-icon">💬</p>
          <p className="empty-text">No conversations yet</p>
          <p className="empty-subtext">Start a conversation with a patient</p>
        </div>
      </div>
    );
  }

  // Render no results
  if (filteredConversations.length === 0) {
    return (
      <div className="conversation-list empty">
        <div className="search-controls">
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="empty-state">
          <p className="empty-text">No conversations found</p>
          <p className="empty-subtext">Try a different search term</p>
        </div>
      </div>
    );
  }

  return (
    <div className="conversation-list">
      {/* Header */}
      <div className="conversation-header">
        <h2>Messages {unreadCount > 0 && renderUnreadBadge(unreadCount)}</h2>
      </div>

      {/* Search and Filter Controls */}
      <div className="search-controls">
        <input
          type="text"
          placeholder="Search conversations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="recent">Most Recent</option>
          <option value="name">Patient Name</option>
          <option value="unread">Unread First</option>
        </select>
      </div>

      {/* Conversation Items */}
      <div className="conversation-items">
        {filteredConversations.map((conversation) => (
          <div
            key={conversation.id}
            className={`conversation-item ${selectedConvId === conversation.id ? 'active' : ''} ${
              conversation.unreadCount > 0 ? 'unread' : ''
            }`}
            onClick={() => handleSelectConversation(conversation)}
          >
            {/* Patient Avatar */}
            <div className="patient-avatar">
              {conversation.patientName.split(' ').map((n) => n[0]).join('')}
            </div>

            {/* Conversation Details */}
            <div className="conversation-details">
              {/* Patient Name and Time */}
              <div className="conversation-header-row">
                <span className="patient-name">{conversation.patientName}</span>
                <span className="message-time">
                  {formatMessageTime(new Date(conversation.lastMessageTime))}
                </span>
              </div>

              {/* Last Message Preview */}
              <div className="last-message">
                <span className="message-preview">
                  {conversation.lastMessage.length > 50
                    ? conversation.lastMessage.substring(0, 50) + '...'
                    : conversation.lastMessage}
                </span>
                {conversation.unreadCount > 0 && (
                  <span className="unread-indicator">{conversation.unreadCount}</span>
                )}
              </div>

              {/* Message Count */}
              <div className="message-count">
                {conversation.messageCount} messages
              </div>
            </div>

            {/* Unread Badge */}
            {conversation.unreadCount > 0 && (
              <div className="conversation-unread-badge">
                {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="conversation-footer">
        <span className="total-conversations">
          {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
        </span>
      </div>
    </div>
  );
};

export default ConversationList;
