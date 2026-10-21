/**
 * Drug Interaction Validator
 * Checks for potential drug-drug interactions and provides severity classification
 * Based on common pharmaceutical interactions and clinical guidelines
 */

// Severity levels
const SEVERITY = {
  NONE: 'none',
  MILD: 'mild',
  MODERATE: 'moderate',
  SEVERE: 'severe',
  CRITICAL: 'critical',
};

// Common drug interactions database
// Format: 'DRUG_A|DRUG_B': { severity, interaction, alternative }
const DRUG_INTERACTIONS = {
  // Anticoagulants + NSAIDs (High risk of bleeding)
  'warfarin|aspirin': {
    severity: SEVERITY.SEVERE,
    interaction: 'Increased risk of bleeding. NSAIDs can increase warfarin effects.',
    recommendation: 'Consider using acetaminophen instead for pain relief.',
    relatedConditions: ['atrial fibrillation', 'thrombosis', 'heart disease'],
  },
  'warfarin|ibuprofen': {
    severity: SEVERITY.SEVERE,
    interaction: 'NSAIDs significantly increase bleeding risk with warfarin.',
    recommendation: 'Use acetaminophen for pain management.',
    relatedConditions: ['atrial fibrillation', 'thrombosis'],
  },
  'warfarin|naproxen': {
    severity: SEVERITY.SEVERE,
    interaction: 'High risk of GI bleeding when combined.',
    recommendation: 'Avoid NSAIDs; use acetaminophen or discuss alternative.',
    relatedConditions: ['atrial fibrillation'],
  },
  'apixaban|aspirin': {
    severity: SEVERITY.MODERATE,
    interaction: 'Increased bleeding risk with combination anticoagulant therapy.',
    recommendation: 'Monitor for bleeding; may be appropriate with medical supervision.',
    relatedConditions: ['atrial fibrillation', 'heart disease'],
  },

  // ACE Inhibitors + Potassium supplements (Hyperkalemia)
  'lisinopril|potassium': {
    severity: SEVERITY.SEVERE,
    interaction: 'ACE inhibitors reduce potassium excretion; combined use risks hyperkalemia.',
    recommendation: 'Avoid potassium supplements; monitor potassium levels regularly.',
    relatedConditions: ['hypertension', 'heart failure'],
  },
  'enalapril|potassium': {
    severity: SEVERITY.SEVERE,
    interaction: 'Risk of dangerous high potassium levels.',
    recommendation: 'Avoid potassium supplements; dietary sources only.',
    relatedConditions: ['hypertension'],
  },

  // Statins + Certain antibiotics (Rhabdomyolysis)
  'simvastatin|erythromycin': {
    severity: SEVERITY.SEVERE,
    interaction: 'Antibiotic inhibits statin metabolism, increasing rhabdomyolysis risk.',
    recommendation: 'Use alternative antibiotic (amoxicillin) or temporarily stop statin.',
    relatedConditions: ['high cholesterol', 'heart disease'],
  },
  'atorvastatin|clarithromycin': {
    severity: SEVERITY.MODERATE,
    interaction: 'Increased risk of muscle pain and weakness.',
    recommendation: 'Monitor for muscle symptoms; consider alternative antibiotic.',
    relatedConditions: ['high cholesterol'],
  },

  // Diabetes medications + Insulin (Hypoglycemia)
  'metformin|insulin': {
    severity: SEVERITY.MODERATE,
    interaction: 'Combined use can increase hypoglycemia risk; requires careful dosing.',
    recommendation: 'Appropriate when dosed correctly; monitor blood glucose frequently.',
    relatedConditions: ['type 2 diabetes', 'type 1 diabetes'],
  },
  'glipizide|insulin': {
    severity: SEVERITY.MODERATE,
    interaction: 'Increased hypoglycemia risk requires careful monitoring.',
    recommendation: 'Appropriate combination with glucose monitoring.',
    relatedConditions: ['diabetes'],
  },

  // Beta-blockers + Calcium channel blockers (Bradycardia, hypotension)
  'metoprolol|diltiazem': {
    severity: SEVERITY.MODERATE,
    interaction: 'May cause excessive slowing of heart rate and low blood pressure.',
    recommendation: 'Monitor heart rate and blood pressure; adjust doses as needed.',
    relatedConditions: ['hypertension', 'heart disease', 'arrhythmia'],
  },
  'propranolol|verapamil': {
    severity: SEVERITY.MODERATE,
    interaction: 'Risk of bradycardia and conduction abnormalities.',
    recommendation: 'Monitor cardiac function; may require dose adjustment.',
    relatedConditions: ['hypertension', 'angina'],
  },

  // Antidepressants + Other serotonergic drugs (Serotonin syndrome)
  'fluoxetine|tramadol': {
    severity: SEVERITY.SEVERE,
    interaction: 'Risk of serotonin syndrome (agitation, confusion, fever, muscle rigidity).',
    recommendation: 'Avoid combination; use alternative pain medication.',
    relatedConditions: ['depression', 'anxiety'],
  },
  'sertraline|ondansetron': {
    severity: SEVERITY.MODERATE,
    interaction: 'Increased serotonin syndrome risk; monitor for symptoms.',
    recommendation: 'Monitor closely; may be used with caution.',
    relatedConditions: ['depression', 'nausea'],
  },
  'paroxetine|tramadol': {
    severity: SEVERITY.SEVERE,
    interaction: 'Significant risk of serotonin syndrome.',
    recommendation: 'Avoid; use alternative pain medication.',
    relatedConditions: ['depression'],
  },

  // Anticoagulants + Antiplatelet agents (Bleeding)
  'warfarin|clopidogrel': {
    severity: SEVERITY.SEVERE,
    interaction: 'Dramatically increased bleeding risk.',
    recommendation: 'Avoid if possible; use only with medical monitoring.',
    relatedConditions: ['atrial fibrillation', 'heart disease'],
  },

  // Thyroid medication + Calcium/Iron (Reduced absorption)
  'levothyroxine|calcium': {
    severity: SEVERITY.MODERATE,
    interaction: 'Calcium reduces thyroid medication absorption; may reduce effectiveness.',
    recommendation: 'Separate administration by at least 4 hours.',
    relatedConditions: ['hypothyroidism'],
  },
  'levothyroxine|iron': {
    severity: SEVERITY.MODERATE,
    interaction: 'Iron reduces levothyroxine absorption.',
    recommendation: 'Take at different times (4+ hours apart).',
    relatedConditions: ['hypothyroidism', 'anemia'],
  },

  // Bisphosphonates + Calcium (Reduced absorption)
  'alendronate|calcium': {
    severity: SEVERITY.MODERATE,
    interaction: 'Calcium interferes with bisphosphonate absorption.',
    recommendation: 'Take alendronate first, wait 30+ minutes before calcium.',
    relatedConditions: ['osteoporosis'],
  },

  // Quinolone antibiotics + NSAIDs (CNS effects)
  'ciprofloxacin|ibuprofen': {
    severity: SEVERITY.MODERATE,
    interaction: 'May increase risk of tendon rupture and CNS effects.',
    recommendation: 'Use acetaminophen instead if possible.',
    relatedConditions: [],
  },

  // Lithium + NSAIDs (Lithium toxicity)
  'lithium|ibuprofen': {
    severity: SEVERITY.SEVERE,
    interaction: 'NSAIDs can increase lithium levels to toxic range.',
    recommendation: 'Use acetaminophen; monitor lithium levels.',
    relatedConditions: ['bipolar disorder'],
  },
  'lithium|naproxen': {
    severity: SEVERITY.SEVERE,
    interaction: 'Increased risk of lithium toxicity.',
    recommendation: 'Avoid NSAIDs; use acetaminophen.',
    relatedConditions: ['bipolar disorder'],
  },

  // Methotrexate + NSAIDs (Renal toxicity)
  'methotrexate|ibuprofen': {
    severity: SEVERITY.SEVERE,
    interaction: 'NSAIDs reduce kidney function, increasing methotrexate toxicity.',
    recommendation: 'Use acetaminophen; monitor kidney function.',
    relatedConditions: ['rheumatoid arthritis', 'cancer'],
  },

  // Phenytoin + Oral contraceptives (Reduced contraceptive effect)
  'phenytoin|ethinylestradiol': {
    severity: SEVERITY.MODERATE,
    interaction: 'Phenytoin increases metabolism of contraceptives, reducing effectiveness.',
    recommendation: 'Consider higher-dose contraceptives or alternative birth control.',
    relatedConditions: ['seizures'],
  },

  // ACE Inhibitors + Diuretics (Hypotension)
  'lisinopril|furosemide': {
    severity: SEVERITY.MODERATE,
    interaction: 'May cause excessive blood pressure lowering.',
    recommendation: 'Appropriate combination; monitor blood pressure regularly.',
    relatedConditions: ['hypertension', 'heart failure'],
  },

  // Opioids + Benzodiazepines (Respiratory depression)
  'morphine|lorazepam': {
    severity: SEVERITY.CRITICAL,
    interaction: 'Risk of severe respiratory depression, overdose, and death.',
    recommendation: 'Avoid combination; use opioid OR benzodiazepine, not both.',
    relatedConditions: ['pain', 'anxiety', 'insomnia'],
  },
  'oxycodone|alprazolam': {
    severity: SEVERITY.CRITICAL,
    interaction: 'Dangerous combination with high overdose risk.',
    recommendation: 'Avoid; use alternative pain or anxiety management.',
    relatedConditions: ['pain', 'anxiety'],
  },

  // Grapefruit interactions (Affects many drugs)
  'simvastatin|grapefruit': {
    severity: SEVERITY.MODERATE,
    interaction: 'Grapefruit increases statin levels, increasing side effects.',
    recommendation: 'Avoid grapefruit and grapefruit juice.',
    relatedConditions: ['high cholesterol'],
  },
  'atorvastatin|grapefruit': {
    severity: SEVERITY.MILD,
    interaction: 'Moderate effect on atorvastatin levels.',
    recommendation: 'Limit grapefruit consumption.',
    relatedConditions: ['high cholesterol'],
  },
};

