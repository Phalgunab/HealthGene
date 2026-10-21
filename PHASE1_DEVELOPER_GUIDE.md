# Phase 1 Component Quick Reference

## Component Overview

| Component | Lines | Status | Features |
|-----------|-------|--------|----------|
| HealthProfile | 300 | ✅ | Demographics, vitals, emergency contact |
| MedicationManager | 400 | ✅ | Add/edit/list, adherence tracking, refills |
| AllergyTracker | 350 | ✅ | Severity, critical alerts, safe alternatives |
| ChronicConditionTracker | 350 | ✅ | Status, review dates, complications |
| SurgicalHistoryTracker | 350 | ✅ | Surgery details, recovery, outcomes |
| AppointmentTracker | 400 | ✅ | Scheduling, findings, diagnoses, follow-ups |
| LabResultsTracker | 400 | ⏳ | Results, trends, reference ranges |
| StructuredDataDashboard | 500 | ⏳ | Overview, stats, quick actions |

## File Locations

```
src/
├── components/
│   ├── HealthProfile.jsx (300 lines)
│   ├── MedicationManager.jsx (400 lines)
│   ├── AllergyTracker.jsx (350 lines)
│   ├── ChronicConditionTracker.jsx (350 lines)
│   ├── SurgicalHistoryTracker.jsx (350 lines)
│   ├── AppointmentTracker.jsx (400 lines)
│   ├── LabResultsTracker.jsx (400 lines) [TODO]
│   └── StructuredDataDashboard.jsx (500 lines) [TODO]
│
└── utils/
    ├── healthDataValidation.js (399 lines)
    │   - MedicalValidationRules constants
    │   - validateBloodPressure(), validateHeartRate(), etc.
    │   - calculateBMI(), formatDate()
    │
    └── firestoreHealthDataManager.js (664 lines)
        - healthProfileManager (get, upsert)
        - medicationManager (CRUD + adherence)
        - allergyManager (CRUD + critical filtering)
        - chronicConditionManager (CRUD + active filtering)
        - surgeryManager (CRUD + timeline)
        - appointmentManager (CRUD + upcoming filtering)
        - labResultManager (CRUD + trend analysis)
        - referenceDataManager (common drugs/tests)
```

## Using Validation Utilities

```javascript
import {
  validateBloodPressure,
  validateMedicationName,
  validateAllergySeverity,
  calculateBMI,
  formatDate,
  formatDateForInput,
} from '../utils/healthDataValidation';

// Validate blood pressure
const validation = validateBloodPressure(120, 80);
if (!validation.isValid) {
  console.error(validation.errors); // ["Error message"]
}

// Calculate BMI
const bmi = calculateBMI(70, 175); // weight kg, height cm
console.log(bmi); // 22.9

// Format dates
const displayDate = formatDate(new Date()); // "October 21, 2026"
const inputDate = formatDateForInput(new Date()); // "2026-10-21"
```

## Using Firestore Manager

```javascript
import {
  medicationManager,
  allergyManager,
  chronicConditionManager,
} from '../utils/firestoreHealthDataManager';

// Add a medication
const med = await medicationManager.addMedication({
  medicationName: 'Aspirin',
  dosage: { value: 100, unit: 'mg' },
  frequency: 'Once daily',
  route: 'Oral',
  startDate: new Date(),
});
console.log(med.id); // Firestore document ID

// Get active medications
const activeMeds = await medicationManager.getActiveMedications();

// Update medication
await medicationManager.updateMedication(medicationId, {
  dosage: { value: 200, unit: 'mg' },
});

// Log adherence
await medicationManager.logAdherence(medicationId, new Date(), true);

// Get all allergies (including critical ones)
const allAllergies = await allergyManager.getAllAllergies();
const criticalAllergies = await allergyManager.getCriticalAllergies();
```

## Component Integration

### How to Import in main.jsx

