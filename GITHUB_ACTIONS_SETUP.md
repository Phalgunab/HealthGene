# GitHub Actions Deployment Setup Guide

## 🚀 Quick Setup

This guide walks you through setting up GitHub Actions for automated deployment of HealthGene.

---

## 📋 Prerequisites

1. **GitHub Repository** - Push your code to GitHub
2. **Firebase Project** - Real Firebase project (not emulator)
3. **Firebase Service Account** - For CI/CD authentication
4. **GitHub Secrets** - Environment variables stored securely

---

## 🔐 Step 1: Get Your Firebase Credentials

Since you already have a Firebase API key, you need to gather these credentials:

### From Firebase Console:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your HealthGene project
3. Click **Project Settings** (gear icon)
4. Go to **Your apps** section
5. Find your Web app and click it
6. Copy these values:

```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=healthgene-xxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=healthgene-xxx
VITE_FIREBASE_STORAGE_BUCKET=healthgene-xxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
```

---

## 🔑 Step 2: Create Firebase CI Token

### Get Firebase CI Token:

```bash
# Login to Firebase CLI (run locally)
firebase login:ci

# This will:
# 1. Open browser for authentication
# 2. Generate a CI token
# 3. Print the token to console
# 4. Save token to ~/.config/firebase/tokens.json
```

**Copy this token - you'll need it for GitHub secrets!**

---

## 🏃 Step 3: Add GitHub Secrets

### Go to GitHub Repository Settings:

1. Navigate to: `https://github.com/YOUR-USERNAME/HealthGene`
2. Click **Settings** tab
3. Left sidebar → **Secrets and variables** → **Actions**
4. Click **New repository secret**

### Add These Secrets (one by one):

| Secret Name | Value | Source |
|-------------|-------|--------|
| `FIREBASE_API_KEY` | Your Firebase API Key | Firebase Console |
| `FIREBASE_AUTH_DOMAIN` | healthgene-xxx.firebaseapp.com | Firebase Console |
| `FIREBASE_PROJECT_ID` | Your project ID | Firebase Console |
| `FIREBASE_STORAGE_BUCKET` | healthgene-xxx.appspot.com | Firebase Console |
| `FIREBASE_MESSAGING_SENDER_ID` | Your sender ID | Firebase Console |
| `FIREBASE_APP_ID` | Your app ID | Firebase Console |
| `FIREBASE_MEASUREMENT_ID` | G-XXXXX | Firebase Console |
| `FIREBASE_CI_TOKEN` | Token from `firebase login:ci` | Generated locally |
| `SENTRY_DSN` | Your Sentry DSN (optional) | Sentry.io or leave empty |
| `VITE_ENVIRONMENT` | `production` | Fixed value |

**Example Screenshot Path:**
```
Repository → Settings → Secrets and variables → Actions → New repository secret
```

---

## 📝 Step 4: Verify Environment File Template

Ensure `.env.example` is properly configured:

```bash
# .env.example should have all required fields
cat .env.example
```

**Expected content:**
```
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
# ... etc
```

---

## ✅ Step 5: Test the Workflow

### Push to Trigger Deployment:

```bash
# Make a small change
echo "# Deployment test" >> README.md

# Commit and push
git add .
git commit -m "Test GitHub Actions deployment"
git push origin main
```

### Monitor the Workflow:

1. Go to your GitHub repository
2. Click **Actions** tab
3. Watch the workflow run in real-time
4. Click on the workflow to see detailed logs

**Expected workflow:**
- ✅ Build Application (compiles code)
- ✅ Security Scan (audits dependencies)
- ✅ Deploy to Firebase Hosting (if on main branch)
- ⚠️ Deploy to Google Play Store (placeholder, needs native config)
- ⚠️ Deploy to Apple App Store (placeholder, needs native config)

---

## 🚀 Step 6: Enable Firebase Hosting Deployment

### Create Firebase Hosting Configuration:

```bash
# Initialize Firebase (if not done)
firebase init hosting

# Or update existing firebase.json
cat firebase.json
```

**firebase.json should have:**
```json
{
  "hosting": {
    "public": "dist",
    "cleanUrls": true,
    "redirects": [],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## 📱 Step 7 (Optional): Mobile Deployment

### For Google Play Store:

1. Create `.github/workflows/android-build.yml`
2. Configure Android Keystore
3. Set up Play Store API credentials
4. Use Gradle to build APK

### For Apple App Store:

1. Create `.github/workflows/ios-build.yml`
2. Configure Apple certificates
3. Set up provisioning profiles
4. Use Xcode to build IPA

**These require additional native configuration beyond web deployment.**

---

## 🔄 Workflow Triggers

The deployment workflow runs on:

1. **Push to `main` branch** → Full deployment
2. **Push to `develop` branch** → Build only (no deployment)
3. **Pull Requests** → Build + security scan
4. **Manual trigger** → Via "Run workflow" button

---

## 📊 Deployment Status

### View Deployment Details:

**Firebase Hosting:**
- Console: https://console.firebase.google.com/project/YOUR-PROJECT/hosting
- Live URL: `https://YOUR-PROJECT.web.app`

**GitHub Actions:**
- Workflows: https://github.com/YOUR-USERNAME/HealthGene/actions
- Build logs: Click on any workflow run

---

## 🔍 Troubleshooting

### Problem: "Firebase token expired"
```bash
# Regenerate locally
firebase login:ci

# Update FIREBASE_CI_TOKEN secret in GitHub
```

### Problem: "Missing environment variable"
```bash
# Verify secret is added to GitHub
# Secrets are case-sensitive!
# FIREBASE_API_KEY ≠ firebase_api_key
```

### Problem: "Build fails with lint errors"
```bash
# Fix locally and test before pushing
npm run lint --fix
npm test
npm run build
```

### Problem: "Deployment succeeds but site doesn't update"
```bash
# Clear browser cache
# Hard refresh: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
# Or check deployment status in Firebase Console
```

---

## 📚 Related Files

- `.github/workflows/deploy.yml` - Main deployment workflow
- `.env.example` - Environment variable template
- `firebase.json` - Firebase configuration
- `vite.config.js` - Build configuration

---

## 🎯 Next Steps

1. ✅ Gather Firebase credentials
2. ✅ Generate Firebase CI token
3. ✅ Add GitHub secrets
4. ✅ Test workflow with a push
5. ✅ Monitor first deployment
6. ✅ Access live app at Firebase Hosting URL
7. ⏭️ Set up mobile app deployment (future)

---

## 📞 Security Best Practices

✅ **DO:**
- Store all credentials in GitHub Secrets
- Rotate Firebase CI token periodically
- Use branch protection rules
- Require code review before merge
- Monitor deployment logs for errors
- Keep dependencies up to date

❌ **DON'T:**
- Commit `.env.local` to Git
- Share Firebase tokens
- Use personal credentials in CI/CD
- Disable security checks
- Deploy from unverified branches

---

## 🔗 Resources

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [Firebase CLI Documentation](https://firebase.google.com/docs/cli)
- [Firebase Hosting Deployment](https://firebase.google.com/docs/hosting/deploying)
- [GitHub Actions Workflows](https://docs.github.com/en/actions/writing-workflows/about-workflows)

---

**Setup completed at:** 2026-10-20
**Last updated:** 2026-10-20 23:42 UTC+8
