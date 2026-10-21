/**
 * Medication Adherence Analyzer
 * Phase 2 Sprint 4
 * 
 * Tracks medication adherence, analyzes patterns, detects non-adherence,
 * and provides personalized interventions to improve medication compliance
 */

// Adherence score thresholds
const ADHERENCE_THRESHOLDS = {
  EXCELLENT: 90,
  GOOD: 75,
  FAIR: 50,
  POOR: 0,
};

// Non-adherence types
const NON_ADHERENCE_TYPES = {
  INTENTIONAL: 'Intentional (decided not to take)',
  UNINTENTIONAL: 'Unintentional (forgot)',
  COST: 'Cost-related',
  SIDE_EFFECTS: 'Side effects',
  DEPRIVATION: 'Felt better and stopped',
  CONFUSION: 'Confused about instructions',
};

// Adherence improvement interventions
const ADHERENCE_INTERVENTIONS = {
  REMINDERS: {
    title: 'Set Medication Reminders',
    description: 'Use phone alarms, pill organizers, or reminder apps',
    effectiveness: 'High',
    effort: 'Low',
    timeframe: 'Immediate',
  },
  SIMPLIFY: {
    title: 'Simplify Medication Regimen',
    description: 'Ask doctor about combining medications or reducing frequency',
    effectiveness: 'High',
    effort: 'Medium',
    timeframe: '1-2 weeks',
  },
  CALENDAR: {
    title: 'Use a Medication Calendar',
    description: 'Track daily doses with checkmarks or stickers',
    effectiveness: 'Medium',
    effort: 'Low',
    timeframe: 'Immediate',
  },
  SUPPORT: {
    title: 'Involve Family/Caregiver',
    description: 'Ask someone to help remind you or monitor adherence',
    effectiveness: 'High',
    effort: 'Medium',
    timeframe: 'Immediate',
  },
  EDUCATION: {
    title: 'Learn More About Medications',
    description: 'Understand why each medication is important for your health',
    effectiveness: 'Medium',
    effort: 'Medium',
    timeframe: '1 week',
  },
  DISCUSS_SIDE_EFFECTS: {
    title: 'Address Side Effects with Doctor',
    description: 'If side effects are a barrier, discuss alternative options',
    effectiveness: 'High',
    effort: 'Medium',
    timeframe: '1-2 weeks',
  },
  FINANCIAL: {
    title: 'Explore Financial Assistance',
    description: 'Ask about generic alternatives, patient assistance programs',
    effectiveness: 'High',
    effort: 'Low',
    timeframe: '1 week',
  },
};

// Risk factors for non-adherence
const RISK_FACTORS = {
  'Multiple medications': { score: 15, category: 'complexity' },
  'Complex schedule': { score: 10, category: 'complexity' },
  'Recent diagnosis': { score: 10, category: 'behavioral' },
  'Side effects': { score: 15, category: 'side_effects' },
  'Cost concerns': { score: 15, category: 'financial' },
  'Cognitive impairment': { score: 20, category: 'cognitive' },
  'Depression': { score: 15, category: 'mental_health' },
  'Social isolation': { score: 10, category: 'social' },
  'Language barrier': { score: 10, category: 'communication' },
  'Limited health literacy': { score: 10, category: 'education' },
};

/**
 * Calculate medication adherence score
 * @param {Array} adherenceData - Array of {date, medication, taken, dosage}
 * @param {number} expectedDaysInPeriod - Number of days expected to take medication
 * @returns {Object} Adherence score with details
 */
export function calculateAdherenceScore(adherenceData = [], expectedDaysInPeriod = 30) {
  if (!adherenceData || adherenceData.length === 0) {
    return {
      score: null,
      percentage: 0,
      category: 'No data',
      message: 'Start logging medications to calculate adherence score',
      dosesTaken: 0,
      dosesExpected: expectedDaysInPeriod,
      dosesMissed: expectedDaysInPeriod,
    };
  }

  // Count doses taken and expected
  const dosesData = adherenceData.filter((entry) => {
    const entryDate = new Date(entry.date);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - expectedDaysInPeriod);
    return entryDate >= cutoffDate;
  });

  const dosesTaken = dosesData.filter((d) => d.taken === true).length;
  const dosesExpected = dosesData.length > 0 ? dosesData.length : expectedDaysInPeriod;
  const dosesMissed = dosesExpected - dosesTaken;

  const adherencePercentage = dosesExpected > 0 ? Math.round((dosesTaken / dosesExpected) * 100) : 0;
  const category = getCategoryFromPercentage(adherencePercentage);

  return {
    score: adherencePercentage,
    percentage: adherencePercentage,
    category,
    message: getAdherenceMessage(adherencePercentage),
    dosesTaken,
    dosesExpected,
    dosesMissed,
    trend: calculateAdherenceTrend(adherenceData),
  };
}

