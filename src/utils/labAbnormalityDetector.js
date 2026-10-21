// Lab Abnormality Detector Utility
// Analyzes lab results for abnormalities, trends, and clinical significance

// Severity levels for abnormalities
export const ABNORMALITY_SEVERITY = {
  CRITICAL: 'CRITICAL',
  HIGH: 'HIGH',
  MODERATE: 'MODERATE',
  MILD: 'MILD',
  NORMAL: 'NORMAL'
};

// Reference ranges for common lab tests
// Format: { min, max, unit, optimalMin, optimalMax, criticalLow, criticalHigh }
export const LAB_REFERENCE_RANGES = {
  'Complete Blood Count': {
    'WBC (White Blood Cell Count)': {
      min: 4.5,
      max: 11.0,
      unit: 'K/uL',
      optimalMin: 4.5,
      optimalMax: 7.0,
      criticalLow: 2.0,
      criticalHigh: 30.0,
      severity: 'CRITICAL'
    },
    'RBC (Red Blood Cell Count)': {
      min: 4.5,
      max: 6.0,
      unit: 'M/uL',
      optimalMin: 4.8,
      optimalMax: 5.5,
      criticalLow: 2.0,
      criticalHigh: 10.0
    },
    'Hemoglobin': {
      min: 12.0,
      max: 17.5,
      unit: 'g/dL',
      optimalMin: 13.5,
      optimalMax: 15.5,
      criticalLow: 7.0,
      criticalHigh: 20.0
    },
    'Hematocrit': {
      min: 36.0,
      max: 46.0,
      unit: '%',
      optimalMin: 40.0,
      optimalMax: 45.0,
      criticalLow: 20.0,
      criticalHigh: 60.0
    },
    'Platelets': {
      min: 150,
      max: 400,
      unit: 'K/uL',
      optimalMin: 200,
      optimalMax: 350,
      criticalLow: 50,
      criticalHigh: 1000
    }
  },

  'Metabolic Panel': {
    'Sodium': {
      min: 136,
      max: 145,
      unit: 'mEq/L',
      optimalMin: 138,
      optimalMax: 142,
      criticalLow: 120,
      criticalHigh: 160
    },
    'Potassium': {
      min: 3.5,
      max: 5.0,
      unit: 'mEq/L',
      optimalMin: 3.8,
      optimalMax: 4.5,
      criticalLow: 2.5,
      criticalHigh: 6.5
    },
    'Chloride': {
      min: 98,
      max: 107,
      unit: 'mEq/L',
      optimalMin: 100,
      optimalMax: 105,
      criticalLow: 80,
      criticalHigh: 125
    },
    'Bicarbonate': {
      min: 23,
      max: 29,
      unit: 'mEq/L',
      optimalMin: 24,
      optimalMax: 28,
      criticalLow: 10,
      criticalHigh: 40
    },
    'BUN (Blood Urea Nitrogen)': {
      min: 7,
      max: 20,
      unit: 'mg/dL',
      optimalMin: 8,
      optimalMax: 18,
      criticalLow: 5,
      criticalHigh: 100
    },
    'Creatinine': {
      min: 0.7,
      max: 1.3,
      unit: 'mg/dL',
      optimalMin: 0.8,
      optimalMax: 1.1,
      criticalLow: 0.4,
      criticalHigh: 10.0
    },
    'Glucose': {
      min: 70,
      max: 100,
      unit: 'mg/dL',
      optimalMin: 80,
      optimalMax: 100,
      criticalLow: 40,
      criticalHigh: 500
    }
  },

  'Liver Function Tests': {
    'Total Bilirubin': {
      min: 0.1,
      max: 1.2,
      unit: 'mg/dL',
      optimalMin: 0.1,
      optimalMax: 0.8,
      criticalLow: 0.0,
      criticalHigh: 5.0
    },
    'Direct Bilirubin': {
      min: 0.0,
      max: 0.3,
      unit: 'mg/dL',
      optimalMin: 0.0,
      optimalMax: 0.2,
      criticalLow: 0.0,
      criticalHigh: 3.0
    },
    'AST (Aspartate Aminotransferase)': {
      min: 10,
      max: 40,
      unit: 'U/L',
      optimalMin: 10,
      optimalMax: 35,
      criticalLow: 0,
      criticalHigh: 300
    },
    'ALT (Alanine Aminotransferase)': {
      min: 7,
      max: 56,
      unit: 'U/L',
      optimalMin: 7,
      optimalMax: 40,
      criticalLow: 0,
      criticalHigh: 300
    },
    'Alkaline Phosphatase': {
      min: 30,
      max: 120,
      unit: 'U/L',
      optimalMin: 40,
      optimalMax: 100,
      criticalLow: 10,
      criticalHigh: 500
    },
    'Total Protein': {
      min: 6.0,
      max: 8.3,
      unit: 'g/dL',
      optimalMin: 6.5,
      optimalMax: 8.0,
      criticalLow: 4.0,
      criticalHigh: 10.0
    },
    'Albumin': {
      min: 3.5,
      max: 5.0,
      unit: 'g/dL',
      optimalMin: 3.8,
      optimalMax: 4.8,
      criticalLow: 2.0,
      criticalHigh: 6.0
    }
  },

  'Lipid Panel': {
    'Total Cholesterol': {
      min: 0,
      max: 200,
      unit: 'mg/dL',
      optimalMin: 0,
      optimalMax: 150,
      criticalLow: -1,
      criticalHigh: 500
    },
    'LDL Cholesterol': {
      min: 0,
      max: 100,
      unit: 'mg/dL',
      optimalMin: 0,
      optimalMax: 70,
      criticalLow: -1,
      criticalHigh: 300
    },
    'HDL Cholesterol': {
      min: 40,
      max: 1000,
      unit: 'mg/dL',
      optimalMin: 50,
      optimalMax: 1000,
      criticalLow: 20,
      criticalHigh: 100
    },
    'Triglycerides': {
      min: 0,
      max: 150,
      unit: 'mg/dL',
      optimalMin: 0,
      optimalMax: 100,
      criticalLow: -1,
      criticalHigh: 1000
    }
  },

  'Thyroid Function': {
    'TSH (Thyroid Stimulating Hormone)': {
      min: 0.4,
      max: 4.0,
      unit: 'mIU/L',
      optimalMin: 0.5,
      optimalMax: 3.0,
      criticalLow: 0.01,
      criticalHigh: 20.0
    },
    'Free T4': {
      min: 0.8,
      max: 1.8,
      unit: 'ng/dL',
      optimalMin: 1.0,
      optimalMax: 1.6,
      criticalLow: 0.4,
      criticalHigh: 4.0
    },
    'Free T3': {
      min: 2.3,
      max: 4.2,
      unit: 'pg/mL',
      optimalMin: 2.8,
      optimalMax: 4.0,
      criticalLow: 1.0,
      criticalHigh: 7.0
    }
  },

  'Coagulation Studies': {
    'PT/INR': {
      min: 0.8,
      max: 1.1,
      unit: 'INR',
      optimalMin: 0.8,
      optimalMax: 1.0,
      criticalLow: 0.5,
      criticalHigh: 4.0
    },
    'PTT (Partial Thromboplastin Time)': {
      min: 25,
      max: 35,
      unit: 'seconds',
      optimalMin: 28,
      optimalMax: 32,
      criticalLow: 15,
      criticalHigh: 100
    }
  },

  'Kidney Function': {
    'eGFR (Estimated Glomerular Filtration Rate)': {
      min: 60,
      max: 120,
      unit: 'mL/min/1.73m²',
      optimalMin: 90,
      optimalMax: 120,
      criticalLow: 15,
      criticalHigh: 200
    }
  }
};

