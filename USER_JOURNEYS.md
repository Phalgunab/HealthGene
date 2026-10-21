# HealthGene - Individual User Journeys

**Document Type**: User Flow & Journey Mapping  
**Application**: HealthGene - Family Medical Documentation Platform  
**Last Updated**: October 21, 2026  
**Status**: ✅ Current

---

## 📋 Overview

HealthGene is a comprehensive healthcare platform serving three primary user types:
1. **Patients/Family Members** - Personal health record management
2. **Providers** - Healthcare professional dashboard and patient access
3. **Administrators** - System management and monitoring

Each user type follows distinct journeys within the application.

---

## 🏥 USER TYPE 1: PATIENT / FAMILY MEMBER

### Primary Objectives
- Create and manage family medical records
- Track health metrics and appointments
- Share records with healthcare providers
- Receive clinical alerts and recommendations
- Maintain medication adherence
- Access family health history

### User Journey: Patient Initial Onboarding

#### Stage 1: Landing & Authentication
**Entry Point**: Application home page  
**User Action**: User arrives at HealthGene

```
Landing Page
    ↓
User Authentication Options:
  - Email/Password Login (new users)
  - Biometric Authentication (existing users)
  - Social Login (Google/Phone)
    ↓
First-Time User Decision:
  - Create Account (New Patient)
  - Login (Returning Patient)
```

#### Stage 2: Account Creation (New Patient)
**Duration**: 5-10 minutes  
**Steps**:
1. Enter email and create password
2. Verify email via confirmation link
3. Complete personal profile
   - Name, age, date of birth
   - Blood type, allergies, chronic conditions
   - Emergency contact information
4. Set up biometric authentication (optional but recommended)
5. Complete onboarding

**Key Features Used**:
- Email verification
- Profile setup
- Biometric enrollment (Face ID/Touch ID)
- Privacy policy acceptance

#### Stage 3: Add Family Members
**Duration**: 2-5 minutes per member  
**Process**:
1. User clicks "Add Family Member"
2. Enter family member details
   - Name, relationship, age, blood type
   - Allergies and chronic conditions
3. Assign permission level (can they view records? edit?)
4. Family member added to records

**Types of Relationships**:
- Self (Primary account holder)
- Spouse
- Child
- Parent
- Sibling
- Other dependents

---

### User Journey: Create & Manage Medical Records

#### Sub-Journey: Record Entry Methods

**Method 1: Manual Entry**
```
Dashboard → Add Record → Select Type
    ↓
Choose Record Type:
  - Symptom (fever, cough, pain)
  - Medication (prescription, dosage)
  - Appointment (doctor visit, date)
  - Lab Result (blood work, pathology)
  - Vaccination (vaccine name, date)
  - Medical History (condition, diagnosis)
  - Surgical History (procedure, date)
  - Allergy (allergen, reaction)
  - Vital Signs (blood pressure, temperature)
    ↓
Enter Details:
  - Description/Title
  - Date & Time
  - Hospital/Provider name
  - Doctor name (if applicable)
  - Any notes/observations
    ↓
Save Record → Added to Timeline
```

**Method 2: Document Upload**
```
Dashboard → Upload Document
    ↓
Choose Upload Source:
  - Device Storage
  - Camera (scan document)
  - Gallery/Photos
    ↓
Upload File
    ↓
System Auto-Extracts:
  - Text via OCR
  - Date information
  - Medical data points
  - Hospital/Lab details
    ↓
User Reviews Extracted Data
    ↓
Confirm & Save
```

**Method 3: AI-Powered Text Input**
```
Dashboard → Voice/Text Input
    ↓
Speak or Type Natural Language:
  Example: "Visited Apollo hospital yesterday for fever, 
           doctor was Dr. Sharma, got blood test done"
    ↓
AI Parsing Extracts:
  - Hospital: Apollo
  - Date: Yesterday
  - Symptoms: Fever
  - Provider: Dr. Sharma
  - Tests: Blood work
    ↓
System Creates Record
    ↓
User Confirms Details
```

