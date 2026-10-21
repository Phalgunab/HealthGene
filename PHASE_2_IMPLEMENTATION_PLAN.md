# Phase 2: Patient Access Control Implementation Plan
## Complete Step-by-Step Roadmap

**Status**: 🟢 IN PROGRESS
**Duration**: 8-10 hours
**Started**: 2024-10-21

---

## 📋 Overview

Phase 2 implements complete patient-side healthcare provider access management. Patients can:
- ✅ Grant providers access to their health data
- ✅ Manage permission levels (4 tiers)
- ✅ Set data expiration dates
- ✅ Revoke access at any time
- ✅ View complete audit history
- ✅ Export access logs

---

## 🎯 Implementation Tasks

### Task 1: Firestore Collections Setup
**Status**: 🟡 PLANNED
**Time**: 30 min

#### Firestore Schema

```javascript
// providerAccess/{accessId}
{
  patientId: string,           // Patient UID
  providerId: string,          // Provider UID
  providerEmail: string,       // Provider email
  providerName: string,        // Provider name
  providerSpecialty: string,   // Specialty
  permissionLevel: string,     // READ_ONLY|READ_COMMENT|READ_EDIT|FULL_ACCESS
  customPermissions: string[], // For custom level
  grantedDate: Timestamp,      // When access granted
  expirationDate: Timestamp,   // null if no expiration
  lastAccessDate: Timestamp,   // Last time provider accessed
  status: string,              // 'active'|'revoked'|'expired'
  notes: string,               // Patient notes
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// accessAudit/{auditId}
{
  patientId: string,
  providerId: string,
  action: string,              // 'granted'|'revoked'|'updated'|'accessed'
  actionDate: Timestamp,
  actionBy: string,            // 'patient'|'admin'|'system'
  permissionLevel: string,
  reason: string,              // Why access was changed
  timestamp: Timestamp
}
```

#### Implementation Steps
1. ✅ Create Firestore security rules
2. ✅ Create indexes for queries
3. ✅ Define collection schemas
4. ✅ Add sample data for testing

---

### Task 2: Grant Access Workflow
**Status**: 🔴 IN PROGRESS
**Time**: 1.5 hours
**File**: `src/components/ProviderAccess/GrantAccessModal.jsx`

#### Features
- [ ] Provider search functionality
- [ ] Permission level selection
- [ ] Expiration date picker
- [ ] Custom permissions selector
- [ ] Terms & conditions acceptance
- [ ] Submit and create access
- [ ] Error handling and validation

#### Implementation Details

```javascript
// GrantAccessModal.jsx components
1. SearchProviderSection
   - Input field for provider email/name
   - Debounced search (500ms)
   - Results list with provider details
   - Selection handling

2. PermissionLevelSection
   - 4 radio buttons for permission tiers
   - Descriptions for each level
   - Custom permissions option
   - Permission detail modal

3. ExpirationDateSection
   - Date picker component
   - Optional expiration
   - Validation (cannot be past date)
   - Default options (30/60/90 days)

4. TermsSection
   - Checkbox for terms acceptance
   - Link to privacy policy
   - Submit button (disabled until agreed)

5. ConfirmationStep
   - Review all selections
   - Edit options
   - Confirm grant
   - Show success message
```

#### Key Functions to Implement
```javascript
export const searchProviders(searchTerm, limit = 10)
  // Search for providers by email, name, specialty
  
export const grantProviderAccessToFirestore(patientId, providerData)
  // Create providerAccess document in Firestore
  // Create audit log entry
  // Handle real-time sync
  
export const validateAccessGrant(grantData)
  // Validate all required fields
  // Check expiration date
  // Verify provider exists
```

---

### Task 3: Manage Provider Access
**Status**: 🔴 PLANNED
**Time**: 1.5 hours
**File**: `src/components/ProviderAccess/ManageProviderAccess.jsx`

#### Features
- [ ] Load and display all providers with access
- [ ] Show access details (level, date granted, last accessed)
- [ ] Search providers
- [ ] Filter by permission level
- [ ] Sort by name/date/last accessed
- [ ] Pagination (10 items/page)
- [ ] Edit permission level
- [ ] Revoke access with confirmation
- [ ] Show revocation reason dialog

#### Implementation Details

