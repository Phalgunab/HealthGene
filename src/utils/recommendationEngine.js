/**
 * Personalized Recommendations Engine
 * Phase 2 Sprint 3
 * 
 * Analyzes health data to provide evidence-based recommendations
 * considering age, conditions, medications, lab results, and lifestyle
 */

// Risk scoring thresholds
const RISK_THRESHOLDS = {
  CRITICAL: 80,
  HIGH: 60,
  MODERATE: 40,
  LOW: 20,
};

// Age-based risk categories
const AGE_CATEGORIES = {
  PEDIATRIC: { min: 0, max: 12 },
  ADOLESCENT: { min: 13, max: 19 },
  ADULT: { min: 20, max: 64 },
  SENIOR: { min: 65, max: 120 },
};

// Chronic condition risk factors
const CONDITION_RISK_FACTORS = {
  'Hypertension': { riskScore: 35, categories: ['cardiovascular'] },
  'Diabetes': { riskScore: 40, categories: ['metabolic', 'cardiovascular'] },
  'Hyperlipidemia': { riskScore: 30, categories: ['cardiovascular'] },
  'Coronary Artery Disease': { riskScore: 50, categories: ['cardiovascular'] },
  'Heart Failure': { riskScore: 45, categories: ['cardiovascular'] },
  'COPD': { riskScore: 35, categories: ['respiratory'] },
  'Asthma': { riskScore: 25, categories: ['respiratory'] },
  'Chronic Kidney Disease': { riskScore: 40, categories: ['renal'] },
  'Obesity': { riskScore: 30, categories: ['metabolic'] },
  'Thyroid Disease': { riskScore: 20, categories: ['endocrine'] },
  'Osteoporosis': { riskScore: 25, categories: ['orthopedic'] },
  'Depression': { riskScore: 30, categories: ['mental_health'] },
};

// Evidence-based lifestyle recommendations
const LIFESTYLE_RECOMMENDATIONS = {
  general: [
    {
      title: 'Regular Physical Activity',
      description: 'Aim for 150 minutes of moderate aerobic activity per week',
      evidence: 'Strong evidence from multiple RCTs',
      priority: 1,
      applies_to_all: true,
    },
    {
      title: 'Balanced Diet',
      description: 'Follow Mediterranean or DASH diet pattern',
      evidence: 'Supported by major cardiovascular and metabolic studies',
      priority: 2,
      applies_to_all: true,
    },
    {
      title: 'Adequate Sleep',
      description: 'Maintain 7-9 hours of quality sleep per night',
      evidence: 'Associated with better health outcomes across populations',
      priority: 3,
      applies_to_all: true,
    },
    {
      title: 'Stress Management',
      description: 'Practice mindfulness, meditation, or relaxation techniques',
      evidence: 'Reduces cardiovascular risk and improves overall health',
      priority: 4,
      applies_to_all: true,
    },
  ],
  cardiovascular: [
    {
      title: 'Reduce Sodium Intake',
      description: 'Keep daily sodium intake below 2,300mg (ideally <1,500mg)',
      evidence: 'Direct effect on blood pressure control',
      priority: 1,
    },
    {
      title: 'Monitor Blood Pressure',
      description: 'Check BP regularly, maintain log for doctor visits',
      evidence: 'Essential for risk stratification and treatment adjustment',
      priority: 2,
    },
    {
      title: 'Limit Alcohol',
      description: 'Moderate consumption: ≤1 drink/day (women), ≤2 drinks/day (men)',
      evidence: 'Reduces cardiovascular and metabolic complications',
      priority: 3,
    },
  ],
  metabolic: [
    {
      title: 'Weight Management',
      description: 'Target BMI 18.5-24.9 (or discuss healthy weight with doctor)',
      evidence: 'Improves glycemic control, lipid profile, and insulin sensitivity',
      priority: 1,
    },
    {
      title: 'Monitor Blood Glucose',
      description: 'Regular testing as per doctor recommendations',
      evidence: 'Essential for early detection of diabetic complications',
      priority: 2,
    },
    {
      title: 'Reduce Refined Carbohydrates',
      description: 'Choose whole grains, limit sugary foods and beverages',
      evidence: 'Improves glucose control and weight management',
      priority: 3,
    },
  ],
  respiratory: [
    {
      title: 'Avoid Respiratory Irritants',
      description: 'Limit exposure to smoke, pollution, allergens',
      evidence: 'Reduces acute exacerbations and hospitalizations',
      priority: 1,
    },
    {
      title: 'Proper Inhaler Technique',
      description: 'Ensure correct use with inhaler trainer or pharmacist guidance',
      evidence: 'Optimizes medication delivery and effectiveness',
      priority: 2,
    },
    {
      title: 'Pulmonary Rehabilitation',
      description: 'Discuss breathing exercises and activity programs',
      evidence: 'Improves exercise tolerance and quality of life',
      priority: 3,
    },
  ],
  renal: [
    {
      title: 'Limit Protein Intake',
      description: 'May reduce protein to 0.6-0.8g/kg body weight',
      evidence: 'Slows CKD progression, especially in advanced stages',
      priority: 1,
    },
    {
      title: 'Monitor Electrolytes',
      description: 'Manage potassium and phosphorus intake per nephrologist',
      evidence: 'Prevents dangerous electrolyte imbalances',
      priority: 2,
    },
    {
      title: 'Kidney Function Monitoring',
      description: 'Regular creatinine and eGFR testing as recommended',
      evidence: 'Essential for treatment adjustment and progression monitoring',
      priority: 3,
    },
  ],
  mental_health: [
    {
      title: 'Professional Support',
      description: 'Consider therapy, counseling, or psychiatric consultation',
      evidence: 'Gold standard treatment for depression and anxiety',
      priority: 1,
    },
    {
      title: 'Social Connection',
      description: 'Maintain meaningful relationships and social activities',
      evidence: 'Protective factor against depression and anxiety',
      priority: 2,
    },
    {
      title: 'Physical Activity',
      description: 'Exercise is as effective as medication for mild-moderate depression',
      evidence: 'Supported by multiple meta-analyses',
      priority: 3,
    },
  ],
};

