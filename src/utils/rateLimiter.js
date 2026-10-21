/**
 * Simple rate limiter using token bucket algorithm
 * Prevents excessive Firestore requests
 */
class RateLimiter {
  constructor(maxRequests = 10, windowMs = 60000) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    this.requests = [];
  }

  /**
   * Check if request is allowed
   * @returns {boolean} True if request is within limits
   */
  isAllowed() {
    const now = Date.now();
    
    // Remove old requests outside the window
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
    
    // Check if within limit
    if (this.requests.length < this.maxRequests) {
      this.requests.push(now);
      return true;
    }
    
    return false;
  }

  /**
   * Get remaining requests in current window
   * @returns {number} Number of allowed requests remaining
   */
  getRemaining() {
    const now = Date.now();
    this.requests = this.requests.filter((timestamp) => now - timestamp < this.windowMs);
    return Math.max(0, this.maxRequests - this.requests.length);
  }

  /**
   * Reset limiter
   */
  reset() {
    this.requests = [];
  }
}

// Create global limiters for different operations
export const firestoreLimiter = new RateLimiter(30, 60000); // 30 requests per minute
export const uploadLimiter = new RateLimiter(10, 60000);    // 10 uploads per minute
export const authLimiter = new RateLimiter(5, 300000);       // 5 auth attempts per 5 minutes

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Throttled function
 */
export const throttle = (func, delay) => {
  let lastCall = 0;
  
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      return func(...args);
    }
  };
};

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} delay - Delay in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, delay) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export default {
  RateLimiter,
  firestoreLimiter,
  uploadLimiter,
  authLimiter,
  throttle,
  debounce,
};
