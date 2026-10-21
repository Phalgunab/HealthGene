# Phase 4: Production Infrastructure Setup Guide

**Status:** 🟡 IN PROGRESS
**Target:** All configured before production deployment
**Timeline:** 1 week

---

## 1. SMS Provider Setup

### Option 1: Firebase Phone Authentication (RECOMMENDED - Built-in)

**Already Enabled:** Firebase Phone Auth is built into the project

**What's Already Done:**
✅ Firebase Auth configured
✅ Phone sign-in enabled
✅ SMS auto-retrieval enabled (Android)
✅ reCAPTCHA integrated

**Manual Testing:**
```bash
npm run dev
# Open http://localhost:5173
# Test phone verification flow
# SMS code appears in browser console (test mode)
```

**Production Setup:**
1. Go to Firebase Console → Authentication
2. Check "Phone" is enabled
3. Verify SMS template (optional customization)
4. Set up phone numbers whitelist (for testing, optional)
5. Deploy to production

**Costs:**
- First 20 phone authentications/day: FREE
- Additional: ~$0.015 per SMS verification

---

### Option 2: Twilio (Standalone SMS)

**Setup Steps:**

1. **Create Twilio Account**
   ```
   Go to: https://www.twilio.com/console
   Sign up or login
   Note Account SID and Auth Token
   ```

2. **Get Phone Number**
   ```
   Console → Phone Numbers → Manage → Buy a Number
   Choose country (e.g., +1 for US)
   Cost: ~$1/month
   ```

3. **Install Twilio SDK**
   ```bash
   npm install twilio
   ```

4. **Update mfaHelper.js**
   ```javascript
   import twilio from 'twilio';
   
   const accountSid = process.env.TWILIO_ACCOUNT_SID;
   const authToken = process.env.TWILIO_AUTH_TOKEN;
   const fromNumber = process.env.TWILIO_PHONE_NUMBER;
   
   const client = twilio(accountSid, authToken);
   
   export async function sendOTPViaTwilio(phoneNumber, otp) {
     try {
       const message = await client.messages.create({
         body: `Your HealthGene verification code: ${otp}`,
         from: fromNumber,
         to: phoneNumber
       });
       return { success: true, messageId: message.sid };
     } catch (error) {
       return { success: false, error: error.message };
     }
   }
   ```

5. **Configure Environment Variables**
   ```
   .env.local:
   VITE_TWILIO_ACCOUNT_SID=your_account_sid
   VITE_TWILIO_AUTH_TOKEN=your_auth_token
   VITE_TWILIO_PHONE_NUMBER=+1234567890
   ```

6. **Test**
   ```bash
   npm run dev
   # OTP should be sent via SMS (not just console)
   ```

**Costs:**
- Outbound SMS: ~$0.01 per SMS

---

### Option 3: AWS SNS (Enterprise)

**Setup Steps:**

1. **Create AWS Account** (if not existing)
   - Go to https://aws.amazon.com
   - Sign up
   - Set up billing

2. **Create SNS Topic**
   ```
   AWS Console → SNS → Create topic
   Name: healthgene-otp
   ```

3. **Get Credentials**
   ```
   AWS Console → IAM → Create user
   Permissions: SNS publish
   Get Access Key & Secret Key
   ```

4. **Install AWS SDK**
   ```bash
   npm install @aws-sdk/client-sns
   ```

5. **Update mfaHelper.js**
   ```javascript
   import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
   
   const snsClient = new SNSClient({ 
     region: process.env.AWS_REGION 
   });
   
   export async function sendOTPViaSNS(phoneNumber, otp) {
     const params = {
       Message: `Your HealthGene verification code: ${otp}`,
       PhoneNumber: phoneNumber,
     };
     
     try {
       const command = new PublishCommand(params);
       const result = await snsClient.send(command);
       return { success: true, messageId: result.MessageId };
     } catch (error) {
       return { success: false, error: error.message };
     }
   }
   ```

6. **Test**
   ```bash
   npm run dev
   # SMS should be sent via AWS SNS
   ```