// Screening recommendations by age and risk factors
const SCREENING_RECOMMENDATIONS = {
  ADULT_UNDER_40: [
    { test: 'Blood Pressure', frequency: 'Every 2 years', applies: () => true },
    { test: 'Cholesterol', frequency: 'Every 4-5 years', applies: () => true },
    { test: 'Blood Glucose', frequency: 'Every 3 years', applies: () => true },
  ],
  ADULT_40_65: [
    { test: 'Blood Pressure', frequency: 'Annually', applies: () => true },
    { test: 'Lipid Panel', frequency: 'Every 2-3 years', applies: () => true },
    { test: 'Blood Glucose', frequency: 'Every 3 years', applies: () => true },
    { test: 'Colorectal Cancer Screening', frequency: 'Every 10 years starting at 45', applies: () => true },
  ],
  ADULT_OVER_65: [
    { test: 'Blood Pressure', frequency: 'Annually', applies: () => true },
    { test: 'Lipid Panel', frequency: 'Annually', applies: () => true },
    { test: 'Blood Glucose', frequency: 'Annually', applies: () => true },
    { test: 'Bone Density Screening', frequency: 'Once for women, consider for men', applies: () => true },
    { test: 'Cognitive Assessment', frequency: 'Baseline, then as recommended', applies: () => true },
  ],
};

/**
 * Calculate overall health risk score
 * @param {Object} healthData - User health data including age, conditions, medications, labs
 * @returns {Object} Risk score and categorization
 */