---

### User Journey: View Medical Timeline

**Current State**: Patient views comprehensive health history

```
Dashboard → Timeline View
    ↓
Display All Records Chronologically (Newest First):
  - Medications taken
  - Doctor appointments
  - Lab results
  - Symptoms recorded
  - Vaccinations
  - Surgery history
  - Hospital visits
    ↓
User Can:
  - Search by date, keyword, type
  - Filter by record type
  - View full details of each record
  - Edit or delete own records
  - Share with providers
```

**Timeline Features**:
- Visual health node graph (connections between related events)
- Color-coded by record type
- Quick access to recent records
- Integration with family members' timelines

---

### User Journey: Track Health Metrics

#### Sub-Journey: Medication Adherence
```
Dashboard → Medications
    ↓
View All Active Medications:
  - Medication name
  - Dosage and frequency
  - Prescribed by (doctor name)
  - Start & end dates
  - Reason for medication
    ↓
Track Adherence:
  - Mark doses taken
  - Log missed doses
  - Add notes (side effects, issues)
    ↓
Receive Reminders:
  - App notifications
  - SMS alerts (if enabled)
  - Email reminders
    ↓
View Adherence Analytics:
  - % adherence rate
  - Trend over time
  - Insights & recommendations
```

#### Sub-Journey: Chronic Condition Management
```
Dashboard → Chronic Conditions
    ↓
View Active Conditions:
  - Condition name
  - Diagnosis date
  - Managing provider
  - Related medications
  - Last check-up date
    ↓
Track Condition Metrics:
  - Blood pressure (for hypertension)
  - Blood sugar (for diabetes)
  - Weight (for cardiac conditions)
  - Lab values
    ↓
Receive Alerts:
  - When values go out of normal range
  - When check-up is overdue
  - When medication refill needed
```

#### Sub-Journey: Lab Results Tracking
```
Dashboard → Lab Results
    ↓
View All Lab Reports:
  - Test name (CBC, lipid profile, glucose)
  - Test date
  - Laboratory name
  - Status (Normal, Abnormal, Pending)
    ↓
Click on Report:
  - View detailed results
  - See reference ranges
  - Get interpretation (if provided by provider)
  - Compare with previous results
    ↓
AI Analysis:
  - Flags abnormalities
  - Shows trends
  - Provides educational info
  - Recommends when to follow up
```

---

### User Journey: Access Control & Privacy

#### Sub-Journey: Grant Provider Access
```
Dashboard → Manage Access
    ↓
View All Connected Providers:
  - Provider name and specialty
  - Date access granted
  - Permission level
  - Last accessed date
    ↓
Add New Provider:
  - Enter provider email/ID
  - OR QR code scan
  - OR provider initiates request
    ↓
Select Permission Level:
  - Read Only (view records only)
  - Read + Comment (add notes)
  - Read + Edit (modify records)
  - Full Access (all permissions)
    ↓
Set Expiration (optional):
  - Permanent access
  - 6 months
  - 1 year
  - Custom date
    ↓
Confirm & Send Access Link
    ↓
Provider Receives Notification
    ↓
Provider Accepts Access Request
```

#### Sub-Journey: Manage Privacy Settings
```
Settings → Privacy & Security
    ↓
Data Privacy Options:
  - Which records are shared with which providers
  - Specific record hiding (mark as private)
  - Anonymous mode (hide personal details)
    ↓
Security Options:
  - Enable biometric authentication
  - Change password
  - Review login history
  - Set session timeout
  - Enable two-factor authentication
    ↓
Data Export:
  - Download complete health records (PDF)
  - Export to other platforms
  - Share with new provider
```

---

### User Journey: Receive Clinical Alerts

