# Quick Reference Card - Patient vs Provider Signup

## 🎯 Quick Lookup Table

| Feature | Patient | Provider |
|---------|---------|----------|
| **Authentication** | Phone + SMS | Email + Password |
| **Steps** | 2 | 4 |
| **Time to Activate** | Instant | 24-48 hours (admin) |
| **Primary Document** | main.jsx | ProviderSignup.jsx |
| **Line Range** | 687-900 | Full component |
| **Component Name** | AuthScreen() | ProviderSignup() |
| **Firestore Path** | users/{uid}/profile/details | providers/{uid} |
| **Status Field** | N/A | status: "unverified" |
| **Profile Fields** | Health info | Professional info |
| **Family Members** | Can add | Not applicable |
| **Health Records** | Can add | Can view/comment |
| **Routing Status** | ✅ Connected | ❌ Disconnected |

---

## 🔑 Key Identifiers

### Patient (Look for these)
```
✓ screen === 'signup'
✓ phone-based authentication
✓ SMS verification code
✓ isPrimaryHolder: true
✓ profile/details path in Firestore
✓ Can add familyMembers
✓ users/{uid} namespace
```

### Provider (Look for these)
```
✓ step === 'credentials'|'profile'|'policies'|'verification'
✓ email-based authentication
✓ Professional credentials (license, specialization)
✓ status: "unverified"
✓ PrivacyPolicyModal shown in Step 3
✓ providers/{uid} namespace
✓ Policy acceptance required
```

---

## 🧭 Navigation in Code

### To Find Patient Signup
```bash
# File: src/main.jsx
# Search: AuthScreen
# Lines: 687-900

# Key functions:
- submitPhone() → Sends SMS code
- verifyCode() → Confirms 6-digit code
- loadFirestoreData() → Checks profile on first login
```

### To Find Provider Signup
```bash
# File: src/components/ProviderAuth/ProviderSignup.jsx
# Key functions:
- handleCredentialsNext() → Validate email/password
- handleProfileNext() → Validate professional info
- handlePoliciesNext() → Check acceptance
- handleSubmit() → Create Firebase account
```

---

## 📲 User Flow Comparison

```
PATIENT                          PROVIDER
────────────────────────────────────────────────────────
Welcome Screen                   ProviderSignup Component
   ↓                                   ↓
[Get started]                    Step 1: Credentials
   ↓                                   ↓
Enter Phone                      Enter Email & Password
   ↓                                   ↓
Receive SMS Code                 Step 2: Professional
   ↓                                   ↓
Enter 6-Digit Code               Enter License & Details
   ↓                                   ↓
✅ Verified                      Step 3: Policies
   ↓                                   ↓
Profile Form (if new)            Accept Privacy & Terms
   ↓                                   ↓
Main Dashboard Ready             Step 4: Verification
                                       ↓
                                  ⏳ Awaiting Admin Approval
```

---

## 💾 Firestore Paths

### Patient Profile
```
users/
  {uid}/
    profile/
      details: {
        fullName, dateOfBirth, gender, bloodGroup,
        height, weight, emergencyContact,
        isPrimaryHolder: true
      }
```

### Provider Profile
```
providers/
  {uid}: {
    fullName, email, phone, specialization,
    licenseNumber, hospitalName,
    status: "unverified",
    createdAt, verifiedAt
  }
```

---

## 🔐 Authentication Methods

### Patient
```javascript
import { signInWithPhoneNumber, RecaptchaVerifier } from 'firebase/auth';

// Step 1: Send code
const result = await signInWithPhoneNumber(
  auth,
  `${countryCode}${phone}`,
  recaptchaRef.current
);

// Step 2: Verify code
await result.confirm(code);
```

### Provider
```javascript
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';

// Create account
const userCredential = await createUserWithEmailAndPassword(
  auth,
  email,
  password
);

// Update profile
await updateProfile(userCredential.user, {
  displayName: fullName
});

// Save provider details to Firestore
await setDoc(doc(db, 'providers', userCredential.user.uid), {
  fullName, email, specialization, licenseNumber, // ... etc
  status: 'unverified'
});
```