**Costs:**
- SMS to US: ~$0.00645 per SMS
- Volume discounts available

---

## 2. Email Provider Setup

### Option 1: Firebase Admin SDK (Built-in)

**Already Available:** Firebase Cloud Functions can send email

**Note:** Requires Cloud Functions setup

**Setup:**
1. Install Firebase CLI
   ```bash
   npm install -g firebase-tools
   firebase login
   ```

2. Create Cloud Function
   ```bash
   firebase init functions
   ```

3. Write function to send email
   ```javascript
   // functions/index.js
   const nodemailer = require('nodemailer');
   const functions = require('firebase-functions');
   
   const transporter = nodemailer.createTransport({
     // Configure Gmail/other SMTP
   });
   
   exports.sendOTPEmail = functions.https.onCall(async (data) => {
     const { email, otp } = data;
     
     const mailOptions = {
       from: 'noreply@healthgene.com',
       to: email,
       subject: 'Your HealthGene Verification Code',
       html: `Your OTP: ${otp}`
     };
     
     return transporter.sendMail(mailOptions);
   });
   ```

---

### Option 2: SendGrid (Recommended - Easy Setup)

**Setup Steps:**

1. **Create SendGrid Account**
   ```
   Go to: https://sendgrid.com
   Sign up with email
   Verify email
   ```

2. **Create API Key**
   ```
   Settings → API Keys → Create API Key
   Name: HealthGene OTP
   Permissions: Mail Send
   Copy and save key
   ```

3. **Verify Sender Email**
   ```
   Sender Authentication → Verify a Single Sender
   Use: noreply@yourdomain.com (or temporary)
   Click link in verification email
   ```

4. **Install SendGrid SDK**
   ```bash
   npm install @sendgrid/mail
   ```

5. **Update mfaHelper.js**
   ```javascript
   import sgMail from '@sendgrid/mail';
   
   sgMail.setApiKey(process.env.SENDGRID_API_KEY);
   
   export async function sendOTPViaEmail(email, otp) {
     const msg = {
       to: email,
       from: 'noreply@healthgene.com',
       subject: 'Your HealthGene Verification Code',
       html: `
         <h1>Your Verification Code</h1>
         <p>Your HealthGene OTP: <strong>${otp}</strong></p>
         <p>This code expires in 5 minutes.</p>
       `,
     };
     
     try {
       await sgMail.send(msg);
       return { success: true };
     } catch (error) {
       return { success: false, error: error.message };
     }
   }
   ```

6. **Configure Environment Variables**
   ```
   .env.local:
   VITE_SENDGRID_API_KEY=your_api_key
   ```

7. **Test**
   ```bash
   npm run dev
   # OTP email should be delivered
   ```

**Costs:**
- Free plan: 100 emails/day
- Paid plans: $20/month for 40k emails

---

### Option 3: Gmail SMTP (Alternative)

**Setup Steps:**

1. **Enable Less Secure Apps** (Gmail account)
   - Account Settings → Security
   - Enable "Less secure app access"

2. **Create App Password** (if 2FA enabled)
   - Account Settings → Security
   - App passwords
   - Generate password for "Mail" app

3. **Install Nodemailer**
   ```bash
   npm install nodemailer
   ```

4. **Update mfaHelper.js**
   ```javascript
   import nodemailer from 'nodemailer';
   
   const transporter = nodemailer.createTransport({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: process.env.GMAIL_EMAIL,
       pass: process.env.GMAIL_APP_PASSWORD
     }
   });
   
   export async function sendOTPViaGmail(email, otp) {
     const mailOptions = {
       from: process.env.GMAIL_EMAIL,
       to: email,
       subject: 'Your HealthGene Verification Code',
       html: `<h1>Your OTP: ${otp}</h1>`
     };
     
     try {
       const result = await transporter.sendMail(mailOptions);
       return { success: true, info: result };
     } catch (error) {
       return { success: false, error: error.message };
     }
   }
   ```

