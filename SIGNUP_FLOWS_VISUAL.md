# HealthGene Authentication Flows - Visual Guide

## Complete App Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           HEALTHGENE APP START                              │
└─────────────────────────────┬───────────────────────────────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │  Is User Logged  │
                    │      In?         │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                │                         │
                ▼                         ▼
            YES: Go to            NO: Show AuthScreen
            Main Dashboard        (Welcome Page)
            ├─ Home Tab           └─────┬────────────┐
            ├─ Records            Button│ Button    │
            ├─ Profile            Get   │ Already   │
            ├─ Messaging          Started│ Have      │
            └─ Settings                 │ Account   │
                                        ▼           ▼
                            ┌──────────────────────────────┐
                            │ PATIENT SIGNUP vs PROVIDER   │
                            │ ⚠️ Currently Only Patient    │
                            │    Path is Connected         │
                            └────────┬─────────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                 │
                    ▼                                 ▼
          ┌──────────────────────┐      ┌──────────────────────┐
          │   PATIENT SIGNUP     │      │  PROVIDER SIGNUP     │
          │   (Phone-based)      │      │  (Email-based)       │
          │   ⚙️ Implemented     │      │  ⚙️ Implemented      │
          │   ✅ Integrated      │      │  ❌ Not Connected    │
          └──────────┬───────────┘      └──────────┬───────────┘
                     │                             │
            ┌────────▼────────┐        ┌───────────▼───────────┐
            │ STEP 1: PHONE   │        │ STEP 1: CREDENTIALS   │
            │ - Select Country│        │ - Email               │
            │ - Enter Phone   │        │ - Password            │
            │ - Send SMS      │        │ - Confirm Password    │
            └────────┬────────┘        └───────────┬───────────┘
                     │                             │
            ┌────────▼────────┐        ┌───────────▼───────────┐
            │ STEP 2: VERIFY  │        │ STEP 2: PROFESSIONAL │
            │ - Get SMS Code  │        │ - Full Name           │
            │ - Enter 6 Digit │        │ - Specialization      │
            │ - Confirm Auth  │        │ - License Number      │
            └────────┬────────┘        │ - Hospital Name       │
                     │                 │ - Phone               │
            ┌────────▼────────┐        └───────────┬───────────┘
            │ LOGIN SUCCESS   │                    │
            │ ✅ User Auth    │        ┌───────────▼───────────┐
            │ Check Profile   │        │ STEP 3: POLICIES      │
            └────────┬────────┘        │ - Privacy Policy      │
                     │                 │ - Terms & Conditions  │
         ┌───────────┴──────────┐      │ - HIPAA Acknowledgment│
         │                      │      └───────────┬───────────┘
         ▼                      ▼                  │
    ┌─────────┐         ┌──────────────┐ ┌────────▼──────────┐
    │  NEW    │         │ EXISTING     │ │ STEP 4: SUBMIT    │
    │ PROFILE │         │ PROFILE      │ │ - Create Account  │
    │ FORM    │         │ FOUND        │ │ - Save Profile    │
    └────┬────┘         │ SHOW DASH    │ │ - Verification    │
         │              └──────────────┘ └────────┬──────────┘
         │                                         │
    ┌────▼─────────────────────────────────────────▼───┐
    │                  CREATE FIRESTORE PROFILE        │
    │                                                   │
    │   PATIENT/FAMILY MEMBER          PROVIDER        │
    │   ────────────────────────────────────────       │
    │   ├─ fullName                     ├─ fullName    │
    │   ├─ dateOfBirth                  ├─ email       │
    │   ├─ gender                       ├─ specialization│
    │   ├─ bloodGroup                   ├─ licenseNumber│
    │   ├─ height/weight                ├─ hospitalName│
    │   ├─ emergencyContact             ├─ phone       │
    │   ├─ isPrimaryHolder: true        ├─ status: "unverified"│
    │   └─ Created in: users/{uid}/     └─ Created in: providers/{uid}│
    │      profile/details                 or similar   │
    └────┬──────────────────────────────────────────────┘
         │
    ┌────▼──────────────────────────────────────┐
    │      REDIRECT TO APPROPRIATE DASHBOARD     │
    │                                            │
    │   PATIENT                  PROVIDER        │
    │   ───────────────────────────────────     │
    │   ├─ Home (Timeline)        ├─ Provider   │
    │   ├─ Add Records            │  Dashboard  │
    │   ├─ Family Management      ├─ Patient    │
    │   ├─ Provider Access        │  List       │
    │   ├─ Messaging              ├─ Alerts     │
    │   └─ Settings               ├─ Reports    │
    │                             └─ Settings   │
    └──────────────────────────────────────────┘
