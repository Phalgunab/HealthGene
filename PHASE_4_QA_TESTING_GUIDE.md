#!/bin/bash
# Phase 4: QA Testing Execution Script
# This script guides manual testing of all Phase 3 MFA scenarios

cat << 'EOF'

╔════════════════════════════════════════════════════════════════════════════╗
║                    PHASE 4: QA TESTING & VERIFICATION                     ║
║                                                                            ║
║  This guide will walk you through testing all Phase 3 MFA functionality    ║
║  Start by running: npm run dev                                            ║
║  Then open: http://localhost:5173                                         ║
╚════════════════════════════════════════════════════════════════════════════╝

═══════════════════════════════════════════════════════════════════════════════
PREREQUISITE: Start Development Server
═══════════════════════════════════════════════════════════════════════════════

Run in terminal:
  npm run dev

Then open in browser:
  http://localhost:5173

Keep browser DevTools open (F12) to check for console errors/warnings.

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 1: NEW USER SIGNUP WITH MFA
═══════════════════════════════════════════════════════════════════════════════

Duration: 5-10 minutes
Prerequisites: Development server running

STEPS:
1. Click "Get started" button
2. Enter phone number: +1 555-0001
3. Handle reCAPTCHA verification
4. Wait for SMS code (check browser console for test code)
5. Enter 6-digit verification code
6. Expected: Should check MFA status
   - If MFA enabled: Show OTP verification screen
   - If MFA disabled: Show success screen directly

VERIFICATION CHECKLIST:
□ Phone input accepts valid formats
□ Country code selector works
□ reCAPTCHA challenge appears
□ SMS code received (check console)
□ Verification code input accepts 6 digits only
□ After entering code, MFA check happens
□ Appropriate screen shown (mfa-verify or success)
□ No console errors
□ Load time < 3 seconds
□ No memory issues

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 2: USER WITHOUT MFA (DIRECT ACCESS)
═══════════════════════════════════════════════════════════════════════════════

Duration: 5 minutes
Prerequisites: User account without MFA enabled

STEPS:
1. Go to "I already have an account"
2. Enter phone number: +1 555-0002 (account without MFA)
3. Complete SMS verification
4. Expected: Should skip MFA and go directly to success screen
   (No OTP verification screen should appear)

VERIFICATION CHECKLIST:
□ Phone verification completes
□ MFA verification screen does NOT appear
□ Success screen appears immediately
□ Access granted to app
□ No console errors
□ No delays in flow

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 3: MFA VERIFICATION WITH OTP
═══════════════════════════════════════════════════════════════════════════════

Duration: 5-10 minutes
Prerequisites: User with MFA enabled

STEPS:
1. Login with user that has MFA enabled
2. Complete phone verification
3. MFA verification screen appears
4. Expected: Show 6-digit OTP input with 5-minute countdown
5. Check console for OTP code (test mode)
6. Enter OTP code
7. Click "Verify and continue"
8. Expected: Success screen appears

VERIFICATION CHECKLIST:
□ MFA verification screen appears after phone verification
□ OTP input placeholder shows: • • • • • •
□ Countdown timer counts down from 5 minutes
□ Attempt counter shows 1/5
□ OTP input accepts 6 digits only
□ Entering correct OTP verifies successfully
□ Success screen appears
□ Device trust checkbox visible
□ No console errors

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 4: OTP VERIFICATION FAILURE & RETRY
═══════════════════════════════════════════════════════════════════════════════

Duration: 5 minutes
Prerequisites: MFA verification screen showing

STEPS:
1. At OTP verification screen
2. Enter wrong 6-digit code (e.g., 000000)
3. Click "Verify and continue"
4. Expected: Error message appears
5. Attempt counter increments to 2/5
6. Try again with correct OTP
7. Expected: Verification succeeds

VERIFICATION CHECKLIST:
□ Wrong OTP shows error message
□ Error message is clear and helpful
□ Attempt counter increments (1/5 → 2/5)
□ User can retry immediately
□ Correct OTP works after wrong attempts
□ No console errors
□ Error message does NOT show OTP value

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 5: BACKUP CODE FALLBACK
═══════════════════════════════════════════════════════════════════════════════

Duration: 5-10 minutes
Prerequisites: MFA verification screen, known backup code

STEPS:
1. At OTP verification screen
2. Click "Use Backup Code Instead" (or similar link)
3. Input field changes to accept 8-character backup code
4. Enter a backup code from user's saved codes
5. Click "Verify"
6. Expected: Verification succeeds, device trust checkbox appears
7. Optionally check "Trust this device"
8. Click "Continue"
9. Expected: Success screen appears

VERIFICATION CHECKLIST:
□ Backup code option is visible/clickable
□ Input switches to backup code mode
□ Accepts 8-character alphanumeric codes
□ Backup code verifies successfully
□ Device trust checkbox visible
□ Accepting trust device works
□ Success screen appears
□ No console errors

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 6: DEVICE TRUST CHECKBOX
═══════════════════════════════════════════════════════════════════════════════

Duration: 5 minutes
Prerequisites: MFA verification successful

STEPS:
1. After OTP verification succeeds
2. Device trust checkbox visible: "Trust this device for 30 days"
3. Check the checkbox
4. Click "Continue"
5. Expected: Device saved to trusted devices list
6. Success screen appears
7. Logout and login again from same device
8. Expected: MFA should be skipped (device trusted)

VERIFICATION CHECKLIST:
□ Checkbox visible and clickable
□ Checkbox label is clear
□ Checking box doesn't cause errors
□ Clicking "Continue" saves device
□ No console errors
□ On next login from same device: MFA skipped
□ Success screen appears immediately
□ Trust persists across sessions

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 7: RATE LIMITING (5 FAILED ATTEMPTS)
═══════════════════════════════════════════════════════════════════════════════

