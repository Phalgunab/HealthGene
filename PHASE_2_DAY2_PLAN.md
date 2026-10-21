# 🎯 PHASE 2 - DAY 2: CONSENT MODAL INTEGRATION + SENTRY SETUP
## October 20, 2026 - Evening Session

**Date:** October 20, 2026 (Evening)  
**Tasks:** Consent Modal Integration + Sentry Error Monitoring  
**Duration:** 2-4 hours (evening work)  
**Status:** 🟡 IN PROGRESS  

---

## 📋 TODAY'S OBJECTIVES

### Primary (Must Complete):
1. ✅ Import ConsentModal into main.jsx
2. ✅ Add localStorage consent detection
3. ✅ Show modal on first login
4. ✅ Save consent to Firestore
5. ✅ Test consent flow end-to-end

### Secondary (Nice to Have):
- 🟡 Install Sentry dependencies
- 🟡 Create Sentry config file
- 🟡 Initialize Sentry in main.jsx

---

## 🔧 STEP 1: CONSENT MODAL INTEGRATION

### 1.1 Update main.jsx Imports

Add these imports at the top of `src/main.jsx`:

```javascript
import { ConsentModal } from './components/ConsentModal';
```

### 1.2 Add State for Consent

In the `App` component function, add:

```javascript
const [showConsentModal, setShowConsentModal] = useState(false);
const [userConsent, setUserConsent] = useState(null);
```

### 1.3 Add useEffect to Check Consent

```javascript
useEffect(() => {
  // Check if user has already accepted consent
  const saved = localStorage.getItem('consentAccepted');
  if (!saved && authenticated && currentUser) {
    setShowConsentModal(true);
  } else if (saved) {
    setUserConsent(JSON.parse(saved));
  }
}, [authenticated, currentUser]);
```

### 1.4 Add Consent Handlers

```javascript
const handleConsentAccept = async () => {
  setShowConsentModal(false);
  
  // Save consent to Firestore
  if (currentUser) {
    try {
      await setDoc(
        doc(db, 'users', currentUser.uid),
        {
          consentAccepted: true,
          consentTimestamp: new Date().toISOString(),
          consentVersion: '1.0',
        },
        { merge: true }
      );
    } catch (error) {
      console.error('Error saving consent:', error);
    }
  }
  
  setUserConsent(JSON.parse(localStorage.getItem('consentAccepted')));
};

const handleConsentDecline = () => {
  // Log decline and show message
  console.warn('User declined consent');
  setShowConsentModal(false);
  // Optional: sign out user
  // signOut(auth);
};
```

### 1.5 Add ConsentModal to JSX

In the main return statement, add this BEFORE the main app content:

```javascript
<ConsentModal
  isOpen={showConsentModal}
  onAccept={handleConsentAccept}
  onDecline={handleConsentDecline}
/>
```

---

## 🔧 STEP 2: SENTRY ERROR MONITORING SETUP

### 2.1 Install Dependencies

```bash
npm install @sentry/react @sentry/tracing
```

### 2.2 Create Sentry Config File

Create `src/utils/sentryConfig.js`:

```javascript
import * as Sentry from "@sentry/react";
import { BrowserTracing } from "@sentry/tracing";

export function initSentry() {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN || '',
    environment: import.meta.env.MODE || 'development',
    integrations: [
      new BrowserTracing(),
      new Sentry.Replay({
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}

export function captureException(error, context = {}) {
  Sentry.captureException(error, {
    contexts: {
      app: context,
    },
  });
}
```

### 2.3 Update .env.example

Add to `.env.example`:

```
# Error Monitoring
VITE_SENTRY_DSN=
```

### 2.4 Initialize Sentry in main.jsx

Add at the top of `src/main.jsx` (after imports):

```javascript
import { initSentry } from './utils/sentryConfig';

// Initialize Sentry
if (import.meta.env.MODE === 'production') {
  initSentry();
}
```

### 2.5 Create Error Boundary Component

Create `src/components/ErrorBoundary.jsx`:

```javascript
import React from 'react';
import * as Sentry from "@sentry/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    Sentry.captureException(error, { contexts: { errorInfo } });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div>
            <h1>Something went wrong</h1>
            <p>We've been notified of the error. Please try refreshing the page.</p>
            <button onClick={() => window.location.reload()}>
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default Sentry.withProfiler(ErrorBoundary);
```

### 2.6 Wrap App with Error Boundary

In `src/main.jsx`:

```javascript
import ErrorBoundary from './components/ErrorBoundary';

// In the render:
createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);
```

---

## ✅ TESTING CHECKLIST

### Consent Modal Testing:
- [ ] Modal appears on first login
- [ ] Scroll detection works (can't accept without scrolling)
- [ ] All 3 checkboxes must be checked
- [ ] Accept button saves to localStorage
- [ ] Accept button saves to Firestore
- [ ] Modal doesn't reappear on subsequent logins
- [ ] localStorage persists across page refresh

### Sentry Testing:
- [ ] Sentry initializes without errors
- [ ] DSN configured correctly (or empty in dev)
- [ ] Error boundary catches exceptions
- [ ] Console shows Sentry initialized
- [ ] Error tracking can be tested with intentional error

---

## 🎯 COMPLETION CHECKLIST

- [ ] ConsentModal imported
- [ ] Consent state added to App
- [ ] useEffect checking localStorage added
- [ ] Consent handlers implemented
- [ ] ConsentModal rendered in JSX
- [ ] Sentry dependencies installed
- [ ] Sentry config file created
- [ ] .env.example updated
- [ ] Sentry initialization added
- [ ] Error boundary component created
- [ ] Error boundary wraps App
- [ ] All testing passed
- [ ] Build verification (npm run build)
- [ ] Live testing (npm run dev)

---

## ⏱️ TIME ESTIMATE

- ConsentModal Integration: 30-45 min
- Sentry Setup: 30-45 min
- Testing & Debugging: 30-60 min
- **Total:** 1.5-2.5 hours

---

## 📝 NOTES

- Keep ConsentModal integration simple first (no Firestore)
- Test localStorage persistence thoroughly
- Sentry can be optional if DSN not provided
- Error boundary is production-ready
- Plan for Firestore schema update if needed