```
Background: System monitors health data
    ↓
Alert Triggered When:
  - Abnormal lab value detected
  - Medication adherence drops below 70%
  - Chronic condition metric out of range
  - Appointment reminder needed
  - Vaccination overdue
  - Lab result available from provider
    ↓
Alert Delivery:
  - In-app notification (red banner)
  - Push notification (mobile)
  - Email summary (daily/weekly)
  - SMS (critical alerts only)
    ↓
User Action:
  - View full alert details
  - Dismiss alert
  - Schedule provider appointment
  - Take immediate action
  - Mark as reviewed
    ↓
Alert Cleared When:
  - Action taken (e.g., scheduled appointment)
  - Condition resolved
  - User manually clears alert
```

---

### User Journey: Consult Provider via Messaging

```
Dashboard → Messages
    ↓
View Message Threads:
  - List of all connected providers
  - Unread message count
  - Last message preview
  - Timestamp
    ↓
Start New Message:
  - Search provider
  - Select from connected providers
  - OR request access to new provider
    ↓
Send Message:
  - Type text message
  - Attach relevant medical records
  - Attach images/documents
  - Set priority (normal/urgent)
    ↓
Receive Response:
  - In-app notification
  - Push notification
  - Email notification
    ↓
Message Thread Features:
  - View full conversation history
  - Search within messages
  - Archive old conversations
  - Mark as unread
```

---

## 👨‍⚕️ USER TYPE 2: HEALTHCARE PROVIDER

### Primary Objectives
- Manage list of patients
- View patient medical records
- Monitor patient health metrics
- Send clinical alerts to patients
- Generate patient reports
- Communicate with patients
- Audit patient data access

### User Journey: Provider Onboarding & Account Setup

#### Stage 1: Registration
```
Landing Page → Provider Login/Signup
    ↓
Provider Chooses: "I'm a Healthcare Provider"
    ↓
Step 1: Professional Credentials
  - Full name
  - Medical license number
  - Specialization (Cardiology, Pediatrics, etc.)
  - Contact email
  - Mobile number
    ↓
Step 2: Professional Details
  - Hospital/Clinic name
  - Address
  - Practice license number
  - Years of experience
    ↓
Step 3: Identity Verification
  - Accept privacy policy (HIPAA compliance)
  - Accept terms & conditions
  - Verify email via confirmation link
    ↓
Step 4: Security Setup
  - Create strong password
  - Set up two-factor authentication
  - Enroll biometric authentication
  - Create backup codes
    ↓
Account Created → Dashboard Access Granted
```

---

### User Journey: Patient Management

#### Sub-Journey: View Patient List
```
Provider Dashboard → Patients
    ↓
View List of All Patients:
  - Patient name
  - Patient ID
  - Last visit date
  - Active conditions
  - Unread alerts count
  - Access permission level
    ↓
Filter & Search:
  - Search by name/ID
  - Filter by condition
  - Filter by last visit date
  - Sort by recent/active
    ↓
Quick Actions:
  - View patient details
  - Send message
  - View medical records
  - Generate report
  - Add/update notes
```

#### Sub-Journey: View Patient Details
```
Patient List → Click Patient Name
    ↓
Patient Overview Page:
  - Patient demographics
  - Active conditions
  - Current medications
  - Recent vital signs
  - Latest lab results
  - Next appointment date
  - Alerts & notifications
    ↓
Tabbed Interface:
  1. Overview (summary)
  2. Timeline (chronological records)
  3. Medications (current & past)
  4. Lab Results (all tests)
  5. Conditions (chronic conditions)
  6. Documents (uploaded files)
  7. Communication (messages)
  8. Access Log (audit trail)
    ↓
Provider Can:
  - View full medical history
  - Add clinical notes
  - Order tests
  - Add prescriptions
  - Send alerts/recommendations
  - Schedule follow-up appointment
```

---

### User Journey: Monitor Clinical Alerts