---

## 🚨 Current Issues & TODOs

### Connected ✅
- Patient signup in AuthScreen
- Patient login with SMS
- Patient profile auto-setup

### Missing ❌
- Provider signup routing (component exists but not connected to auth)
- Provider login component (doesn't exist)
- Role-based dashboard routing
- Provider dashboard (doesn't exist)
- Admin verification panel (doesn't exist)

---

## 🛠️ Code Search Tips

### Find Patient Signup
```bash
grep -n "setScreen('signup')" src/main.jsx
grep -n "AuthScreen" src/main.jsx
grep -n "submitPhone\|verifyCode" src/main.jsx
```

### Find Provider Signup
```bash
grep -n "ProviderSignup" src/components/ProviderAuth/
grep -n "handleCredentialsNext\|handleProfileNext" src/components/ProviderAuth/ProviderSignup.jsx
grep -n "setPoliciesAccepted\|step ===" src/components/ProviderAuth/ProviderSignup.jsx
```

### Find User Type Check
```bash
grep -n "profileSnapshot.exists()\|providerSnapshot.exists()" src/main.jsx
grep -n "isPrimaryHolder\|status.*unverified" src/
```

---

## 📋 Testing Scenarios

### Test Patient Signup
1. Click "Get started" on welcome screen
2. Enter phone number with country code
3. Receive SMS verification code
4. Enter 6-digit code
5. See profile form
6. Fill and save profile
7. Redirected to home dashboard
8. Verify `isPrimaryHolder: true` in Firestore

### Test Provider Signup (Manual)
1. Navigate to ProviderSignup component directly
2. Fill credentials (email, password)
3. Verify password validation (8+, uppercase, number, symbol)
4. Fill professional profile
5. Accept policies and terms
6. Submit and see confirmation
7. Verify `status: "unverified"` in Firestore providers/{uid}
8. Verify confirmation email sent

---

## 🎓 Learning Path

**Level 1: Overview** (10 minutes)
- Read this quick reference
- Look at the comparison table

**Level 2: Deep Dive** (30 minutes)
- Read SIGNUP_FLOW_IDENTIFICATION.md
- Review code in main.jsx AuthScreen
- Review ProviderSignup.jsx

**Level 3: Implementation** (1-2 hours)
- Study SIGNUP_FLOWS_VISUAL.md flow diagrams
- Trace through state management
- Review Firestore structure
- Plan provider login integration

**Level 4: Integration** (varies)
- Follow integration checklist
- Implement missing components
- Test all scenarios
- Validate Firestore data

---

## 🎯 Common Questions

**Q: How do I know if a user is a patient?**
A: Look for `isPrimaryHolder: true` in Firestore at `users/{uid}/profile/details`

**Q: How do I know if a user is a provider?**
A: Look for a document in `providers/{uid}` with `status: "unverified"` or `"verified"`

**Q: Where is the provider login?**
A: Not yet implemented. Component exists at `ProviderSignup.jsx` but needs `ProviderLogin.jsx`

**Q: Can providers and patients use the same account?**
A: No, they use separate authentication methods. Would need architectural changes to support both.

**Q: How long until provider is activated?**
A: After signup, status is "unverified". Admin must review and change status to "verified" (24-48 hours typical).

**Q: What happens if a provider provides invalid credentials?**
A: Form validation happens on Step 2. If saved with invalid data, admin would reject during verification.

**Q: Can a provider see patient records without explicit access?**
A: No. Patient must grant access in Provider Access section first.

---

## 📞 Support References

For more detailed information:
- **SIGNUP_FLOW_IDENTIFICATION.md** - Complete identification guide
- **SIGNUP_FLOWS_VISUAL.md** - Flow diagrams and state management
- **COMPONENT_STRUCTURE.md** - Component organization details
- **USER_JOURNEYS.md** - Complete user workflows