Duration: 10 minutes
Prerequisites: MFA verification screen showing

STEPS:
1. At OTP verification screen
2. Enter wrong code 5 times (000000, 111111, 222222, etc.)
3. After 5th failed attempt:
   Expected: "Maximum attempts exceeded" message
   Expected: Cooldown message "Try again in 59 minutes"
   Expected: Verify button disabled
4. Try to enter 6th code:
   Expected: Cannot submit (button disabled)
5. Try backup code instead:
   Expected: Works (backup codes not affected by OTP rate limit)

VERIFICATION CHECKLIST:
□ First 4 failed attempts show error, allow retry
□ Attempt counter increments (1/5 → 5/5)
□ On 5th failure, maximum attempts exceeded message appears
□ Cooldown message appears (1 hour)
□ "Verify and continue" button becomes disabled
□ Cannot enter more OTP attempts
□ Backup code option still available
□ Backup code works (rate limit only for OTP)
□ No console errors

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 8: EXPIRED OTP (5 MINUTE TIMEOUT)
═══════════════════════════════════════════════════════════════════════════════

Duration: 6 minutes
Prerequisites: MFA verification screen showing

STEPS:
1. At OTP verification screen
2. Watch countdown timer (starts at 5:00)
3. Wait 5 minutes or until timer reaches 0:00
4. Expected: "OTP has expired" message appears
5. Click "Resend OTP"
6. Expected: New OTP sent, timer resets to 5:00

VERIFICATION CHECKLIST:
□ Countdown timer visible and accurate
□ Timer counts down properly
□ At 5:00 expiration, clear error message
□ "Resend OTP" button available
□ Clicking resend sends new OTP
□ Timer resets to 5:00
□ New OTP is different from old OTP
□ No console errors

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 9: RESEND OTP
═══════════════════════════════════════════════════════════════════════════════

Duration: 5 minutes
Prerequisites: MFA verification screen showing

STEPS:
1. At OTP verification screen
2. Click "Didn't receive code? Resend"
3. Expected: New OTP sent (check console)
4. Expected: Cooldown message or success notification
5. Use new OTP code
6. Enter and verify
7. Expected: Verification succeeds

VERIFICATION CHECKLIST:
□ Resend button is visible and clickable
□ Clicking resend triggers new OTP
□ New OTP different from previous
□ Success notification shown
□ New OTP works for verification
□ Attempt counter resets on resend
□ No console errors
□ Resend works multiple times

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
SCENARIO 10: SETTINGS - MANAGE MFA & TRUSTED DEVICES
═══════════════════════════════════════════════════════════════════════════════

Duration: 10 minutes
Prerequisites: User logged in with MFA and trusted device

STEPS:
1. Go to Profile → Settings (or similar)
2. Look for "Two-Factor Authentication" option
3. Click to open MFA settings
4. Expected: MFA status card showing "Enabled"
5. Tab: "Trusted Devices"
   - Should see previously trusted device
   - Device shows name/date
   - "Remove" button available
6. Click "Remove" on trusted device
7. Expected: Device removed from list
8. Logout and login again
9. Expected: MFA verification required (device no longer trusted)

VERIFICATION CHECKLIST:
□ Settings page accessible
□ MFA settings tab visible
□ MFA status correctly shows
□ Trusted devices list visible
□ Previous device shown in list
□ Device info (name, date) displayed
□ "Remove" button works
□ Device immediately removed
□ Next login requires MFA again
□ No console errors

PASS/FAIL: ___________

═══════════════════════════════════════════════════════════════════════════════
VERIFICATION CHECKLIST (General)
═══════════════════════════════════════════════════════════════════════════════

SECURITY:
□ No OTP values in console logs
□ No backup codes in console logs
□ No passwords in error messages
□ All sensitive data encrypted
□ No timing attacks possible (constant-time comparison)
□ Firestore security rules enforced

PERFORMANCE:
□ Phone verification: < 3 seconds
□ MFA screen load: < 1 second
□ OTP verification: < 2 seconds
□ No memory leaks during login
□ No memory leaks during MFA
□ Bundle size acceptable (< 400 KB gzipped)
□ No layout shifts (CLS)
□ Smooth animations

USABILITY:
□ Clear error messages
□ Helpful guidance text
□ Logical flow
□ Easy to use on mobile
□ Easy to use on desktop
□ Clear visual hierarchy
□ No broken UI
□ Responsive design

COMPATIBILITY:
□ Works on Chrome
□ Works on Safari
□ Works on Firefox
□ Works on iOS
□ Works on Android
□ Works on older browsers
□ Works offline gracefully

═══════════════════════════════════════════════════════════════════════════════
FINAL SIGN-OFF
═══════════════════════════════════════════════════════════════════════════════

Total Scenarios Passed: _____ / 10
Total Scenarios Failed: _____ / 10

Critical Issues Found:
1. ___________________________________________________________
2. ___________________________________________________________
3. ___________________________________________________________

Medium Issues Found:
1. ___________________________________________________________
2. ___________________________________________________________

Low Issues Found:
1. ___________________________________________________________
2. ___________________________________________________________

Overall Status:
□ PASS (All scenarios passed, no critical issues)
□ PASS WITH NOTES (Minor issues to fix)
□ FAIL (Critical issues found, must fix)

QA Lead Signature: ________________________  Date: __________

═══════════════════════════════════════════════════════════════════════════════

NEXT STEPS:
1. Fix any issues found
2. Re-test failed scenarios
3. Run security audit
4. Run performance testing
5. Deploy to staging
6. Load test with 1000+ users

═══════════════════════════════════════════════════════════════════════════════

EOF
