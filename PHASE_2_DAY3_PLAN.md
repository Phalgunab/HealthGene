# 🎯 PHASE 2 - DAY 3: RATE LIMITING + SESSION TIMEOUT
## October 20, 2026 - Evening Session

**Date:** October 20, 2026 (Evening)  
**Tasks:** Rate Limiting Integration + Session Timeout Implementation  
**Duration:** 2-3 hours (evening work)  
**Status:** 🟡 IN PROGRESS  

---

## 📋 TODAY'S OBJECTIVES

### Primary (Must Complete):
1. ✅ Integrate rate limiting into Firestore operations
2. ✅ Add rate limiting checks to create/update/delete operations
3. ✅ Implement session timeout (15 min idle)
4. ✅ Add timeout warning at 14 minutes
5. ✅ Show auto-logout countdown
6. ✅ Reset timer on user interaction
7. ✅ Test all functionality end-to-end

### Secondary (Nice to Have):
- 🟡 Add rate limit error UI messages
- 🟡 Create session timeout warning modal

---

## 🔧 STEP 1: RATE LIMITING INTEGRATION

### 1.1 Review Existing rateLimiter.js
Located at: `src/utils/rateLimiter.js`

Available:
- `firestoreLimiter`: 30 requests/min
- `uploadLimiter`: 10 uploads/min
- `authLimiter`: 5 auth attempts/5min
- `throttle()` and `debounce()` helpers

### 1.2 Integrate into Firestore Operations

Update all `addDoc()`, `setDoc()`, `deleteDoc()`, `updateDoc()` calls:

```javascript
import { firestoreLimiter } from './utils/rateLimiter';

// Before saving a record
if (!firestoreLimiter.isAllowed()) {
  setAuthError('Too many requests. Please wait a moment.');
  return;
}

// Proceed with Firestore operation
await addDoc(collection(userRef, 'records'), recordData);
```

### 1.3 Rate Limit Locations in src/main.jsx

Search for and add rate limiting to:
1. Line ~600: `addRecord()` - saving health records
2. Line ~400: `addFamilyMember()` - adding family members
3. Line ~500: `updateFamilyMember()` - updating family members
4. Line ~550: `deleteFamilyMember()` - deleting family members
5. Line ~200: `handleConsentAccept()` - saving consent

### 1.4 Error Handling

When rate limit exceeded:
```javascript
if (!firestoreLimiter.isAllowed()) {
  const remaining = firestoreLimiter.getRemaining();
  const message = remaining === 0 
    ? 'Rate limit reached. Please wait 60 seconds.'
    : 'Too many requests. Please try again shortly.';
  
  setAuthError(message);
  return;
}
```

---

## 🔧 STEP 2: SESSION TIMEOUT IMPLEMENTATION

### 2.1 Create Session Timeout Utility

Create `src/utils/sessionTimeout.js`:

```javascript
/**
 * Session timeout manager
 * Logs out user after 15 minutes of inactivity
 */
export class SessionTimeoutManager {
  constructor(timeoutMs = 15 * 60 * 1000, warningMs = 14 * 60 * 1000) {
    this.timeoutMs = timeoutMs;      // 15 minutes
    this.warningMs = warningMs;      // 14 minutes
    this.timeoutId = null;
    this.warningId = null;
    this.onWarning = null;
    this.onTimeout = null;
  }

  /**
   * Start timeout tracking
   */
  start() {
    this.reset(); // Clear existing timers
    
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
   */
  reset() {
    if (this.warningId) clearTimeout(this.warningId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.start();
  }

  /**
   * Stop timeout tracking
   */
  stop() {
    if (this.warningId) clearTimeout(this.warningId);
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.warningId = null;
    this.timeoutId = null;
  }

  /**
   * Get time remaining (in seconds)
   */
  getTimeRemaining() {
    return Math.ceil(this.timeoutMs / 1000);
  }
}

export default SessionTimeoutManager;
```

### 2.2 Add to App Component

In `src/main.jsx`:

