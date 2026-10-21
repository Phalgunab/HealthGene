import DOMPurify from 'dompurify';

/**
 * Sanitize user input to prevent XSS attacks
 * @param {string} dirty - Unsanitized user input
 * @returns {string} Sanitized HTML-safe string
 */
export const sanitizeInput = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  const config = {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  };
  
  return DOMPurify.sanitize(dirty, config);
};

/**
 * Sanitize HTML content for display
 * @param {string} dirty - Unsanitized HTML
 * @returns {string} Sanitized HTML with safe tags
 */
export const sanitizeHTML = (dirty) => {
  if (!dirty || typeof dirty !== 'string') return '';
  
  const config = {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'li'],
    ALLOWED_ATTR: [],
  };
  
  return DOMPurify.sanitize(dirty, config);
};

/**
 * Escape text for safe display
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
export const escapeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  
  return text.replace(/[&<>"']/g, (char) => map[char]);
};

export default { sanitizeInput, sanitizeHTML, escapeText };
