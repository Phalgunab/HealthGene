# Firebase Configuration Guide

## Current Status

✅ `.env.local` created with placeholder credentials for development testing

## ⚠️ Important: Real Credentials Required

The placeholder credentials in `.env.local` are **dummy values for testing only**. To properly test the app:

### Option 1: Use Real Firebase Project (Recommended for Production)

1. **Create a Firebase Project**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Click "Create a project" or "Add project"
   - Enter project name: `HealthGene` or similar
   - Enable Google Analytics (optional)

2. **Enable Authentication Methods**
   - In Firebase Console, go to **Authentication**
   - Click **Sign-in method**
   - Enable:
     - ✅ **Phone** (required for HealthGene)
     - ✅ **Google** (optional, for future integration)

3. **Create Web App & Get Credentials**
   - In Firebase Console, go to **Project Settings** (gear icon)
   - Scroll down to "Your apps"
   - Click **Add app** → **Web** (`</>`icon)
   - Register app (name: `HealthGene` or similar)
   - Copy the Firebase config object

4. **Update `.env.local`**
   ```bash
   # Copy from Firebase console to .env.local
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789abcdef
   VITE_FIREBASE_MEASUREMENT_ID=G-ABCDEFGHIJ
   ```

5. **Enable Firestore Database**
   - In Firebase Console, go to **Firestore Database**
   - Click **Create database**
   - Start in **Test mode** (for development)
   - Choose region closest to you
   - Click **Create**

6. **Configure Phone Number Sign-In**
   - In Firebase Console, go to **Authentication** → **Sign-in method**
   - Click on **Phone**
   - Enable reCAPTCHA verification (you'll need to set this up separately)

### Option 2: Use Firebase Emulator Suite (Local Development)

For completely local testing without internet:

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Initialize Firebase in your project**
   ```bash
   firebase login
   firebase init emulators
   ```

3. **Enable emulators** in `.env.local`
   ```bash
   VITE_FIREBASE_EMULATOR_HOST=localhost:9099
   ```

4. **Start emulator**
   ```bash
   firebase emulators:start
   ```

## Testing the Configuration

### With Placeholder Credentials (Current)
- ✅ App loads without errors
- ✅ UI renders correctly
- ❌ Firebase operations will fail (auth, Firestore)
- ✅ Good for testing UI/UX only

### With Real Firebase Credentials
- ✅ Full app functionality
- ✅ Real authentication works
- ✅ Real Firestore database
- ⚠️ Uses real Firebase project quota

### With Firebase Emulator
- ✅ Full app functionality
- ✅ No internet required
- ✅ Free (runs locally)
- ✅ Best for development

## Security: Never Commit `.env.local`

✅ `.env.local` is already in `.gitignore`

Verify:
```bash
grep ".env.local" .gitignore
```

Should output: `.env.local`

## Troubleshooting

### "Firebase configuration missing" error
- Solution: Create `.env.local` from `.env.example` ✅ (Done)

### "API key not valid" error
- **With Placeholder Credentials**: Expected! App still loads, Firebase calls fail gracefully
- **With Real Credentials**: Check Firebase console that API key is correct
- **With Emulator**: Make sure `firebase emulators:start` is running

### "Phone sign-in not configured"
- Solution: Go to Firebase Console → Authentication → Sign-in method → Phone
- Ensure phone is enabled and configured

### "Firestore permission denied"
- Solution: Use Test mode (Development) for now
- For Production: Update security rules (see FIRESTORE_SECURITY_RULES.txt)

## Next Steps

1. ✅ Development: Keep placeholder credentials for UI testing
2. For Testing: Set up real Firebase credentials (Option 1)
3. For Local Development: Use Firebase Emulator (Option 2)
4. For Production: Use hardened Firebase with proper security rules

## Environment Variables Explained

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_FIREBASE_API_KEY` | API authentication key | `AIzaSyD...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain | `project.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Google Cloud project ID | `my-project` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket | `project.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase app ID | `1:123...:web:abc...` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics ID | `G-ABC...` |

## References

- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Web Setup](https://firebase.google.com/docs/web/setup)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
- [HealthGene MFA Implementation](./PHASE_3_DAY_1.md)
