# 🚀 PHASE 2: COMPLIANCE & PRIVACY IMPLEMENTATION
## Smart Prioritization & Development Plan

**Phase Start Date:** October 20, 2026  
**Estimated Duration:** 2 weeks  
**Estimated Effort:** 80-120 hours  
**Status:** READY TO START ✅

---

## 📊 PHASE 2 PRIORITIES (Ranked by Impact & Dependencies)

### TIER 1: Critical Path Items (Start Now)
These must be done first; they block other work.

| Priority | Task | Duration | Impact | Status |
|----------|------|----------|--------|--------|
| 🔴 1 | Integrate XSS Protection into Components | 1 day | HIGH | 🟡 READY |
| 🔴 2 | Implement Consent Management UI | 1-2 days | HIGH | 🟡 READY |
| 🔴 3 | Set Up Sentry (Error Monitoring) | 1-2 days | HIGH | 🟡 READY |
| 🔴 4 | Integrate Rate Limiting | 1 day | MEDIUM | 🟡 READY |
| 🔴 5 | Add Session Timeout (15 min idle) | 1-2 days | HIGH | 🟡 READY |

**Tier 1 Total:** 5-8 days (40-64 hours)

---

### TIER 2: Compliance Items (After Tier 1)
These require external resources but can progress in parallel.

| Priority | Task | Duration | Impact | Status | Dependencies |
|----------|------|----------|--------|--------|--------------|
| 🟠 6 | Biometric Authentication (WebAuthn) | 2-3 days | HIGH | 🟡 READY | Tier 1 complete |
| 🟠 7 | End-to-End Encryption (TweetNaCl.js) | 3-4 days | CRITICAL | 🟡 READY | Tier 1 complete |
| 🟠 8 | Data Export Functionality | 1-2 days | MEDIUM | 🟡 READY | Tier 1 complete |
| 🟠 9 | Account Deletion (30-day grace) | 1-2 days | HIGH | 🟡 READY | Tier 1 complete |

**Tier 2 Total:** 8-12 days (64-96 hours)

---

### TIER 3: Legal/Parallel Track (Can start immediately)
Do NOT block development; run in parallel with Tier 1.

| Priority | Task | Duration | Status | Action |
|----------|------|----------|--------|--------|
| 🟡 10 | Hire Healthcare Privacy Attorney | 1-3 days | 🔴 BLOCKED | Contact 3+ attorneys |
| 🟡 11 | Submit Privacy Policy for Review | 2-5 min | 🟡 READY | Email draft to attorney |
| 🟡 12 | Submit Terms of Service for Review | 2-5 min | 🟡 READY | Email draft to attorney |
| 🟡 13 | HIPAA Compliance Assessment | 1-2 weeks | 🔴 PENDING REVIEW | Attorney task |
| 🟡 14 | Publish Legal Documents | 1 day | 🔴 BLOCKED | After attorney approval |

**Tier 3 Timeline:** 1-2 weeks (attorney review running in parallel)

---

## 🎯 PHASE 2 EXECUTION PLAN

### Week 1: Core Security & UX

**Day 1: XSS Protection Integration**
```
- Integrate sanitizeInput() into all user input fields
- Integrate sanitizeHTML() into all user output displays
- Test XSS vectors (e.g., <script>, onclick=)
- Verify existing functionality unaffected
Time: 6-8 hours
Files: src/main.jsx (update all input/output)
```

**Day 2: Consent Management UI**
```
- Create ConsentModal component
- Add Privacy Policy link/modal
- Add Terms of Service link/modal
- Add HIPAA Disclosure checkbox (if US-based)
- Store consent status in Firestore
- Show on first login
Time: 8-10 hours
Files: src/components/ConsentModal.jsx (new)
       src/main.jsx (integration)
```

**Day 3: Sentry Error Monitoring**
```
- Install @sentry/react @sentry/tracing
- Configure in src/firebase.js
- Add error boundaries
- Test with mock errors
- Set up dashboard
Time: 4-6 hours
Files: src/firebase.js (add Sentry config)
       src/utils/errorBoundary.js (new)
```

**Day 4: Rate Limiting Integration**
```
- Integrate RateLimiter into Firestore operations
- Add UI feedback for rate limit hits
- Test with rapid requests
- Verify smooth degradation
Time: 4-6 hours
Files: src/firebase.js (integrate rateLimiter)
```

