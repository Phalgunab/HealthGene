# Provider Signup vs Patient Signup - Identification Guide

## Overview

HealthGene has **two distinct signup flows** for different user types:

1. **Patient/Family Member Signup** - Built into main authentication flow (MyFamilyHealth)
2. **Provider Signup** - Separate dedicated component with professional credentials

---

## 1️⃣ Patient/Family Member Signup

### Location
- **File**: [/src/main.jsx](/Users/phalgunab/Data/Claude/HealthGene/src/main.jsx) (lines 687-900)
- **Component**: `AuthScreen()`
- **Flow**: Phone-based authentication with SMS verification

### Entry Point
```jsx
// Welcome screen button (line 745)
<button className="auth-primary" onClick={() => setScreen('signup')}>
  Get started <ArrowUpRight size={18}/>
</button>
```

### Signup Flow Steps

#### Step 1: Welcome Screen
- User sees "YOUR HEALTH, TOGETHER" welcome screen
- Options: "Get started" (signup) or "I already have an account" (login)
- Shows privacy/encryption messaging

#### Step 2: Phone Number Entry
- User selects country code (India +91 or Singapore +65)
- Enters phone number
- System sends 6-digit SMS verification code
- Uses Firebase Phone Authentication with reCAPTCHA protection

#### Step 3: SMS Code Verification
- User receives 6-digit code via SMS
- Enters code in verification screen
- Firebase confirms authentication
- User is automatically logged in

#### Step 4: Profile Setup (First Login Only)
- App checks if user has profile data in Firestore
- If no profile exists, redirects to Profile tab
- Sets `editProfile = true` (forces profile edit form)
- User fills in:
  - Full Name
  - Date of Birth
  - Gender
  - Blood Group
  - Height/Weight
  - Emergency Contact

### Code Reference
```jsx
// Line 699 - Main signup state management
const [screen, setScreen] = useState('welcome');
const [phone, setPhone] = useState('');
const [code, setCode] = useState('');
const [confirmationResult, setConfirmationResult] = useState(null);

// Line 715 - Phone submission
const submitPhone = async (event) => {
  // Validates phone, sends SMS code
  const result = await signInWithPhoneNumber(auth, `${countryCode}${phone}`);
  setScreen('verify');
};

// Line 729 - Code verification
const verifyCode = async (event) => {
  // Confirms SMS code with Firebase
  await confirmationResult.confirm(code);
  // User is now authenticated
};

// Line 520 - Profile setup for first-time users
const isNewUser = !profileSnapshot.exists();
if (isNewUser) {
  setTab('Profile');
  setEditProfile(true);
  // Forces user to complete profile
}
```

### User Type After Signup
- Role: **Patient/Family Member**
- Permissions: Can create personal health records, add family members, grant provider access
- Account Type: Designated as `isPrimaryHolder: true`

