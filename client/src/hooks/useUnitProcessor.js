import { useState, useCallback, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "";
const COOLDOWN_MS = 7000;

export function useUnitProcessor(dept, unitCount = 5) {
  const sessionId = useRef(`session-${Date.now()}-${Math.random().toString(36).slice(2)}`);

  const makeUnit = () => ({
    syllabus:"", coStatement:"", coLevel:"K3",
    processed:false, processing:false, result:null, error:null
  });

  const [units, setUnits] = useState(Array.from({ length: unitCount }, makeUnit));
  const [cooldownActive, setCooldownActive] = useState(false);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const cooldownTimer = useRef(null);

  // Re-init units if unitCount changes
  const lastCount = useRef(unitCount);
  if (lastCount.current !== unitCount) {
    lastCount.current = unitCount;
    // Will be handled via reset from parent
  }

  const updateUnit = useCallback((idx, patch) => {
    setUnits(prev => prev.map((u, i) => i === idx ? { ...u, ...patch } : u));
  }, []);

  function startCooldown() {
    setCooldownActive(true);
    setCooldownSeconds(Math.ceil(COOLDOWN_MS / 1000));
    clearInterval(cooldownTimer.current);
    let rem = Math.ceil(COOLDOWN_MS / 1000);
    cooldownTimer.current = setInterval(() => {
      rem -= 1;
      setCooldownSeconds(rem);
      if (rem <= 0) { clearInterval(cooldownTimer.current); setCooldownActive(false); setCooldownSeconds(0); }
    }, 1000);
  }

  const processUnit = useCallback(async (idx) => {
    const unit = units[idx];
    if (!unit.syllabus.trim() || !unit.coStatement.trim()) return;
    updateUnit(idx, { processing:true, error:null });
    try {
      const res = await fetch(`${API_BASE}/api/process-unit`, {
        method:"POST",
        headers:{ "Content-Type":"application/json", "x-session-id": sessionId.current },
        body: JSON.stringify({ dept, unitId:idx+1, coStatement:unit.coStatement, coLevel:unit.coLevel, syllabus:unit.syllabus })
      });
      const json = await res.json();
      if (!res.ok) { updateUnit(idx, { processing:false, error: json.error || "API error" }); return; }
      updateUnit(idx, { processing:false, processed:true, result:json.data, error:null });
      startCooldown();
    } catch(err) {
      updateUnit(idx, { processing:false, error:err.message });
    }
  }, [units, dept, updateUnit]);

  const lockManualUnit = useCallback((idx, manualResult) => {
    updateUnit(idx, { processed:true, result:manualResult, error:null });
  }, [updateUnit]);

  const reset = useCallback(() => {
    clearInterval(cooldownTimer.current);
    setUnits(Array.from({ length: unitCount }, makeUnit));
    setCooldownActive(false); setCooldownSeconds(0);
  }, [unitCount]);

  const allProcessed = units.length === unitCount && units.every(u => u.processed);

  return { units, updateUnit, processUnit, lockManualUnit, cooldownActive, cooldownSeconds, allProcessed, reset };
}
