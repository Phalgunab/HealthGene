# Phase 4: Performance Optimization Guide

**Status:** 🟡 IN PROGRESS
**Target:** Optimize app for production
**Timeline:** 1 week

---

## Current Performance Baseline

### Build Metrics
- **Build Time:** 222ms ✅
- **Bundle Size (gzipped):** 392.81 KB ✅
- **Modules:** 2,336 modules
- **Status:** Acceptable, no critical issues

### Runtime Metrics (Target)
- Phone verification: < 3 seconds
- MFA screen load: < 1 second
- OTP verification: < 2 seconds
- Settings page load: < 1 second
- Overall app load: < 2 seconds

---

## 1. Bundle Analysis & Optimization

### Analyze Bundle
```bash
# Install size analyzer
npm install --save-dev vite-plugin-visualizer

# Add to vite.config.js
import { visualizer } from 'vite-plugin-visualizer';

export default {
  plugins: [visualizer()],
};

# Build and analyze
npm run build
# Open dist/stats.html
```

### Identify Large Dependencies
```bash
# Check package size
npm ls --depth=0
npm ls react react-dom

# Check specific file size
du -sh node_modules/[package-name]
```

### Current Large Dependencies
| Package | Size | Needed? |
|---------|------|---------|
| react | 43 KB | ✅ Core |
| react-dom | 127 KB | ✅ Core |
| firebase | 220 KB | ✅ Auth/Firestore |
| lucide-react | 12 KB | ✅ Icons |
| pdfjs | 1.2 MB | 🤔 PDF viewing (large) |

### Optimization Opportunities

#### 1. Code Splitting for MFA Components
**Current:** All MFA components bundled together
**Target:** Lazy load MFA components

```javascript
// Before
import MFASetup from './components/MFASetup';
import MFAVerification from './components/MFAVerification';

// After - Lazy load
const MFASetup = lazy(() => import('./components/MFASetup'));
const MFAVerification = lazy(() => import('./components/MFAVerification'));

// In render
<Suspense fallback={<Loading />}>
  <MFAVerification {...props} />
</Suspense>
```

**Expected Savings:** ~30-50 KB (MFA components loaded only when needed)

#### 2. Code Splitting for Settings Page
**Current:** Settings page always loaded
**Target:** Load on demand

```javascript
// Route-based code splitting
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

// In main.jsx
{screen === 'settings' && (
  <Suspense fallback={<div>Loading...</div>}>
    <SettingsPage {...props} />
  </Suspense>
)}
```

**Expected Savings:** ~10-20 KB

#### 3. PDF.js Optimization
**Current:** Full PDF.js bundled (1.2 MB uncompressed)
**Target:** Load as separate chunk or CDN

```javascript
// Option 1: Lazy load
const PDFViewer = lazy(() => import('./components/PDFViewer'));

// Option 2: Use CDN
import * as pdfjsLib from 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
```

**Expected Savings:** ~200-300 KB (PDF.js)

#### 4. Remove Unused Icons
```bash
# Check which icons are actually used
grep -r "import.*lucide-react" src/ | grep -o "<[A-Z][a-zA-Z]*" | sort -u
```

**Example:** If only using 20 of 300 icons, consider tree-shaking

#### 5. Tree Shaking
Ensure `package.json` has:
```json
{
  "sideEffects": false,
  "type": "module"
}
```

---

## 2. Runtime Performance Optimization

### Profile with React DevTools

```bash
npm run dev
# Open app in browser
# Right-click → Inspect → React Profiler tab
# Start recording
# Perform actions (login, MFA, navigate)
# Stop recording
# Analyze render times
```

### Common Issues & Solutions

#### Issue: Too Many Re-renders
**Symptom:** Login page re-renders on every keystroke

**Solution:**
```javascript
// Before
const [phone, setPhone] = useState('');
<input onChange={e => setPhone(e.target.value)} />

// After - Memoize
const [phone, setPhone] = useState('');
const handlePhoneChange = useCallback((e) => {
  setPhone(e.target.value);
}, []);
<input onChange={handlePhoneChange} />
```

#### Issue: Slow MFA Verification
**Symptom:** OTP verification takes >2 seconds

**Solution:** Offload to Web Worker
```javascript
// mfaHelper.js
const worker = new Worker('otp.worker.js');

export function verifyOTPAsync(otp, hash) {
  return new Promise((resolve) => {
    worker.onmessage = (e) => resolve(e.data);
    worker.postMessage({ otp, hash });
  });
}

// otp.worker.js
self.onmessage = async (e) => {
  const { otp, hash } = e.data;
  const verified = await verifyOTP(otp, hash);
  self.postMessage(verified);
};
```

