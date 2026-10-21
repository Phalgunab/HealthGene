# Sprint 5 Phase 3: Patient Access Management - Implementation Plan

**Phase**: 3 of 5
**Component**: Patient-side provider access management
**Estimated Time**: 3-4 hours
**Status**: Starting

---

## Overview

Phase 3 enables patients to manage which healthcare providers have access to their medical data. Patients can:
- View all providers with current access
- Grant new providers access
- Revoke access from existing providers
- Set permission levels (Full, Adherence Only, Read Only, Custom)
- View access history and audit logs
- Filter and search through providers

---

## Architecture

### Components to Build

#### 1. ManageProviderAccess.jsx (Main Component)
**Purpose**: Patient-facing interface for managing provider access
**Location**: `src/components/ProviderAccess/ManageProviderAccess.jsx`

**Features**:
- Display active providers with access (table/card view)
- Search and filter providers
- Quick actions: Edit permissions, Revoke access
- "Grant New Provider Access" button
- Show access level for each provider
- Show last accessed timestamp
- Sort options (name, date accessed, permission level)

**State Management**:
```javascript
const [providers, setProviders] = useState([])
const [showGrantModal, setShowGrantModal] = useState(false)
const [selectedProvider, setSelectedProvider] = useState(null)
const [searchTerm, setSearchTerm] = useState('')
const [sortBy, setSortBy] = useState('name')
const [filterLevel, setFilterLevel] = useState('all')
const [loading, setLoading] = useState(false)
const [confirmRevoke, setConfirmRevoke] = useState(null)
```

#### 2. GrantAccessModal.jsx (Modal Component)
**Purpose**: Modal interface for granting access to new providers
**Location**: `src/components/ProviderAccess/GrantAccessModal.jsx`

**Features**:
- Search for providers by name/NPI
- Display provider details (specialty, organization, license)
- Permission level selector with descriptions
- Data type selector for custom permissions
- Terms & conditions checkbox
- Grant/Cancel buttons
- Loading state during submission

**Permission Levels**:
1. **Full Access**: All patient data
2. **Adherence Only**: Adherence metrics only
3. **Read Only**: View all data, no messaging
4. **Custom**: Select specific data types

**Data Types**:
- Medications
- Adherence data
- Adherence trends
- Identified barriers
- Recommended interventions
- Lab results
- Medical history

#### 3. AccessHistoryView.jsx (History Component)
**Purpose**: Display access history and audit logs
**Location**: `src/components/ProviderAccess/AccessHistoryView.jsx`

**Features**:
- Timeline of all access events
- Event type (granted, revoked, updated, accessed)
- Provider name
- Permission level
- Timestamp
- Filter by date range
- Filter by event type
- Export audit log

**Data Structure**:
```javascript
{
  id: 'event_id',
  type: 'granted|revoked|updated|accessed',
  providerId: 'provider_id',
  providerName: 'Dr. Smith',
  permissionLevel: 'Full|AdherenceOnly|ReadOnly|Custom',
  timestamp: '2024-03-15T10:30:00Z',
  description: 'Access granted to Dr. John Smith'
}
```

#### 4. ProviderCard.jsx (Sub-component)
**Purpose**: Reusable provider card for display
**Location**: `src/components/ProviderAccess/ProviderCard.jsx`

**Features**:
- Provider avatar/initials
- Name and specialty
- Organization
- Access level badge
- Last accessed time
- Quick action buttons
- Permission indicator

#### 5. PermissionLevelSelector.jsx (Sub-component)
**Purpose**: Reusable permission level selector
**Location**: `src/components/ProviderAccess/PermissionLevelSelector.jsx`

**Features**:
- 4 preset options (Full, Adherence Only, Read Only, Custom)
- Radio buttons or button group
- Description for each level
- Custom data type checkboxes
- Visual indicator of current selection

---

## Utilities to Build

**File**: `src/utils/accessManagement.js`

### Functions

#### 1. validateAccessPermission(permissionData)
**Purpose**: Validate permission data before submission
**Returns**: { isValid: boolean, errors: object }
```javascript
validateAccessPermission({
  providerId: 'required',
  permissionLevel: 'Full|AdherenceOnly|ReadOnly|Custom',
  customPermissions: [] // if Custom selected
})
```

#### 2. getProviderAccessList(userId)
**Purpose**: Fetch list of providers with access
**Returns**: Promise<Array<Provider>>
```javascript
{
  id: 'provider_id',
  name: 'Dr. Smith',
  specialty: 'Cardiologist',
  organization: 'Heart Hospital',
  permissionLevel: 'Full',
  lastAccessed: '2024-03-15T10:30:00Z',
  grantedDate: '2024-01-01T00:00:00Z'
}
```

#### 3. grantProviderAccess(userId, providerId, permissionLevel, customPermissions)
**Purpose**: Grant access to a provider
**Returns**: Promise<{ success: boolean, event: AccessEvent }>

#### 4. revokeProviderAccess(userId, providerId)
**Purpose**: Revoke access from a provider
**Returns**: Promise<{ success: boolean, event: AccessEvent }>

#### 5. updateAccessLevel(userId, providerId, newLevel, customPermissions)
**Purpose**: Update permission level for existing provider access
**Returns**: Promise<{ success: boolean, event: AccessEvent }>

