# Quick Command Reference - GitHub Actions Deployment

## 🚀 One-Time Setup (Run Locally)

```bash
# Step 1: Generate Firebase CI Token
firebase login:ci

# Copy the token that appears - you'll need it for GitHub Secrets

# Step 2: Verify your Firebase credentials locally
cat .env.local
# Should have all FIREBASE_* variables filled

# Step 3: Test build locally
npm install
npm run build
npm run lint --if-present

# Step 4: Verify Firebase config
firebase projects:list
firebase hosting:sites:list

# Step 5: Push code to GitHub
git add .
git commit -m "Set up GitHub Actions deployment"
git push origin main
```

---

## 📋 GitHub Secrets Setup Checklist

Go to: `https://github.com/YOUR-USERNAME/HealthGene/settings/secrets/actions`

Add these secrets:

```
✅ FIREBASE_API_KEY
   Value: Your real Firebase API key from Console

✅ FIREBASE_AUTH_DOMAIN  
   Value: healthgene-xxx.firebaseapp.com

✅ FIREBASE_PROJECT_ID
   Value: Your Firebase project ID

✅ FIREBASE_STORAGE_BUCKET
   Value: healthgene-xxx.appspot.com

✅ FIREBASE_MESSAGING_SENDER_ID
   Value: Your sender ID number

✅ FIREBASE_APP_ID
   Value: Your Firebase app ID

✅ FIREBASE_MEASUREMENT_ID
   Value: G-XXXXX (Google Analytics ID)

✅ FIREBASE_CI_TOKEN
   Value: Token from firebase login:ci command

✅ SENTRY_DSN (Optional)
   Value: Your Sentry DSN or leave empty

✅ VITE_ENVIRONMENT
   Value: production
```

---

## 🔄 Deployment Workflow

### Automatic (Push to Main)

```bash
# 1. Make changes
git add .
git commit -m "Feature: Add new capability"

# 2. Push to main
git push origin main

# 3. GitHub Actions automatically:
#    - Builds the app
#    - Runs tests
#    - Runs security scan
#    - Deploys to Firebase Hosting
#    - Updates live app at YOUR-PROJECT.web.app
```

### Manual Trigger

1. Go to: `https://github.com/YOUR-USERNAME/HealthGene/actions`
2. Click **Build and Deploy HealthGene**
3. Click **Run workflow**
4. Select branch (main or develop)
5. Click **Run workflow**

---

## 📊 Monitor Deployment

### In GitHub

1. Go to **Actions** tab in your repository
2. Click latest workflow run
3. View logs in real-time
4. Check individual steps for errors

### In Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click **Hosting** in left sidebar
4. View deployment history and status

### Check Live App

Visit your live app:
- **URL:** `https://YOUR-PROJECT.web.app`
- **Alt URL:** `https://YOUR-PROJECT.firebaseapp.com`

---

## 🔧 Troubleshooting

### Build Fails - Check These

```bash
# 1. Verify secrets are added to GitHub
#    Go to Settings → Secrets and variables → Actions

# 2. Test build locally
npm ci
npm run build

# 3. Check for TypeScript errors
npm run build 2>&1 | grep -i error

# 4. Verify .env.local has correct values
cat .env.local | grep VITE_FIREBASE
```

### Deployment Fails - Check These

```bash
# 1. Verify Firebase token is valid
firebase projects:list

# 2. Check Firebase hosting is enabled
firebase hosting:sites:list

# 3. Verify Firestore rules syntax
firebase deploy --only firestore:rules --dry-run

# 4. Check deployment status
firebase hosting:channel:list
```

### "Secret not found" Error

**Solution:**
1. Verify secret name is correct (case-sensitive!)
2. Check secret was saved properly
3. Verify GitHub Actions has permission to read secrets
4. Regenerate secret and try again

### "Build size exceeds limit"

**Solution:**
```bash
# Analyze bundle
npm run build
npm install -g source-map-explorer
source-map-explorer dist/assets/*.js

# Or check output
du -sh dist/
find dist -type f -exec ls -lh {} \; | sort -k5 -h | tail -20
```

---

## 📈 Monitoring & Maintenance

### Weekly Checks

```bash
# Update dependencies
npm outdated
npm update

# Audit security
npm audit
npm audit fix

# Test locally
npm run build
npm test

# Push improvements
git add .
git commit -m "Chore: Update dependencies and security patches"
git push origin main
```

### Monthly Tasks

1. Rotate Firebase CI token
   ```bash
   firebase login:ci
   # Update FIREBASE_CI_TOKEN secret in GitHub
   ```

2. Review deployment logs
3. Check Firebase usage and costs
4. Monitor error tracking (Sentry)
5. Update security headers if needed

---

## 🚀 Performance Tips

### Optimize Deployment Speed

1. **Use `npm ci` instead of `npm install`**
   - Already in workflow ✅

2. **Enable npm cache**
   - Already configured in workflow ✅

3. **Parallel jobs**
   - Security scan runs in parallel ✅

4. **Artifact retention**
   - Set to 7 days (change if needed)

### Optimize App Performance

```bash
# Check bundle size
npm run build
echo "Bundle size:"
du -sh dist/assets/

# Analyze what's in bundle
npm install -D @vite/plugin-visualizer
# Then use in vite.config.js

# Check performance
npm audit
npm outdated
```

---

## 🔐 Security Checklist

- ✅ Never commit `.env.local`
- ✅ Use GitHub Secrets for all credentials
- ✅ Rotate Firebase CI token every 3 months
- ✅ Use strong GitHub account password
- ✅ Enable 2FA on GitHub
- ✅ Review deployment logs for suspicious activity
- ✅ Keep dependencies updated
- ✅ Run security audits before deployment

---

## 📞 Emergency Procedures

### Stop Deployment

```bash
# Go to GitHub Actions and cancel running workflow
# Or disable the workflow temporarily:
git push origin develop  # Push to develop (no auto-deploy)
```

### Rollback to Previous Version

```bash
# In GitHub
git revert HEAD
git push origin main

# Or in Firebase Console
# Click previous deployment and restore
```

### Emergency Hotfix

```bash
# Create hotfix branch
git checkout -b hotfix/critical-issue

# Fix the issue
# ... make changes ...

# Test locally
npm run build
npm test

# Commit and push
git add .
git commit -m "Hotfix: critical bug"
git push origin hotfix/critical-issue

# Create Pull Request → Merge → Auto-deploys to main
```

---

## 📚 Useful URLs

| Resource | Link |
|----------|------|
| GitHub Actions | https://github.com/YOUR-USERNAME/HealthGene/actions |
| GitHub Secrets | https://github.com/YOUR-USERNAME/HealthGene/settings/secrets/actions |
| Firebase Console | https://console.firebase.google.com |
| Firebase Hosting | https://console.firebase.google.com/project/YOUR-PROJECT/hosting |
| Live App | https://YOUR-PROJECT.web.app |
| Workflow File | `.github/workflows/deploy.yml` |

---

## ✅ Verification Checklist

After setup, verify everything works:

- [ ] Repository is public or you have GitHub Actions enabled
- [ ] All secrets are added to GitHub
- [ ] `.github/workflows/deploy.yml` exists
- [ ] `firebase.json` is configured
- [ ] `.env.local` is in `.gitignore`
- [ ] Build succeeds locally (`npm run build`)
- [ ] Tests pass locally (`npm test`)
- [ ] First workflow run completed successfully
- [ ] Live app is accessible at Firebase Hosting URL
- [ ] Security headers are present (check DevTools)

---

**Setup completed:** 2026-10-20 23:42 UTC+8
**Next review:** 2026-10-27