```javascript
import SessionTimeoutManager from './utils/sessionTimeout';

// Inside App component, after other state declarations:
const sessionTimeout = useRef(null);
const [showTimeoutWarning, setShowTimeoutWarning] = useState(false);
const [timeoutCountdown, setTimeoutCountdown] = useState(900); // 15 minutes in seconds

// Initialize session timeout on auth
useEffect(() => {
  if (authenticated && currentUser) {
    sessionTimeout.current = new SessionTimeoutManager();
    
    // On warning (14 minutes)
    sessionTimeout.current.onWarning = () => {
      setShowTimeoutWarning(true);
      // Start countdown from 60 seconds
      let countdown = 60;
      const interval = setInterval(() => {
        setTimeoutCountdown(countdown);
        countdown--;
        if (countdown < 0) clearInterval(interval);
      }, 1000);
    };

    // On timeout (15 minutes)
    sessionTimeout.current.onTimeout = () => {
      setShowTimeoutWarning(false);
      signOut(auth);
      setAuthenticated(false);
      setAuthError('Your session has expired. Please log in again.');
    };

    sessionTimeout.current.start();

    return () => {
      if (sessionTimeout.current) {
        sessionTimeout.current.stop();
      }
    };
  }
}, [authenticated, currentUser]);

// Reset timer on user activity
useEffect(() => {
  if (!authenticated || !sessionTimeout.current) return;

  const events = ['mousedown', 'keydown', 'scroll', 'touchstart', 'click'];
  
  const handleActivity = () => {
    if (sessionTimeout.current && !showTimeoutWarning) {
      sessionTimeout.current.reset();
    }
  };

  events.forEach(event => {
    document.addEventListener(event, handleActivity, true);
  });

  return () => {
    events.forEach(event => {
      document.removeEventListener(event, handleActivity, true);
    });
  };
}, [authenticated, showTimeoutWarning]);
```

### 2.3 Session Timeout Warning Modal

Create `src/components/SessionTimeoutWarning.jsx`:

```javascript
import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const SessionTimeoutWarning = ({ isOpen, countdown, onContinue, onLogout }) => {
  if (!isOpen) return null;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="consent-modal-overlay">
      <div className="consent-modal" style={{ maxWidth: '400px' }}>
        <div className="consent-modal-header">
          <div className="consent-header-title">
            <AlertTriangle size={24} style={{ color: '#ff6b6b' }} />
            <h2>Session Expiring</h2>
          </div>
        </div>

        <div className="consent-text">
          <p>Your session will expire in <strong>{minutes}:{seconds.toString().padStart(2, '0')}</strong> due to inactivity.</p>
          <p>Click "Continue" to stay logged in or "Log Out" to exit safely.</p>
        </div>

        <div className="consent-actions" style={{ gap: '10px' }}>
          <button 
            className="sheet-secondary" 
            onClick={onLogout}
            style={{ flex: 1 }}
          >
            Log Out
          </button>
          <button 
            className="auth-primary" 
            onClick={onContinue}
            style={{ flex: 1 }}
          >
            Continue Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
```

### 2.4 Add Warning Modal to App

In `src/main.jsx` JSX return:

```javascript
<SessionTimeoutWarning
  isOpen={showTimeoutWarning}
  countdown={timeoutCountdown}
  onContinue={() => {
    setShowTimeoutWarning(false);
    if (sessionTimeout.current) {
      sessionTimeout.current.reset();
    }
  }}
  onLogout={() => {
    signOut(auth);
    setShowTimeoutWarning(false);
  }}
/>
```

---

## ✅ TESTING CHECKLIST

### Rate Limiting Testing:
- [ ] Create multiple records rapidly
- [ ] Verify rate limit message appears
- [ ] Check message says "Too many requests"
- [ ] Wait 60 seconds and create again
- [ ] Verify can create after waiting
- [ ] Test with add/update/delete operations

### Session Timeout Testing:
- [ ] Log in and wait 14 minutes
- [ ] Warning modal appears at 14 min
- [ ] Countdown timer displays correctly
- [ ] Click "Continue" resets timer
- [ ] Move mouse → timer resets
- [ ] Type → timer resets
- [ ] Scroll → timer resets
- [ ] Click "Log Out" logs out user
- [ ] Inactivity continues → logs out at 15 min

---

## 🎯 COMPLETION CHECKLIST

- [ ] rateLimiter.js reviewed
- [ ] Rate limiting imported in main.jsx
- [ ] Rate limiting added to addRecord()
- [ ] Rate limiting added to addFamilyMember()
- [ ] Rate limiting added to updateFamilyMember()
- [ ] Rate limiting added to deleteFamilyMember()
- [ ] Rate limiting error messages added
- [ ] SessionTimeoutManager created
- [ ] Session timeout initialized on auth
- [ ] Activity listener added (mouse, keyboard, scroll)
- [ ] Timer reset on activity
- [ ] SessionTimeoutWarning component created
- [ ] Warning modal integrated in App
- [ ] All testing passed
- [ ] Build verification (npm run build)
- [ ] Live testing (npm run dev)

---

## ⏱️ TIME ESTIMATE

- Rate Limiting Integration: 45-60 min
- Session Timeout Implementation: 60-75 min
- Testing & Debugging: 30-60 min
- **Total:** 2-3 hours

---

## 📝 NOTES

- Rate limiter already exists from Phase 1
- Session timeout critical for security
- Activity tracking must be efficient (event delegation)
- Warning modal gives users time to respond
- Continue button resets the timer
- Auto-logout is hard stop (no recovery)