/**
 * Classify abnormality severity based on lab value
 * @param {number} value - Lab result value
 * @param {object} rangeData - Reference range object
 * @returns {string} Severity level
 */
export const classifyAbnormalitySeverity = (value, rangeData) => {
  // Check for critical values first
  if (value <= rangeData.criticalLow || value >= rangeData.criticalHigh) {
    return ABNORMALITY_SEVERITY.CRITICAL;
  }

  // Check if outside normal range but not critical
  if (value < rangeData.min || value > rangeData.max) {
    return ABNORMALITY_SEVERITY.HIGH;
  }

  // Check if outside optimal range but within normal
  if (
    rangeData.optimalMin &&
    rangeData.optimalMax &&
    (value < rangeData.optimalMin || value > rangeData.optimalMax)
  ) {
    return ABNORMALITY_SEVERITY.MODERATE;
  }

  return ABNORMALITY_SEVERITY.NORMAL;
};

/**
 * Get clinical interpretation of lab value
 * @param {number} value - Lab result value
 * @param {object} rangeData - Reference range object
 * @returns {object} Interpretation with status and description
 */
export const getLabInterpretation = (value, rangeData) => {
  if (value <= rangeData.criticalLow) {
    return {
      status: 'CRITICALLY LOW',
      emoji: '🔴',
      description: `Dangerously low (${value} ${rangeData.unit}). Critical range below ${rangeData.criticalLow}. Seek immediate medical attention.`,
      severity: ABNORMALITY_SEVERITY.CRITICAL
    };
  }

  if (value >= rangeData.criticalHigh) {
    return {
      status: 'CRITICALLY HIGH',
      emoji: '🔴',
      description: `Dangerously high (${value} ${rangeData.unit}). Critical range above ${rangeData.criticalHigh}. Seek immediate medical attention.`,
      severity: ABNORMALITY_SEVERITY.CRITICAL
    };
  }

  if (value < rangeData.min) {
    return {
      status: 'LOW',
      emoji: '🟠',
      description: `Below normal range (${value} ${rangeData.unit}). Normal range: ${rangeData.min}-${rangeData.max}. Discuss with physician.`,
      severity: ABNORMALITY_SEVERITY.HIGH
    };
  }

  if (value > rangeData.max) {
    return {
      status: 'HIGH',
      emoji: '🟠',
      description: `Above normal range (${value} ${rangeData.unit}). Normal range: ${rangeData.min}-${rangeData.max}. Discuss with physician.`,
      severity: ABNORMALITY_SEVERITY.HIGH
    };
  }

  if (
    rangeData.optimalMin &&
    rangeData.optimalMax &&
    (value < rangeData.optimalMin || value > rangeData.optimalMax)
  ) {
    return {
      status: 'SUBOPTIMAL',
      emoji: '🟡',
      description: `Within normal range but suboptimal (${value} ${rangeData.unit}). Optimal range: ${rangeData.optimalMin}-${rangeData.optimalMax}. Monitor closely.`,
      severity: ABNORMALITY_SEVERITY.MODERATE
    };
  }

  return {
    status: 'NORMAL',
    emoji: '✅',
    description: `Within optimal range (${value} ${rangeData.unit}). Optimal range: ${rangeData.optimalMin}-${rangeData.optimalMax}. Keep up good work!`,
    severity: ABNORMALITY_SEVERITY.NORMAL
  };
};