/**
 * Get adherence category from percentage
 */
function getCategoryFromPercentage(percentage) {
  if (percentage >= ADHERENCE_THRESHOLDS.EXCELLENT) return 'Excellent';
  if (percentage >= ADHERENCE_THRESHOLDS.GOOD) return 'Good';
  if (percentage >= ADHERENCE_THRESHOLDS.FAIR) return 'Fair';
  return 'Poor';
}

/**
 * Get message based on adherence score
 */
function getAdherenceMessage(percentage) {
  if (percentage >= 90) {
    return 'Excellent! You are taking your medications as prescribed.';
  } else if (percentage >= 75) {
    return 'Good adherence. Keep up the great work!';
  } else if (percentage >= 50) {
    return 'Fair adherence. There is room for improvement.';
  } else {
    return 'Poor adherence. Please discuss with your doctor.';
  }
}

/**
 * Calculate adherence trend (improving, stable, declining)
 */
function calculateAdherenceTrend(adherenceData = []) {
  if (adherenceData.length < 14) return 'insufficient data';

  // Compare first half to second half
  const midpoint = Math.floor(adherenceData.length / 2);
  const firstHalf = adherenceData.slice(0, midpoint);
  const secondHalf = adherenceData.slice(midpoint);

  const firstHalfAdherence = calculateAdherenceScore(firstHalf, 7).percentage;
  const secondHalfAdherence = calculateAdherenceScore(secondHalf, 7).percentage;

  if (secondHalfAdherence > firstHalfAdherence + 5) return 'improving';
  if (secondHalfAdherence < firstHalfAdherence - 5) return 'declining';
  return 'stable';
}

/**
 * Analyze adherence patterns
 * @param {Array} adherenceData - Adherence tracking data
 * @returns {Object} Pattern analysis
 */
export function analyzeAdherencePatterns(adherenceData = []) {
  if (!adherenceData || adherenceData.length === 0) {
    return {
      patterns: [],
      dayOfWeekTrends: {},
      timeOfDayPreferences: {},
      commonMissedDays: [],
    };
  }

  const patterns = [];
  const dayOfWeekCounts = {};
  const commonMissedDays = [];

  // Analyze by day of week
  adherenceData.forEach((entry) => {
    const date = new Date(entry.date);
    const dayOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      date.getDay()
    ];

    if (!dayOfWeekCounts[dayOfWeek]) {
      dayOfWeekCounts[dayOfWeek] = { taken: 0, missed: 0 };
    }

    if (entry.taken) {
      dayOfWeekCounts[dayOfWeek].taken++;
    } else {
      dayOfWeekCounts[dayOfWeek].missed++;
    }
  });

  // Identify worst adherence days
  Object.entries(dayOfWeekCounts).forEach(([day, counts]) => {
    const adherenceRate = counts.taken / (counts.taken + counts.missed);
    if (adherenceRate < 0.7) {
      commonMissedDays.push({
        day,
        adherenceRate: Math.round(adherenceRate * 100),
        count: counts.missed,
      });
      patterns.push({
        type: 'Low adherence on',
        detail: day,
        recommendation: `Consider setting extra reminders on ${day}s`,
      });
    }
  });

  return {
    patterns,
    dayOfWeekTrends: dayOfWeekCounts,
    commonMissedDays: commonMissedDays.sort((a, b) => b.count - a.count),
  };
}

/**
 * Identify non-adherence barriers
 * @param {Object} medicationData - Medication information
 * @param {Object} userContext - User age, conditions, etc.
 * @param {Array} adherenceHistory - Recent adherence records
 * @returns {Array} Identified barriers
 */