```javascript
import HealthProfile from './components/HealthProfile';
import MedicationManager from './components/MedicationManager';
import AllergyTracker from './components/AllergyTracker';
import ChronicConditionTracker from './components/ChronicConditionTracker';
import SurgicalHistoryTracker from './components/SurgicalHistoryTracker';
import AppointmentTracker from './components/AppointmentTracker';

// Use in your app routing or tab navigation
<HealthProfile />
<MedicationManager />
<AllergyTracker />
// ... etc
```

### Component Props

**None of the Phase 1 components require props.** Each component manages:
- Its own state (forms, loaded data)
- Its own Firebase operations (CRUD)
- Its own validation
- Its own UI rendering

This makes them drop-in ready for any routing or navigation system.

## Firestore Security Rules (Already Implemented)

```javascript
match /users/{userId}/{document=**} {
  allow read, write: if request.auth.uid == userId;
}
match /reference_data/{document=**} {
  allow read: if request.auth != null;
  allow write: if request.auth.token.admin == true;
}
```

## Medical Validation Constants

### Vital Signs Ranges
```javascript
MedicalValidationRules.bloodPressure // systolic: 70-200, diastolic: 40-130
MedicalValidationRules.heartRate // 30-200 bpm
MedicalValidationRules.temperature // 35-42°C
MedicalValidationRules.height // 50-300 cm
MedicalValidationRules.weight // 2-300 kg
```

### Allergy Severity Levels
```javascript
ALLERGY_SEVERITY_LEVELS = ['Mild', 'Moderate', 'Severe', 'Life-threatening']
```

## Common Patterns

### Component State Pattern
```javascript
const [loading, setLoading] = useState(false);
const [data, setData] = useState([]);
const [error, setError] = useState('');
const [success, setSuccess] = useState('');
const [showForm, setShowForm] = useState(false);
const [editingId, setEditingId] = useState(null);
const [formData, setFormData] = useState({ /* initial values */ });
const [validationErrors, setValidationErrors] = useState({});
```

### Load Data Pattern
```javascript
useEffect(() => {
  loadData();
}, [filter]); // Re-load when filter changes

const loadData = async () => {
  try {
    setLoading(true);
    const data = await manager.getFiltered();
    setData(data);
  } catch (err) {
    setError('Failed to load: ' + err.message);
  } finally {
    setLoading(false);
  }
};
```

### Form Submit Pattern
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) {
    setError('Please fix validation errors');
    return;
  }

  try {
    if (editingId) {
      await manager.update(editingId, formData);
      setSuccess('Updated successfully!');
    } else {
      await manager.add(formData);
      setSuccess('Added successfully!');
    }
    // Reset form and reload
  } catch (err) {
    setError('Failed: ' + err.message);
  }
};
```

## Testing Strategy (Not Yet Implemented)

### Unit Tests
- Validation functions (healthDataValidation.js)
- Manager functions (firestoreHealthDataManager.js)
- Component logic hooks

### Integration Tests
- Data flow: add → store → retrieve
- Family sync (if applicable)
- Data consistency

### E2E Tests
- Complete user workflows
- CRUD sequences
- Validation error handling

## Deployment Checklist

- [ ] All components built and tested
- [ ] All tests written and passing
- [ ] Firestore collections created
- [ ] Reference data (medications, lab tests) populated
- [ ] Security rules applied
- [ ] Staging deployment complete
- [ ] Stakeholder review complete
- [ ] Production deployment scheduled
- [ ] Error monitoring active
- [ ] Backup plan ready

## Next Steps

1. **Complete LabResultsTracker** - Add lab result tracking with trends
2. **Complete StructuredDataDashboard** - Add overview and analytics
3. **Write Tests** - Unit, integration, and E2E tests
4. **Performance Testing** - Test with large datasets
5. **Staging Deployment** - Deploy to staging environment
6. **Documentation** - API docs and user guide
7. **Production Deployment** - Deploy to production

## Support

For questions or issues:
- Check component source code (includes detailed comments)
- Review validation functions for medical rules
- Check Firestore manager for database operations
- Refer to original PHASE1_IMPLEMENTATION_PLAN.md for specifications

