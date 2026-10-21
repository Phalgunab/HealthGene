# HealthGene - Environment Setup Guide

## Before You Start

This project requires Firebase configuration. Follow these steps to set up your environment:

## Step 1: Create Your Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create a new project" or select existing
3. Fill in your project name (e.g., "myfamilyhealth")
4. Accept terms and create project
5. Wait for project initialization

## Step 2: Enable Firebase Services

1. In your Firebase project, enable:
   - **Authentication:**
     - Go to Authentication → Sign-in method
     - Enable: Google, Phone
   - **Firestore Database:**
     - Go to Firestore Database → Create Database
     - Choose: Production mode
     - Choose region: United States (us-central1) or closest to you
   - **Storage (Optional):**
     - For document uploads (if needed)

## Step 3: Get Your Firebase Configuration

1. In Firebase Console, click ⚙️ (Settings) → Project Settings
2. Scroll down to "Your apps" section
3. Click "Web app" (</> icon) if not already added
4. Copy your Firebase config (you'll see the object with apiKey, etc.)

## Step 4: Create .env.local File

1. In the project root directory, create a new file: `.env.local`
2. Copy the contents from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

3. Fill in the configuration from Step 3:
   ```
   VITE_FIREBASE_API_KEY=YOUR_API_KEY_HERE
   VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN_HERE
   VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID_HERE
   VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET_HERE
   VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID_HERE
   VITE_FIREBASE_APP_ID=YOUR_APP_ID_HERE
   VITE_FIREBASE_MEASUREMENT_ID=YOUR_MEASUREMENT_ID_HERE
   ```

**IMPORTANT:** The `.env.local` file is in `.gitignore` and will NOT be committed to git. This protects your credentials.

## Step 5: Install Dependencies

```bash
npm install
```

## Step 6: Run Development Server

```bash
npm run dev
```

Your app will be available at `http://localhost:5173`

## Step 7: Deploy Firebase Rules

Deploy the Firestore security rules:

```bash
firebase login
firebase deploy --only firestore:rules
```

If you don't have the Firebase CLI installed:
```bash
npm install -g firebase-tools
```

## Testing the Setup

After setup, test:

1. ✓ App loads without errors
2. ✓ Can sign in with Google or phone number
3. ✓ Can add health records
4. ✓ Records appear in your list
5. ✓ Can log out

## Production Deployment

When deploying to production:

1. **Set production environment variables** in your hosting provider
2. **Review Firestore rules** in production mode
3. **Enable HTTPS only** (automatic with modern hosts)
4. **Configure CORS** if needed
5. **Set up monitoring** (Sentry, Firebase Monitoring)
6. **Document privacy policy URL** in app

## Security Checklist

- [ ] `.env.local` is in `.gitignore` (never committed)
- [ ] Firebase API key is only in environment variables
- [ ] Firestore rules are deployed and restrictive
- [ ] Authentication methods are enabled (Google, Phone)
- [ ] HTTPS is enforced
- [ ] Privacy Policy and Terms are accessible
- [ ] Data retention policies are documented

## Troubleshooting

**"Firebase configuration missing" error:**
- Check `.env.local` exists and has all required keys
- Restart development server after creating `.env.local`
- Ensure keys are copied exactly from Firebase Console

**"Authentication not configured" error:**
- Go to Firebase Console → Authentication → Sign-in method
- Enable at least one method (Google recommended)
- Check "Authorized domains" includes your domain

**"Firestore rules error" when writing data:**
- Go to Firebase Console → Firestore Database → Rules
- Verify rules allow authenticated users to write
- Check user is actually authenticated

## Support

For help setting up Firebase:
- [Firebase Documentation](https://firebase.google.com/docs)
- [Firebase Authentication Setup](https://firebase.google.com/docs/auth)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)

---

**Version:** 1.0  
**Last Updated:** October 2026