### Visual Indicators
- **Screen Label**: "WELCOME TO MYFAMILYHEALTH"
- **Call-to-Action**: "Get started" button
- **Theme**: Green color scheme (#1b5e20 dark green)
- **Branding**: MyFamilyHealth logo/heart icon

---

## 2️⃣ Provider Signup

### Location
- **File**: [/src/components/ProviderAuth/ProviderSignup.jsx](/Users/phalgunab/Data/Claude/HealthGene/src/components/ProviderAuth/ProviderSignup.jsx)
- **Component**: `ProviderSignup({ onSignupSuccess, onNavigateToLogin })`
- **Flow**: Email-based registration with credential verification

### Entry Point
Provider signup is typically accessed through:
- Separate provider portal/login page
- Not part of main patient authentication flow
- Requires deliberate navigation to provider signup route

### Signup Flow Steps (4-Step Wizard)

#### Step 1: Credentials
User enters professional login credentials
```jsx
- Email address (validated email format)
- Password (requirements: 8+ chars, 1 uppercase, 1 number, 1 special char)
- Confirm password (must match)
- Submit to move to Step 2
```

#### Step 2: Professional Profile
User enters healthcare credentials
```jsx
- Full Name (healthcare professional's name)
- Medical Specialization (dropdown: Internal Medicine, Cardiology, etc.)
- License Number (professional medical license)
- Hospital/Clinic Name (where they work)
- Phone Number (contact number, validated format)
- Submit to move to Step 3
```

#### Step 3: Policies & Terms
User accepts legal requirements
```jsx
- Privacy Policy acceptance (opens modal with full text)
- Terms of Service acceptance (checkbox)
- HIPAA compliance acknowledgment (implicit)
- Cannot proceed without accepting both
- Submit to move to Step 4
```

#### Step 4: Verification & Confirmation
- System creates Firebase user account with email/password
- Creates Firestore provider profile document with:
  - Professional details (name, specialization, license)
  - Workplace information
  - Account status: `unverified` (pending admin verification)
- Sends confirmation email
- Shows success message with next steps

### Code Reference
```jsx
// Lines 15-30 - Component state for 4-step process
const [step, setStep] = useState('credentials');
const [loading, setLoading] = useState(false);
const [error, setError] = useState('');

// Credentials state (Step 1)
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');

// Profile state (Step 2)
const [fullName, setFullName] = useState('');
const [specialization, setSpecialization] = useState('');
const [licenseNumber, setLicenseNumber] = useState('');
const [hospitalName, setHospitalName] = useState('');
const [phone, setPhone] = useState('');

// Policies state (Step 3)
const [policiesAccepted, setPoliciesAccepted] = useState(false);
const [showPrivacyModal, setShowPrivacyModal] = useState(false);

// Line 55-65 - Validation functions
const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const validatePassword = (password) => 
  password.length >= 8 &&
  /[A-Z]/.test(password) &&
  /[0-9]/.test(password) &&
  /[!@#$%^&*]/.test(password);

// Line 75 - Step 1 handler
const handleCredentialsNext = (e) => {
  // Validates email format and password strength
  // Moves to 'profile' step
};

// Line 110 - Step 2 handler
const handleProfileNext = (e) => {
  // Validates professional details
  // Moves to 'policies' step
};

// Line 180 - Step 3 handler
const handlePoliciesNext = (e) => {
  // Checks policies acceptance
  // Moves to 'verification' step
};

// Line 200+ - Step 4 handler
const handleSubmit = async (e) => {
  // Creates Firebase auth account
  // Creates Firestore provider profile
  // Sends verification email
};
```

### User Type After Signup
- Role: **Healthcare Provider**
- Status: `unverified` (pending admin approval)
- Permissions: Limited until verified by admin
  - After verification: Can view assigned patients, create clinical alerts, send messages
- Account Type: Professional healthcare credentials

### Visual Indicators
- **Screen Title**: Step-by-step wizard (1/4, 2/4, 3/4, 4/4)
- **Icons**: Professional credentials icons (User, Mail, Lock, Phone, Building, Stethoscope)
- **Required Fields**: Marked with asterisk (*)
- **Theme**: Dark Green (#1b5e20) consistent with app
- **Special Element**: PrivacyPolicyModal component for policy review

---

## Key Differences - Quick Reference

| Aspect | Patient Signup | Provider Signup |
|--------|---|---|
| **Authentication Method** | Phone + SMS | Email + Password |
| **Location** | Main auth flow (`main.jsx`) | Separate component (`ProviderAuth/`) |
| **Steps** | 2 main steps | 4-step wizard |
| **Profile Info** | Personal health data | Professional credentials |
| **Verification** | Immediate (SMS code) | Deferred (admin review) |
| **Activation** | Immediate after verification | After admin approval |
| **Account Status** | Active | Unverified (pending) |
| **User Role** | Patient/Family Member | Healthcare Provider |
| **Initial Setup** | Profile form (first login) | All info during signup |
| **Can View** | Own health records | Assigned patient data |
| **Can Create** | Health records, family members | Clinical alerts, reports |

---

## How to Identify User Type in Code

### At Signup Time
```jsx
// Patient path
if (screen === 'signup') {
  // In main.jsx AuthScreen - leads to phone-based auth
  // After verification: isPrimaryHolder = true
}

// Provider path
// User navigates to ProviderSignup component
// After completion: Creates provider Firestore document with professional fields
```

### In Firestore
```javascript
// Patient/Family Member document (users/{uid}/profile/details)
{
  fullName: "Swetha Kumar",
  dateOfBirth: "1990-05-15",
  gender: "Female",
  bloodGroup: "O+",
  height: "165",
  weight: "65",
  isPrimaryHolder: true  // KEY INDICATOR
}

// Provider document (providers/{uid} or users/{uid}/provider/details)
{
  fullName: "Dr. Maya Chen",
  email: "maya.chen@hospital.com",
  specialization: "Internal Medicine",
  licenseNumber: "LIC123456",
  hospitalName: "Apollo Hospitals",
  phone: "+91-9876543210",
  status: "unverified",  // KEY INDICATOR
  credentials: { verified: false, verifiedAt: null }
}
```

### In Code Logic
```jsx
// Check if user is patient (has profile in users/{uid}/profile/details)
if (currentUser && profileSnapshot.exists()) {
  // Patient signup completed
}

// Check if user is provider (need to implement)
if (currentUser && providerSnapshot.exists()) {
  // Provider signup completed
}
```

---

## Current Implementation Status

### ✅ Complete - Patient Signup
- Phone-based authentication fully implemented
- SMS verification working
- Profile setup on first login
- Family member addition
- Records management
- All features integrated

### ✅ Complete - Provider Signup
- 4-step wizard implemented
- Email/password authentication
- Professional credentials collection
- Privacy policy modal
- Firebase integration
- **⚠️ Status**: Component ready but may not be fully integrated in main routing

---

## Integration Gaps & Recommendations

### 1. **Provider Login Integration**
Currently, patient and provider have separate auth flows. Need to:
- Add "I'm a provider" option in main AuthScreen
- Route to ProviderSignup instead of patient signup
- Implement provider login (not currently visible)

```jsx
// Suggested improvement in AuthScreen
if (screen === 'welcome') {
  return (
    <button onClick={() => setScreen('signup')}>Get started (Patient)</button>
    <button onClick={() => setScreen('provider-signup')}>Join as Provider</button>
  );
}

if (screen === 'provider-signup') {
  return <ProviderSignup onSignupSuccess={...} onNavigateToLogin={...} />;
}
```

### 2. **Provider Login Implementation**
Need to create `ProviderLogin.jsx` component for:
- Email/password authentication
- Account verification check
- Redirect to provider dashboard if verified

### 3. **Role-Based Routing**
After authentication, determine if user is patient or provider:
```jsx
// In App component, after auth state change
const determineUserType = async (user) => {
  const isPatient = await checkPatientProfile(user.uid);
  const isProvider = await checkProviderProfile(user.uid);
  
  if (isPatient) {
    // Show patient dashboard (current behavior)
  } else if (isProvider) {
    // Show provider dashboard
  }
};
```

---

## Testing Checklist

### Patient Signup Testing
- [ ] Click "Get started" on welcome screen
- [ ] Select country code and enter phone
- [ ] Receive SMS and enter verification code
- [ ] Profile form appears automatically
- [ ] Fill and save profile
- [ ] Can see home dashboard with "My profile" as active person
- [ ] Can add family members
- [ ] Can add health records

### Provider Signup Testing
- [ ] Navigate to ProviderSignup component (if accessible)
- [ ] Step 1: Enter email and valid password
- [ ] Step 2: Fill professional credentials
- [ ] Step 3: Accept policies
- [ ] Step 4: See success confirmation
- [ ] Check Firestore for provider document with `status: "unverified"`
- [ ] Verify email can be used for provider login

---

## File Reference Summary

| File | Purpose | Key Content |
|------|---------|---|
| [main.jsx](/Users/phalgunab/Data/Claude/HealthGene/src/main.jsx) | Patient auth flow | `AuthScreen()`, `submitPhone()`, `verifyCode()` |
| [ProviderSignup.jsx](/Users/phalgunab/Data/Claude/HealthGene/src/components/ProviderAuth/ProviderSignup.jsx) | Provider signup wizard | 4-step form, validation, Firebase integration |
| [ProviderLogin.jsx](/Users/phalgunab/Data/Claude/HealthGene/src/components/ProviderAuth/) | Provider login | ❌ Not yet implemented |
| [PrivacyPolicyModal.jsx](/Users/phalgunab/Data/Claude/HealthGene/src/components/ProviderAuth/) | Policy display | Used in provider signup Step 3 |
| [ProviderAuth.css](/Users/phalgunab/Data/Claude/HealthGene/src/styles/) | Provider auth styling | Dark green theme styles |

---

## Summary

**To identify signup flows in the app:**

1. **Patient Signup** → Look at `AuthScreen` in `main.jsx`
   - Phone-based, 2-step process
   - SMS verification
   - Immediate activation
   - Creates patient profile in Firestore

2. **Provider Signup** → Look at `ProviderSignup.jsx` in `ProviderAuth/`
   - Email-based, 4-step wizard process
   - Professional credential collection
   - Requires admin verification
   - Creates provider profile in Firestore

The main integration gap is that the provider signup/login flow needs to be connected to the main authentication screen for users to easily discover and access it.
