# HealthGene: Critical Fixes Checklist

## 🚨 EMERGENCY ITEMS (Do This First - Today!)

### Security Credentials
- [ ] **ROTATE Firebase API Key immediately**
  - Current exposed key: `AIzaSyAE_OnH_5v7o-tnjqKRK4xRYKwH5KW3jkE`
  - Action: Generate new key in Firebase Console
  - Time: 30 minutes
  - Link: https://console.firebase.google.com

- [ ] **Remove personal data from git history**
  - Names in code: "Phalguna Rao BAMMIDI", "Swetha NAYANI", "Vinay Kumar DURGAM"
  - Command: `git filter-branch --tree-filter 'rm -f src/main.jsx' HEAD`
  - Time: 1 hour
  - Risk: GDPR violation ($20M+ fine)

- [ ] **Create `.env.local` (git ignored)**
  ```
  VITE_FIREBASE_API_KEY=<new-key>
  VITE_FIREBASE_AUTH_DOMAIN=myfamilyhealth-fe7b5.firebaseapp.com
  VITE_FIREBASE_PROJECT_ID=myfamilyhealth-fe7b5
  VITE_FIREBASE_STORAGE_BUCKET=myfamilyhealth-fe7b5.firebasestorage.app
  VITE_FIREBASE_MESSAGING_SENDER_ID=1094951940065
  VITE_FIREBASE_APP_ID=1:1094951940065:web:467ebff8a8c6518135aca0
  VITE_FIREBASE_MEASUREMENT_ID=G-CKQXN26H8J
  ```
  - Time: 30 minutes

---

## 🔴 CRITICAL PHASE 1 (Week 1)

### 1. Dependency Vulnerabilities
```bash
# Check current status
npm audit

# Fix vulnerabilities
npm audit fix
npm audit fix --force  # if needed

# Update Firebase
npm install firebase@latest
```
- [ ] Fix all HIGH severity vulnerabilities
- [ ] Run: `npm audit` - expect 0 vulnerabilities
- [ ] Time: 4-8 hours
- [ ] Verify: Test app functionality after update

### 2. Error Logging & Monitoring
- [ ] Install Sentry
  ```bash
  npm install @sentry/react @sentry/tracing
  ```
- [ ] Configure in `src/firebase.js`:
  ```javascript
  import * as Sentry from "@sentry/react";
  
  Sentry.init({
    dsn: process.env.VITE_SENTRY_DSN,
    environment: process.env.NODE_ENV,
  });
  ```
- [ ] Time: 2-3 hours
- [ ] Test: Trigger error and verify logging

### 3. Rate Limiting
- [ ] Add `firebase.js` throttling:
  ```javascript
  import pLimit from 'p-limit';
  
  const limit = pLimit(5); // max 5 concurrent requests
  ```
- [ ] Add client-side debouncing for user input
- [ ] Time: 2-3 hours

### 4. XSS Protection
- [ ] Install DOMPurify
  ```bash
  npm install dompurify
  npm install --save-dev @types/dompurify
  ```
- [ ] Sanitize all user display output
- [ ] Time: 4-6 hours

### 5. Authentication Improvements
- [ ] Add biometric authentication option
  ```javascript
  // For web: WebAuthn API
  // For mobile: Native biometric
  ```
- [ ] Implement session timeout (15 min idle)
- [ ] Add login attempt rate limiting (5 attempts/5 min)
- [ ] Time: 1-2 days

### 6. Firestore Security Rules
- [ ] Update `firestore.rules`:
  ```rules
  rules_version = '2';
  
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId}/{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == userId
          && request.size() < 1000000  // < 1MB per write
          && request.time < timestamp.now() + duration.value(1, 's');  // no future dates
      }
    }
  }
  ```
- [ ] Time: 2-3 hours

---

## 🟠 HIGH PRIORITY PHASE 2 (Week 2-3)