export function calculateHealthRiskScore(healthData = {}) {
  let riskScore = 0;
  const riskFactors = [];

  // Age-based risk
  const ageRisk = calculateAgeRisk(healthData.age);
  riskScore += ageRisk.score;
  if (ageRisk.score > 0) {
    riskFactors.push({ factor: ageRisk.description, contribution: ageRisk.score });
  }

  // Chronic conditions risk
  if (healthData.conditions && healthData.conditions.length > 0) {
    const conditionRisk = calculateConditionRisk(healthData.conditions);
    riskScore += conditionRisk.score;
    riskFactors.push(...conditionRisk.factors);
  }

  // Medication complexity risk (polypharmacy)
  if (healthData.medications && healthData.medications.length > 5) {
    const polypharmacyRisk = (healthData.medications.length - 5) * 2;
    riskScore += Math.min(polypharmacyRisk, 15);
    riskFactors.push({
      factor: `Polypharmacy (${healthData.medications.length} medications)`,
      contribution: Math.min(polypharmacyRisk, 15),
    });
  }

  // Lab abnormalities risk
  if (healthData.labAbnormalities && healthData.labAbnormalities.length > 0) {
    const labRisk = calculateLabAbnormalitiesRisk(healthData.labAbnormalities);
    riskScore += labRisk.score;
    riskFactors.push(...labRisk.factors);
  }

  // Normalize score to 0-100
  const finalScore = Math.min(riskScore, 100);

  return {
    score: finalScore,
    category: getRiskCategory(finalScore),
    factors: riskFactors,
    explanation: generateRiskExplanation(finalScore, riskFactors),
  };
}

/**
 * Calculate age-related risk
 */
function calculateAgeRisk(age = 30) {
  if (!age || age < 0) return { score: 0, description: 'Age unknown' };

  if (age < 30) {
    return { score: 5, description: 'Young adult (lower baseline risk)' };
  } else if (age < 50) {
    return { score: 15, description: 'Middle age (moderate age-related risk)' };
  } else if (age < 65) {
    return { score: 25, description: 'Pre-senior (elevated age-related risk)' };
  } else {
    return { score: 35, description: 'Senior (high age-related risk)' };
  }
}

/**
 * Calculate risk from chronic conditions
 */
function calculateConditionRisk(conditions = []) {
  let totalScore = 0;
  const factors = [];

  conditions.forEach((condition) => {
    const conditionData = CONDITION_RISK_FACTORS[condition];
    if (conditionData) {
      totalScore += conditionData.riskScore;
      factors.push({
        factor: condition,
        contribution: conditionData.riskScore,
      });
    }
  });

  return { score: Math.min(totalScore, 40), factors };
}

/**
 * Calculate risk from lab abnormalities
 */
function calculateLabAbnormalitiesRisk(abnormalities = []) {
  let totalScore = 0;
  const factors = [];

  abnormalities.forEach((abnormality) => {
    let abnormScore = 0;
    if (abnormality.severity === 'CRITICAL') {
      abnormScore = 20;
    } else if (abnormality.severity === 'HIGH') {
      abnormScore = 15;
    } else if (abnormality.severity === 'MODERATE') {
      abnormScore = 10;
    } else {
      abnormScore = 5;
    }

    totalScore += abnormScore;
    factors.push({
      factor: `Abnormal ${abnormality.testName} (${abnormality.severity})`,
      contribution: abnormScore,
    });
  });

  return { score: Math.min(totalScore, 25), factors };
}

/**
 * Categorize risk level
 */
function getRiskCategory(score) {
  if (score >= RISK_THRESHOLDS.CRITICAL) return 'CRITICAL';
  if (score >= RISK_THRESHOLDS.HIGH) return 'HIGH';
  if (score >= RISK_THRESHOLDS.MODERATE) return 'MODERATE';
  return 'LOW';
}

/**
 * Generate readable risk explanation
 */
function generateRiskExplanation(score, factors) {
  let explanation = '';

  if (score >= RISK_THRESHOLDS.CRITICAL) {
    explanation = 'You have critical health risk factors that require immediate medical attention.';
  } else if (score >= RISK_THRESHOLDS.HIGH) {
    explanation = 'You have significant health risk factors that should be discussed with your doctor.';
  } else if (score >= RISK_THRESHOLDS.MODERATE) {
    explanation = 'You have some health risk factors that deserve attention and monitoring.';
  } else {
    explanation = 'Your overall health risk profile is low, but maintain healthy lifestyle habits.';
  }

  return explanation;
}

/**
 * Generate personalized health recommendations
 * @param {Object} healthData - Complete health data
 * @returns {Array} Prioritized recommendations
 */
