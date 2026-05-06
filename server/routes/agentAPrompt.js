const { PROGRAM_OUTCOMES, DEPT_PSO, BLOOMS_LEVELS } = require("../utils/psoData");

/**
 * Builds the full system + user prompt for Agent A (Mistral).
 * Enforces: Bloom's K-level ≤ CO level, hours sum = 10,
 * dept-specific PSOs, and returns strict JSON.
 */
function buildAgentAPrompt(dept, unitId, coStatement, coLevel, syllabus) {
  const psos = DEPT_PSO[dept];
  const psoBlock = Object.entries(psos)
    .map(([k, v]) => `    ${k}: ${v}`)
    .join("\n");

  const poBlock = Object.entries(PROGRAM_OUTCOMES)
    .map(([k, v]) => `    ${k}: ${v}`)
    .join("\n");

  const bloomsBlock = Object.entries(BLOOMS_LEVELS)
    .map(([k, v]) => `    ${k} (${v.name}): ${v.verbs.join(", ")}`)
    .join("\n");

  const maxLevel = coLevel; // never exceed this

  const systemPrompt = `You are an expert Academic Quality Controller and Instructional Designer for NBA/NAAC-accredited Indian engineering colleges.

Your role: Generate a 10-hour lesson plan for a given unit syllabus, mapping each topic to Program Outcomes (POs) and Program Specific Outcomes (PSOs) using Bloom's Taxonomy.

## STRICT RULES (violations invalidate output):
1. ALL topic hours must sum to EXACTLY 10.
2. Every topic name MUST start with a Bloom's Taxonomy action verb.
3. Each topic's bloom_level MUST be ≤ the CO's K-level (max allowed: ${maxLevel}).
4. NEVER use bloom_level above K4 (Analyze).
5. Map only RELEVANT POs and PSOs — do not map everything blindly.
6. Distribute hours so at least one PO or PSO has ≥7 hours total (to achieve Strength 3).
7. Output ONLY raw JSON. No markdown fences, no explanation, no preamble.

## Bloom's Taxonomy Reference:
${bloomsBlock}

## Program Outcomes:
${poBlock}

## Department: ${dept}
## PSOs for ${dept}:
${psoBlock}

## Output JSON Schema (follow EXACTLY):
{
  "unit_meta": {
    "dept": "${dept}",
    "unit_id": ${unitId},
    "co_level": "${coLevel}",
    "co_statement": "<co statement here>"
  },
  "lesson_plan": [
    {
      "topic": "<Verb + topic description>",
      "bloom_level": "K1|K2|K3|K4",
      "hours": <integer>,
      "mappings": ["PO1", "PO2", "PSO1"]
    }
  ],
  "unit_matrices": {
    "m1_raw": { "po1": "7/10", "po2": "3/10", ... },
    "m2_percent": { "po1": 70, "po2": 30, ... },
    "m3_strength": { "po1": 3, "po2": 1, ... }
  },
  "validation": "Confirmed: Hours sum to 10 and Bloom's levels ≤ ${coLevel}."
}

Include ONLY POs and PSOs that are actually mapped (non-zero). Use lowercase keys in matrices (po1, po2, pso1, pso2, pso3).`;

  const userPrompt = `Generate the lesson plan for the following unit:

Department: ${dept}
Unit ID: ${unitId}
Course Outcome (CO): ${coStatement}
CO Bloom's Level: ${coLevel}
Unit Syllabus:
${syllabus}

Remember: hours must sum to exactly 10, Bloom's levels must not exceed ${coLevel}, and output ONLY raw JSON.`;

  return { systemPrompt, userPrompt };
}

module.exports = { buildAgentAPrompt };