```
Provider Dashboard → Alerts
    ↓
View All Patient Alerts:
  - Alert type (abnormal lab, medication issue, etc.)
  - Patient name
  - Alert severity (critical, high, medium, low)
  - Alert date/time
  - Status (new, acknowledged, resolved)
    ↓
Alert Categories:
  - Abnormal Lab Results
  - Medication Adherence Issues
  - Vital Signs Out of Range
  - Overdue Appointments
  - Overdue Medications
  - Patient-Reported Issues
    ↓
Click Alert → View Details:
  - Full alert description
  - Related patient records
  - Severity justification
  - Recommended action
    ↓
Take Action:
  - Send message to patient
  - Schedule urgent appointment
  - Request additional tests
  - Update treatment plan
  - Mark alert as acknowledged
  - Dismiss alert
    ↓
Alert Status Updated:
  - New → Acknowledged (provider reviewed)
  - Acknowledged → Resolved (action taken)
  - Any → Dismissed (not actionable)
```

---

### User Journey: Generate Patient Reports

```
Patient Details → Reports
    ↓
Report Generator:
  - Select report type
    • Summary Report (overview)
    • Complete Medical History
    • Lab Results Report
    • Medication History
    • Chronic Condition Report
    • Appointment Summary
    ↓
Customize Report:
  - Date range
  - Specific conditions
  - Specific medications
  - Include/exclude sections
  - Add custom notes
    ↓
Generate Report:
  - System compiles data
  - Formats as PDF
  - Adds provider signature/stamp
    ↓
Report Options:
  - Download to computer
  - Email to patient
  - Print
  - Share with other providers
  - Send to insurance company
  - Attach to EHR system
```

---

### User Journey: Monitor Patient Health Metrics

#### Sub-Journey: Review Lab Abnormalities
```
Provider Dashboard → Alerts → Lab Abnormality
    ↓
Alert Details Show:
  - Lab test name
  - Test value
  - Normal range
  - Status (Critical/High/Low/Abnormal)
  - Patient name
  - Test date
  - Ordering provider (if different)
    ↓
Provider Reviews:
  - Compare with previous results
  - Assess trend over time
  - Determine if immediate action needed
    ↓
Provider Actions:
  - Send alert to patient
  - Schedule appointment
  - Order follow-up tests
  - Adjust medication
  - Send educational information
  - Add clinical note
```

#### Sub-Journey: Monitor Medication Adherence
```
Patient Details → Medications Tab
    ↓
View All Active Medications:
  - Medication name
  - Prescribed dose & frequency
  - Adherence rate (%)
  - Status (adherent/not adherent)
  - Days since last dose logged
    ↓
Adherence Metrics:
  - Overall adherence % (must be >80%)
  - Missed doses this month
  - Trend over past 3 months
  - Color-coded indicator (green/yellow/red)
    ↓
If Adherence < 70%:
  - Alert generated
  - Provider receives notification
    ↓
Provider Actions:
  - Send reminder message to patient
  - Discuss barriers during appointment
  - Adjust medication if side effects reported
  - Recommend alarm/reminder app
  - Escalate if critical medication
```

---

### User Journey: Communicate with Patients

```
Provider Dashboard → Messages
    ↓
View Message List:
  - All connected patients
  - Unread message count
  - Last message snippet
  - Patient name & ID
    ↓
Open Message Thread:
  - View conversation history
  - Read timestamp of messages
    ↓
Send Message:
  - Type consultation message
  - Attach patient records
  - Attach test results
  - Attach educational materials
  - Set priority level
  - Request response by date (optional)
    ↓
Message Delivery:
  - Sent to patient in-app
  - Push notification sent
  - Email notification sent
  - SMS (if enabled for critical)
    ↓
Patient Response:
  - Provider receives notification
  - Can include questions, concerns, updates
    ↓
Provider Actions:
  - Reply immediately
  - Schedule appointment
  - Escalate if urgent
  - Mark as resolved
```

---

### User Journey: Request/Manage Patient Access

