# Phase 2: Patient Access Control Implementation Guide

## Quick Reference

### Files Already Existing (From Previous Implementation)
```
src/components/ProviderAccess/
├─ ManageProviderAccess.jsx (Main interface)
├─ GrantAccessModal.jsx (Grant workflow)
├─ PermissionLevelSelector.jsx (Permission selection)
├─ AccessHistoryView.jsx (History view)
└─ ProviderCard.jsx (Card display)

src/utils/
└─ accessManagement.js (API functions)

src/components/styles/
└─ ProviderAccess.css (Styling)
```

### What's Already Working
- ✅ Component structure exists
- ✅ Utils functions partially implemented
- ✅ CSS styling in place
- ✅ React hooks and state management

### What Needs Implementation

#### 1. **Complete Grant Access Workflow**

File: `src/components/ProviderAccess/GrantAccessModal.jsx`

```javascript
// Requirements:
- Search for provider by email
- Select permission level (4 options)
- Set expiration date (optional)
- Confirm and grant access
- Handle errors gracefully
- Show success message
```

#### 2. **Enhance Manage Provider Access**

File: `src/components/ProviderAccess/ManageProviderAccess.jsx`

```javascript
// Requirements:
- Load granted access list
- Display each provider with:
  - Provider name
  - Permission level
  - Grant date
  - Last accessed date
  - Expiration date (if set)
- Show revoke button for each
- Filter by permission level
- Search providers
- Pagination support
```

#### 3. **Implement Permission Level Selector**

File: `src/components/ProviderAccess/PermissionLevelSelector.jsx`

```javascript
// Permission Levels:
1. READ_ONLY
   └─ View patient data only
   
2. READ_COMMENT
   └─ View + Add notes/comments
   
3. READ_EDIT
   └─ View + Modify data
   
4. FULL_ACCESS
   └─ Complete control (requires confirmation)
```

#### 4. **Access History Implementation**

File: `src/components/ProviderAccess/AccessHistoryView.jsx`

```javascript
// Show:
- Complete log of access grants/revokes
- Timestamp for each action
- Admin action (if applicable)
- Filter by date range
- Export history (CSV)
```

#### 5. **Integrate with Patient Dashboard**

File: `src/main.jsx` (Patient Dashboard)

```javascript
// Add to patient navigation:
- "Provider Access" tab in patient dashboard
- Link to ManageProviderAccess component
- Show quick summary of active providers
- Notification when new access requested
```

---

## Implementation Order

### Step 1: Complete Grant Access
1. Update GrantAccessModal.jsx
2. Add provider search functionality
3. Implement permission level selection
4. Add expiration date picker
5. Write Firestore write logic

**Time Estimate:** 2-3 hours

### Step 2: Enhance Access Management
1. Load active access list
2. Display provider cards
3. Add filter/search
4. Implement revoke function
5. Add pagination

**Time Estimate:** 2-3 hours

### Step 3: Implement Revoke Workflow
1. Add revoke confirmation modal
2. Reason for revocation
3. Update Firestore record
4. Log action in audit trail
5. Notify provider

**Time Estimate:** 1-2 hours

### Step 4: Access History
1. Query audit logs
2. Display in timeline
3. Add date range filter
4. Export functionality

**Time Estimate:** 1-2 hours

### Step 5: Dashboard Integration
1. Add Provider Access tab
2. Add to patient navigation
3. Show access summary
4. Link to management interface

**Time Estimate:** 1 hour

---

## Firestore Structure Needed

### Collection: `users/{uid}/providerAccess/{providerId}`

```json
{
  "providerId": "provider_uid",
  "providerEmail": "doctor@hospital.com",
  "providerName": "Dr. John Smith",
  "specialization": "Cardiology",
  "permissionLevel": "READ_EDIT",
  "grantedAt": "2024-01-15T10:00:00Z",
  "expiresAt": "2024-03-15T10:00:00Z",
  "lastAccessedAt": "2024-01-15T12:30:00Z",
  "accessCount": 3,
  "status": "active"
}
```

### Collection: `accessAudit/{auditId}`

```json
{
  "action": "access_granted",
  "patientUid": "patient_uid",
  "providerUid": "provider_uid",
  "permissionLevel": "READ_EDIT",
  "actionBy": "patient_uid",
  "actionByRole": "patient",
  "timestamp": "2024-01-15T10:00:00Z",
  "expiresAt": "2024-03-15T10:00:00Z",
  "reason": null
}
```