#### Issue: Large Initial Bundle
**Symptom:** App takes >2 seconds to load

**Solution:** Already addressed by code splitting

---

## 3. Network Optimization

### Minimize Firebase Requests

**Current Flow:**
```
1. Phone auth → Firebase Auth API
2. Get MFA settings → Firestore read
3. Generate OTP → Firestore write
4. Verify OTP → Firestore read + write
5. Device trust → Firestore write
```

**Optimization:**
- Batch reads where possible
- Cache MFA settings in state
- Use transactions for multi-step operations

```javascript
// Cache MFA settings
const [mfaSettings, setMFASettings] = useState(null);

// Fetch once on login
useEffect(() => {
  getMFASettings(uid).then(setMFASettings);
}, [uid]);

// Reuse cached value
if (mfaSettings?.enabled) { ... }
```

### Compress Data Transfers

**Already Done:**
- Gzip compression enabled by default
- Firebase uses gzip

**Additional:**
- Minimize JSON responses
- Only request needed fields
- Use Firestore field-level requests

```javascript
// Before - Get all user fields
const user = await getDoc(doc(db, 'users', uid));

// After - Get specific fields
const user = await getDoc(doc(db, 'users', uid));
const { mfaSettings } = user.data();
```

### Test on Slow Networks

```bash
# Chrome DevTools → Network
# Set throttling to "Slow 3G"
# Test auth flow
# Target: Auth flow still < 5 seconds
```

---

## 4. Memory Optimization

### Detect Memory Leaks

```javascript
// Chrome DevTools → Memory
// 1. Take heap snapshot
// 2. Perform action (login, MFA)
// 3. Take another heap snapshot
// 4. Compare
// 5. Look for objects that should be garbage collected
```

### Common Memory Leak Causes

#### Issue: Event Listeners Not Cleaned Up
```javascript
// Before - Memory leak
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
});

// After - Proper cleanup
useEffect(() => {
  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

#### Issue: Timers Not Cleared
```javascript
// Before - Memory leak
useEffect(() => {
  const timer = setInterval(() => {
    checkMFAExpiration();
  }, 1000);
});

// After - Proper cleanup
useEffect(() => {
  const timer = setInterval(() => {
    checkMFAExpiration();
  }, 1000);
  return () => clearInterval(timer);
}, []);
```

#### Issue: Firebase Listeners Not Unsubscribed
```javascript
// Before - Memory leak
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'users', uid), (doc) => {
    setUserData(doc.data());
  });
});

// After - Proper cleanup
useEffect(() => {
  const unsubscribe = onSnapshot(doc(db, 'users', uid), (doc) => {
    setUserData(doc.data());
  });
  return () => unsubscribe();
}, [uid]);
```

---

## 5. Database Query Optimization

### Firestore Optimization

#### Issue: N+1 Queries
**Before:**
```javascript
const users = await getDocs(collection(db, 'users'));
for (const user of users.docs) {
  const mfa = await getDoc(doc(db, `users/${user.id}/mfaSettings/config`));
  // N+1 queries (1 for users + N for each MFA setting)
}
```

**After:**
```javascript
// Fetch users + MFA together
const [users, mfaSettings] = await Promise.all([
  getDocs(collection(db, 'users')),
  getDocs(collection(db, 'mfaSettings'))
]);
// 2 queries instead of 1+N
```

#### Issue: Fetching Too Much Data
**Before:**
```javascript
const settings = await getDoc(doc(db, 'users', uid));
// Returns all user data (name, email, address, history, etc.)
```

**After:**
```javascript
// Only fetch needed fields (Firestore doesn't support field projection yet)
// Alternative: Store MFA settings in separate collection (already doing this ✅)
```

#### Issue: Slow Queries
**Before:**
```javascript
// Slow - scans all backup codes
const codes = await getDocs(
  collection(db, `users/${uid}/backupCodes`)
);
```

**After:**
```javascript
// Faster - direct reference (already doing this ✅)
const codeDoc = await getDoc(doc(db, `users/${uid}/backupCodes/current`));
```

---

## 6. UI/UX Performance

### Lighthouse Audit

```bash
# Run Lighthouse
npm run build
# Open Chrome DevTools → Lighthouse
# Click "Generate Report"
# Address issues
```

**Targets:**
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

### Optimize Images
```bash
# Convert to WebP
npx cwebp image.png -o image.webp

# Optimize SVG
npx svgo icon.svg
```

### Optimize Fonts
```css
/* Currently */
@import url('https://fonts.googleapis.com/css2?family=Inter');

