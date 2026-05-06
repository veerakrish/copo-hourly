const express = require("express");
const router  = express.Router();

/**
 * Aggregates M3 strength values across all 5 processed units.
 * Final Articulation = average M3 per PO/PSO (rounded to 2dp).
 * A PO/PSO with 0 in some units still counts those 0s in the average.
 */
router.post("/", (req, res) => {
  const { units } = req.body; // array of 5 unit result objects

  if (!Array.isArray(units) || units.length === 0) {
    return res.status(400).json({ error: "units must be a non-empty array." });
  }

  // Collect all unique PO/PSO keys across all units
  const allKeys = new Set();
  for (const unit of units) {
    const m3 = unit?.unit_matrices?.m3_strength || {};
    for (const k of Object.keys(m3)) allKeys.add(k);
  }

  const n = units.length;
  const sumMap = {};
  const countMap = {};

  // Sum M3 values; treat missing as 0
  for (const key of allKeys) {
    sumMap[key]   = 0;
    countMap[key] = 0;
    for (const unit of units) {
      const val = unit?.unit_matrices?.m3_strength?.[key] ?? 0;
      sumMap[key]   += val;
      countMap[key] += 1;
    }
  }

  // Build final articulation matrix
  const finalArticulation = {};
  const finalM3Raw        = {};
  for (const key of allKeys) {
    const avg = sumMap[key] / n;
    finalArticulation[key] = Math.round(avg * 100) / 100; // 2 dp
    // Round to nearest integer for display
    finalM3Raw[key] = Math.round(avg);
  }

  // Build per-unit M3 summary for the comparison table
  const unitSummaries = units.map((unit, idx) => ({
    unit_id: unit?.unit_meta?.unit_id ?? idx + 1,
    co_level: unit?.unit_meta?.co_level,
    m3: unit?.unit_matrices?.m3_strength || {}
  }));

  return res.json({
    success: true,
    totalUnits: n,
    allOutcomes: [...allKeys].sort(),
    unitSummaries,
    finalArticulation,   // average (decimal)
    finalM3Rounded: finalM3Raw, // rounded to 0/1/2/3
    generatedAt: new Date().toISOString()
  });
});

module.exports = router;
