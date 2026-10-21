import React, { useState, useEffect, useRef } from 'react';
import { getConversationMessages, sendMessage, markAsRead, formatMessageTime } from '@/utils/messaging';
import { logProviderAction, ACTION_TYPES } from '@/utils/auditLogging';

/**
 * MessageThread Component
 * Displays individual conversation message thread
 */
const MessageThread = ({ conversationId = null, patientName = '', providerId = 'provider-123' }) => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  // Load messages on conversation change
  useEffect(() => {
    if (conversationId) {
      loadMessages();
      markConversationAsRead();
    }
  }, [conversationId]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages
  const loadMessages = async () => {
    try {
      setLoading(true);
      const data = await getConversationMessages(conversationId);
      setMessages(data);
      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to load messages');
      console.error('Message loading error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Mark conversation as read
  const markConversationAsRead = async () => {
    try {
      await markAsRead(conversationId);
      await logProviderAction(providerId, ACTION_TYPES.MESSAGE_READ, null, {
        conversationId
      });
    } catch (err) {
      console.error('Mark as read error:', err);
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!messageInput.trim()) {
      return;
    }

    try {
      setSending(true);
      const newMessage = await sendMessage(conversationId, providerId, messageInput);
      
      // Add message to display
      setMessages([...messages, newMessage]);
      setMessageInput('');

      // Log action
      await logProviderAction(providerId, ACTION_TYPES.MESSAGE_SENT, null, {
        conversationId,
        messageLength: messageInput.length
      });

      setError(null);
    } catch (err) {
      setError(err.message || 'Failed to send message');
      console.error('Send message error:', err);
    } finally {
      setSending(false);
    }
  };

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Format message sender
  const getSenderLabel = (message) => {
    return message.sender === 'provider' ? 'You' : patientName;
  };

  // Render empty state
  if (!conversationId) {
    return (
      <div className="message-thread empty">
        <div className="empty-state">
          <p className="empty-icon">👋</p>
          <p className="empty-text">Select a conversation</p>
          <p className="empty-subtext">Choose a patient from the list to view messages</p>
        </div>
      </div>
    );
  }

  return (
    <div className="message-thread">
      {/* Thread Header */}
      <div className="thread-header">
        <div className="thread-info">
          <h2>{patientName}</h2>
          <p className="conversation-status">Active conversation</p>
        </div>
        <button className="refresh-btn" onClick={loadMessages} title="Refresh messages">
          🔄
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <span className="error-text">❌ {error}</span>
          <button onClick={loadMessages} className="retry-btn">
            Retry
          </button>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="messages-loading">
          <div className="loading-spinner"></div>
          <p>Loading messages...</p>
        </div>
      )}

      {/* Messages Container */}
      {!loading && (
        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="no-messages">
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`message-bubble ${message.sender === 'provider' ? 'sent' : 'received'}`}
              >
                {/* Sender Label */}
                <div className="message-sender">
                  {getSenderLabel(message)}
                </div>

                {/* Message Content */}
                <div className="message-content">
                  <p className="message-text">{message.text}</p>
                  <div className="message-footer">
                    <span className="message-time">
                      {formatMessageTime(new Date(message.timestamp))}
                    </span>
                    {message.sender === 'provider' && (
                      <span className="message-status">
                        {message.status === 'sent' ? '✓' : message.status === 'delivered' ? '✓✓' : '✓✓✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>
      )}

      {/* Message Input Form */}
      <form className="message-input-form" onSubmit={handleSendMessage}>
        <div className="input-wrapper">
          <input
            type="text"
            placeholder="Type your message..."
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            disabled={sending || !conversationId}
            className="message-input"
            maxLength={1000}
          />
          <div className="input-actions">
            <span className="char-count">
              {messageInput.length}/1000
            </span>
            <button
              type="submit"
              disabled={sending || !messageInput.trim()}
              className="send-btn"
              title="Send message"
            >
              {sending ? '⏳' : '📤'}
            </button>
          </div>
        </div>
      </form>

      {/* Quick Actions */}
      <div className="thread-actions">
        <button className="action-btn" title="Schedule call">
          📞 Call
        </button>
        <button className="action-btn" title="Schedule appointment">
          📅 Appointment
        </button>
        <button className="action-btn" title="Generate report">
          📄 Report
        </button>
      </div>
    </div>
  );
};

export default MessageThread;