/**
 * Analyze trend in lab results
 * @param {array} results - Array of lab results with timestamps and values
 * @returns {object} Trend analysis
 */
export const analyzeTrend = (results) => {
  if (!results || results.length < 2) {
    return {
      trend: 'INSUFFICIENT_DATA',
      direction: 'STABLE',
      rate: 0,
      description: 'Need at least 2 results to analyze trend'
    };
  }

  // Sort by date ascending
  const sorted = [...results].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    return dateA - dateB;
  });

  const firstValue = sorted[0].value;
  const lastValue = sorted[sorted.length - 1].value;
  const change = lastValue - firstValue;
  const percentChange = ((change / firstValue) * 100).toFixed(2);

  let direction = 'STABLE';
  let trend = 'STABLE';

  if (change > 0) {
    direction = 'INCREASING';
    trend = Math.abs(percentChange) > 10 ? 'INCREASING_RAPIDLY' : 'INCREASING_SLOWLY';
  } else if (change < 0) {
    direction = 'DECREASING';
    trend = Math.abs(percentChange) > 10 ? 'DECREASING_RAPIDLY' : 'DECREASING_SLOWLY';
  }

  // Calculate average rate of change per day
  const firstDate = new Date(sorted[0].date).getTime();
  const lastDate = new Date(sorted[sorted.length - 1].date).getTime();
  const daysDiff = (lastDate - firstDate) / (1000 * 60 * 60 * 24);
  const ratePerDay = daysDiff > 0 ? (change / daysDiff).toFixed(2) : 0;

  return {
    trend,
    direction,
    change: parseFloat(change.toFixed(2)),
    percentChange: parseFloat(percentChange),
    rate: parseFloat(ratePerDay),
    resultCount: results.length,
    firstValue,
    lastValue,
    description: `${direction} by ${Math.abs(percentChange)}% over ${Math.ceil(daysDiff)} days`
  };
};

