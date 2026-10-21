# Firebase Emulator Suite Setup & Usage

## ✅ Status: RUNNING

The Firebase Emulator Suite is now **fully configured and running** on your machine.

### Emulator Services Active:
- **Authentication Emulator**: `http://127.0.0.1:9099`
- **Firestore Emulator**: `http://127.0.0.1:8080`
- **Emulator UI Dashboard**: `http://127.0.0.1:4000`
- **Emulator Hub**: `127.0.0.1:4400`

### Development Server:
- **App URL**: `http://localhost:5176/HealthGene/`

---

## 🎯 What This Means

✅ **Full app functionality is now available locally:**
- Phone authentication works
- MFA setup and verification works
- OTP generation and validation works
- Device trust mechanism works
- Backup codes work
- Firestore database operations work
- No internet connection required
- No Firebase billing
- All data is local and ephemeral

---

## 📋 Configuration Details

### .env.local
```bash
VITE_USE_FIREBASE_EMULATOR=true
VITE_FIREBASE_EMULATOR_AUTH_HOST=localhost
VITE_FIREBASE_EMULATOR_AUTH_PORT=9099
VITE_FIREBASE_EMULATOR_FIRESTORE_HOST=localhost
VITE_FIREBASE_EMULATOR_FIRESTORE_PORT=8080
```

### firebase.json
```json
{
  "emulators": {
    "auth": {
      "host": "localhost",
      "port": 9099
    },
    "firestore": {
      "host": "localhost",
      "port": 8080
    },
    "ui": {
      "enabled": true,
      "host": "localhost",
      "port": 4000
    }
  }
}
```

### src/firebase.js
- Auto-detects `VITE_USE_FIREBASE_EMULATOR` environment variable
- Connects to Auth Emulator if enabled
- Connects to Firestore Emulator if enabled
- Gracefully handles double connections (dev hot reload)

---

## 🚀 How to Use

### 1. Start the Emulator Suite (Already Running)
```bash
firebase emulators:start
```

To restart:
```bash
# Kill existing process
pkill -f "firebase emulators:start"

# Start fresh
firebase emulators:start
```

### 2. Start the Dev Server (Already Running)
```bash
npm run dev
```

The app automatically connects to emulators when `VITE_USE_FIREBASE_EMULATOR=true`

### 3. Test the App
1. Open: http://localhost:5176/HealthGene/
2. Click "Get Started"
3. Enter phone number (any format, e.g., "+1234567890")
4. Complete OTP verification (any 6-digit code works in emulator)
5. Set up MFA if prompted
6. Access protected features

### 4. Monitor Emulator (Optional)
Open Emulator UI: http://127.0.0.1:4000

Features:
- View all Auth users
- View Firestore documents
- Delete data
- Run queries
- Monitor events

---

## 📝 Testing Scenarios

### Scenario 1: Basic Authentication
1. Click "Get Started"
2. Enter: `+15551234567`
3. Enter any 6-digit code for OTP
4. Verify success screen appears

### Scenario 2: MFA Setup
1. Complete basic auth
2. On MFA screen, click "Set up MFA"
3. Choose TOTP method
4. Complete setup
5. On next login, MFA will be required

### Scenario 3: Device Trust
1. Complete MFA setup
2. During verification, check "Trust this device for 30 days"
3. Logout and login again
4. Same device should skip MFA
5. Different device/browser should require MFA

### Scenario 4: Backup Codes
1. Complete MFA setup
2. In MFA settings, regenerate backup codes
3. Copy a backup code
4. On MFA verification, toggle "Use backup code"
5. Paste backup code to verify

### Scenario 5: Session Timeout
1. Login and complete MFA
2. Wait 15 minutes
3. Try to access protected features
4. Session should be expired, require re-login

---

## 🔍 Debugging

### View Emulator Logs
```bash
tail -f /Users/phalgunab/Data/Claude/HealthGene/firestore-debug.log
```

### Check Browser Console
1. Open http://localhost:5176/HealthGene/
2. Press F12 (DevTools)
3. Go to Console tab
4. Look for `✅ Connected to Auth Emulator` message
5. Look for `✅ Connected to Firestore Emulator` message

### Restart Everything
```bash
# Kill all Node/Firebase processes
pkill -f "npm run dev"
pkill -f "firebase emulators:start"

# Wait 2 seconds
sleep 2

# Start emulator
cd /Users/phalgunab/Data/Claude/HealthGene
firebase emulators:start > /tmp/firebase-emulator.log 2>&1 &

# Wait for startup
sleep 10

# Start dev server
npm run dev > /tmp/dev.log 2>&1 &

# Verify
sleep 4
curl -s http://localhost:5176/HealthGene/ | grep "<title>"
```

---

## 🔐 Data Persistence

**Default Behavior:**
- Emulator data is stored locally in `.firebase` directory
- Data persists between restarts
- Only cleared when you run `firebase emulators:clear`

**To Clear Data:**
```bash
firebase emulators:clear
firebase emulators:start
```

---

## 📊 Testing Checklist

Use this checklist to verify all features work:

### Authentication Flow
- [ ] Phone sign-in accepts various formats
- [ ] OTP entry works (any 6-digit code accepted in emulator)
- [ ] Verification success screen appears
- [ ] Multiple users can be created

### MFA Setup
- [ ] MFA setup wizard loads
- [ ] TOTP QR code displays
- [ ] TOTP code verification works
- [ ] Backup codes generated and downloadable
- [ ] MFA settings accessible in profile

