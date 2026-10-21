/**
 * Messaging Utility Functions
 * Handles provider-patient conversations, message management, and real-time updates
 */

// Mock conversation data with realistic message histories
const MOCK_CONVERSATIONS = [
  {
    id: 'conv-001',
    patientId: 'PA-001',
    patientName: 'Michael Chen',
    lastMessage: 'Thanks for checking on me. Doing better today.',
    lastMessageTime: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    unreadCount: 0,
    messages: [
      { id: 'msg-1', sender: 'provider', text: 'How are you feeling today?', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { id: 'msg-2', sender: 'patient', text: 'A bit tired, but taking my medication regularly', timestamp: new Date(Date.now() - 2.5 * 60 * 60 * 1000) },
      { id: 'msg-3', sender: 'provider', text: 'That is good to hear. Keep it up!', timestamp: new Date(Date.now() - 2.1 * 60 * 60 * 1000) },
      { id: 'msg-4', sender: 'patient', text: 'Thanks for checking on me. Doing better today.', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ]
  },
  {
    id: 'conv-002',
    patientId: 'PA-002',
    patientName: 'John Anderson',
    lastMessage: 'Sure, I can do that. See you tomorrow at 2 PM.',
    lastMessageTime: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
    unreadCount: 1,
    messages: [
      { id: 'msg-5', sender: 'provider', text: 'Can you schedule an appointment tomorrow?', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
      { id: 'msg-6', sender: 'patient', text: 'Sure, I can do that. See you tomorrow at 2 PM.', timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) },
    ]
  },
  {
    id: 'conv-003',
    patientId: 'PA-003',
    patientName: 'Sarah Mitchell',
    lastMessage: 'Everything looks good. Your labs are normal.',
    lastMessageTime: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    unreadCount: 0,
    messages: [
      { id: 'msg-7', sender: 'patient', text: 'When will my lab results be ready?', timestamp: new Date(Date.now() - 1.5 * 24 * 60 * 60 * 1000) },
      { id: 'msg-8', sender: 'provider', text: 'They should be ready by tomorrow.', timestamp: new Date(Date.now() - 1.2 * 24 * 60 * 60 * 1000) },
      { id: 'msg-9', sender: 'provider', text: 'Everything looks good. Your labs are normal.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
    ]
  },
  {
    id: 'conv-004',
    patientId: 'PA-004',
    patientName: 'Emma Rodriguez',
    lastMessage: 'Thanks for the advice!',
    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    unreadCount: 0,
    messages: [
      { id: 'msg-10', sender: 'provider', text: 'How is your GERD been?', timestamp: new Date(Date.now() - 3.5 * 24 * 60 * 60 * 1000) },
      { id: 'msg-11', sender: 'patient', text: 'Much better since I changed my diet.', timestamp: new Date(Date.now() - 3.2 * 24 * 60 * 60 * 1000) },
      { id: 'msg-12', sender: 'provider', text: 'That is excellent! Keep it up!', timestamp: new Date(Date.now() - 3.1 * 24 * 60 * 60 * 1000) },
      { id: 'msg-13', sender: 'patient', text: 'Thanks for the advice!', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
    ]
  },
  {
    id: 'conv-005',
    patientId: 'PA-005',
    patientName: 'James Thompson',
    lastMessage: 'I will take them as prescribed.',
    lastMessageTime: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    unreadCount: 2,
    messages: [
      { id: 'msg-14', sender: 'provider', text: 'Important: Please take your medications exactly as prescribed.', timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { id: 'msg-15', sender: 'patient', text: 'I will take them as prescribed.', timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) },
    ]
  },
  {
    id: 'conv-006',
    patientId: 'PA-006',
    patientName: 'Lisa Wang',
    lastMessage: 'Yes, I will attend the appointment.',
    lastMessageTime: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
    unreadCount: 0,
    messages: [
      { id: 'msg-16', sender: 'provider', text: 'Remember your appointment is tomorrow at 10 AM.', timestamp: new Date(Date.now() - 8.5 * 60 * 60 * 1000) },
      { id: 'msg-17', sender: 'patient', text: 'Yes, I will attend the appointment.', timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000) },
    ]
  }
];

// Simulate network delay
const delay = () => new Promise(resolve => setTimeout(resolve, Math.random() * 600 + 600));

/**
 * Get all conversations for a provider
 * @param {string} providerId - Provider ID
 * @returns {Promise<Array>} List of conversations
 */
export async function getConversations(providerId) {
  await delay();
  if (!providerId) throw new Error('Provider ID required');
  
  return MOCK_CONVERSATIONS.map(conv => ({
    id: conv.id,
    patientId: conv.patientId,
    patientName: conv.patientName,
    lastMessage: conv.lastMessage,
    lastMessageTime: conv.lastMessageTime,
    unreadCount: conv.unreadCount,
    messageCount: conv.messages.length
  }));
}

/**
 * Get messages from a specific conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Array>} List of messages
 */
export async function getConversationMessages(conversationId) {
  await delay();
  if (!conversationId) throw new Error('Conversation ID required');
  
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation) throw new Error('Conversation not found');
  
  return conversation.messages.map(msg => ({
    id: msg.id,
    conversationId,
    sender: msg.sender,
    text: msg.text,
    timestamp: msg.timestamp,
    status: 'delivered',
    read: msg.sender === 'provider' ? true : Math.random() > 0.3
  }));
}

/**
 * Send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @param {string} providerId - Provider ID
 * @param {string} messageText - Message text
 * @returns {Promise<Object>} Sent message
 */
export async function sendMessage(conversationId, providerId, messageText) {
  await delay();
  if (!conversationId || !providerId || !messageText) {
    throw new Error('Conversation ID, Provider ID, and message text required');
  }
  
  if (messageText.trim().length === 0) {
    throw new Error('Message cannot be empty');
  }

  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation) throw new Error('Conversation not found');

  const newMessage = {
    id: `msg-${Date.now()}`,
    sender: 'provider',
    text: messageText,
    timestamp: new Date(),
    status: 'sent'
  };

  conversation.messages.push(newMessage);
  conversation.lastMessage = messageText;
  conversation.lastMessageTime = new Date();

  return {
    id: newMessage.id,
    conversationId,
    sender: 'provider',
    text: messageText,
    timestamp: newMessage.timestamp,
    status: 'sent'
  };
}

/**
 * Mark conversation as read
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Updated conversation
 */
export async function markAsRead(conversationId) {
  await delay();
  if (!conversationId) throw new Error('Conversation ID required');
  
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation) throw new Error('Conversation not found');

  conversation.unreadCount = 0;
  
  return {
    conversationId,
    unreadCount: 0,
    success: true
  };
}

