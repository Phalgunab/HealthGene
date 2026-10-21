/**
 * Health Data Validation Utilities
 * Provides validation rules for medical data according to clinical standards
 */

export const MedicalValidationRules = {
  // Vital signs ranges
  bloodPressure: {
    systolicMin: 70,
    systolicMax: 200,
    diastolicMin: 40,
    diastolicMax: 130,
  },
  heartRate: {
    min: 30,
    max: 200,
  },
  temperature: {
    min: 35,
    max: 42,
  },
  height: {
    min: 50,
    max: 300, // cm
  },
  weight: {
    min: 2,
    max: 300, // kg
  },
};

/**
 * Validate blood pressure values
 */
export const validateBloodPressure = (systolic, diastolic) => {
  const errors = [];

  if (!Number.isInteger(systolic) || systolic < MedicalValidationRules.bloodPressure.systolicMin || systolic > MedicalValidationRules.bloodPressure.systolicMax) {
    errors.push(`Systolic BP must be between ${MedicalValidationRules.bloodPressure.systolicMin}-${MedicalValidationRules.bloodPressure.systolicMax} mmHg`);
  }

  if (!Number.isInteger(diastolic) || diastolic < MedicalValidationRules.bloodPressure.diastolicMin || diastolic > MedicalValidationRules.bloodPressure.diastolicMax) {
    errors.push(`Diastolic BP must be between ${MedicalValidationRules.bloodPressure.diastolicMin}-${MedicalValidationRules.bloodPressure.diastolicMax} mmHg`);
  }

  if (systolic <= diastolic) {
    errors.push('Systolic pressure must be higher than diastolic pressure');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate heart rate
 */
export const validateHeartRate = (rate) => {
  const errors = [];

  if (!Number.isInteger(rate) || rate < MedicalValidationRules.heartRate.min || rate > MedicalValidationRules.heartRate.max) {
    errors.push(`Heart rate must be between ${MedicalValidationRules.heartRate.min}-${MedicalValidationRules.heartRate.max} bpm`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate body temperature
 */
export const validateTemperature = (temp) => {
  const errors = [];

  if (typeof temp !== 'number' || temp < MedicalValidationRules.temperature.min || temp > MedicalValidationRules.temperature.max) {
    errors.push(`Temperature must be between ${MedicalValidationRules.temperature.min}-${MedicalValidationRules.temperature.max}°C`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate height
 */
export const validateHeight = (height) => {
  const errors = [];

  if (typeof height !== 'number' || height < MedicalValidationRules.height.min || height > MedicalValidationRules.height.max) {
    errors.push(`Height must be between ${MedicalValidationRules.height.min}-${MedicalValidationRules.height.max} cm`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate weight
 */
export const validateWeight = (weight) => {
  const errors = [];

  if (typeof weight !== 'number' || weight < MedicalValidationRules.weight.min || weight > MedicalValidationRules.weight.max) {
    errors.push(`Weight must be between ${MedicalValidationRules.weight.min}-${MedicalValidationRules.weight.max} kg`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate BMI from height and weight
 */
export const calculateBMI = (weight, height) => {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
};

/**
 * Get BMI category
 */
export const getBMICategory = (bmi) => {
  if (!bmi) return null;
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
};

/**
 * Validate date of birth
 */
export const validateDateOfBirth = (dob) => {
  const errors = [];
  const dobDate = new Date(dob);
  const today = new Date();

  if (!dob || isNaN(dobDate.getTime())) {
    errors.push('Date of birth must be a valid date');
  } else if (dobDate > today) {
    errors.push('Date of birth cannot be in the future');
  } else if (today.getFullYear() - dobDate.getFullYear() > 150) {
    errors.push('Date of birth seems invalid (age > 150 years)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Calculate age from date of birth
 */
export const calculateAge = (dob) => {
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
};

/**
 * Validate phone number (basic format)
 */
export const validatePhoneNumber = (phone) => {
  const errors = [];
  const phoneRegex = /^[\d\s\-\+\(\)]{10,}$/;

  if (!phone || !phoneRegex.test(phone)) {
    errors.push('Phone number must be at least 10 digits');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate email format
 */
export const validateEmail = (email) => {
  const errors = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    errors.push('Please enter a valid email address');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate medication dosage
 */
export const validateMedicationDosage = (value, unit) => {
  const errors = [];

  if (!value || typeof value !== 'number' || value <= 0) {
    errors.push('Dosage must be a positive number');
  }

  if (!unit || typeof unit !== 'string' || unit.trim().length === 0) {
    errors.push('Unit is required (e.g., mg, ml, tablet)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate medication name
 */
export const validateMedicationName = (name) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Medication name must be at least 2 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate allergy severity
 */
export const ALLERGY_SEVERITY_LEVELS = ['Mild', 'Moderate', 'Severe', 'Life-threatening'];

export const validateAllergySeverity = (severity) => {
  const errors = [];

  if (!ALLERGY_SEVERITY_LEVELS.includes(severity)) {
    errors.push(`Severity must be one of: ${ALLERGY_SEVERITY_LEVELS.join(', ')}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate allergy name
 */
export const validateAllergyName = (name) => {
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    errors.push('Allergy name must be at least 2 characters');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate lab result value
 */
export const validateLabResultValue = (value) => {
  const errors = [];

  if (value === null || value === undefined || typeof value !== 'number') {
    errors.push('Lab result value must be a valid number');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate lab result reference range
 */
export const validateReferenceRange = (min, max) => {
  const errors = [];

  if (min === null || min === undefined || typeof min !== 'number') {
    errors.push('Reference minimum must be a valid number');
  }

  if (max === null || max === undefined || typeof max !== 'number') {
    errors.push('Reference maximum must be a valid number');
  }

  if (min !== null && max !== null && min >= max) {
    errors.push('Reference minimum must be less than maximum');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Determine if a lab value is within normal range
 */
export const getLabValueInterpretation = (value, normalMin, normalMax) => {
  if (value < normalMin) return 'Low';
  if (value > normalMax) return 'High';
  return 'Normal';
};

/**
 * Validate date range (startDate must be before endDate)
 */
export const validateDateRange = (startDate, endDate) => {
  const errors = [];

  if (!startDate) {
    errors.push('Start date is required');
  } else if (new Date(startDate) > new Date()) {
    errors.push('Start date cannot be in the future');
  }

  if (endDate && new Date(startDate) >= new Date(endDate)) {
    errors.push('End date must be after start date');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Validate future date (for appointments, etc.)
 */
export const validateFutureDate = (date) => {
  const errors = [];
  const dateObj = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!date) {
    errors.push('Date is required');
  } else if (isNaN(dateObj.getTime())) {
    errors.push('Date must be valid');
  } else if (dateObj < today) {
    errors.push('Date must be in the future');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Format date for display
 */
export const formatDate = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Format date for input fields
 */
export const formatDateForInput = (date) => {
  if (!date) return '';
  const dateObj = new Date(date);
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