```javascript
// ManageProviderAccess sections

1. HeaderSection
   - Title & description
   - Grant new access button
   - Search bar

2. FilterSection
   - Permission level filter (All/READ/COMMENT/EDIT/FULL)
   - Status filter (Active/Revoked)
   - Sort options (Name/Date/Last Accessed)

3. ProviderList
   - Calls ProviderCard component for each
   - Pagination controls
   - Empty state handling
   - Loading skeleton

4. ProviderCard (see Task 5)
   - Shows provider info
   - Current permission
   - Last accessed date
   - Action buttons (Edit/Revoke)

5. RevokeConfirmationModal
   - Confirmation message
   - Reason input field
   - Cancel/Confirm buttons
   - Loading state
```

#### Key Functions
```javascript
export const getProviderAccessListFromFirestore(patientId)
  // Fetch all active access grants
  // Load provider details
  // Order by grant date
  
export const revokeProviderAccessFirestore(patientId, accessId)
  // Update access status to 'revoked'
  // Create audit entry
  // Update lastModified
```

---

### Task 4: Permission Level Selector
**Status**: 🔴 PLANNED
**Time**: 1 hour
**File**: `src/components/ProviderAccess/PermissionLevelSelector.jsx`

#### Permission Levels

```javascript
1. READ_ONLY
   - View all patient data
   - Cannot comment or edit
   - Read-only access

2. READ_COMMENT
   - View all data
   - Add notes/comments
   - Cannot edit records

3. READ_EDIT
   - View all data
   - Add comments
   - Edit data fields
   - Cannot delete records

4. FULL_ACCESS
   - Complete control
   - Requires confirmation
   - Can view, edit, delete
   - Can manage other providers (if admin)
```

#### Implementation
- [ ] Radio button group for each level
- [ ] Detailed description for each
- [ ] Icon for each permission
- [ ] Custom permissions checkbox
- [ ] Modal for custom selection
- [ ] Validation

---

### Task 5: Provider Card Component
**Status**: 🔴 PLANNED
**Time**: 45 min
**File**: `src/components/ProviderAccess/ProviderCard.jsx`

#### Display Information
- [ ] Provider name & specialty
- [ ] Organization/hospital name
- [ ] Permission level badge
- [ ] Grant date
- [ ] Last accessed date
- [ ] Expiration date (if set)
- [ ] Action buttons
- [ ] Status indicator

---

### Task 6: Access History View
**Status**: 🔴 PLANNED
**Time**: 1 hour
**File**: `src/components/ProviderAccess/AccessHistoryView.jsx`

#### Features
- [ ] Timeline of all access events
- [ ] Event types (granted/revoked/updated/accessed)
- [ ] Date & time stamps
- [ ] Who performed action
- [ ] Reason for changes
- [ ] Date range filter
- [ ] Export to CSV
- [ ] Search/filter

#### Event Types
```javascript
'granted'  → Access granted to provider
'revoked'  → Access revoked from provider
'updated'  → Permission level changed
'accessed' → Provider accessed patient data
```

---

### Task 7: Integration with Patient Dashboard
**Status**: 🔴 PLANNED
**Time**: 30 min
**File**: `src/main.jsx`

#### Changes
- [ ] Add "Provider Access" tab to patient navigation
- [ ] Add import for ManageProviderAccess
- [ ] Add tab state handling
- [ ] Update bottom nav with new tab
- [ ] Route to ManageProviderAccess when selected
- [ ] Pass userId prop

```javascript
// In patient dashboard nav
[['Home', Home], 
 ['Records', FileText], 
 ['Alerts', ShieldAlert], 
 ['Access', Lock],  // NEW
 ['Family', Users], 
 ['Profile', Settings]]
```

---

### Task 8: Firestore Real Integration
**Status**: 🔴 PLANNED
**Time**: 2 hours
**File**: `src/utils/accessManagement.js`

#### Replace Mock Data
- [ ] Replace mock getProviderAccessList with Firestore query
- [ ] Replace mock searchProviders with real search
- [ ] Replace mock grantProviderAccess with Firestore write
- [ ] Replace mock revokeProviderAccess with Firestore update
- [ ] Replace mock getAccessHistory with Firestore query
- [ ] Add real-time listeners for live updates
- [ ] Implement error handling
- [ ] Add retry logic

#### Firestore Queries