export function identifyNonAdherenceBarriers(medicationData = {}, userContext = {}, adherenceHistory = []) {
  const barriers = [];
  const riskScore = {};

  // Complexity barriers
  if (medicationData.frequency && medicationData.frequency.includes('daily')) {
    if (medicationData.frequency !== 'Once daily') {
      barriers.push({
        type: 'Complexity',
        factor: 'Multiple daily doses',
        severity: 'medium',
        suggestion: 'Ask doctor about extended-release formulations',
      });
    }
  }

  // Side effects barrier
  if (medicationData.sideEffects && medicationData.sideEffects.length > 0) {
    barriers.push({
      type: 'Side Effects',
      factor: medicationData.sideEffects.join(', '),
      severity: 'high',
      suggestion: 'Discuss side effects with your doctor or pharmacist',
    });
  }

  // Cost barrier
  if (medicationData.costBarrier === true) {
    barriers.push({
      type: 'Financial',
      factor: 'High medication cost',
      severity: 'high',
      suggestion: 'Explore generic alternatives or patient assistance programs',
    });
  }

  // Cognitive/age barrier
  if (userContext.age && userContext.age > 75) {
    barriers.push({
      type: 'Cognitive',
      factor: 'Age-related memory concerns',
      severity: 'medium',
      suggestion: 'Use pill organizer, set phone reminders, involve caregiver',
    });
  }

  // Depression/mental health barrier
  if (userContext.conditions && userContext.conditions.includes('Depression')) {
    barriers.push({
      type: 'Mental Health',
      factor: 'Depression may affect adherence',
      severity: 'high',
      suggestion: 'Discuss with healthcare provider; consider counseling support',
    });
  }

  // Felt better and stopped (deprivation)
  const recentMissedDoses = adherenceHistory.filter((h) => {
    const daysSince = Math.floor((Date.now() - new Date(h.date)) / (1000 * 60 * 60 * 24));
    return daysSince <= 7 && h.taken === false;
  });

  if (recentMissedDoses.length > 0) {
    barriers.push({
      type: 'Behavioral',
      factor: 'Recent missed doses',
      severity: 'medium',
      suggestion: 'Remember: medications prevent disease recurrence even when you feel well',
    });
  }

  return barriers;
}

/**
 * Generate personalized adherence interventions
 * @param {Object} adherenceProfile - User adherence score and patterns
 * @param {Array} barriers - Identified barriers
 * @returns {Array} Prioritized interventions
 */
export function generateAdherenceInterventions(adherenceProfile = {}, barriers = []) {
  const interventions = [];

  // Base interventions for all users with poor adherence
  if (adherenceProfile.percentage < 90) {
    interventions.push({
      ...ADHERENCE_INTERVENTIONS.REMINDERS,
      priority: 1,
      reason: 'Most effective and easiest to implement',
    });
  }

  // Complexity-based interventions
  if (barriers.some((b) => b.type === 'Complexity')) {
    interventions.push({
      ...ADHERENCE_INTERVENTIONS.SIMPLIFY,
      priority: 1,
      reason: 'Can significantly reduce adherence burden',
    });
    interventions.push({
      ...ADHERENCE_INTERVENTIONS.CALENDAR,
      priority: 2,
      reason: 'Helps organize complex regimen',
    });
  }

  // Side effects interventions
  if (barriers.some((b) => b.type === 'Side Effects')) {
    interventions.push({
      ...ADHERENCE_INTERVENTIONS.DISCUSS_SIDE_EFFECTS,
      priority: 1,
      reason: 'Addressing side effects removes major barrier',
    });
  }

  // Financial interventions
  if (barriers.some((b) => b.type === 'Financial')) {
    interventions.push({
      ...ADHERENCE_INTERVENTIONS.FINANCIAL,
      priority: 1,
      reason: 'Can eliminate cost barrier',
    });
  }

  // Cognitive/caregiver interventions
  if (barriers.some((b) => b.type === 'Cognitive')) {
    interventions.push({
      ...ADHERENCE_INTERVENTIONS.SUPPORT,
      priority: 1,
      reason: 'Family/caregiver support is highly effective',
    });
  }

  // Mental health interventions
  if (barriers.some((b) => b.type === 'Mental Health')) {
    interventions.push({
      ...ADHERENCE_INTERVENTIONS.SUPPORT,
      priority: 1,
      reason: 'Professional support helps improve adherence',
    });
  }

  // Education for all
  interventions.push({
    ...ADHERENCE_INTERVENTIONS.EDUCATION,
    priority: 2,
    reason: 'Understanding medication importance increases adherence',
  });

  // Remove duplicates and sort by priority
  const uniqueInterventions = Array.from(
    new Map(interventions.map((i) => [i.title, i])).values()
  ).sort((a, b) => a.priority - b.priority);

  return uniqueInterventions;
}

/**
 * Calculate medication adherence risk score
 * Based on factors that predict non-adherence
 */