---

## API Functions to Complete

### accessManagement.js

```javascript
// Already exists, needs completion:

export const getProviderAccessList = async (userId)
// Load all providers with current access

export const grantProviderAccess = async (userId, providerId, permissionLevel, expiryDate)
// Grant new provider access

export const revokeProviderAccess = async (userId, providerId, reason)
// Revoke provider access

export const updateAccessLevel = async (userId, providerId, newLevel)
// Update permission level

export const getAccessHistory = async (userId, limit)
// Get audit trail

export const formatPermissionLevel = (level)
// Format level for display
```

---

## Testing Strategy

### Unit Tests
- Permission level validation
- Expiration date calculation
- Access status checking
- Audit log creation

### Integration Tests
- Grant access workflow
- Revoke access workflow
- History filtering
- Notifications

### E2E Tests
- Patient grants access to provider
- Provider sees patient in list
- Patient revokes access
- Provider loses access
- History shows all actions

---

## UI/UX Considerations

### Grant Access Modal
```
[Search Provider Input]
↓
[Select Permission Level]
  ○ Read Only
  ○ Read + Comment
  ○ Read + Edit
  ◉ Full Access
↓
[Expiration Date Picker] (Optional)
↓
[Grant] [Cancel]
```

### Access List Card
```
┌─────────────────────────────┐
│ Dr. John Smith              │
│ john@hospital.com           │
│ Cardiology                  │
├─────────────────────────────┤
│ Permission: Read + Edit     │
│ Granted: Jan 15, 2024       │
│ Last Accessed: 2 hours ago  │
│ Expires: Mar 15, 2024       │
├─────────────────────────────┤
│ [View History] [Revoke]     │
└─────────────────────────────┘
```

---

## Security Checklist

- [ ] Only patient can grant/revoke own access
- [ ] Only admin can see all access records
- [ ] Audit trail logged for all changes
- [ ] Expired access automatically revoked
- [ ] Permission levels enforced in queries
- [ ] Firestore rules restrict access
- [ ] No sensitive data in logs

---

## Demo Workflow

1. **Patient logs in**
   - Dashboard shows "Provider Access" tab
   - Click tab to open ManageProviderAccess

2. **Patient grants access**
   - Click "Grant New Access"
   - Search for provider by email
   - Select permission level
   - Set 30-day expiration
   - Click "Grant Access"
   - See success message

3. **Access appears in list**
   - Provider card shows with details
   - Shows permission level
   - Shows grant date
   - Shows expiration date

4. **Patient revokes access**
   - Click "Revoke" on provider card
   - Confirm revocation
   - Add reason (optional)
   - Access removed from list
   - Logged in audit trail

5. **View history**
   - Click "Access History" tab
   - See timeline of all actions
   - Filter by date range
   - Export as CSV

---

## Files to Modify

### src/main.jsx
- Add Provider Access tab to patient dashboard
- Wire up ManageProviderAccess component
- Handle notifications for access requests

### src/utils/accessManagement.js
- Complete all API functions
- Add error handling
- Add validation

### src/components/ProviderAccess/*.jsx
- Complete all components
- Add state management
- Add UI/UX improvements

### src/styles/ProviderAccess.css
- Enhance styling if needed
- Mobile responsive adjustments

---

## Success Criteria

✅ Patient can grant provider access
✅ Patient can select permission level
✅ Patient can set expiration date
✅ Patient can revoke access
✅ Patient can view access history
✅ All actions logged in audit trail
✅ Provider sees patient in list after grant
✅ Provider loses access after revoke
✅ UI is responsive and intuitive
✅ Error handling works correctly
✅ All data validated before saving
✅ Security rules prevent unauthorized access

---

## Estimated Timeline

- **Total Time:** 8-10 hours
- **Step 1 (Grant):** 2-3 hours
- **Step 2 (Manage):** 2-3 hours
- **Step 3 (Revoke):** 1-2 hours
- **Step 4 (History):** 1-2 hours
- **Step 5 (Integration):** 1 hour
- **Testing:** 1-2 hours

---

## Next Phase (Phase 3)

After Access Control is complete:
- Provider-patient matching system
- Auto-assignment workflows
- Advanced analytics
- Compliance reporting
- Performance optimization

---

**Status:** Ready for Phase 2 Implementation
**Last Updated:** 2024-10-21