### Compliance & Privacy
- [ ] Create Privacy Policy (attorney-reviewed)
  - Minimum 3,000 words
  - Cover HIPAA, GDPR, CCPA
  - Cost: $2,000-5,000 legal review
  
- [ ] Create Terms of Service
  
- [ ] Implement data export
  ```javascript
  const exportUserData = async (userId) => {
    const data = await getDocs(collection(db, 'users', userId, 'records'));
    return JSON.stringify(data.docs.map(d => d.data()));
  };
  ```

- [ ] Implement account deletion
  ```javascript
  const deleteUserAccount = async (userId) => {
    await deleteDoc(doc(db, 'users', userId));
    await auth.currentUser.delete();
  };
  ```

- [ ] Add consent management UI
  - [ ] Terms acceptance checkbox
  - [ ] Privacy policy checkbox
  - [ ] HIPAA disclosure (if US)
  
- [ ] Time: 1-2 weeks

### Platform Planning
- [ ] Decision: React Native vs Capacitor vs Flutter
  - [ ] Compare pros/cons for your use case
  - [ ] Verify team skills
  - [ ] Estimate timeline
  
- [ ] Create detailed native app plan
  - [ ] Component structure
  - [ ] State management strategy
  - [ ] Native API requirements
  
- [ ] Time: 2-3 days

---

## 🟡 MEDIUM PRIORITY PHASE 3 (Week 3-4)

### Code Quality
- [ ] Refactor monolithic main.jsx
  ```
  src/
  ├── components/
  │   ├── Auth/
  │   ├── Home/
  │   ├── Records/
  │   ├── Family/
  │   └── Profile/
  ├── hooks/
  ├── services/
  ├── utils/
  └── types/
  ```
  - Time: 2-3 days

- [ ] Add unit tests (Jest + React Testing Library)
  ```bash
  npm install --save-dev jest @testing-library/react vitest
  ```
  - Target: 70%+ coverage
  - Time: 1-2 weeks

- [ ] Set up CI/CD (GitHub Actions)
  ```yaml
  name: Tests
  on: [push, pull_request]
  jobs:
    test:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v2
        - run: npm install
        - run: npm test
        - run: npm run lint
  ```
  - Time: 1 day

### Documentation
- [ ] Create/update README.md
- [ ] Add architecture documentation
- [ ] Add API documentation
- [ ] Add security best practices guide
- [ ] Time: 2-3 days

---

## 📋 App Store Submission Checklist

### Pre-Submission (Before Native Build)
- [ ] App icon (1024x1024)
- [ ] Screenshots (2-5 per store)
- [ ] App description (80 chars max)
- [ ] Keywords/tags
- [ ] Privacy Policy URL (must be live, https)
- [ ] Support email
- [ ] Support website
- [ ] Content rating questionnaire filled out
- [ ] COPPA declaration if under-13 users

### iOS Requirements
- [ ] Apple Developer Account ($99/year)
- [ ] Create App ID in App Store Connect
- [ ] Generate provisioning profiles
- [ ] Create certificates
- [ ] Privacy Manifest (PrivacyInfo.xcprivacy)
  - Health Kit permissions?
  - Camera usage
  - Photo library access
- [ ] App minimum iOS version (recommend 12.0+)
- [ ] Implement App Tracking Transparency
- [ ] Remove any test/debug code

### Android Requirements
- [ ] Google Play Developer Account ($25 one-time)
- [ ] Create signing key
  ```bash
  keytool -genkey -v -keystore app.keystore -keyalg RSA -keysize 2048 -validity 10000 -alias app
  ```
- [ ] Enable Google Play App Signing
- [ ] Target API level 31+ (update from current)
- [ ] 64-bit support verified
- [ ] Permissions declared in AndroidManifest.xml:
  - CAMERA
  - READ_EXTERNAL_STORAGE
  - WRITE_EXTERNAL_STORAGE
  - INTERNET