#### Sub-Journey: Accept Access Request
```
Provider Inbox → Access Requests
    ↓
New Access Request Shows:
  - Patient name
  - Request date/time
  - Requested access level
  - Request source (direct/patient-initiated)
    ↓
Provider Reviews Request:
  - Verifies patient identity (if needed)
  - Assesses if applicable to their practice
  - Decides to accept/reject
    ↓
Accept Access:
  - Access granted immediately
  - Patient receives confirmation
  - Records become visible
    ↓
Reject Access:
  - Patient receives notification
  - Access request expires
  - Can try again later
```

---

### User Journey: Audit & Compliance

```
Provider Settings → Access Log
    ↓
View Complete Audit Trail:
  - Patient name
  - Date & time accessed
  - Records viewed
  - Actions taken (view, edit, delete)
  - IP address / device
  - Duration of access
    ↓
Filter Audit Log:
  - By date range
  - By patient
  - By action type
  - By device
    ↓
HIPAA Compliance:
  - Every data access logged
  - Cannot be deleted
  - Automatically reported to patient
  - Available for regulatory audits
    ↓
Provider Can:
  - Export audit log for compliance
  - Share with compliance officer
  - Review for suspicious activity
  - Verify legitimate access only
```

---

## 👨‍💼 USER TYPE 3: SYSTEM ADMINISTRATOR

### Primary Objectives
- Manage user accounts and permissions
- Monitor system health and performance
- Verify provider credentials
- Handle compliance and regulatory requirements
- Generate system-wide reports
- Manage abuse and security issues

### User Journey: Account Management

```
Admin Dashboard → User Management
    ↓
View All Users:
  - Patients
  - Providers
  - Administrators
    ↓
Actions Available:
  - Create new account
  - Edit user details
  - Reset password
  - Suspend/reactivate account
  - Delete account (with backup)
  - Change permission levels
  - View user activity
    ↓
User Details:
  - Account creation date
  - Last login
  - Login attempts
  - Account status (active/suspended/inactive)
  - Security flags (if any)
```

---

### User Journey: Provider Verification

```
Admin Dashboard → Provider Verification
    ↓
View Pending Providers:
  - New provider registrations
  - Status: Awaiting verification
  - Days pending
    ↓
Verify Provider:
  - Review professional credentials
  - Verify medical license number
  - Cross-check with medical board
  - Verify hospital affiliation
  - Confirm email authenticity
    ↓
Verification Options:
  - Approve (account activated)
  - Request more documentation
  - Reject (account deactivated)
    ↓
Provider Notification:
  - Email sent with status
  - If approved: full access granted
  - If rejected: reason provided
```

---

### User Journey: Compliance & Reporting

```
Admin Dashboard → Compliance
    ↓
Generate Reports:
  - HIPAA compliance reports
  - Data access audit reports
  - User activity reports
  - System security reports
  - Provider verification status
    ↓
Monitor System Health:
  - User growth metrics
  - Active user count
  - Data storage usage
  - System uptime
  - Error rates
    ↓
Export Data:
  - Compliance documentation
  - Regulatory filings
  - Usage statistics
  - Security audit trails
```

---

## 🔄 CROSS-USER WORKFLOWS

### Workflow 1: Patient → Provider Access Flow

```
Patient Initiates:
  Patient Dashboard → Manage Access → Add Provider
    ↓
Patient Enters:
  - Provider email or ID
  - Permission level
  - Access duration (optional)
    ↓
System Sends:
  - Access invitation to provider
  - Provider receives notification
    ↓
Provider Accepts:
  - Provider clicks accept link
  - Verifies patient identity
  - Access to records granted
    ↓
Patient Notified:
  - Email confirmation sent
  - Provider name added to access list
  - Can revoke anytime
    ↓
Provider Can Now:
  - View all patient records
  - Send messages
  - Generate reports
  - Add clinical notes
  - Based on permission level
```

---

### Workflow 2: Provider-Initiated Patient Alert

