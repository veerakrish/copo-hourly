import { useState, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const COOLDOWN_MS = 7000;

/**
 * Manages sequential unit processing state and API calls.
 * Exposes: units, processUnit, lockManualUnit, aggregate, reset,
 *          cooldownActive, cooldownSeconds, aggregated
 */
export function useUnitProcessor(dept) {
  const sessionId = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const makeUnit = () => ({
    syllabus:    "",
    coStatement: "",
    coLevel:     "K3",
    processed:   false,
    processing:  false,
    result:      null,
    error:       null
  });

  const [units, setUnits]                 = useState(Array.from({ length: 5 }, makeUnit));
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [aggregated, setAggregated]       = useState(null);
  const cooldownTimer = useRef(null);

  /* ── Update a single unit field ─────────────── */
  const updateUnit = useCallback((idx, patch) => {
    setUnits(prev => prev.map((u, i) => i === idx ? { ...u, ...patch } : u));
  }, []);

  /* ── Start the cooldown UI countdown ────────── */
  function startCooldown() {
    setCooldownActive(true);
    setCooldownSeconds(Math.ceil(COOLDOWN_MS / 1000));
    clearInterval(cooldownTimer.current);
    let remaining = Math.ceil(COOLDOWN_MS / 1000);
    cooldownTimer.current = setInterval(() => {
      remaining -= 1;
      setCooldownSeconds(remaining);
      if (remaining <= 0) {
        clearInterval(cooldownTimer.current);
        setCooldownActive(false);
        setCooldownSeconds(0);
      }
    }, 1000);
  }

  /* ── AI mode: process a unit via Mistral ─────── */
  const processUnit = useCallback(async (idx) => {
    const unit = units[idx];
    if (!unit.syllabus.trim() || !unit.coStatement.trim()) return;

    updateUnit(idx, { processing: true, error: null });

    try {
      const res = await fetch(`${API_BASE}/api/process-unit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-session-id": sessionId.current
        },
        body: JSON.stringify({
          dept,
          unitId:      idx + 1,
          coStatement: unit.coStatement,
          coLevel:     unit.coLevel,
          syllabus:    unit.syllabus
        })
      });

      const json = await res.json();

      if (!res.ok) {
        updateUnit(idx, { processing: false, error: json.error || "API error" });
        return;
      }

      updateUnit(idx, { processing: false, processed: true, result: json.data, error: null });
      startCooldown();

    } catch (err) {
      updateUnit(idx, { processing: false, error: err.message });
    }
  }, [units, dept, updateUnit]);

  /* ── Manual mode: lock a unit with user data ─── */
  const lockManualUnit = useCallback((idx, manualResult) => {
    updateUnit(idx, { processed: true, result: manualResult, error: null });
  }, [updateUnit]);

  /* ── Final aggregation (calls server or local) ─ */
  const aggregate = useCallback(async () => {
    const processed = units.filter(u => u.processed && u.result);
    if (processed.length < 5) return;

    try {
      const res = await fetch(`${API_BASE}/api/aggregate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ units: processed.map(u => u.result) })
      });
      const json = await res.json();
      if (res.ok) setAggregated(json);
    } catch (err) {
      console.error("Aggregation error:", err);
    }
  }, [units]);

  /* ── Reset everything ───────────────────────── */
  const reset = useCallback(() => {
    clearInterval(cooldownTimer.current);
    setUnits(Array.from({ length: 5 }, makeUnit));
    setCooldownActive(false);
    setCooldownSeconds(0);
    setAggregated(null);
  }, []);

  const allProcessed = units.every(u => u.processed);

  return {
    units, updateUnit,
    processUnit, lockManualUnit,
    cooldownActive, cooldownSeconds,
    aggregate, aggregated,
    allProcessed, reset
  };
}
