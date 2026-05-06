const express  = require("express");
const router   = express.Router();
const { getCooldownMiddleware } = require("../middleware/cooldown");
const { buildAgentAPrompt }    = require("./agentAPrompt");

const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
const MISTRAL_MODEL   = "mistral-large-latest";

/* ── helpers ─────────────────────────────────────── */
function extractJSON(text) {
  // Strip markdown fences if model ignored the instruction
  const clean = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();
  // Find the first '{' and last '}' to isolate JSON
  const start = clean.indexOf("{");
  const end   = clean.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("No JSON object found in response.");
  return JSON.parse(clean.slice(start, end + 1));
}

function validateSchema(data) {
  if (!data.unit_meta)    throw new Error("Missing unit_meta");
  if (!data.lesson_plan)  throw new Error("Missing lesson_plan");
  if (!data.unit_matrices) throw new Error("Missing unit_matrices");

  const totalHours = data.lesson_plan.reduce((sum, t) => sum + (t.hours || 0), 0);
  if (totalHours !== 10) {
    throw new Error(`Hours sum to ${totalHours}, expected 10.`);
  }

  const coIdx = ["K1","K2","K3","K4"].indexOf(data.unit_meta.co_level);
  for (const topic of data.lesson_plan) {
    const tIdx = ["K1","K2","K3","K4"].indexOf(topic.bloom_level);
    if (tIdx > coIdx) {
      throw new Error(`Topic "${topic.topic}" has level ${topic.bloom_level} which exceeds CO level ${data.unit_meta.co_level}.`);
    }
  }
  return true;
}

/* ── route ───────────────────────────────────────── */
router.post("/", getCooldownMiddleware(), async (req, res) => {
  const { dept, unitId, coStatement, coLevel, syllabus } = req.body;

  if (!dept || !unitId || !coStatement || !coLevel || !syllabus) {
    return res.status(400).json({ error: "Missing required fields: dept, unitId, coStatement, coLevel, syllabus" });
  }

  const validDepts  = ["CSE", "AIML", "CIC"];
  const validLevels = ["K1", "K2", "K3", "K4"];
  if (!validDepts.includes(dept))   return res.status(400).json({ error: "dept must be CSE, AIML, or CIC" });
  if (!validLevels.includes(coLevel)) return res.status(400).json({ error: "coLevel must be K1–K4" });

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) return res.status(500).json({ error: "MISTRAL_API_KEY not configured on server." });

  const { systemPrompt, userPrompt } = buildAgentAPrompt(dept, unitId, coStatement, coLevel, syllabus);

  try {
    const mistralRes = await fetch(MISTRAL_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: MISTRAL_MODEL,
        temperature: 0.2,
        max_tokens: 3000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   }
        ]
      })
    });

    if (!mistralRes.ok) {
      const errBody = await mistralRes.text();
      if (mistralRes.status === 429) {
        return res.status(429).json({ error: "Mistral API rate limit reached. Wait a moment and retry." });
      }
      return res.status(mistralRes.status).json({ error: `Mistral API error: ${errBody}` });
    }

    const mistralData = await mistralRes.json();
    const rawText     = mistralData.choices?.[0]?.message?.content;

    if (!rawText) return res.status(500).json({ error: "Empty response from Mistral." });

    // Parse and validate the JSON
    const parsed = extractJSON(rawText);
    validateSchema(parsed);

    return res.json({ success: true, data: parsed });

  } catch (err) {
    console.error("[process-unit] Error:", err.message);
    return res.status(500).json({ error: err.message || "Internal server error." });
  }
});

module.exports = router;