```
Provider Action:
  Provider Dashboard → Select Patient → Send Alert
    ↓
Create Alert:
  - Type: abnormal lab result
  - Message: explanation
  - Recommendation: suggested action
  - Urgency: normal/urgent/critical
    ↓
Alert Sent:
  - Patient receives in-app notification
  - Push notification sent
  - Email notification sent
  - SMS (if critical)
    ↓
Patient Response:
  - Views alert details
  - Acknowledges understanding
  - Takes recommended action
  - Sends message with questions
  - OR schedules appointment
    ↓
Provider Follows Up:
  - Monitors patient response
  - Sends follow-up if needed
  - Updates patient status
```

---

### Workflow 3: Provider Handoff / Transfer

```
Patient Scenario:
  Patient visits Cardiologist A
  Later wants to visit Cardiologist B
    ↓
Process:
  Patient removes access from Cardiologist A
  Patient grants access to Cardiologist B
    ↓
Cardiologist B Can:
  - View complete cardiology history
  - See previous diagnoses
  - Review past treatments
  - Continue care seamlessly
    ↓
Audit Trail:
  - Cardiologist A access revoked
  - Timestamp recorded
  - Notification sent to both
  - Compliance documented
```

---

## 📊 KEY USER METRICS & BEHAVIORS

### Patient Engagement Metrics
- **Average Session Duration**: 10-15 minutes
- **Most Active Time**: Evening (6-9 PM)
- **Record Upload Frequency**: 2-3 per week
- **Provider Messages Sent**: 1-2 per week
- **Timeline Views**: Daily (if chronic condition patient)

### Provider Engagement Metrics
- **Daily Active Patients**: 15-50 per provider
- **Messages Reviewed**: 10-20 per day
- **Alert Response Time**: Average 2-4 hours
- **Reports Generated**: 5-15 per week
- **Access Reviews**: Monthly (compliance check)

---

## ⚠️ COMMON PAIN POINTS & SOLUTIONS

### Patient Pain Points
1. **Difficulty remembering medication names/dosages**
   - Solution: Barcode scanning, voice input with AI parsing

2. **Unsure which records to share**
   - Solution: Guided permission wizard, template presets

3. **Fear of privacy breach**
   - Solution: Clear privacy controls, audit trail visibility

4. **Too many notifications**
   - Solution: Customizable alert settings, digest options

### Provider Pain Points
1. **Information overload (too many alerts)**
   - Solution: Alert prioritization, configurable thresholds

2. **Time spent on documentation**
   - Solution: Auto-populated fields, template notes

3. **Patient adherence tracking**
   - Solution: Automated adherence dashboard with trends

4. **Coordinating with multiple providers**
   - Solution: Care team feature, shared patient notes

---

## 🎯 CRITICAL SUCCESS PATHS

### For Patients
✅ Complete onboarding in < 10 minutes  
✅ Upload first record within 1 week  
✅ Grant provider access within 2 weeks  
✅ Achieve 80%+ medication adherence  
✅ Respond to clinical alerts within 24 hours  

### For Providers
✅ Complete verification within 5 business days  
✅ Access first patient records within 1 day  
✅ Respond to first patient message within 4 hours  
✅ Generate first report within 2 weeks  
✅ Monitor all active patients weekly  

### For System
✅ Zero data loss  
✅ 99.9% uptime  
✅ < 2 second page load time  
✅ 100% HIPAA compliance  
✅ Complete audit trail maintenance  

---

## 📱 PLATFORM-SPECIFIC JOURNEYS

### Web Application
- Full features available
- Desktop-optimized interface
- Detailed analytics dashboards
- Document upload/download
- Report generation & export

### Mobile Application
- Core features only (read/write records)
- Simplified navigation
- Voice input for quick logging
- Push notifications
- Touch-optimized interface
- Biometric authentication

### API/Third-Party Integration
- EHR system integration
- Lab results import
- Appointment calendar sync
- Insurance verification
- Health device data sync

---

**Document Status**: ✅ Complete & Comprehensive  
**Last Review**: October 21, 2026  
**Next Review**: Upon new feature addition