**Day 5: Session Timeout**
```
- Implement 15-minute idle timeout
- Add warning before logout (1 min)
- Reset timer on user activity
- Clear sensitive data on logout
Time: 4-6 hours
Files: src/main.jsx (add useEffect hooks)
       src/utils/sessionManager.js (new)
```

**Week 1 Status:** ✅ Core security complete (40-50 hours)

---

### Week 2: Encryption & Features

**Day 6-7: Biometric Authentication (WebAuthn)**
```
- Research WebAuthn API
- Implement registration
- Implement authentication
- Add fallback to password
- Test on multiple browsers
Time: 12-16 hours
Files: src/utils/webauthn.js (new)
       src/main.jsx (integrate)
```

**Day 8-9: End-to-End Encryption**
```
- Install tweetnacl.js
- Generate keypair on first signup
- Store encrypted health records
- Implement encryption/decryption functions
- Test with sample data
Time: 16-20 hours
Files: src/utils/encryption.js (new)
       src/firebase.js (integrate into read/write)
```

**Day 10: Data Export**
```
- Implement CSV export
- Implement JSON export
- Add download button to profile
- Test file size limits
Time: 4-6 hours
Files: src/utils/dataExport.js (new)
       src/main.jsx (add export button)
```

**Day 11: Account Deletion**
```
- Implement soft delete (30-day grace)
- Send confirmation email
- Schedule hard delete (30 days)
- Add recovery option
Time: 4-6 hours
Files: src/utils/accountDeletion.js (new)
       Firestore Cloud Function (new)
```

**Day 12-14: Legal & Polish**
```
- Receive attorney feedback
- Update Privacy Policy
- Update Terms of Service
- Publish legal documents
- Final testing
Time: 8-12 hours
```

**Week 2 Status:** ✅ Advanced features & compliance complete (60-70 hours)

---

## 📋 DETAILED IMPLEMENTATION TASKS

### 1. XSS PROTECTION INTEGRATION

**Current State:**
- ✅ `src/utils/security.js` created
- ❌ NOT integrated into components

**Task List:**
- [ ] Import security functions in src/main.jsx
- [ ] Wrap all text input fields with `sanitizeInput()`
- [ ] Wrap all user-generated output with `sanitizeHTML()`
- [ ] Test with XSS payloads:
  - `<script>alert('XSS')</script>`
  - `<img src=x onerror=alert('XSS')>`
  - `<svg onload=alert('XSS')>`
- [ ] Verify functionality still works
- [ ] Add comments explaining sanitization

**Code Locations to Update:**
- Input: Health record entry, profile update, family member add
- Output: Health record display, profile view, notifications

---

### 2. CONSENT MANAGEMENT UI

**Task List:**
- [ ] Create `src/components/ConsentModal.jsx`:
  - Display Privacy Policy (link + inline)
  - Display Terms of Service (link + inline)
  - Display HIPAA Disclosure (if applicable)
  - Accept/Decline buttons
  - Remember choice in Firestore

- [ ] Integrate into login flow:
  - Show on first login
  - Don't re-show if already accepted
  - Make acceptance required before using app

- [ ] Add to user profile:
  - View previously accepted policies
  - Download PDF copies
  - Re-accept if policies updated

---

### 3. SENTRY ERROR MONITORING

**Task List:**
- [ ] Install dependencies:
  ```bash
  npm install @sentry/react @sentry/tracing
  ```

- [ ] Create `src/utils/sentryConfig.js`:
  ```javascript
  import * as Sentry from "@sentry/react";
  
  export const initSentry = () => {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN,
      environment: import.meta.env.MODE,
      tracesSampleRate: 0.1,
      integrations: [new Sentry.Replay()],
    });
  };
  ```

- [ ] Initialize in `src/main.jsx`
- [ ] Create error boundary component
- [ ] Test with intentional errors
- [ ] Configure alerts for critical errors

---

### 4. RATE LIMITING INTEGRATION

**Task List:**
- [ ] Import RateLimiter in `src/firebase.js`
- [ ] Wrap all Firestore operations:
  ```javascript
  await firestoreLimiter.acquire();
  const result = await someFirestoreOperation();
  ```

- [ ] Wrap all auth operations:
  ```javascript
  await authLimiter.acquire();
  await signInWithEmailAndPassword(auth, email, password);
  ```