export function generatePersonalizedRecommendations(healthData = {}) {
  const recommendations = [];

  // Start with general recommendations
  recommendations.push(...LIFESTYLE_RECOMMENDATIONS.general);

  // Add category-specific recommendations based on conditions
  if (healthData.conditions && healthData.conditions.length > 0) {
    const categories = new Set();

    healthData.conditions.forEach((condition) => {
      const conditionData = CONDITION_RISK_FACTORS[condition];
      if (conditionData && conditionData.categories) {
        conditionData.categories.forEach((cat) => categories.add(cat));
      }
    });

    categories.forEach((category) => {
      if (LIFESTYLE_RECOMMENDATIONS[category]) {
        recommendations.push(...LIFESTYLE_RECOMMENDATIONS[category]);
      }
    });
  }

  // Add medication-specific recommendations
  if (healthData.medications && healthData.medications.length > 0) {
    recommendations.push({
      title: 'Medication Adherence',
      description: 'Take medications exactly as prescribed for optimal effectiveness',
      evidence: 'Non-adherence is major cause of treatment failure',
      priority: 0,
      specific: true,
    });
  }

  // Add screening recommendations
  const screeningRecs = getScreeningRecommendations(healthData.age, healthData.conditions);
  recommendations.push(...screeningRecs);

  // Remove duplicates and sort by priority
  const uniqueRecs = Array.from(
    new Map(
      recommendations.map((rec) => [
        rec.title + rec.description,
        rec,
      ])
    ).values()
  );

  return uniqueRecs.sort((a, b) => (a.priority || 999) - (b.priority || 999));
}

/**
 * Get age-appropriate screening recommendations
 */
function getScreeningRecommendations(age, conditions) {
  const recommendations = [];
  const screenings = getAgeBasedScreenings(age);

  screenings.forEach((screening) => {
    recommendations.push({
      title: `Screening: ${screening.test}`,
      description: `Recommended frequency: ${screening.frequency}`,
      evidence: 'Evidence-based screening recommendations',
      category: 'screening',
      priority: 1,
    });
  });

  return recommendations;
}

/**
 * Get screening tests based on age
 */
function getAgeBasedScreenings(age = 30) {
  if (!age) return SCREENING_RECOMMENDATIONS.ADULT_UNDER_40;

  if (age < 40) return SCREENING_RECOMMENDATIONS.ADULT_UNDER_40;
  if (age < 65) return SCREENING_RECOMMENDATIONS.ADULT_40_65;
  return SCREENING_RECOMMENDATIONS.ADULT_OVER_65;
}

/**
 * Get condition-specific clinical guidelines
 */
export function getConditionGuidelines(condition) {
  const guidelines = {
    Hypertension: {
      targets: {
        general: '< 130/80 mmHg',
        diabetes: '< 130/80 mmHg',
        ckd: '< 120/90 mmHg',
      },
      medications: ['ACE Inhibitors', 'ARBs', 'Beta Blockers', 'Calcium Channel Blockers', 'Thiazide Diuretics'],
      monitoring: 'Monthly or as recommended by doctor',
    },
    Diabetes: {
      targets: {
        fasting_glucose: '80-130 mg/dL',
        a1c: '< 7% (individualize)',
        bp: '< 130/80 mmHg',
      },
      medications: ['Metformin', 'GLP-1 agonists', 'SGLT2 inhibitors', 'Sulfonylureas', 'Insulin'],
      monitoring: 'A1C every 3 months until stable, then every 6 months',
    },
    Hyperlipidemia: {
      targets: {
        ldl: '< 70 mg/dL (high risk), < 100 mg/dL (moderate risk)',
        triglycerides: '< 150 mg/dL',
        hdl: '> 40 mg/dL (men), > 50 mg/dL (women)',
      },
      medications: ['Statins', 'Ezetimibe', 'PCSK9 inhibitors', 'Bempedoic acid'],
      monitoring: 'Lipid panel annually or as per doctor',
    },
    'Chronic Kidney Disease': {
      targets: {
        eGFR: 'Based on stage',
        albumin_creatinine_ratio: '< 30 mg/g',
        bp: '< 120/90 mmHg',
      },
      medications: ['ACE Inhibitors', 'ARBs', 'SGLT2 inhibitors'],
      monitoring: 'eGFR and creatinine every 3-6 months',
    },
  };

  return guidelines[condition] || { targets: 'Consult healthcare provider', medications: 'As prescribed', monitoring: 'As recommended' };
}