/**
 * Search conversations
 * @param {string} providerId - Provider ID
 * @param {string} searchTerm - Search term (patient name or message content)
 * @returns {Promise<Array>} Matching conversations
 */
export async function searchConversations(providerId, searchTerm) {
  await delay();
  if (!providerId || !searchTerm) throw new Error('Provider ID and search term required');
  
  const term = searchTerm.toLowerCase();
  
  return MOCK_CONVERSATIONS
    .filter(conv => 
      conv.patientName.toLowerCase().includes(term) ||
      conv.messages.some(msg => msg.text.toLowerCase().includes(term))
    )
    .map(conv => ({
      id: conv.id,
      patientId: conv.patientId,
      patientName: conv.patientName,
      lastMessage: conv.lastMessage,
      lastMessageTime: conv.lastMessageTime,
      unreadCount: conv.unreadCount,
      messageCount: conv.messages.length
    }));
}

/**
 * Get the last message in a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Last message
 */
export async function getLastMessage(conversationId) {
  await delay();
  if (!conversationId) throw new Error('Conversation ID required');
  
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation) throw new Error('Conversation not found');
  
  const lastMsg = conversation.messages[conversation.messages.length - 1];
  return {
    id: lastMsg.id,
    sender: lastMsg.sender,
    text: lastMsg.text,
    timestamp: lastMsg.timestamp,
    status: 'delivered'
  };
}

/**
 * Get total unread message count
 * @param {string} providerId - Provider ID
 * @returns {Promise<number>} Total unread count
 */
export async function getUnreadCount(providerId) {
  await delay();
  if (!providerId) throw new Error('Provider ID required');
  
  const totalUnread = MOCK_CONVERSATIONS.reduce((sum, conv) => sum + conv.unreadCount, 0);
  return totalUnread;
}

/**
 * Delete a message
 * @param {string} conversationId - Conversation ID
 * @param {string} messageId - Message ID
 * @returns {Promise<Object>} Delete result
 */
export async function deleteMessage(conversationId, messageId) {
  await delay();
  if (!conversationId || !messageId) throw new Error('Conversation ID and Message ID required');
  
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation) throw new Error('Conversation not found');
  
  const messageIndex = conversation.messages.findIndex(m => m.id === messageId);
  if (messageIndex === -1) throw new Error('Message not found');
  
  conversation.messages.splice(messageIndex, 1);
  
  return {
    conversationId,
    messageId,
    success: true
  };
}

/**
 * Get conversation metrics
 * @param {string} providerId - Provider ID
 * @returns {Promise<Object>} Conversation statistics
 */
export async function getConversationMetrics(providerId) {
  await delay();
  if (!providerId) throw new Error('Provider ID required');
  
  const totalConversations = MOCK_CONVERSATIONS.length;
  const totalMessages = MOCK_CONVERSATIONS.reduce((sum, conv) => sum + conv.messages.length, 0);
  const totalUnread = MOCK_CONVERSATIONS.reduce((sum, conv) => sum + conv.unreadCount, 0);
  
  return {
    totalConversations,
    totalMessages,
    totalUnread,
    providerId
  };
}

/**
 * Get conversation with full details
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>} Full conversation object
 */
export async function getConversationDetail(conversationId) {
  await delay();
  if (!conversationId) throw new Error('Conversation ID required');
  
  const conversation = MOCK_CONVERSATIONS.find(c => c.id === conversationId);
  if (!conversation) throw new Error('Conversation not found');
  
  return {
    id: conversation.id,
    patientId: conversation.patientId,
    patientName: conversation.patientName,
    lastMessage: conversation.lastMessage,
    lastMessageTime: conversation.lastMessageTime,
    unreadCount: conversation.unreadCount,
    messageCount: conversation.messages.length,
    createdDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    messages: conversation.messages
  };
}

/**
 * Format message timestamp
 * @param {Date} timestamp - Message timestamp
 * @returns {string} Formatted timestamp
 */
export function formatMessageTime(timestamp) {
  const now = new Date();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  
  return timestamp.toLocaleDateString();
}

/**
 * Format message for display
 * @param {Object} message - Message object
 * @returns {Object} Formatted message
 */
export function formatMessage(message) {
  return {
    ...message,
    formattedTime: formatMessageTime(message.timestamp),
    isProvider: message.sender === 'provider',
    displayText: message.text
  };
}