- [ ] Add user feedback:
  - Show "Please wait" message
  - Disable submit buttons during rate limit
  - Show retry timer

- [ ] Test:
  - Rapid fire requests
  - Verify smooth degradation
  - Check rate limit messages

---

### 5. SESSION TIMEOUT

**Task List:**
- [ ] Create `src/utils/sessionManager.js`:
  - Track last user activity
  - Set 15-minute timeout
  - Show warning at 14 minutes
  - Logout at 15 minutes
  - Reset on any user action

- [ ] Integration points:
  - onClick handlers
  - onChange handlers
  - Touch events (mobile)

- [ ] Add UI:
  - "Session expiring in X minutes" warning
  - "Stay logged in?" button
  - Auto-logout message

---

### 6. BIOMETRIC AUTHENTICATION (WebAuthn)

**Task List:**
- [ ] Create `src/utils/webauthn.js`:
  ```javascript
  // Registration
  export async function registerWebAuthn(userId, userName, displayName) {
    const attestation = await navigator.credentials.create({
      publicKey: {
        challenge: new Uint8Array(32),
        rp: { name: "HealthGene" },
        user: {
          id: Uint8Array.from(userId),
          name: userName,
          displayName: displayName
        },
        pubKeyCredParams: [{ alg: -7, type: "public-key" }],
        timeout: 60000,
        attestation: "direct"
      }
    });
    return attestation;
  }
  
  // Authentication
  export async function authenticateWebAuthn(credential) {
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge: new Uint8Array(32),
        timeout: 60000,
        userVerification: "required"
      }
    });
    return assertion;
  }
  ```

- [ ] Add to registration flow:
  - Optional biometric during signup
  - Store public key in Firestore
  - Test on multiple devices

- [ ] Add to login flow:
  - "Use fingerprint?" option
  - Fallback to password
  - Store in browser cache

- [ ] Browser compatibility check

---

### 7. END-TO-END ENCRYPTION

**Task List:**
- [ ] Install TweetNaCl.js:
  ```bash
  npm install tweetnacl tweetnacl-util
  ```

- [ ] Create `src/utils/encryption.js`:
  ```javascript
  import nacl from 'tweetnacl';
  import {randomBytes, encodeBase64, decodeBase64} from 'tweetnacl-util';
  
  export function generateKeyPair() {
    return nacl.box.keyPair();
  }
  
  export function encryptData(data, publicKey) {
    const nonce = randomBytes(nacl.box.nonceLength);
    const encrypted = nacl.box(
      nacl.util.decodeUTF8(JSON.stringify(data)),
      nonce,
      publicKey,
      secretKey
    );
    return {
      ciphertext: encodeBase64(encrypted),
      nonce: encodeBase64(nonce)
    };
  }
  
  export function decryptData(ciphertext, nonce, secretKey) {
    const decrypted = nacl.box.open(
      decodeBase64(ciphertext),
      decodeBase64(nonce),
      publicKey,
      secretKey
    );
    return JSON.parse(nacl.util.encodeUTF8(decrypted));
  }
  ```

- [ ] Generate keypair on first signup
- [ ] Store public key in Firestore
- [ ] Store secret key locally (localStorage with warning)
- [ ] Encrypt health records before storage
- [ ] Decrypt on retrieval
- [ ] Test with multiple records

---

### 8. DATA EXPORT FUNCTIONALITY

**Task List:**
- [ ] Create `src/utils/dataExport.js`:
  ```javascript
  export function exportToCSV(records) {
    const headers = ['Date', 'Type', 'Value', 'Notes'];
    const rows = records.map(r => [r.date, r.type, r.value, r.notes]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    return csv;
  }
  
  export function exportToJSON(records) {
    return JSON.stringify(records, null, 2);
  }
  
  export function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }
  ```

- [ ] Add to profile page:
  - "Export My Data" button
  - CSV option (Excel-friendly)
  - JSON option (complete)
  - XML option (healthcare-standard)

- [ ] Test with various data sizes

---

### 9. ACCOUNT DELETION (30-day Grace)

**Task List:**
- [ ] Create `src/utils/accountDeletion.js`:
  ```javascript
  export async function deleteAccount(userId) {
    // Soft delete - set deletionScheduledAt
    await updateDoc(doc(db, 'users', userId), {
      deletionScheduledAt: serverTimestamp(),
      active: false
    });
    
    // Clear local data
    localStorage.clear();
  }
  
  export async function cancelDeletion(userId) {
    // Cancel soft delete
    await updateDoc(doc(db, 'users', userId), {
      deletionScheduledAt: null,
      active: true
    });
  }
  ```