#### 6. getAccessHistory(userId, filters)
**Purpose**: Fetch access history with optional filters
**Returns**: Promise<Array<AccessEvent>>
```javascript
filters: {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  eventType: 'granted|revoked|updated|accessed',
  providerId: 'optional'
}
```

#### 7. searchProviders(query, limit = 10)
**Purpose**: Search for providers by name or NPI
**Returns**: Promise<Array<Provider>>

#### 8. calculateAccessExpiration(grantedDate, expiryDays = 365)
**Purpose**: Calculate when access expires (annual expiration)
**Returns**: Date

#### 9. getAccessDataTypes(permissionLevel)
**Purpose**: Get available data types for permission level
**Returns**: Array<string>

#### 10. logAccessEvent(userId, providerId, eventType, details)
**Purpose**: Log access event for audit trail
**Returns**: Promise<AccessEvent>

---

## CSS Styling

**File**: `src/styles/ProviderAccess.css`

**Key Sections**:

1. **Container & Layout** (100 lines)
   - Main container with padding
   - Header with title and action buttons
   - Tab navigation (Active, History)
   - Search and filter bar layout

2. **Provider Cards** (150 lines)
   - Card styling with shadow
   - Avatar/initials circle
   - Provider info layout
   - Permission level badge colors:
     * Full: Green
     * AdherenceOnly: Blue
     * ReadOnly: Orange
     * Custom: Purple
   - Last accessed timestamp
   - Quick action buttons

3. **Modal Styling** (200 lines)
   - Modal overlay and background
   - Modal content box
   - Header with close button
   - Form sections
   - Permission level options with descriptions
   - Data type checkboxes grid
   - Footer with action buttons
   - Loading spinner

4. **Access History** (150 lines)
   - Timeline layout
   - Event items with icon
   - Event type indicators
   - Timestamp formatting
   - Filter controls
   - Expandable event details

5. **Responsive Design** (100 lines)
   - Tablet breakpoint (1200px)
   - Mobile breakpoint (768px)
   - Extra small devices (480px)
   - Card stacking
   - Button sizing
   - Text sizing

**Total CSS**: ~700 lines

---

## State Management Strategy

### Data Flow
```
Patient Views ManageProviderAccess
  ↓
useEffect: Load providers list
  ↓
Display provider cards from state
  ↓
User clicks "Grant Access"
  ↓
Show GrantAccessModal
  ↓
User searches for provider
  ↓
User selects permission level
  ↓
User clicks "Grant Access"
  ↓
Validate data
  ↓
Call grantProviderAccess()
  ↓
Update providers list
  ↓
Log access event
  ↓
Show success notification
  ↓
Close modal & refresh view
```

---

## Integration Points

### With Firebase
- Firestore collection: `users/{userId}/providerAccess/{accessId}`
- Firestore collection: `users/{userId}/accessHistory/{eventId}`
- Security rules: Only patient or authorized admin can access
- Real-time listeners: Update on new access events

### With Provider Component
- Search providers from provider database
- Validate provider NPI and credentials
- Use provider specialties for display

### With Patient Component
- Display access info in patient profile
- Show access count in dashboard
- Export audit log from dashboard

---

## Testing Strategy

### Unit Tests
- [ ] validateAccessPermission() with valid/invalid data
- [ ] calculateAccessExpiration() with various dates
- [ ] getAccessDataTypes() for each permission level
- [ ] searchProviders() with various queries

### Integration Tests
- [ ] Grant access flow end-to-end
- [ ] Revoke access flow
- [ ] Update permission level
- [ ] Access history logging
- [ ] Real-time update on new access

### Component Tests
- [ ] ManageProviderAccess renders correctly
- [ ] GrantAccessModal opens/closes
- [ ] Permission level selector works
- [ ] Search functionality works
- [ ] Access history displays events

### E2E Tests
- [ ] Full patient workflow (grant → view → revoke)
- [ ] Provider sees shared data in dashboard
- [ ] Audit log captures all events
- [ ] Expired access is removed

---

## Success Criteria

✅ All components render without errors
✅ Grant access flow works end-to-end
✅ Revoke access works
✅ Update permission level works
✅ Access history displays correctly
✅ Search functionality returns accurate results
✅ All validations working
✅ Responsive design on all breakpoints
✅ Build completes with zero errors
✅ Deployment successful to Firebase
✅ Documentation complete

---

## Deliverables

1. ✅ ManageProviderAccess.jsx (250-300 lines)
2. ✅ GrantAccessModal.jsx (200-250 lines)
3. ✅ AccessHistoryView.jsx (150-200 lines)
4. ✅ ProviderCard.jsx (80-100 lines)
5. ✅ PermissionLevelSelector.jsx (60-80 lines)
6. ✅ accessManagement.js utilities (250-300 lines)
7. ✅ ProviderAccess.css (700 lines)
8. ✅ Build and deploy to Firebase
9. ✅ SPRINT5_PHASE3_COMPLETE.md documentation

---

## Time Breakdown

- Component development: 90 minutes
- Utilities implementation: 30 minutes
- CSS styling: 20 minutes
- Testing & refinement: 20 minutes
- Build & deploy: 10 minutes
- Documentation: 10 minutes

**Total**: 3-4 hours

---

**Next**: Phase 4 - Provider Dashboard
**After**: Phase 5 - Messaging & Reports