**Limitations:**
- Rate limited to ~1000 emails/day
- May be blocked for suspicious activity
- Not recommended for production

---

## 3. Firestore Security Rules Deployment

**File:** `FIRESTORE_SECURITY_RULES.txt`

**Deployment Steps:**

1. **Via Firebase Console** (Manual)
   ```
   1. Go to Firebase Console
   2. Firestore Database → Rules
   3. Copy rules from FIRESTORE_SECURITY_RULES.txt
   4. Paste into Rules Editor
   5. Click "Publish"
   ```

2. **Via Firebase CLI** (Automated)
   ```bash
   # Create rules file
   cat > firestore.rules << 'EOF'
   [Copy content from FIRESTORE_SECURITY_RULES.txt]
   EOF
   
   # Deploy rules
   firebase deploy --only firestore:rules
   ```

3. **Testing** (Firebase Emulator)
   ```bash
   # Start emulator
   firebase emulators:start --only firestore
   
   # Run tests
   npm test -- firestore.test.js
   ```

**Verification:**
```bash
# Check current rules
firebase firestore:get-ruleset

# Ensure rules show user isolation
grep -n "request.auth.uid == userId" firestore.rules
```

---

## 4. Monitoring & Alerting Setup

### Firebase Console Monitoring
```
1. Go to Firebase Console
2. Click Project Settings (gear icon)
3. Verify email address for alerts
4. Enable email notifications
```

### Error Tracking (Sentry)

**Setup Steps:**

1. **Create Sentry Account**
   ```
   Go to: https://sentry.io
   Sign up (free tier available)
   ```

2. **Create Project**
   ```
   New Project → React → Platform
   Get DSN key
   ```

3. **Install Sentry SDK**
   ```bash
   npm install @sentry/react @sentry/tracing
   ```

4. **Initialize Sentry** (src/main.jsx)
   ```javascript
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.MODE,
     tracesSampleRate: 1.0,
   });
   
   export default Sentry.withProfiler(App);
   ```

5. **Configure Environment**
   ```
   .env.production:
   VITE_SENTRY_DSN=your_sentry_dsn
   ```

6. **Test**
   ```javascript
   // Test error capture
   Sentry.captureException(new Error("Test error"));
   ```

### Custom Metrics (Firestore)

**Create collection for metrics:**
```firestore
metrics/
├── mfa_success_rate/
│   └── daily_2025_01_21
│       ├── total: 1000
│       ├── success: 980
│       └── timestamp: 2025-01-21T00:00:00Z
├── otp_delivery_time/
│   └── daily_2025_01_21
│       ├── average_ms: 2500
│       └── timestamp: 2025-01-21T00:00:00Z
└── auth_errors/
    └── daily_2025_01_21
        ├── count: 20
        ├── errors: [...]
        └── timestamp: 2025-01-21T00:00:00Z
```

---

## 5. Load Testing Setup

### Firebase Load Testing

**Tool:** Apache JMeter or Locust

**Setup:**
```bash
# Install Apache JMeter
brew install jmeter

# Or use cloud service:
# - LoadImpact
# - BlazeMeter
# - AWS Load Testing
```

**Test Scenarios:**
```
1. 100 concurrent users
2. Each user: phone auth → OTP → access
3. Ramp up over 5 minutes
4. Run for 30 minutes
5. Monitor:
   - Response times
   - Error rates
   - Firebase quota usage
   - Firestore read/write operations
```

**Expected Results:**
- 99% requests < 2s
- Error rate < 0.1%
- No quota exceeded
- No crashes

---

## 6. Staging Deployment

**Environment:** Firebase Staging Project

**Prerequisites:**
- [ ] SMS provider configured
- [ ] Email provider configured
- [ ] Monitoring & alerting set up
- [ ] Firestore security rules ready
- [ ] Environment variables configured

**Deployment Steps:**