- [ ] Create Cloud Function for hard delete:
  ```javascript
  exports.hardDeleteAccounts = functions.pubsub
    .schedule('every 24 hours')
    .onRun(async (context) => {
      const cutoffDate = Date.now() - (30 * 24 * 60 * 60 * 1000);
      const query = db.collection('users')
        .where('deletionScheduledAt', '<', new Date(cutoffDate))
        .where('active', '==', false);
      
      const snapshot = await query.get();
      snapshot.forEach(doc => {
        db.collection('users').doc(doc.id).delete();
      });
    });
  ```

- [ ] Add to settings:
  - "Delete Account" button
  - Confirmation dialog
  - Show 30-day grace period
  - Add "Cancel Deletion" option

---

## ⚡ QUICK START CHECKLIST

### Today (Start Now)
- [ ] Read this plan completely
- [ ] Create .env.local with Firebase credentials
- [ ] Test app startup: `npm run dev`
- [ ] Review src/utils/security.js and rateLimiter.js
- [ ] Plan attorney contact (Tier 3)

### Tomorrow (Tier 1 - Day 1)
- [ ] Start XSS protection integration
- [ ] Create ConsentModal component
- [ ] Begin Sentry setup

### This Week (Tier 1 - Complete)
- [ ] Finish rate limiting integration
- [ ] Finish session timeout
- [ ] Test all Tier 1 items

### Next Week (Tier 2 - Start)
- [ ] WebAuthn implementation
- [ ] Encryption implementation
- [ ] Data export & deletion

### Parallel (Tier 3)
- [ ] Contact attorney TODAY
- [ ] Send Privacy Policy for review
- [ ] Send Terms of Service for review
- [ ] Implement feedback as it arrives

---

## 🔧 REQUIRED DEPENDENCIES

**Install in Phase 2:**
```bash
# Error monitoring
npm install @sentry/react @sentry/tracing

# Biometric authentication
# (WebAuthn is native browser API - no install needed)

# Encryption
npm install tweetnacl tweetnacl-util

# Rate limiting (already installed in Phase 1)
# npm install p-limit

# Optional: UUID generation
npm install uuid

# Optional: date utilities
npm install date-fns
```

**Total new packages:** 4 (Sentry, TweetNaCl, tweetnacl-util, uuid)

---

## 📊 SUCCESS METRICS

After Phase 2 is complete, you should have:

✅ No XSS vulnerabilities (test with OWASP payloads)
✅ Consent captured from all users (check Firestore)
✅ Error tracking working (test Sentry dashboard)
✅ Rate limiting functional (test with rapid requests)
✅ Session timeout working (test idle behavior)
✅ Biometric auth working (test on 3+ browsers)
✅ End-to-end encryption working (verify encrypted data)
✅ Data export working (download and verify files)
✅ Account deletion working (verify soft/hard delete)
✅ All legal documents reviewed by attorney

**App Readiness:** 🟡 25% → 🟢 45% (+80%)

---

## ⚠️ CRITICAL REMINDERS

1. **Don't publish legal docs** until attorney review
2. **Backup encryption keys** before deleting users
3. **Test encryption** with multiple scenarios
4. **Monitor Sentry** for errors after launch
5. **Rate limit appropriately** (don't block legitimate users)
6. **Session timeout aware** users before logout
7. **WebAuthn fallback** required for users without devices

---

## 🎯 SUCCESS CRITERIA

Phase 2 is complete when:

- [x] XSS protection integrated and tested
- [x] Consent management UI in place
- [x] Sentry error monitoring working
- [x] Rate limiting integrated
- [x] Session timeout implemented
- [x] WebAuthn authentication functional
- [x] E2E encryption working for health data
- [x] Data export functionality added
- [x] Account deletion (soft/hard) implemented
- [x] All legal docs reviewed by attorney
- [x] User testing completed
- [x] No new security vulnerabilities introduced
- [x] App readiness improved to 45%+

---

**Status:** 🟡 READY TO START  
**Next Step:** Begin Day 1 (XSS Integration)  
**Questions?** Review Phase 1 files or attorney resources  

