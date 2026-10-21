# 🚀 HealthGene GitHub Actions Setup Checklist

**Status:** Ready for Configuration  
**Last Updated:** 2026-10-20  
**Target:** Production-ready CI/CD pipeline

---

## 📋 Pre-Deployment Checklist

### ✅ Code & Repository Requirements

- [ ] Repository is pushed to GitHub at `Phalgunab/HealthGene`
- [ ] Main branch is set as default branch
- [ ] `.github/workflows/deploy.yml` exists in repository
- [ ] `.env.example` is committed with all required variables documented
- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] `firebase.json` is properly configured with hosting rules
- [ ] `firestore.rules` is valid and tested
- [ ] All source code compiles locally without errors
- [ ] No console warnings in browser DevTools
- [ ] All tests pass locally (`npm test`)

### ✅ Firebase Project Setup

- [ ] Firebase project created at [console.firebase.google.com](https://console.firebase.google.com)
- [ ] Web app registered in Firebase project
- [ ] Firebase Hosting enabled for the project
- [ ] Firestore database created (production mode)
- [ ] Authentication methods enabled:
  - [ ] Phone authentication
  - [ ] Anonymous authentication
  - [ ] Custom claims for MFA
- [ ] Storage bucket configured (if using file uploads)
- [ ] Firestore rules deployed and tested

### ✅ Firebase Credentials Gathered

Collect these from Firebase Console → Project Settings → Your apps → Web app:

- [ ] `VITE_FIREBASE_API_KEY` - Copied and verified
- [ ] `VITE_FIREBASE_AUTH_DOMAIN` - Copied and verified
- [ ] `VITE_FIREBASE_PROJECT_ID` - Copied and verified
- [ ] `VITE_FIREBASE_STORAGE_BUCKET` - Copied and verified
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID` - Copied and verified
- [ ] `VITE_FIREBASE_APP_ID` - Copied and verified
- [ ] `VITE_FIREBASE_MEASUREMENT_ID` - Copied and verified

**Verification:**
```bash
# All values should be filled and non-empty
cat .env.local | grep VITE_FIREBASE
```

### ✅ Firebase CLI Authentication

```bash
# Step 1: Login to Firebase CLI locally
firebase login:ci

# Step 2: Copy the token displayed (long string)
# Example: 1//0gfq...
# This becomes FIREBASE_CI_TOKEN

# Step 3: Verify token works
firebase projects:list
# Should show your HealthGene project
```

- [ ] Ran `firebase login:ci` successfully
- [ ] Copied FIREBASE_CI_TOKEN
- [ ] Verified token by listing projects

### ✅ GitHub Secrets Configuration

Go to: `https://github.com/Phalgunab/HealthGene/settings/secrets/actions`

Add these secrets one by one:

#### Firebase Web Config (Required)
- [ ] `FIREBASE_API_KEY` = AIzaSy... (from Firebase Console)
- [ ] `FIREBASE_AUTH_DOMAIN` = healthgene-xxx.firebaseapp.com
- [ ] `FIREBASE_PROJECT_ID` = healthgene-xxx
- [ ] `FIREBASE_STORAGE_BUCKET` = healthgene-xxx.appspot.com
- [ ] `FIREBASE_MESSAGING_SENDER_ID` = 123456789012
- [ ] `FIREBASE_APP_ID` = 1:123456789012:web:abcdef...
- [ ] `FIREBASE_MEASUREMENT_ID` = G-ABCDEFGHIJ

#### Firebase Deployment (Required)
- [ ] `FIREBASE_CI_TOKEN` = 1//0gfq... (from `firebase login:ci`)

#### Environment Config (Required)
- [ ] `VITE_ENVIRONMENT` = production

#### Optional Monitoring
- [ ] `SENTRY_DSN` = https://xxx@sentry.io/xxx (optional, can be empty)

**Verification:**
1. Go to Settings → Secrets and variables → Actions
2. Should see 9-10 secrets listed
3. All should show green checkmarks

---

## 🧪 Testing Checklist

### Local Testing (Before Pushing)

```bash
# Test 1: Verify build works
npm ci --frozen-lockfile
npm run build
# Expected: ✅ Build successful, 0 errors, dist/ folder created

# Test 2: Verify linting passes
npm run lint --if-present
# Expected: ✅ 0 errors, 0 warnings (or acceptable warnings)

# Test 3: Verify tests pass
npm test --if-present
# Expected: ✅ All tests passed

# Test 4: Check bundle size
du -sh dist/
# Expected: ✅ < 5 MB total size

# Test 5: Verify .env.local has real credentials
cat .env.local | grep -i firebase
# Expected: ✅ All FIREBASE_* variables filled with real values
```

- [ ] `npm run build` completes with 0 errors
- [ ] `npm run lint` completes with acceptable warnings
- [ ] `npm test` passes all tests
- [ ] Bundle size is reasonable (< 5 MB)
- [ ] `.env.local` has all Firebase credentials

### First Deployment Test

```bash
# Step 1: Make a small test commit
echo "# Test deployment" >> README.md
git add README.md
git commit -m "Test: GitHub Actions workflow verification"
git push origin main

# Step 2: Monitor GitHub Actions
# Go to: https://github.com/Phalgunab/HealthGene/actions
# Watch the "Build and Deploy HealthGene" workflow run

# Step 3: Check logs for each step
# Expected progression:
#   ✅ Checkout code
#   ✅ Setup Node.js
#   ✅ Install dependencies
#   ✅ Create .env.local for build
#   ✅ Run linter
#   ✅ Run tests
#   ✅ Build application
#   ✅ Upload build artifacts
#   ✅ Check build size
#   ✅ Deploy to Firebase Hosting
#   ✅ Notification/Summary

# Step 4: Verify deployment
# Visit: https://YOUR-PROJECT.web.app
# Expected: ✅ App loads, no errors in console
```

- [ ] Push test commit to main branch
- [ ] GitHub Actions workflow triggers automatically
- [ ] All workflow steps complete successfully (green checkmarks)
- [ ] Deployment to Firebase Hosting succeeds
- [ ] Live app loads at `https://YOUR-PROJECT.web.app`
- [ ] Browser console shows no critical errors

---

## 🔍 Verification Steps

### After Secrets Are Added

1. **Visual Verification in GitHub**
   ```
   Go to: Settings → Secrets and variables → Actions
   Look for: 9-10 secrets with green checkmarks
   All names should match exactly (case-sensitive):
   - FIREBASE_API_KEY
   - FIREBASE_AUTH_DOMAIN
   - FIREBASE_PROJECT_ID
   - FIREBASE_STORAGE_BUCKET
   - FIREBASE_MESSAGING_SENDER_ID
   - FIREBASE_APP_ID
   - FIREBASE_MEASUREMENT_ID
   - FIREBASE_CI_TOKEN
   - VITE_ENVIRONMENT
   - SENTRY_DSN (optional)
   ```

2. **Test Build Step**
   ```bash
   # This simulates what GitHub Actions does:
   npm ci --frozen-lockfile
   export VITE_FIREBASE_API_KEY="your-key"
   export VITE_FIREBASE_AUTH_DOMAIN="your-domain"
   # ... export all other secrets ...
   npm run build
   # Should succeed with no errors
   ```

3. **Test Firebase Deploy Command**
   ```bash
   firebase deploy \
     --project="YOUR-PROJECT-ID" \
     --token="YOUR-CI-TOKEN" \
     --only=hosting \
     --dry-run
   # Should complete without errors
   ```

### After First Deployment

1. **Check Live URL**
   - URL: `https://YOUR-PROJECT.web.app`
   - Status: Should load and be responsive
   - Console: No 403/404 errors from Firebase

2. **Check Firebase Console**
   - Dashboard: Should show recent deployments
   - Hosting: Should show green checkmarks
   - Deployments: Should list latest deployment with timestamp

3. **Test Core Features**
   - Homepage loads: ✅
   - Authentication works: ✅
   - Can enter phone number: ✅
   - Can verify OTP: ✅
   - Dashboard loads: ✅
   - Data persists: ✅

---

## ⚠️ Common Issues & Solutions

### Issue: "Secrets not found" during build

**Check:**
```bash
# Verify secrets exist in GitHub
curl -H "Authorization: token YOUR-GITHUB-TOKEN" \
  https://api.github.com/repos/Phalgunab/HealthGene/actions/secrets
```

**Fix:**
- Double-check secret names are spelled correctly (case-sensitive!)
- Go to Settings → Secrets and verify all 8 secrets are there
- If missing, add them again
- Regenerate GitHub token if permissions issue

---

### Issue: "Build fails with VITE_* undefined"

**Cause:** Secrets weren't passed to build step

**Fix:**
1. Verify `.github/workflows/deploy.yml` creates `.env.local` (lines 34-42)
2. Check workflow logs for "Create .env.local for build" step
3. Ensure no secrets have typos in workflow file
4. Secrets must start with `VITE_` or `SENTRY_` to be exposed to Vite build

---

### Issue: "Firebase deployment fails with auth error"

**Cause:** CI token is expired or invalid

**Fix:**
```bash
# Regenerate locally
firebase login:ci

# Update GitHub Secret FIREBASE_CI_TOKEN with new value
# Go to Settings → Secrets → FIREBASE_CI_TOKEN → Update
```

---

### Issue: "App deploys but gives 404 at /"

**Cause:** Firebase Hosting isn't configured for SPA routing

**Fix:**
- Verify `firebase.json` has rewrites section (already added) ✅
- Check hosting section exists (already added) ✅
- Redeploy with: `firebase deploy --only=hosting`

---

### Issue: "Build size is too large"

**Check:**
```bash
npm run build
du -sh dist/
find dist -type f -size +500k -exec ls -lh {} \;
```

**Fix:**
- Analyze bundle: `npm install -D @vite/plugin-visualizer`
- Remove unused dependencies
- Use dynamic imports for large modules
- Enable gzip compression (already configured in firebase.json)

---

## 📊 Deployment Workflow Overview

```
Developer pushes to main
         ↓
GitHub Actions triggered
         ↓
Build Job (Ubuntu):
  - Checkout code
  - Setup Node 18
  - Install dependencies (npm ci)
  - Create .env.local from secrets
  - Run linter
  - Run tests
  - Build app (npm run build)
  - Upload dist/ artifacts
         ↓
Deploy Job (if main branch):
  - Download dist/ artifacts
  - Setup Firebase CLI
  - Deploy to Firebase Hosting (using CI token)
  - Comment on PR with status
         ↓
App live at: https://YOUR-PROJECT.web.app
```

---

## 📱 Mobile Deployment (Future)

When you're ready to deploy to App Store / Play Store:

- [ ] Create Android build workflow
- [ ] Create iOS build workflow
- [ ] Configure keystores for Android
- [ ] Configure certificates for iOS
- [ ] Add Play Store credentials to secrets
- [ ] Add Apple credentials to secrets
- [ ] Test native builds locally with Capacitor

**Not yet required - Web deployment is working first.**

---

## 🔐 Security Checklist

- [ ] All secrets are stored in GitHub Secrets (not in code)
- [ ] `.env.local` is in `.gitignore`
- [ ] No API keys in commit history (`git log` doesn't show them)
- [ ] GitHub account has 2FA enabled
- [ ] Used `firebase login:ci` (not `firebase login`) for CI token
- [ ] CI token has appropriate permissions
- [ ] Workflow only deploys on main branch
- [ ] Pull requests don't have access to production secrets
- [ ] Firestore rules are restrictive (don't allow public access)

---

## ✨ Post-Deployment Monitoring

### Daily
- [ ] Check GitHub Actions workflow status
- [ ] Monitor error logs in Firebase Console
- [ ] Test core features work on live app

### Weekly
- [ ] Review deployment history
- [ ] Check for failed workflows
- [ ] Monitor app performance metrics
- [ ] Update dependencies if needed

### Monthly
- [ ] Rotate Firebase CI token
- [ ] Review security audit results
- [ ] Update workflow if needed
- [ ] Test rollback procedures

---

## 📞 Quick Links

| Task | URL |
|------|-----|
| GitHub Repository | https://github.com/Phalgunab/HealthGene |
| GitHub Actions | https://github.com/Phalgunab/HealthGene/actions |
| Add Secrets | https://github.com/Phalgunab/HealthGene/settings/secrets/actions |
| Firebase Console | https://console.firebase.google.com |
| Firestore Rules | https://console.firebase.google.com/project/YOUR-PROJECT/firestore/rules |
| Hosting Deployments | https://console.firebase.google.com/project/YOUR-PROJECT/hosting/dashboard |
| Live App | https://YOUR-PROJECT.web.app |
| Workflow File | `.github/workflows/deploy.yml` |

---

## 🎯 Next Steps

**Immediate (Today):**
1. Gather all Firebase credentials
2. Run `firebase login:ci` to get CI token
3. Add all 9 secrets to GitHub

**Short-term (This week):**
4. Test first deployment by pushing to main
5. Verify app loads at Firebase Hosting URL
6. Test core features on production

**Medium-term (Next week):**
7. Set up monitoring and error tracking
8. Create deployment documentation
9. Train team on deployment process

**Long-term (Next month):**
10. Add mobile (Android/iOS) deployment
11. Set up staging environment
12. Implement blue-green deployment strategy

---

## ✅ Completion Checklist

- [ ] All 9 GitHub Secrets added and verified
- [ ] Local build passes (`npm run build`)
- [ ] First test commit pushed to main
- [ ] GitHub Actions workflow completes successfully
- [ ] Live app accessible at Firebase Hosting URL
- [ ] Core features tested on production app
- [ ] Team trained on deployment process
- [ ] Deployment documentation archived

**Setup Status:** READY FOR DEPLOYMENT ✅

---

*Generated: 2026-10-20 23:42 UTC+8*  
*Last Updated: 2026-10-20*  
*Next Review: 2026-10-27*