/**
 * Get clinical recommendation based on lab abnormality
 * @param {string} testName - Name of lab test
 * @param {string} status - Status from interpretation
 * @returns {object} Recommendations
 */
export const getClinicialRecommendations = (testName, status) => {
  const recommendations = {
    'WBC': {
      'CRITICALLY_LOW': [
        'Seek immediate medical attention',
        'Avoid crowds and sick individuals',
        'Monitor for signs of infection',
        'May need antibiotics or immunoglobulin therapy'
      ],
      'LOW': [
        'Consult with physician within 1-2 weeks',
        'Recheck in 1 month',
        'Discuss medications that may cause low WBC',
        'Monitor for unexplained infections'
      ],
      'CRITICALLY_HIGH': [
        'Seek immediate medical attention',
        'May indicate serious infection or leukemia',
        'Get urgent blood culture',
        'Complete differential needed'
      ],
      'HIGH': [
        'Consult with physician',
        'May indicate infection or inflammation',
        'Repeat test in 2-4 weeks',
        'Look for signs of infection'
      ]
    },

    'Hemoglobin': {
      'CRITICALLY_LOW': [
        'Seek immediate medical attention',
        'May need blood transfusion',
        'Severe anemia evaluation needed',
        'Assess for active bleeding'
      ],
      'LOW': [
        'Consult with physician',
        'Check for iron deficiency',
        'Increase iron-rich foods',
        'Recheck in 4-6 weeks'
      ],
      'HIGH': [
        'Evaluate for dehydration or polycythemia',
        'Increase fluid intake',
        'Recheck in 2-4 weeks',
        'Consult physician'
      ]
    },

    'Glucose': {
      'CRITICALLY_LOW': [
        'Treat hypoglycemia immediately with fast-acting carbs',
        'Seek medical attention',
        'Recheck blood glucose frequently',
        'Review diabetes medication dosage'
      ],
      'LOW': [
        'Take slow-acting carbohydrates',
        'Consult with endocrinologist',
        'Adjust diabetes medications if needed',
        'Monitor more frequently'
      ],
      'HIGH': [
        'Consult with endocrinologist or physician',
        'Review diet and exercise',
        'May need medications or insulin adjustment',
        'Recheck fasting glucose'
      ],
      'CRITICALLY_HIGH': [
        'Seek immediate medical attention',
        'Risk of diabetic ketoacidosis (DKA)',
        'Get emergency evaluation',
        'Likely needs insulin'
      ]
    },

    'Potassium': {
      'CRITICALLY_LOW': [
        'Seek immediate medical attention',
        'Risk of cardiac arrhythmias',
        'IV potassium replacement likely needed',
        'EKG monitoring required'
      ],
      'LOW': [
        'Increase potassium-rich foods (bananas, spinach, etc.)',
        'May need oral potassium supplementation',
        'Consult with physician',
        'Recheck in 2-4 weeks'
      ],
      'CRITICALLY_HIGH': [
        'Seek immediate medical attention',
        'Risk of cardiac arrhythmias',
        'May need dialysis',
        'EKG monitoring required'
      ],
      'HIGH': [
        'Reduce potassium intake',
        'Review medications that increase potassium',
        'Check kidney function',
        'Consult with physician'
      ]
    },

    'Creatinine': {
      'HIGH': [
        'May indicate kidney dysfunction',
        'Calculate eGFR for better assessment',
        'Increase water intake',
        'Review medications affecting kidneys',
        'Consult with nephrologist'
      ],
      'CRITICALLY_HIGH': [
        'Seek medical attention',
        'Severe kidney impairment',
        'May need dialysis consultation',
        'Urgent nephrology referral'
      ]
    },

    'TSH': {
      'LOW': [
        'May indicate hyperthyroidism or over-treatment',
        'Consult with endocrinologist',
        'Review thyroid medications',
        'May need dose adjustment'
      ],
      'HIGH': [
        'May indicate hypothyroidism',
        'Check Free T4 level',
        'Consult with endocrinologist',
        'May need thyroid replacement therapy'
      ]
    }
  };

  const testRecommendations = recommendations[testName] || {};
  const statusKey = status.replace(/\s+/g, '_').toUpperCase();
  
  return {
    recommendations: testRecommendations[statusKey] || [
      'Consult with your physician about this abnormal result',
      'Repeat test if recommended',
      'Monitor for related symptoms',
      'Make appropriate lifestyle modifications'
    ],
    nextSteps: [
      'Schedule appointment with physician',
      'Bring recent lab results',
      'Discuss any symptoms',
      'Ask about medication adjustments if needed'
    ]
  };
};

