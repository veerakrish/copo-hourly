/* cooldown.js
   Tracks last Mistral API call time per session and enforces
   a 7-second minimum gap to prevent 429 rate-limit errors.
   ----------------------------------------------------------------- */
const COOLDOWN_MS = 7000; // 7 seconds between unit calls

// In-memory store: sessionId → timestamp of last API call
const lastCallMap = new Map();

function getCooldownMiddleware() {
  return function cooldown(req, res, next) {
    const sessionId = req.headers["x-session-id"] || req.ip || "default";
    const now       = Date.now();
    const last      = lastCallMap.get(sessionId) || 0;
    const elapsed   = now - last;
    const remaining = COOLDOWN_MS - elapsed;

    if (remaining > 0) {
      return res.status(429).json({
        error: "COOLDOWN_ACTIVE",
        message: `Please wait ${Math.ceil(remaining / 1000)} more second(s) before processing the next unit.`,
        remainingMs: remaining
      });
    }

    // Stamp the time BEFORE calling next so the timestamp is accurate
    lastCallMap.set(sessionId, now);

    // Clean up stale entries older than 5 minutes to avoid memory leak
    if (lastCallMap.size > 500) {
      const cutoff = now - 300_000;
      for (const [id, ts] of lastCallMap.entries()) {
        if (ts < cutoff) lastCallMap.delete(id);
      }
    }

    next();
  };
}

module.exports = { getCooldownMiddleware, COOLDOWN_MS };