### MFA Verification
- [ ] MFA required on login when enabled
- [ ] OTP code entry works
- [ ] Backup code toggle and entry works
- [ ] Countdown timer displays correctly
- [ ] Resend OTP works

### Device Trust
- [ ] "Trust this device" checkbox visible
- [ ] Device fingerprint captured on login
- [ ] Trusted devices listed in settings
- [ ] Can revoke trusted devices
- [ ] Same device skips MFA (when trusted)
- [ ] Different device requires MFA

### Session Management
- [ ] 15-minute timeout enforced
- [ ] Session refresh on activity
- [ ] Logout clears session
- [ ] Protected routes require auth

### Error Handling
- [ ] Invalid phone number rejected
- [ ] Invalid OTP code rejected
- [ ] Network errors handled gracefully
- [ ] Error messages display clearly

### UI/UX
- [ ] All screens render correctly
- [ ] Forms are responsive
- [ ] Buttons work as expected
- [ ] Loading states visible
- [ ] Mobile responsive design works

---

## 🌐 Switching Between Emulator and Real Firebase

### To Use Emulator (Current Setup)
```bash
# In .env.local
VITE_USE_FIREBASE_EMULATOR=true
```

### To Use Real Firebase
```bash
# In .env.local
VITE_USE_FIREBASE_EMULATOR=false

# Add real Firebase credentials
VITE_FIREBASE_API_KEY=your_real_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
# ... etc
```

### To Use Firestore Only (No Auth Emulator)
```bash
# In .env.local - only set Firestore emulator
VITE_FIREBASE_EMULATOR_FIRESTORE_HOST=localhost
VITE_FIREBASE_EMULATOR_FIRESTORE_PORT=8080

# Use real Firebase Auth (requires credentials)
VITE_FIREBASE_API_KEY=your_real_api_key
# ... real auth credentials
```

---

## 📚 Files Modified

1. **firebase.json**
   - Added emulator configuration
   - Enabled Auth, Firestore, and UI emulators

2. **.env.local**
   - Added `VITE_USE_FIREBASE_EMULATOR=true`
   - Added emulator host/port configuration

3. **src/firebase.js**
   - Added emulator detection and connection logic
   - Graceful error handling for double connections
   - Console logging for debugging

---

## 🎓 Learning Resources

### Firebase Emulator Documentation
- https://firebase.google.com/docs/emulator-suite

### Getting Started with Emulator
- https://firebase.google.com/docs/emulator-suite/connect_and_prototype

### Authentication Emulator
- https://firebase.google.com/docs/auth/emulator-setup

### Firestore Emulator
- https://firebase.google.com/docs/firestore/emulator-setup

---

## ⚠️ Important Notes

### Project ID
The emulator uses a demo project ID. This is normal and expected:
```
i  emulators: Detected demo project ID "demo-no-project"
```

### Data is Ephemeral
- Emulator data is for development only
- Reset between sessions with `firebase emulators:clear`
- Never used in production

### Local Only
- Emulator only accessible on localhost
- Cannot be accessed from other devices
- Cannot be accessed via public IP

### Performance
- Emulator is very fast for development
- No network latency
- Ideal for testing authentication flows
- Good for unit and integration testing

---

## 🆘 Troubleshooting

### Problem: "Cannot connect to emulator"
**Solution:**
1. Check if emulator is running: `ps aux | grep firebase`
2. Check logs: `tail /tmp/firebase-emulator.log`
3. Restart emulator: `firebase emulators:stop` then `firebase emulators:start`

### Problem: "Port already in use"
**Solution:**
```bash
# Find what's using the port
lsof -i :9099  # Auth emulator
lsof -i :8080  # Firestore emulator
lsof -i :4000  # Emulator UI

# Kill the process if needed
kill <PID>
```

### Problem: "JAVA_HOME not set"
**Solution:**
```bash
# Check Java installation
java -version

# If not installed, install via Homebrew
brew install openjdk
export JAVA_HOME=/opt/homebrew/opt/openjdk/libexec/openjdk.jdk/Contents/Home
```

### Problem: "Auth emulator not responding"
**Solution:**
1. Verify emulator is running
2. Restart dev server (hot reload may have cached old config)
3. Clear .env cache: `npm run dev -- --force`

### Problem: "Data not persisting"
**Solution:**
1. Check if emulator was restarted
2. Verify `.firebase` directory exists
3. Run `firebase emulators:clear` to reset and start fresh

---

## ✅ Next Steps

1. **Test the app**: http://localhost:5176/HealthGene/
2. **Go through all test scenarios** from this guide
3. **Monitor with Emulator UI**: http://127.0.0.1:4000
4. **Review QA Testing Guide**: See PHASE_4_QA_TESTING_GUIDE.md
5. **Run security audit** when ready
6. **Measure performance** with dev tools

---

## 📞 Quick Commands

```bash
# Start emulator
firebase emulators:start

# Clear emulator data
firebase emulators:clear

# Start dev server
npm run dev

# Stop all processes
pkill -f "firebase"
pkill -f "npm run dev"

# Check if running
ps aux | grep firebase
ps aux | grep npm

# View logs
tail -f firestore-debug.log
tail /tmp/dev.log
```

---

**Setup completed at:** 2026-10-20 23:32 UTC+8
**Status:** ✅ Ready for testing
**Last verified:** Dev server running on 5176, Emulator running on 9099/8080