/**
 * Detect related conditions based on lab abnormality
 * @param {string} testName - Name of lab test
 * @param {string} status - Status level
 * @returns {array} Possible related conditions
 */
export const getRelatedConditions = (testName, status) => {
  const conditions = {
    'Hemoglobin': {
      'CRITICAL': ['Severe anemia', 'Acute blood loss', 'Bone marrow failure'],
      'HIGH': ['Anemia', 'Chronic bleeding', 'Iron deficiency'],
      'CRITICALLY_HIGH': ['Polycythemia vera', 'Severe dehydration', 'Chronic hypoxia']
    },
    'WBC': {
      'CRITICAL': ['Leukemia', 'Severe infection', 'Aplastic anemia'],
      'HIGH': ['Infection', 'Leukocytosis', 'Inflammation', 'Leukemia'],
      'CRITICALLY_LOW': ['Immunosuppression', 'Aplastic anemia', 'HIV/AIDS']
    },
    'Glucose': {
      'CRITICAL': ['Uncontrolled diabetes', 'Diabetic ketoacidosis'],
      'HIGH': ['Diabetes', 'Prediabetes', 'Stress response'],
      'CRITICALLY_LOW': ['Severe hypoglycemia', 'Insulin overdose']
    },
    'Potassium': {
      'CRITICAL': ['Hyperkalemia', 'Acute kidney injury', 'Rhabdomyolysis'],
      'HIGH': ['Kidney disease', 'ACE inhibitor use', 'Addisons disease'],
      'CRITICALLY_LOW': ['Hypokalemia', 'Dehydration', 'Malnutrition']
    },
    'Creatinine': {
      'HIGH': ['Chronic kidney disease', 'Acute kidney injury', 'Diabetic nephropathy'],
      'CRITICALLY_HIGH': ['End-stage renal disease', 'Acute kidney failure']
    },
    'Bilirubin': {
      'HIGH': ['Liver disease', 'Hemolysis', 'Biliary obstruction', 'Jaundice'],
      'CRITICALLY_HIGH': ['Severe liver disease', 'Newborn jaundice', 'Hemolytic crisis']
    },
    'AST/ALT': {
      'HIGH': ['Liver disease', 'Hepatitis', 'Fatty liver disease', 'Muscle injury'],
      'CRITICALLY_HIGH': ['Acute hepatitis', 'Liver failure', 'Severe muscle injury']
    },
    'TSH': {
      'CRITICAL': ['Severe hyperthyroidism', 'Thyroid cancer'],
      'HIGH': ['Hypothyroidism', 'Thyroid disease'],
      'CRITICALLY_LOW': ['Graves disease', 'Thyroiditis']
    }
  };

  const testConditions = conditions[testName] || {};
  return testConditions[status] || [];
};

/**
 * Check for lab result patterns indicating concern
 * @param {array} recentResults - Array of recent lab results
 * @returns {array} Alerts based on patterns
 */
export const detectPatterns = (recentResults) => {
  const alerts = [];

  if (!recentResults || recentResults.length < 2) {
    return alerts;
  }

  // Check for rapidly worsening trends
  recentResults.forEach(result => {
    const trend = analyzeTrend(result.values);
    if (trend.trend === 'DECREASING_RAPIDLY' || trend.trend === 'INCREASING_RAPIDLY') {
      alerts.push({
        type: 'RAPID_CHANGE',
        severity: 'HIGH',
        message: `${result.testName} is ${trend.direction.toLowerCase()} rapidly`,
        trend
      });
    }
  });

  // Check for multiple abnormalities
  const abnormalCount = recentResults.filter(r => 
    r.status !== 'NORMAL' && r.status !== 'SUBOPTIMAL'
  ).length;

  if (abnormalCount >= 3) {
    alerts.push({
      type: 'MULTIPLE_ABNORMALITIES',
      severity: 'MODERATE',
      message: `${abnormalCount} lab values are abnormal. Comprehensive review recommended.`
    });
  }

  // Check for critical values
  const criticalResults = recentResults.filter(r => r.status === 'CRITICAL');
  if (criticalResults.length > 0) {
    alerts.push({
      type: 'CRITICAL_VALUES',
      severity: 'CRITICAL',
      message: `${criticalResults.length} critically abnormal result(s) requiring immediate attention`,
      results: criticalResults
    });
  }

  return alerts;
};