/**
 * Check interaction between two drugs
 * @param {string} drug1 - First medication name
 * @param {string} drug2 - Second medication name
 * @returns {object} Interaction data or null if no known interaction
 */
export const checkDrugInteraction = (drug1, drug2) => {
  if (!drug1 || !drug2) return null;

  const normalized1 = normalizeDrugName(drug1);
  const normalized2 = normalizeDrugName(drug2);

  // Check both orderings
  const key1 = `${normalized1}|${normalized2}`;
  const key2 = `${normalized2}|${normalized1}`;

  return DRUG_INTERACTIONS[key1] || DRUG_INTERACTIONS[key2] || null;
};

/**
 * Check all interactions for a list of medications
 * @param {array} medications - Array of medication objects with medicationName property
 * @returns {array} Array of interaction objects
 */
export const checkAllInteractions = (medications) => {
  if (!medications || medications.length < 2) return [];

  const interactions = [];
  const checked = new Set();

  for (let i = 0; i < medications.length; i++) {
    for (let j = i + 1; j < medications.length; j++) {
      const med1 = medications[i].medicationName;
      const med2 = medications[j].medicationName;

      const key = [med1, med2].sort().join('|');
      if (checked.has(key)) continue;
      checked.add(key);

      const interaction = checkDrugInteraction(med1, med2);
      if (interaction) {
        interactions.push({
          drug1: med1,
          drug2: med2,
          ...interaction,
          id: `${i}-${j}`,
        });
      }
    }
  }

  return interactions.sort((a, b) => {
    const severityOrder = {
      [SEVERITY.CRITICAL]: 0,
      [SEVERITY.SEVERE]: 1,
      [SEVERITY.MODERATE]: 2,
      [SEVERITY.MILD]: 3,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

/**
 * Get alternative medications for a given drug and interaction
 * @param {string} drug - Medication name
 * @param {string} conflictingDrug - Drug it conflicts with
 * @returns {array} Array of alternative medications
 */
export const getAlternatives = (drug, conflictingDrug) => {
  const interaction = checkDrugInteraction(drug, conflictingDrug);
  if (!interaction || !interaction.recommendation) return [];

  // Parse recommendations and extract alternatives
  const alternatives = [];
  const recommendation = interaction.recommendation.toLowerCase();

  if (recommendation.includes('acetaminophen')) {
    alternatives.push({ name: 'Acetaminophen (Tylenol)', strength: '500-650 mg', frequency: 'Every 4-6 hours' });
  }
  if (recommendation.includes('amoxicillin')) {
    alternatives.push({ name: 'Amoxicillin', strength: '500 mg', frequency: 'Every 8 hours' });
  }

  return alternatives;
};

/**
 * Normalize drug name for comparison
 * @param {string} drugName - Drug name to normalize
 * @returns {string} Normalized drug name
 */
function normalizeDrugName(drugName) {
  if (!drugName) return '';
  return drugName
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '')
    .replace(/\(.*\)/g, '') // Remove parentheses content (e.g., brand names)
    .split('|')[0]; // Handle 'Name|Dosage' format
}

/**
 * Get severity color for UI display
 * @param {string} severity - Severity level
 * @returns {string} Hex color code
 */
export const getSeverityColor = (severity) => {
  const colors = {
    [SEVERITY.CRITICAL]: '#c0392b', // Dark red
    [SEVERITY.SEVERE]: '#e74c3c', // Red
    [SEVERITY.MODERATE]: '#f39c12', // Orange
    [SEVERITY.MILD]: '#f1c40f', // Yellow
    [SEVERITY.NONE]: '#27ae60', // Green
  };
  return colors[severity] || '#95a5a6'; // Gray default
};

/**
 * Get severity badge text
 * @param {string} severity - Severity level
 * @returns {string} Display text
 */
export const getSeverityLabel = (severity) => {
  const labels = {
    [SEVERITY.CRITICAL]: '🔴 CRITICAL',
    [SEVERITY.SEVERE]: '🟠 SEVERE',
    [SEVERITY.MODERATE]: '🟡 MODERATE',
    [SEVERITY.MILD]: '⚪ MILD',
    [SEVERITY.NONE]: '✅ NONE',
  };
  return labels[severity] || 'UNKNOWN';
};

/**
 * Check if interaction is critical enough to warn user immediately
 * @param {string} severity - Severity level
 * @returns {boolean}
 */
export const shouldWarnImmediately = (severity) => {
  return severity === SEVERITY.CRITICAL || severity === SEVERITY.SEVERE;
};

/**
 * Get all known medications in interaction database
 * @returns {array} Sorted array of medication names
 */
export const getAllKnownMedications = () => {
  const medications = new Set();
  Object.keys(DRUG_INTERACTIONS).forEach((key) => {
    const [drug1, drug2] = key.split('|');
    medications.add(drug1);
    medications.add(drug2);
  });
  return Array.from(medications).sort();
};

/**
 * Search for interactions involving a specific medication
 * @param {string} medication - Medication name to search
 * @returns {array} Array of interactions involving this medication
 */
export const searchInteractionsByMedication = (medication) => {
  if (!medication) return [];

  const normalized = normalizeDrugName(medication);
  const interactions = [];

  Object.entries(DRUG_INTERACTIONS).forEach(([key, data]) => {
    const [drug1, drug2] = key.split('|');
    if (normalized === normalizeDrugName(drug1) || normalized === normalizeDrugName(drug2)) {
      interactions.push({
        medication,
        conflictsWith: normalized === normalizeDrugName(drug1) ? drug2 : drug1,
        ...data,
      });
    }
  });

  return interactions.sort((a, b) => {
    const severityOrder = {
      [SEVERITY.CRITICAL]: 0,
      [SEVERITY.SEVERE]: 1,
      [SEVERITY.MODERATE]: 2,
      [SEVERITY.MILD]: 3,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });
};

export default {
  checkDrugInteraction,
  checkAllInteractions,
  getAlternatives,
  getSeverityColor,
  getSeverityLabel,
  shouldWarnImmediately,
  getAllKnownMedications,
  searchInteractionsByMedication,
};
