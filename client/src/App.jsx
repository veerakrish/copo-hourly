import { useState } from "react";
import DeptSelector    from "./components/DeptSelector";
import UnitTabs        from "./components/UnitTabs";
import UnitInputPanel  from "./components/UnitInputPanel";
import ManualPanel     from "./components/ManualPanel";
import AggregationView from "./components/AggregationView";
import { useUnitProcessor } from "./hooks/useUnitProcessor";

export default function App() {
  const [dept, setDept]           = useState(null);
  const [mode, setMode]           = useState("ai");      // 'ai' | 'manual'
  const [activeUnit, setActiveUnit] = useState(0);       // 0-4 for AI tabs; 'agg' for final
  const [activeView, setActiveView] = useState("units"); // 'units' | 'agg'

  const {
    units, updateUnit,
    processUnit, lockManualUnit,
    cooldownActive, cooldownSeconds,
    aggregate, aggregated,
    allProcessed, reset
  } = useUnitProcessor(dept);

  function handleDeptSelect(d) {
    setDept(d);
    setActiveUnit(0);
    setActiveView("units");
  }

  function handleReset() {
    reset();
    setDept(null);
    setMode("ai");
    setActiveUnit(0);
    setActiveView("units");
  }

  /* ── Not yet on dept selection ───────────── */
  if (!dept) {
    return <DeptSelector onSelect={handleDeptSelect} />;
  }

  const deptColors = { CSE: "var(--accent-gold)", AIML: "var(--accent-teal)", CIC: "var(--accent-purple)" };

  return (
    <div id="app">
      {/* ── Header ─────────────────────────── */}
      <header className="header">
        <div className="header-inner">
          <span className="header-logo">
            Accreditation <em>Architect</em>
          </span>
          <div className="header-right">
            <span className="dept-badge" style={{ color: deptColors[dept] || "var(--accent-gold)" }}>
              {dept}
            </span>
            <div className="mode-toggle">
              <button
                className={`mode-btn ${mode === "ai" ? "active" : ""}`}
                onClick={() => setMode("ai")}
              >
                ⚡ AI Mode
              </button>
              <button
                className={`mode-btn ${mode === "manual" ? "active" : ""}`}
                onClick={() => setMode("manual")}
              >
                ✎ Manual
              </button>
            </div>
            <button className="btn btn-secondary btn-sm" onClick={handleReset}>
              ← Change Dept
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ───────────────────────────── */}
      <main style={{ flex: 1 }}>
        <div className="app-wrap">

          {/* ── AI Mode ─────────────────────── */}
          {mode === "ai" && (
            <>
              <UnitTabs
                units={units}
                activeUnit={activeView === "agg" ? -1 : activeUnit}
                onSelect={idx => { setActiveUnit(idx); setActiveView("units"); }}
              />

              {/* Final matrix tab */}
              <div style={{ display: "flex", gap: 6, padding: "0 0 0", borderBottom: "1px solid var(--border)", marginTop: -1 }}>
                <button
                  className={`unit-tab${activeView === "agg" ? " active" : ""}${!allProcessed ? " locked" : ""}`}
                  style={{ borderRadius: "0 0 var(--radius-md) var(--radius-md)" }}
                  onClick={() => { if (allProcessed) setActiveView("agg"); }}
                  disabled={!allProcessed}
                  title={!allProcessed ? "Complete all 5 units first" : "View final matrix"}
                >
                  📊 Final Matrix
                  {!allProcessed && <span style={{ fontSize: 11, opacity: 0.6 }}>🔒</span>}
                </button>
              </div>

              <div className="content-area">
                {activeView === "units" && (
                  <UnitInputPanel
                    unit={units[activeUnit]}
                    unitIdx={activeUnit}
                    onUpdate={patch => updateUnit(activeUnit, patch)}
                    onProcess={() => processUnit(activeUnit)}
                    cooldownActive={cooldownActive}
                    cooldownSeconds={cooldownSeconds}
                  />
                )}
                {activeView === "agg" && (
                  <AggregationView units={units} />
                )}
              </div>
            </>
          )}

          {/* ── Manual Mode ─────────────────── */}
          {mode === "manual" && (
            <>
              <div style={{ paddingTop: 24 }}>
                {/* Progress bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <span style={{ fontSize: 13, color: "var(--text-2)" }}>Progress:</span>
                  {units.map((u, i) => (
                    <div key={i} style={{
                      width: 36, height: 36, borderRadius: 8,
                      background: u.processed ? "rgba(0,212,170,0.15)" : "var(--bg-3)",
                      border: `1px solid ${u.processed ? "var(--accent-teal)" : "var(--border)"}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-mono)", fontSize: 12,
                      color: u.processed ? "var(--accent-teal)" : "var(--text-3)"
                    }}>
                      {u.processed ? "✓" : i + 1}
                    </div>
                  ))}
                </div>

                <ManualPanel
                  onLockUnit={lockManualUnit}
                  unitsLocked={units.map(u => u.processed)}
                />

                {allProcessed && (
                  <div style={{ marginTop: 24 }}>
                    <div className="section-divider">Final Matrix</div>
                    <AggregationView units={units} />
                  </div>
                )}
              </div>
            </>
          )}

        </div>
      </main>
    </div>
  );
}