```

---

## Authentication Screen States (Patient - Implemented)

```
┌──────────────────────────────────────────────────────┐
│              screen = 'welcome'                      │
│  ┌────────────────────────────────────────────────┐  │
│  │   YOUR HEALTH, TOGETHER                        │  │
│  │   Every health moment, in one safe place.      │  │
│  │                                                 │  │
│  │   [Get started] [I already have an account]    │  │
│  │                                                 │  │
│  │   🔒 Private, encrypted, and always yours      │  │
│  └────────────────────────────────────────────────┘  │
│  Buttons: ← onClick={() => setScreen('signup')}      │
│           ← onClick={() => setScreen('signin')}      │
└──────────────────────────────────────────────────────┘
                      │
          ┌───────────┴───────────┐
          ▼                       ▼
    ┌──────────┐            ┌──────────┐
    │ SIGNUP   │            │ SIGNIN   │
    │ screen   │            │ screen   │
    └──────┬───┘            └──────┬───┘
           │                       │
    ┌──────▼──────────────────┬────▼──────────────────┐
    │ WELCOME TO MYFAMILYHEALTH│ YOUR HEALTH SPACE     │
    │ Create your account      │ Welcome back          │
    │ Start building...        │ Sign in to see...     │
    │                          │                      │
    │ [Google Auth]            │ [Google Auth]        │
    │ or continue with phone   │ or continue with phone│
    │                          │                      │
    │ ┌──────────────────────┐ │ ┌──────────────────┐ │
    │ │ PHONE: [+91 ────────]│ │ │ PHONE: [+91 ────]│ │
    │ │ [Continue with phone]│ │ │ [Send sign-in]   │ │
    │ └──────────────────────┘ │ └──────────────────┘ │
    │                          │                      │
    │ Already have account? →  │ New to MyFamilyHealth?│
    │       Sign in            │      Create account   │
    └──────┬─────────────────────────┬─────────────────┘
           │                         │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │  screen = 'verify'      │
           │  ┌────────────────────┐ │
           │  │ 📱 Check messages  │ │
           │  │ Code sent to:      │ │
           │  │ +91 (555) 000-0000 │ │
           │  │                    │ │
           │  │ [● ● ● ● ● ●]     │ │
           │  │ Verification Code  │ │
           │  │                    │ │
           │  │ [Verify & continue]│ │
           │  │                    │ │
           │  │ Resend code?       │ │
           │  │ Use different #?   │ │
           │  └────────────────────┘ │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │   AUTHENTICATION SUCCESS │
           │   - Firebase confirms    │
           │   - User logged in       │
           │   - Check profile exists │
           └────────────┬────────────┘
                        │
           ┌────────────▼────────────┐
           │   Is Profile Existing?  │
           └────────┬────────────┬───┘
                    │            │
                YES │            │ NO
                    ▼            ▼
              ┌──────────┐  ┌──────────────┐
              │Dashboard │  │ Profile Form │
              │Ready     │  │ (Auto-open)  │
              └──────────┘  └──────────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Fill Profile Details  │
                    │ - Full Name           │
                    │ - Date of Birth       │
                    │ - Gender              │
                    │ - Blood Group         │
                    │ - Height/Weight       │
                    │ - Emergency Contact   │
                    │ - [Save Profile]      │
                    └───────────┬───────────┘
                                │
                    ┌───────────▼───────────┐
                    │ Profile Saved to      │
                    │ Firestore             │
                    │ Redirect to Dashboard │
                    └───────────────────────┘