/**
 * Calculate preventive health score
 * Based on adherence to recommendations
 */
export function calculatePreventiveHealthScore(healthData = {}) {
  let score = 0;
  let maxScore = 0;
  const areas = {};

  // Physical activity score
  maxScore += 20;
  if (healthData.exerciseDaysPerWeek >= 5) {
    score += 20;
    areas.exercise = { score: 20, status: 'Excellent' };
  } else if (healthData.exerciseDaysPerWeek >= 3) {
    score += 15;
    areas.exercise = { score: 15, status: 'Good' };
  } else if (healthData.exerciseDaysPerWeek >= 1) {
    score += 10;
    areas.exercise = { score: 10, status: 'Fair' };
  } else {
    areas.exercise = { score: 0, status: 'Needs improvement' };
  }

  // Sleep quality score
  maxScore += 15;
  if (healthData.averageSleepHours >= 7 && healthData.averageSleepHours <= 9) {
    score += 15;
    areas.sleep = { score: 15, status: 'Excellent' };
  } else if (healthData.averageSleepHours >= 6 || healthData.averageSleepHours <= 10) {
    score += 10;
    areas.sleep = { score: 10, status: 'Good' };
  } else {
    areas.sleep = { score: 0, status: 'Needs improvement' };
  }

  // Diet quality score
  maxScore += 15;
  if (healthData.dietQuality === 'Excellent') {
    score += 15;
    areas.diet = { score: 15, status: 'Excellent' };
  } else if (healthData.dietQuality === 'Good') {
    score += 10;
    areas.diet = { score: 10, status: 'Good' };
  } else {
    areas.diet = { score: 5, status: 'Fair' };
    score += 5;
  }

  // Medication adherence
  maxScore += 15;
  if (healthData.medicationAdherence && healthData.medicationAdherence >= 90) {
    score += 15;
    areas.adherence = { score: 15, status: 'Excellent' };
  } else if (healthData.medicationAdherence >= 75) {
    score += 10;
    areas.adherence = { score: 10, status: 'Good' };
  } else if (healthData.medicationAdherence >= 50) {
    score += 5;
    areas.adherence = { score: 5, status: 'Fair' };
  } else {
    areas.adherence = { score: 0, status: 'Needs improvement' };
  }

  // Regular monitoring
  maxScore += 20;
  const lastCheckupDaysAgo = healthData.daysSinceLastCheckup || 999;
  if (lastCheckupDaysAgo <= 365) {
    score += 20;
    areas.monitoring = { score: 20, status: 'Excellent' };
  } else if (lastCheckupDaysAgo <= 730) {
    score += 10;
    areas.monitoring = { score: 10, status: 'Good' };
  } else {
    areas.monitoring = { score: 0, status: 'Schedule checkup' };
  }

  const percentage = Math.round((score / maxScore) * 100);

  return {
    score: percentage,
    category: getPreventiveScoreCategory(percentage),
    areas,
    nextSteps: getPreventiveNextSteps(percentage, areas),
  };
}

function getPreventiveScoreCategory(score) {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Poor';
}

function getPreventiveNextSteps(score, areas) {
  const steps = [];

  Object.entries(areas).forEach(([area, data]) => {
    if (data.status === 'Needs improvement' || data.status === 'Schedule checkup') {
      if (area === 'exercise') steps.push('Increase physical activity to 150 min/week');
      if (area === 'sleep') steps.push('Establish consistent sleep schedule (7-9 hours)');
      if (area === 'diet') steps.push('Focus on Mediterranean or DASH diet');
      if (area === 'adherence') steps.push('Review medication schedule and reminders');
      if (area === 'monitoring') steps.push('Schedule annual physical examination');
    }
  });

  return steps.length > 0 ? steps : ['Continue current healthy habits'];
}