```javascript
// Get all active providers with access
const q = query(
  collection(db, 'users', patientId, 'providerAccess'),
  where('status', '==', 'active'),
  orderBy('grantedDate', 'desc')
);

// Search providers
const q = query(
  collection(db, 'providers'),
  where('email', '>=', searchTerm),
  where('email', '<', searchTerm + '\uf8ff'),
  limit(10)
);

// Get access history
const q = query(
  collection(db, 'users', patientId, 'accessAudit'),
  orderBy('actionDate', 'desc'),
  limit(100)
);
```

---

### Task 9: Testing & Validation
**Status**: 🔴 PLANNED
**Time**: 1.5 hours

#### Test Scenarios
- [ ] Grant access workflow (happy path)
- [ ] Grant access with expiration date
- [ ] Search for non-existent provider
- [ ] Select different permission levels
- [ ] Revoke access successfully
- [ ] View access history
- [ ] Filter and search on list
- [ ] Pagination works correctly
- [ ] Real-time updates when other devices change
- [ ] Error handling (network errors, validation)
- [ ] Mobile responsive design
- [ ] Audit logs created correctly

#### Validation Checks
- [ ] All required fields present
- [ ] Permission levels correct
- [ ] Dates in proper format
- [ ] Firestore rules allow operations
- [ ] Audit trail complete
- [ ] No sensitive data in logs

---

## 📊 Progress Tracking

| Task | Status | Progress | Time Est | Time Actual |
|------|--------|----------|----------|------------|
| 1. Firestore Setup | 🟡 | 0% | 30m | |
| 2. Grant Access | 🔴 | 0% | 1.5h | |
| 3. Manage Access | 🔴 | 0% | 1.5h | |
| 4. Permission Selector | 🔴 | 0% | 1h | |
| 5. Provider Card | 🔴 | 0% | 45m | |
| 6. Access History | 🔴 | 0% | 1h | |
| 7. Dashboard Integration | 🔴 | 0% | 30m | |
| 8. Firestore Integration | 🔴 | 0% | 2h | |
| 9. Testing & Validation | 🔴 | 0% | 1.5h | |

**Total**: 9.5 hours planned

---

## 🏗️ Architecture Overview

```
Patient Dashboard
├── Home
├── Records
├── Alerts
├── Provider Access (NEW)
│   ├── ManageProviderAccess
│   │   ├── SearchBar
│   │   ├── FilterPanel
│   │   ├── ProviderList
│   │   │   └── ProviderCard (×N)
│   │   ├── GrantAccessModal
│   │   │   ├── SearchProviderSection
│   │   │   ├── PermissionLevelSection
│   │   │   ├── ExpirationDateSection
│   │   │   └── TermsSection
│   │   └── AccessHistoryView
├── Family
└── Profile

Firestore Collections
├── users/{uid}
│   ├── providerAccess/{accessId}
│   └── accessAudit/{auditId}
└── providers/{uid}

Utilities
└── accessManagement.js
    ├── searchProviders()
    ├── grantProviderAccess()
    ├── revokeProviderAccess()
    ├── updateAccessLevel()
    ├── getAccessHistory()
    ├── getProviderAccessList()
    └── validateAccessPermission()
```

---

## ✅ Success Criteria

Phase 2 is complete when:

1. ✅ All components built and integrated
2. ✅ All Firestore operations working
3. ✅ Real-time updates functional
4. ✅ Full test coverage passing
5. ✅ Responsive design verified (mobile/tablet/desktop)
6. ✅ Audit logging complete
7. ✅ Error handling robust
8. ✅ No console errors or warnings
9. ✅ Build succeeds without warnings
10. ✅ Documentation updated

---

## 📚 Documentation Files

- [PHASE_2_ACCESS_CONTROL_GUIDE.md](./PHASE_2_ACCESS_CONTROL_GUIDE.md) - Original guide
- [PHASE_2_IMPLEMENTATION_PLAN.md](./PHASE_2_IMPLEMENTATION_PLAN.md) - This file
- Code comments and JSDoc in component files

---

## 🚀 Deployment

After Phase 2 complete:
1. Merge feature branch to main
2. Run full test suite
3. Deploy to staging
4. User acceptance testing
5. Deploy to production

---

**Generated**: 2024-10-21
**Last Updated**: 2024-10-21 22:49 UTC+8