### Both Platforms
- [ ] All critical/high security fixes completed
- [ ] HIPAA BAA signed (if applicable)
- [ ] Privacy policy attorney-reviewed
- [ ] No hardcoded secrets
- [ ] Error tracking working
- [ ] Analytics configured (privacy-compliant)
- [ ] Crash reporting working
- [ ] Tested on actual devices (not just emulators)
- [ ] Tested offline functionality
- [ ] Tested across orientations (portrait/landscape)
- [ ] Tested on older devices (iOS 12, Android 5)

---

## 📊 Success Criteria

### Security
- [ ] npm audit returns 0 vulnerabilities
- [ ] No exposed API keys in code
- [ ] All dependencies updated
- [ ] HTTPS only
- [ ] No console errors/warnings in production

### Privacy
- [ ] Data export working
- [ ] Account deletion working
- [ ] Privacy Policy published
- [ ] Terms accepted before use
- [ ] HIPAA audit log implemented

### Functionality
- [ ] All features work offline (with local storage)
- [ ] Push notifications working
- [ ] Biometric auth working
- [ ] File upload/OCR working
- [ ] PDF parsing working

### Performance
- [ ] App launches in < 3 seconds
- [ ] Records load in < 2 seconds
- [ ] OCR completes in < 30 seconds
- [ ] No memory leaks
- [ ] Battery impact minimal

### Compliance
- [ ] WCAG AA accessibility
- [ ] Works in landscape/portrait
- [ ] Works on tablets
- [ ] Works on older phones
- [ ] Privacy policy accurate

---

## 🎯 Timeline Summary

| Phase | Duration | Focus | Status |
|-------|----------|-------|--------|
| Phase 1: Emergency | 1 week | Security fixes | ⏳ TODO |
| Phase 2: Compliance | 2 weeks | Legal & privacy | ⏳ TODO |
| Phase 3: Code quality | 1 week | Testing & docs | ⏳ TODO |
| Phase 4: Native development | 4-6 weeks | iOS/Android | ⏳ TODO |
| Phase 5: Testing & QA | 2-3 weeks | Full testing | ⏳ TODO |
| Phase 6: Submission | 1-2 weeks per platform | App store review | ⏳ TODO |
| **Total** | **12-16 weeks** | **Full launch** | ⏳ TODO |

---

## 📞 Key Contacts Needed

- [ ] Healthcare privacy attorney (for HIPAA/legal)
  - Estimated cost: $2,000-5,000
  - Time to hire: 1-2 weeks

- [ ] Security auditor (for penetration test)
  - Estimated cost: $3,000-8,000
  - Time to hire: 2-3 weeks

- [ ] DevOps engineer (for CI/CD setup)
  - Estimated cost: $5,000-10,000
  - Time commitment: 2-4 weeks

- [ ] QA engineer (for testing)
  - Estimated cost: $5,000-15,000
  - Time commitment: 4-6 weeks

---

## ❌ DO NOT DO

- ❌ Do not submit to app stores without fixing critical issues
- ❌ Do not deploy to production with exposed API keys
- ❌ Do not use this app with real patient data yet
- ❌ Do not ignore security vulnerabilities
- ❌ Do not skip legal review of privacy policy
- ❌ Do not forget about HIPAA compliance
- ❌ Do not rely on Firebase security rules alone
- ❌ Do not skip testing on real devices
- ❌ Do not use default/weak passwords
- ❌ Do not commit secrets to git

---

## ✅ Success Looks Like

- ✅ Zero exposed secrets
- ✅ npm audit passing
- ✅ All tests passing
- ✅ Privacy policy live
- ✅ Data export working
- ✅ Biometric auth working
- ✅ HIPAA audit log in place
- ✅ App approved by Apple
- ✅ App approved by Google Play
- ✅ Real users can sign up securely
- ✅ Health records encrypted end-to-end
- ✅ Team confident in security posture

---

**Last Updated:** October 2026  
**Next Review:** After Phase 1 completion  
**Contact:** [Security Lead]  
**Status:** 🔴 CRITICAL - MULTIPLE BLOCKERS