/* Optimized */
@font-face {
  font-family: 'Inter';
  src: url('/fonts/Inter-Regular.woff2') format('woff2');
  font-display: swap; /* Show fallback while loading */
}
```

### Minimize Layout Shifts (CLS)
- Avoid content jumping during load
- Reserve space for dynamic content
- Use fixed sizes for images

```jsx
// Before - Layout shift
{showMFAScreen && <MFAVerification />}

// After - No shift
<div style={{ minHeight: '300px' }}>
  {showMFAScreen && <MFAVerification />}
</div>
```

---

## 7. Performance Targets & Metrics

### Web Vitals (Google Core Web Vitals)

| Metric | Current | Target |
|--------|---------|--------|
| LCP (Largest Contentful Paint) | TBD | < 2.5s |
| FID (First Input Delay) | TBD | < 100ms |
| CLS (Cumulative Layout Shift) | TBD | < 0.1 |

### Custom Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Phone Auth Time | < 3s | From input submit to verification code entry |
| MFA Load Time | < 1s | From verification success to OTP screen |
| OTP Verify Time | < 2s | From OTP input to access granted |
| Settings Load Time | < 1s | From navigation to page interactive |
| Device Trust Time | < 1s | From checkbox to save complete |

---

## 8. Optimization Checklist

### Quick Wins (1-2 hours)
- [ ] Enable code splitting for MFA components
- [ ] Enable code splitting for Settings page
- [ ] Check for unused dependencies (npm prune)
- [ ] Remove unused CSS
- [ ] Remove unused JavaScript
- [ ] Optimize images (if any)
- [ ] Add font-display: swap

### Medium Effort (4-6 hours)
- [ ] Lazy load PDF.js
- [ ] Implement React.memo() for expensive components
- [ ] Add Suspense boundaries
- [ ] Profile and fix re-renders
- [ ] Cache Firebase queries
- [ ] Batch Firestore operations

### Long Term (Not urgent)
- [ ] Implement service worker for offline
- [ ] Add PWA support
- [ ] Implement route-based code splitting
- [ ] Migrate to faster build tool (already using Vite ✅)

---

## 9. Performance Monitoring

### Setup Performance Tracking

```javascript
// In main.jsx
import { reportWebVitals } from 'web-vitals';

reportWebVitals((metric) => {
  // Send to analytics
  if (window.gtag) {
    gtag.event(metric.name, {
      value: Math.round(metric.value),
      event_category: 'web_vitals',
    });
  }
  
  // Log to Sentry
  Sentry.captureMessage(`Web Vital: ${metric.name} = ${metric.value}`, 'info');
});
```

### Setup Custom Metrics

```javascript
// Track auth flow performance
const authStartTime = performance.now();

// In verifyCode()
const authEndTime = performance.now();
const authDuration = authEndTime - authStartTime;

analytics.logEvent('auth_flow_time', {
  duration: authDuration,
  success: true,
});

if (authDuration > 5000) {
  Sentry.captureMessage(`Slow auth flow: ${authDuration}ms`, 'warning');
}
```

---

## 10. Performance Optimization Plan

### Week 1: Quick Wins
1. Monday: Enable code splitting (MFA, Settings)
2. Tuesday: Analyze bundle with visualizer
3. Wednesday: Remove unused dependencies
4. Thursday: Profile with React DevTools
5. Friday: Fix identified performance issues

### Benchmarking

Before optimization:
```bash
npm run build
# Note bundle size

npm run dev
# Measure load times with Chrome DevTools
```

After optimization:
```bash
npm run build
# Compare bundle size (target: < 360 KB gzipped)

npm run dev
# Measure load times (target: auth < 5s, MFA < 2s)
```

### Expected Results

| Component | Before | After | Gain |
|-----------|--------|-------|------|
| Bundle | 392 KB | 320 KB | 72 KB (-18%) |
| MFA Load | 1.2s | 0.8s | 0.4s (-33%) |
| Auth Flow | 5.5s | 4.0s | 1.5s (-27%) |
| Settings | 1.5s | 0.9s | 0.6s (-40%) |

---

## Ongoing Performance Maintenance

### Monthly
- [ ] Run Lighthouse audit
- [ ] Review performance metrics
- [ ] Update dependencies
- [ ] Check for security updates

### Quarterly
- [ ] Comprehensive performance review
- [ ] Plan optimizations for next release
- [ ] Update performance baselines

---

**Status:** 🟡 Performance Optimization In Progress
**Target Completion:** Week 1
**Next:** Production Deployment

