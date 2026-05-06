/**
 * matrixCalc.js — Pure math utilities for M1/M2/M3 calculations.
 * No dependencies. Used by both Manual Panel (real-time) and
 * display components.
 */

const TOTAL_HOURS = 10;

/**
 * M3 Strength from hours mapped to a PO/PSO.
 * @param {number} mappedHours
 * @param {number} totalHours  default 10
 * @returns {0|1|2|3}
 */
export function getStrength(mappedHours, totalHours = TOTAL_HOURS) {
  if (!mappedHours || mappedHours === 0) return 0;
  const pct = (mappedHours / totalHours) * 100;
  if (pct >= 70) return 3;
  if (pct >= 50) return 2;
  return 1;
}

/**
 * Build full M1/M2/M3 matrices from a lesson_plan array.
 * @param {Array}  lessonPlan  array of { hours, mappings[] }
 * @param {number} totalHours
 */
export function buildMatrices(lessonPlan, totalHours = TOTAL_HOURS) {
  // Aggregate hours per outcome key
  const hourMap = {};
  for (const topic of lessonPlan) {
    for (const mapping of (topic.mappings || [])) {
      const key = mapping.toLowerCase();
      hourMap[key] = (hourMap[key] || 0) + (topic.hours || 0);
    }
  }

  const m1_raw      = {};
  const m2_percent  = {};
  const m3_strength = {};

  for (const [key, hours] of Object.entries(hourMap)) {
    m1_raw[key]      = `${hours}/${totalHours}`;
    m2_percent[key]  = Math.round((hours / totalHours) * 100);
    m3_strength[key] = getStrength(hours, totalHours);
  }

  return { m1_raw, m2_percent, m3_strength };
}

/**
 * Build matrices from a flat hour map (key → hours).
 * Used by ManualPanel.
 */
export function buildMatricesFromMap(hourMap, totalHours = TOTAL_HOURS) {
  const m1_raw      = {};
  const m2_percent  = {};
  const m3_strength = {};

  for (const [key, hours] of Object.entries(hourMap)) {
    if (!hours || hours === 0) continue;
    m1_raw[key]      = `${hours}/${totalHours}`;
    m2_percent[key]  = Math.round((hours / totalHours) * 100);
    m3_strength[key] = getStrength(hours, totalHours);
  }

  return { m1_raw, m2_percent, m3_strength };
}

/**
 * Aggregate 5 units' M3 matrices into a final average.
 * @param {Array} unitResults  array of unit result objects
 */
export function aggregateMatrices(unitResults) {
  const allKeys = new Set();
  for (const u of unitResults) {
    for (const k of Object.keys(u?.unit_matrices?.m3_strength || {})) {
      allKeys.add(k);
    }
  }

  const n = unitResults.length;
  const finalArticulation = {};
  const finalM3Rounded    = {};

  for (const key of allKeys) {
    const sum = unitResults.reduce((acc, u) => {
      return acc + (u?.unit_matrices?.m3_strength?.[key] ?? 0);
    }, 0);
    const avg = sum / n;
    finalArticulation[key] = Math.round(avg * 100) / 100;
    finalM3Rounded[key]    = Math.round(avg);
  }

  return { finalArticulation, finalM3Rounded, allKeys: [...allKeys].sort() };
}

/** Validate hours sum to exactly 10 */
export function validateHoursSum(hourMap) {
  const total = Object.values(hourMap).reduce((s, h) => s + (Number(h) || 0), 0);
  return { valid: total === TOTAL_HOURS, total };
}

/** Bloom's level comparison — returns true if level ≤ ceiling */
export function bloomLevelOk(level, ceiling) {
  const order = ["K1","K2","K3","K4"];
  return order.indexOf(level) <= order.indexOf(ceiling);
}
