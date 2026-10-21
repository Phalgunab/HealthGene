# 🚀 HealthGene GitHub Actions - Quick Start (5 Minutes)

## What Was Done ✅

Your HealthGene app is now configured for automatic deployment to Firebase Hosting using GitHub Actions.

**Status:** 🟡 Ready for Secrets Configuration

---

## 🔑 What You Need To Do (3 Simple Steps)

### STEP 1: Generate Firebase CI Token
```bash
# Run this command on your local machine
firebase login:ci

# It will open a browser window for authentication
# After login, copy the long token displayed
```

### STEP 2: Get Your Firebase Credentials
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your HealthGene project
3. Click **Project Settings** (gear icon)
4. Go to **Your apps** section
5. Click your Web app to expand it
6. Copy these 7 values:
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN` (should end with `.firebaseapp.com`)
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
   - `FIREBASE_MEASUREMENT_ID`

### STEP 3: Add to GitHub Secrets
1. Go to: `https://github.com/Phalgunab/HealthGene/settings/secrets/actions`
2. Click **"New repository secret"** button
3. For each of the 9 secrets below, create a new one:

| Secret Name | Value |
|-------------|-------|
| `FIREBASE_API_KEY` | Copy from Firebase Console |
| `FIREBASE_AUTH_DOMAIN` | Copy from Firebase Console |
| `FIREBASE_PROJECT_ID` | Copy from Firebase Console |
| `FIREBASE_STORAGE_BUCKET` | Copy from Firebase Console |
| `FIREBASE_MESSAGING_SENDER_ID` | Copy from Firebase Console |
| `FIREBASE_APP_ID` | Copy from Firebase Console |
| `FIREBASE_MEASUREMENT_ID` | Copy from Firebase Console |
| `FIREBASE_CI_TOKEN` | Paste the token from `firebase login:ci` |
| `VITE_ENVIRONMENT` | Type: `production` |

---

## ✅ Verify It Worked

After adding all 9 secrets:
- Go to Settings → Secrets and variables → Actions
- You should see 9 secrets with green checkmarks

---

## 🚀 Test Your Deployment

Once secrets are added:

```bash
# Push a small change to trigger the workflow
git add .
git commit -m "Test GitHub Actions deployment"
git push origin main
```

Then:
1. Go to: `https://github.com/Phalgunab/HealthGene/actions`
2. Watch the workflow run
3. When complete, visit: `https://YOUR-PROJECT.web.app`

---

## 📚 Need More Details?

- **Setup Guide:** See `GITHUB_ACTIONS_SETUP.md` (comprehensive)
- **Quick Commands:** See `GITHUB_ACTIONS_QUICK_REFERENCE.md`
- **Troubleshooting:** See `DEPLOYMENT_CHECKLIST.md`
- **Full Status:** See `DEPLOYMENT_COMPLETE.md`

---

## 🎯 What Happens After Deployment

After each push to main:
1. ✅ App builds automatically
2. ✅ Tests run
3. ✅ Security scan runs
4. ✅ Deployed to Firebase Hosting (1-2 minutes)
5. ✅ Live at `https://YOUR-PROJECT.web.app`

**No manual build steps needed!**

---

## 💡 Pro Tips

- The workflow runs on every push to `main` branch
- Pull requests trigger build but don't deploy
- You can manually trigger via "Run workflow" button
- Check GitHub Actions tab to see all deployment history
- Check Firebase Console for detailed deployment logs

---

## ⏱️ Estimated Time

- Adding 9 secrets: 5-10 minutes
- First deployment: 3-5 minutes
- **Total to go live: ~10-15 minutes**

---

**Ready? Start with STEP 1 above!** 🚀

For questions, refer to the detailed guides in the repository.