export function calculateAdherenceRiskScore(
  medicationCount = 1,
  age = 50,
  conditions = [],
  adherencePercentage = 100
) {
  let riskScore = 0;

  // Medication complexity risk
  if (medicationCount > 5) {
    riskScore += 20;
  } else if (medicationCount > 3) {
    riskScore += 15;
  } else if (medicationCount > 1) {
    riskScore += 10;
  }

  // Age risk
  if (age > 75) {
    riskScore += 15;
  } else if (age > 65) {
    riskScore += 10;
  }

  // Chronic condition risk
  if (conditions.length > 3) {
    riskScore += 15;
  } else if (conditions.length > 1) {
    riskScore += 10;
  }

  // Current adherence risk (inverse)
  if (adherencePercentage < 50) {
    riskScore += 20;
  } else if (adherencePercentage < 75) {
    riskScore += 15;
  } else if (adherencePercentage < 90) {
    riskScore += 10;
  }

  // Normalize to 0-100
  const finalScore = Math.min(riskScore, 100);

  return {
    score: finalScore,
    category: getRiskCategory(finalScore),
    explanation: getRiskExplanation(finalScore),
  };
}

/**
 * Get risk category
 */
function getRiskCategory(score) {
  if (score >= 70) return 'High Risk';
  if (score >= 50) return 'Moderate Risk';
  if (score >= 30) return 'Low Risk';
  return 'Minimal Risk';
}

/**
 * Get risk explanation
 */
function getRiskExplanation(score) {
  if (score >= 70) {
    return 'You have significant risk factors for non-adherence. Proactive interventions are recommended.';
  } else if (score >= 50) {
    return 'You have some risk factors for non-adherence. Consider implementing support strategies.';
  } else if (score >= 30) {
    return 'Your adherence risk is relatively low, but staying vigilant is important.';
  } else {
    return 'Your adherence risk is minimal. Maintain your current practices.';
  }
}

/**
 * Generate adherence insights and recommendations
 */
export function generateAdherenceInsights(adherenceScore, adherenceHistory = [], medications = []) {
  const insights = [];

  // Consistency insight
  if (adherenceScore.percentage >= 90) {
    insights.push({
      type: 'positive',
      title: 'Excellent Consistency',
      message: 'You are taking your medications reliably, which leads to better health outcomes.',
      icon: 'checkmark',
    });
  } else if (adherenceScore.percentage >= 75) {
    insights.push({
      type: 'positive',
      title: 'Good Compliance',
      message: 'You are generally taking your medications as prescribed.',
      icon: 'thumbsup',
    });
  } else if (adherenceScore.percentage >= 50) {
    insights.push({
      type: 'warning',
      title: 'Inconsistent Adherence',
      message: 'Missing doses regularly. Implement strategies to improve consistency.',
      icon: 'alert',
    });
  } else {
    insights.push({
      type: 'alert',
      title: 'Poor Adherence',
      message: 'Most doses are being missed. Urgent discussion with your doctor is recommended.',
      icon: 'danger',
    });
  }

  // Trend insight
  if (adherenceScore.trend === 'improving') {
    insights.push({
      type: 'positive',
      title: 'Improving Trend',
      message: 'Your adherence is getting better over time. Keep it up!',
      icon: 'trending_up',
    });
  } else if (adherenceScore.trend === 'declining') {
    insights.push({
      type: 'warning',
      title: 'Declining Trend',
      message: 'Your adherence has been decreasing. Now is the time to take action.',
      icon: 'trending_down',
    });
  }

  // Medication count insight
  if (medications.length > 5) {
    insights.push({
      type: 'info',
      title: 'Multiple Medications',
      message: `You are taking ${medications.length} medications. Consider a pill organizer or reminder system.`,
      icon: 'info',
    });
  }

  return insights;
}

/**
 * Calculate medication adherence targets based on condition
 */
export function getAdherenceTargets(medicationIndications = []) {
  const targets = {
    general: 95,
    cardiovascular: 95,
    diabetes: 95,
    infection: 100,
    mental_health: 90,
  };

  let highestTarget = targets.general;

  medicationIndications.forEach((indication) => {
    const indication_lower = indication.toLowerCase();
    if (indication_lower.includes('hypertension') || indication_lower.includes('coronary')) {
      highestTarget = Math.max(highestTarget, targets.cardiovascular);
    } else if (indication_lower.includes('diabetes')) {
      highestTarget = Math.max(highestTarget, targets.diabetes);
    } else if (indication_lower.includes('antibiotic') || indication_lower.includes('infection')) {
      highestTarget = Math.max(highestTarget, targets.infection);
    } else if (indication_lower.includes('depression') || indication_lower.includes('anxiety')) {
      highestTarget = Math.max(highestTarget, targets.mental_health);
    }
  });

  return highestTarget;
}
