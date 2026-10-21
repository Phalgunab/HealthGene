# GitHub Actions - Deployment Configuration Guide

## Overview

The HealthGene repository is configured with automated CI/CD via GitHub Actions. The workflow automatically builds and deploys the application to Firebase Hosting on every push to the `main` branch.

## Required Secrets

To enable automatic deployment, configure these secrets in your GitHub repository settings:

### GitHub Repository Settings Path
1. Go to: `https://github.com/Phalgunab/HealthGene/settings/secrets/actions`
2. Add each secret below

### Firebase Configuration Secrets

| Secret Name | Value | Source |
|------------|-------|--------|
| `FIREBASE_API_KEY` | Firebase API Key | Firebase Console → Project Settings |
| `FIREBASE_AUTH_DOMAIN` | Auth Domain | e.g., `myfamilyhealth-fe7b5.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Project ID | e.g., `myfamilyhealth-fe7b5` |
| `FIREBASE_STORAGE_BUCKET` | Storage Bucket | e.g., `myfamilyhealth-fe7b5.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | From Firebase Console |
| `FIREBASE_APP_ID` | App ID | From Firebase Console |
| `FIREBASE_MEASUREMENT_ID` | Measurement ID (GA) | From Firebase Console |

### Firebase CLI Secrets

| Secret Name | Value | Source |
|------------|-------|--------|
| `FIREBASE_CI_TOKEN` | Firebase CLI Token | Run: `firebase login:ci` |
| `FIREBASE_PROJECT_ID` | Project ID | Firebase Console |

### Optional Secrets

| Secret Name | Value | Purpose |
|------------|-------|---------|
| `SENTRY_DSN` | Sentry DSN URL | Error tracking (optional) |
| `VITE_ENVIRONMENT` | `production` or `staging` | Environment flag (optional) |

## How to Get Firebase Secrets

### 1. Get Firebase Configuration
```bash
# Navigate to Firebase Console
# Project: myfamilyhealth-fe7b5
# Settings → Project Settings → General
# Look for "Web API Key" configuration
```

Configuration example:
```javascript
{
  "apiKey": "AIzaSyAE_OnH_5v7o-tnjqKRK4xRYKwH5KW3jkE",
  "authDomain": "myfamilyhealth-fe7b5.firebaseapp.com",
  "projectId": "myfamilyhealth-fe7b5",
  "storageBucket": "myfamilyhealth-fe7b5.firebasestorage.app",
  "messagingSenderId": "1094951940065",
  "appId": "1:1094951940065:web:467ebff8a8c6518135aca0",
  "measurementId": "G-CKQXN26H8J"
}
```

### 2. Get Firebase CLI Token
```bash
# In terminal, run:
firebase login:ci

# Follow the browser prompt
# Copy the generated token
# This is your FIREBASE_CI_TOKEN
```

## Workflow Triggers

The GitHub Actions workflow (`deploy.yml`) is triggered by:

### Automatic Deployment (Production)
- **Push to `main` branch**: Builds, tests, and deploys to Firebase Hosting
- **Push to `develop` branch**: Builds and tests only (no deployment)

### Manual Trigger
- Click "Run workflow" on GitHub Actions tab

### Pull Request
- Builds and tests, with comment on PR showing build status

## Workflow Steps

### Build Job
1. ✅ Checkout code
2. ✅ Setup Node.js 20.x
3. ✅ Install dependencies (`npm ci`)
4. ✅ Create `.env.local` from secrets
5. ✅ Run linter (`npm run lint`)
6. ✅ Run tests (`npm test`)
7. ✅ Build application (`npm run build`)
8. ✅ Upload artifacts (dist folder)

### Deploy Job (main branch only)
1. ✅ Download build artifacts
2. ✅ Setup Firebase CLI
3. ✅ Deploy to Firebase Hosting
4. ✅ Comment PR with deployment info

### Security Scan Job
1. ✅ Run npm audit
2. ✅ Upload SBOM (Software Bill of Materials)

## Monitoring Deployments

### View Workflow Runs
1. Go to: `https://github.com/Phalgunab/HealthGene/actions`
2. Click on workflow run to see details
3. View logs for each job

### Check Deployment Status
1. Go to: `https://console.firebase.google.com`
2. Navigate to `Hosting` tab
3. View deployment history and logs

### Live Application
- **Production URL**: https://myfamilyhealth-fe7b5.web.app
- **Firebase Console**: https://console.firebase.google.com/project/myfamilyhealth-fe7b5/hosting

## Environment Variables

The workflow creates `.env.local` with these variables:

```
VITE_FIREBASE_API_KEY=***
VITE_FIREBASE_AUTH_DOMAIN=***
VITE_FIREBASE_PROJECT_ID=***
VITE_FIREBASE_STORAGE_BUCKET=***
VITE_FIREBASE_MESSAGING_SENDER_ID=***
VITE_FIREBASE_APP_ID=***
VITE_FIREBASE_MEASUREMENT_ID=***
VITE_ENVIRONMENT=production
VITE_USE_FIREBASE_EMULATOR=false
```

## Troubleshooting

### Build Fails
1. Check logs in GitHub Actions tab
2. Verify all secrets are configured
3. Ensure `package.json` build script exists
4. Check for syntax errors in code

### Deployment Fails
1. Verify Firebase CLI token (`FIREBASE_CI_TOKEN`)
2. Check Firebase project permissions
3. Ensure `firebase.json` is configured correctly
4. Review Firebase console for errors

### Tests Fail
1. Check test output in logs
2. Run `npm test` locally to reproduce
3. Update tests or code as needed

## Local Development

To test the build locally before pushing:

```bash
# Create .env.local with your secrets
cat > .env.local << 'EOF'
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
# ... (add all secrets)
EOF

# Build
npm run build

# Test deployment locally
firebase emulators:start
```

## Deployment Checklist

Before pushing to `main`:
- [ ] Code is tested locally
- [ ] `npm run build` succeeds
- [ ] No console errors
- [ ] Tests pass: `npm test`
- [ ] Linter passes: `npm run lint`
- [ ] Commit message is descriptive
- [ ] Branch is up to date with main

## Security Notes

⚠️ **Important**: Never commit secrets to the repository!

- ✅ Secrets are stored in GitHub's encrypted vault
- ✅ Secrets are only available to GitHub Actions runners
- ✅ Secrets are masked in logs
- ✅ Never log or print secrets

## Next Steps

1. Add the required secrets to GitHub repository
2. Push code to trigger the workflow
3. Monitor the GitHub Actions tab
4. Verify deployment at: https://myfamilyhealth-fe7b5.web.app

## Support

For issues with GitHub Actions:
1. Check workflow logs: GitHub → Actions tab
2. Review error messages carefully
3. Verify all secrets are configured
4. Check Firebase console for errors

---

**Workflow File**: `.github/workflows/deploy.yml`  
**Last Updated**: October 21, 2026  
**Status**: Active ✅