/**
 * Generate comprehensive lab analysis report
 * @param {object} labData - Lab test data
 * @returns {object} Comprehensive analysis
 */
export const generateLabAnalysisReport = (labData) => {
  if (!labData) {
    return {
      status: 'NO_DATA',
      analysis: []
    };
  }

  const analysis = [];

  // Get reference ranges
  let category = null;
  let rangeData = null;

  for (const [cat, tests] of Object.entries(LAB_REFERENCE_RANGES)) {
    if (tests[labData.testName]) {
      category = cat;
      rangeData = tests[labData.testName];
      break;
    }
  }

  if (!rangeData) {
    return {
      status: 'UNKNOWN_TEST',
      testName: labData.testName,
      message: 'Reference ranges not available for this test'
    };
  }

  // Get interpretation
  const interpretation = getLabInterpretation(labData.value, rangeData);
  
  // Get trend if historical data available
  let trendAnalysis = null;
  if (labData.historicalValues && labData.historicalValues.length > 0) {
    trendAnalysis = analyzeTrend(labData.historicalValues);
  }

  // Get recommendations
  const recommendations = getClinicialRecommendations(labData.testName, interpretation.status);

  // Get related conditions
  const conditions = getRelatedConditions(labData.testName, interpretation.status);

  return {
    status: 'SUCCESS',
    testName: labData.testName,
    category,
    value: labData.value,
    unit: rangeData.unit,
    interpretation,
    referenceRange: {
      min: rangeData.min,
      max: rangeData.max,
      optimal: {
        min: rangeData.optimalMin,
        max: rangeData.optimalMax
      },
      critical: {
        low: rangeData.criticalLow,
        high: rangeData.criticalHigh
      }
    },
    trend: trendAnalysis,
    recommendations,
    relatedConditions: conditions,
    datePerformed: labData.date,
    nextCheckup: calculateNextCheckup(interpretation.severity)
  };
};

/**
 * Calculate recommended next checkup date based on severity
 * @param {string} severity - Severity level
 * @returns {object} Next checkup recommendation
 */
export const calculateNextCheckup = (severity) => {
  const today = new Date();
  const nextDate = new Date(today);

  switch (severity) {
    case ABNORMALITY_SEVERITY.CRITICAL:
      nextDate.setDate(nextDate.getDate() + 1); // Tomorrow
      return {
        daysFromNow: 1,
        date: nextDate,
        recommendation: 'Urgent follow-up required'
      };
    case ABNORMALITY_SEVERITY.HIGH:
      nextDate.setDate(nextDate.getDate() + 7); // 1 week
      return {
        daysFromNow: 7,
        date: nextDate,
        recommendation: 'Follow-up within 1 week'
      };
    case ABNORMALITY_SEVERITY.MODERATE:
      nextDate.setDate(nextDate.getDate() + 14); // 2 weeks
      return {
        daysFromNow: 14,
        date: nextDate,
        recommendation: 'Follow-up within 2 weeks'
      };
    case ABNORMALITY_SEVERITY.MILD:
      nextDate.setMonth(nextDate.getMonth() + 1); // 1 month
      return {
        daysFromNow: 30,
        date: nextDate,
        recommendation: 'Follow-up in 1 month'
      };
    default:
      nextDate.setMonth(nextDate.getMonth() + 3); // 3 months
      return {
        daysFromNow: 90,
        date: nextDate,
        recommendation: 'Routine follow-up in 3 months'
      };
  }
};

export default {
  ABNORMALITY_SEVERITY,
  LAB_REFERENCE_RANGES,
  classifyAbnormalitySeverity,
  getLabInterpretation,
  analyzeTrend,
  getClinicialRecommendations,
  getRelatedConditions,
  detectPatterns,
  generateLabAnalysisReport,
  calculateNextCheckup
};
