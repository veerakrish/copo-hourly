const express = require("express");
const router  = express.Router();
const { klevelIndex } = require("../utils/psoData");

/**
 * Agent B — pure logic validator (no API call).
 * Accepts a unit result JSON and validates:
 *  1. Hours sum to 10
 *  2. All bloom_levels ≤ co_level
 *  3. M3 strength values are mathematically correct
 *  4. At least one mapped outcome reaches Strength 3
 */
router.post("/", (req, res) => {
  const { data } = req.body;
  if (!data) return res.status(400).json({ error: "Missing data field." });

  const issues = [];
  const coIdx  = klevelIndex(data.unit_meta?.co_level);

  // ── 1. Hours sum ─────────────────────────────────
  const totalHours = (data.lesson_plan || []).reduce((s, t) => s + (t.hours || 0), 0);
  if (totalHours !== 10) {
    issues.push(`Hours sum = ${totalHours} (expected 10).`);
  }

  // ── 2. Bloom's K-level check ─────────────────────
  for (const topic of (data.lesson_plan || [])) {
    const tIdx = klevelIndex(topic.bloom_level);
    if (tIdx > coIdx) {
      issues.push(`"${topic.topic}" is ${topic.bloom_level} which exceeds CO level ${data.unit_meta.co_level}.`);
    }
  }

  // ── 3. Recompute M1/M2/M3 from lesson_plan ───────
  const hourMap = {};
  for (const topic of (data.lesson_plan || [])) {
    for (const mapping of (topic.mappings || [])) {
      const key = mapping.toLowerCase();
      hourMap[key] = (hourMap[key] || 0) + topic.hours;
    }
  }

  const recomputedM3 = {};
  let hasStrength3   = false;

  for (const [key, hours] of Object.entries(hourMap)) {
    const pct = (hours / 10) * 100;
    let str = 0;
    if (pct >= 70) { str = 3; hasStrength3 = true; }
    else if (pct >= 50) str = 2;
    else if (pct >  0)  str = 1;
    recomputedM3[key] = str;
  }

  // Compare with provided M3
  const providedM3 = data.unit_matrices?.m3_strength || {};
  for (const [key, expected] of Object.entries(recomputedM3)) {
    if (providedM3[key] !== expected) {
      issues.push(`M3 mismatch for ${key.toUpperCase()}: got ${providedM3[key]}, expected ${expected}.`);
    }
  }

  // ── 4. Strength 3 check ───────────────────────────
  if (!hasStrength3) {
    issues.push("No outcome reaches Strength 3 (≥70% of 10 hours). Redistribute hours.");
  }

  if (issues.length > 0) {
    return res.json({ valid: false, issues, recomputedM3 });
  }

  return res.json({
    valid: true,
    message: "Agent B: All checks passed. Hours sum to 10, Bloom's levels ≤ CO, M3 values correct, Strength 3 achieved.",
    recomputedM3
  });
});

module.exports = router;
