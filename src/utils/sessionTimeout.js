/**
 * Session timeout manager
 * Logs out user after 15 minutes of inactivity
 * Shows warning at 14 minutes
 */
export class SessionTimeoutManager {
  constructor(timeoutMs = 15 * 60 * 1000, warningMs = 14 * 60 * 1000) {
    this.timeoutMs = timeoutMs;      // 15 minutes
    this.warningMs = warningMs;      // 14 minutes (1 minute before logout)
    this.timeoutId = null;
    this.warningId = null;
    this.onWarning = null;
    this.onTimeout = null;
  }

  /**
   * Start timeout tracking
   * Sets up both warning and logout timers
   */
  start() {
    // Clear existing timers first
    if (this.warningId) clearTimeout(this.warningId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    
    // Set warning timer (14 minutes)
    this.warningId = setTimeout(() => {
      if (this.onWarning) {
        this.onWarning();
      }
    }, this.warningMs);

    // Set logout timer (15 minutes)
    this.timeoutId = setTimeout(() => {
      if (this.onTimeout) {
        this.onTimeout();
      }
    }, this.timeoutMs);
  }

  /**
   * Reset timeout (called on user activity)
   * Clears old timers and starts fresh
   */
  reset() {
    if (this.warningId) clearTimeout(this.warningId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    
    // Set warning timer (14 minutes)
    this.warningId = setTimeout(() => {
      if (this.onWarning) {
        this.onWarning();
      }
    }, this.warningMs);

    // Set logout timer (15 minutes)
    this.timeoutId = setTimeout(() => {
      if (this.onTimeout) {
        this.onTimeout();
      }
    }, this.timeoutMs);
  }

  /**
   * Stop timeout tracking
   * Cleans up all timers
   */
  stop() {
    if (this.warningId) clearTimeout(this.warningId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.warningId = null;
    this.timeoutId = null;
  }

  /**
   * Get time remaining (in seconds)
   * @returns {number} Seconds until logout
   */
  getTimeRemaining() {
    return Math.ceil(this.timeoutMs / 1000);
  }
}

export default SessionTimeoutManager;