```

---

## Provider Signup Form Flow (Not Yet Connected to Main Auth)

```
┌──────────────────────────────────────────────────────┐
│         ProviderSignup Component Loaded              │
│         (Step indicator: 1/4, 2/4, 3/4, 4/4)        │
└──────────────────────────────────────────────────────┘
                      │
                      ▼
    ┌─────────────────────────────────────┐
    │        STEP 1/4: CREDENTIALS         │
    │  ┌───────────────────────────────┐  │
    │  │ EMAIL:                        │  │
    │  │ [____________________] 📧     │  │
    │  │                               │  │
    │  │ PASSWORD:                     │  │
    │  │ [____________________] 🔒     │  │
    │  │ Must have: 8+ chars, 1 Upper,│  │
    │  │            1 Number, 1 Symbol │  │
    │  │                               │  │
    │  │ CONFIRM PASSWORD:             │  │
    │  │ [____________________] 🔒     │  │
    │  │                               │  │
    │  │ [← Back]        [Next →]      │  │
    │  └───────────────────────────────┘  │
    └─────────────────────────────────────┘
           Validation: validateCredentials()
                      │
              ┌───────▼────────┐
              │ Valid?         │
              └────┬────────┬──┘
                   │ YES    │ NO
                   │        └──► Show error
                   ▼
    ┌─────────────────────────────────────┐
    │      STEP 2/4: PROFESSIONAL PROFILE  │
    │  ┌───────────────────────────────┐  │
    │  │ FULL NAME:                    │  │
    │  │ [____________________] 👤     │  │
    │  │                               │  │
    │  │ SPECIALIZATION:               │  │
    │  │ [Dropdown ▼] (Internal Med..  │  │
    │  │                               │  │
    │  │ LICENSE NUMBER:               │  │
    │  │ [____________________]         │  │
    │  │                               │  │
    │  │ HOSPITAL/CLINIC NAME:         │  │
    │  │ [____________________] 🏥     │  │
    │  │                               │  │
    │  │ PHONE NUMBER:                 │  │
    │  │ [____________________] 📞     │  │
    │  │ Format: 10+ digits            │  │
    │  │                               │  │
    │  │ [← Back]        [Next →]      │  │
    │  └───────────────────────────────┘  │
    └─────────────────────────────────────┘
           Validation: validateProfile()
                      │
              ┌───────▼────────┐
              │ Valid?         │
              └────┬────────┬──┘
                   │ YES    │ NO
                   │        └──► Show error
                   ▼
    ┌─────────────────────────────────────┐
    │      STEP 3/4: POLICIES & TERMS      │
    │  ┌───────────────────────────────┐  │
    │  │ Please review and accept:     │  │
    │  │                               │  │
    │  │ ☐ Privacy Policy              │  │
    │  │   [View Policy] → Opens Modal │  │
    │  │                               │  │
    │  │ ☐ Terms of Service            │  │
    │  │   [View Terms]                │  │
    │  │                               │  │
    │  │ ☐ HIPAA Compliance            │  │
    │  │   Acknowledgment              │  │
    │  │                               │  │
    │  │ By continuing, you agree...   │  │
    │  │                               │  │
    │  │ [← Back]        [Next →]      │  │
    │  │                               │  │
    │  │ (All boxes must be checked)   │  │
    │  └───────────────────────────────┘  │
    └─────────────────────────────────────┘
           Validation: policiesAccepted
                      │
              ┌───────▼────────┐
              │ All checked?   │
              └────┬────────┬──┘
                   │ YES    │ NO
                   │        └──► Disable Next
                   ▼
    ┌─────────────────────────────────────┐
    │     STEP 4/4: VERIFICATION          │
    │  ┌───────────────────────────────┐  │
    │  │ ✅ ACCOUNT CREATED            │  │
    │  │                               │  │
    │  │ Dr. Maya Chen                 │  │
    │  │ Internal Medicine             │  │
    │  │ License #: LIC123456          │  │
    │  │ Apollo Hospitals              │  │
    │  │                               │  │
    │  │ Status: AWAITING VERIFICATION │  │
    │  │                               │  │
    │  │ A confirmation email has been │  │
    │  │ sent to maya.chen@hospital... │  │
    │  │                               │  │
    │  │ Admin will verify your        │  │
    │  │ credentials within 24 hours.  │  │
    │  │                               │  │
    │  │ [← Back]    [Go to Login]     │  │
    │  └───────────────────────────────┘  │
    │                                     │
    │ Backend Actions:                    │
    │ 1. createUserWithEmailAndPassword() │
    │ 2. Create Firestore document with   │
    │    status: "unverified"             │
    │ 3. Send verification email         │
    │ 4. onSignupSuccess() callback       │
    └─────────────────────────────────────┘
```

---

## Firestore Document Structure

### Patient Document
```
users/
  {uid}/
    profile/
      details: {
        fullName: "Swetha Kumar",
        dateOfBirth: "1990-05-15",
        gender: "Female",
        bloodGroup: "O+",
        height: "165",
        weight: "65",
        emergencyContact: "8765432100",
        isPrimaryHolder: true,
        createdAt: 2024-10-21T12:00:00Z
      }
    familyMembers/
      {memberId}: {
        name: "Rahul Kumar",
        relationship: "Son",
        dateOfBirth: "2015-08-20",
        isPrimaryHolder: false
      }
    records/
      {recordId}: { medical records... }
    notifications/
      {notifId}: { notifications... }
```

### Provider Document
```
providers/
  {uid}: {
    fullName: "Dr. Maya Chen",
    email: "maya.chen@hospital.com",
    phone: "+91-9876543210",
    specialization: "Internal Medicine",
    licenseNumber: "LIC123456",
    hospitalName: "Apollo Hospitals",
    status: "unverified",          ← KEY INDICATOR
    verificationToken: "abc123...",
    createdAt: 2024-10-21T12:00:00Z,
    verifiedAt: null,
    credentials: {
      verified: false,
      verifiedBy: null,
      verificationDate: null
    }
  }
```

---

## State Management Reference

### Patient Signup States
```javascript
// AuthScreen component states
const [screen, setScreen] = useState('welcome');
// Possible values: 'welcome', 'signup', 'signin', 'verify'

const [phone, setPhone] = useState('');
const [countryCode, setCountryCode] = useState('+91');
const [code, setCode] = useState('');
const [confirmationResult, setConfirmationResult] = useState(null);
const [authError, setAuthError] = useState('');
const [authLoading, setAuthLoading] = useState(false);
```

### Provider Signup States
```javascript
// ProviderSignup component states
const [step, setStep] = useState('credentials');
// Possible values: 'credentials', 'profile', 'policies', 'verification'

// Credentials
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

// Profile
const [fullName, setFullName] = useState('');
const [specialization, setSpecialization] = useState('');
const [licenseNumber, setLicenseNumber] = useState('');
const [hospitalName, setHospitalName] = useState('');
const [phone, setPhone] = useState('');

// Policies
const [policiesAccepted, setPoliciesAccepted] = useState(false);
const [showPrivacyModal, setShowPrivacyModal] = useState(false);

// Common
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');
const [fieldErrors, setFieldErrors] = useState({});
```

---

## Integration Checklist

To fully integrate both signup flows, implement:

- [ ] **Main Auth Router** - Add option to choose patient vs provider signup
- [ ] **Provider Login** - Create `ProviderLogin.jsx` component
- [ ] **Role Detection** - Determine user type after authentication
- [ ] **Dashboard Router** - Route to appropriate dashboard based on role
- [ ] **Provider Dashboard** - Implement provider interface
- [ ] **Admin Panel** - Verify/approve provider accounts
- [ ] **API Endpoints** - If using backend:
  - POST `/auth/provider/signup` - Create provider account
  - POST `/auth/provider/login` - Provider login
  - GET `/auth/verify-provider` - Check verification status
  - PATCH `/admin/verify-provider/{id}` - Admin approval