```bash
# 1. Create staging environment (if not existing)
firebase projects:create healthgene-staging

# 2. Switch to staging
firebase use healthgene-staging

# 3. Deploy Firestore rules
firebase deploy --only firestore:rules

# 4. Deploy Cloud Functions (if used)
firebase deploy --only functions

# 5. Switch back to production
firebase use healthgene-prod

# 6. Verify staging is working
# Open staging URL and test MFA flow
```

**Smoke Tests:**
```
1. Phone verification works
2. MFA OTP generation works
3. OTP verification succeeds
4. Device trust saves correctly
5. Settings page loads
6. No console errors
7. Performance acceptable
```

---

## 7. Environment Variables Checklist

### Development (.env.local)
```
VITE_FIREBASE_API_KEY=xxxxx
VITE_FIREBASE_AUTH_DOMAIN=xxxxx
VITE_FIREBASE_PROJECT_ID=healthgene-dev
VITE_FIREBASE_STORAGE_BUCKET=xxxxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxxxx
VITE_FIREBASE_APP_ID=xxxxx
VITE_MODE=development
VITE_TWILIO_ACCOUNT_SID=xxxxx (optional)
VITE_TWILIO_AUTH_TOKEN=xxxxx (optional)
VITE_SENDGRID_API_KEY=xxxxx (optional)
VITE_SENTRY_DSN=xxxxx (optional)
```

### Staging (.env.staging)
```
VITE_FIREBASE_PROJECT_ID=healthgene-staging
VITE_MODE=staging
[Other keys same as production]
```

### Production (.env.production)
```
VITE_FIREBASE_PROJECT_ID=healthgene-prod
VITE_MODE=production
[All provider credentials configured]
[All monitoring configured]
```

---

## 8. Deployment Checklist

### Pre-Deployment
- [ ] All unit tests passing (55 tests)
- [ ] All integration tests passing (20+ tests)
- [ ] Security audit complete
- [ ] Performance testing complete
- [ ] QA testing complete
- [ ] No critical/high issues
- [ ] Firestore rules reviewed
- [ ] Environment variables configured
- [ ] SMS provider tested
- [ ] Email provider tested
- [ ] Monitoring set up
- [ ] Backups enabled

### Deployment Steps
- [ ] Deploy Firestore rules
- [ ] Deploy Cloud Functions (if any)
- [ ] Configure SMS provider
- [ ] Configure Email provider
- [ ] Enable monitoring & alerting
- [ ] Run smoke tests
- [ ] Verify error logging
- [ ] Check performance metrics

### Post-Deployment
- [ ] Monitor error rate (target: < 0.1%)
- [ ] Monitor response times (target: < 2s)
- [ ] Check user feedback
- [ ] Monitor Firestore quota
- [ ] Verify rate limiting working
- [ ] Verify device trust expiration
- [ ] Verify backup codes working

---

## Infrastructure Costs Estimate

| Service | Cost/Month | Notes |
|---------|-----------|-------|
| Firebase (Firestore) | ~$10-50 | Scales with usage |
| Firebase (Auth) | Included | 20 free/day SMS |
| SMS (Twilio) | $1 + $0.01/SMS | Alternative to Firebase |
| Email (SendGrid) | $20 | Free tier: 100/day |
| Monitoring (Sentry) | Free-$99 | Free tier sufficient |
| **Total** | **$31-170** | Depends on volume |

---

## Troubleshooting

### SMS Not Delivering
```
1. Check SMS provider credentials
2. Verify phone number format (+1-555-0000)
3. Check rate limiting not triggered
4. Check provider's uptime status
5. Try backup provider
6. Check logs for errors
```

### Email Not Delivering
```
1. Verify sender email
2. Check spam folder
3. Verify DKIM/SPF/DMARC
4. Check email provider logs
5. Check rate limiting
6. Verify email format
```

### Performance Issues
```
1. Check Firestore quotas
2. Check network latency
3. Profile code with Chrome DevTools
4. Check for memory leaks
5. Monitor Firebase operations
6. Reduce bundle size if needed
```

---

**Status:** 🟡 Infrastructure Setup In Progress
**Target:** Week 1
**Next:** Production Deployment

