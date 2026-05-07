import { useState } from "react";
import DeptSelector    from "./components/DeptSelector";
import UnitTabs        from "./components/UnitTabs";
import UnitInputPanel  from "./components/UnitInputPanel";
import ManualPanel     from "./components/ManualPanel";
import AggregationView from "./components/AggregationView";
import { useUnitProcessor } from "./hooks/useUnitProcessor";

export default function App() {
  const [dept, setDept]               = useState(null);
  const [courseType, setCourseType]   = useState(null);
  const [unitCount, setUnitCount]     = useState(5);
  const [mode, setMode]               = useState("ai");
  const [activeUnit, setActiveUnit]   = useState(0);
  const [activeView, setActiveView]   = useState("units");

  const {
    units, updateUnit,
    processUnit, lockManualUnit,
    cooldownActive, cooldownSeconds,
    allProcessed, reset
  } = useUnitProcessor(dept, unitCount);

  function handleDeptSelect(d) { setDept(d); }

  function handleCourseSetup(type, count) {
    setCourseType(type);
    setUnitCount(count);
    setActiveUnit(0);
    setActiveView("units");
  }

  function handleReset() {
    reset();
    setDept(null);
    setCourseType(null);
    setUnitCount(5);
    setMode("ai");
    setActiveUnit(0);
    setActiveView("units");
  }

  const deptColors = { CSE: "var(--accent-gold)", AIML: "var(--accent-teal)", CIC: "var(--accent-purple)" };

  if (!dept) return <DeptSelector onSelect={handleDeptSelect} />;

  if (!courseType) {
    return (
      <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
        <AppHeader dept={dept} deptColors={deptColors} onReset={handleReset} showModeToggle={false} mode={mode} setMode={setMode} />
        <CourseSetup onConfirm={handleCourseSetup} />
        <Footer />
      </div>
    );
  }

  return (
    <div style={{ display:"flex", flexDirection:"column", minHeight:"100vh" }}>
      <AppHeader dept={dept} deptColors={deptColors} onReset={handleReset}
        showModeToggle mode={mode} setMode={setMode}
        courseType={courseType} unitCount={unitCount} />

      <main style={{ flex:1 }}>
        <div className="app-wrap">

          {mode === "ai" && (
            <>
              <UnitTabs
                units={units}
                activeUnit={activeView === "agg" ? -1 : activeUnit}
                onSelect={idx => { setActiveUnit(idx); setActiveView("units"); }}
                label={courseType === "lab" ? "Exp" : "Unit"}
              />
              <div style={{ display:"flex", gap:6, borderBottom:"1px solid var(--border)", marginTop:-1 }}>
                <button
                  className={`unit-tab${activeView === "agg" ? " active" : ""}${!allProcessed ? " locked" : ""}`}
                  style={{ borderRadius:"0 0 var(--radius-md) var(--radius-md)" }}
                  onClick={() => { if (allProcessed) setActiveView("agg"); }}
                  disabled={!allProcessed}
                  title={!allProcessed ? "Complete all entries first" : "View final matrix"}
                >
                  📊 Final CO-PO Matrix
                  {!allProcessed && <span style={{ fontSize:11, opacity:0.6 }}>🔒</span>}
                </button>
              </div>
              <div className="content-area">
                {activeView === "units" && (
                  <UnitInputPanel
                    unit={units[activeUnit]} unitIdx={activeUnit}
                    onUpdate={patch => updateUnit(activeUnit, patch)}
                    onProcess={() => processUnit(activeUnit)}
                    cooldownActive={cooldownActive} cooldownSeconds={cooldownSeconds}
                    label={courseType === "lab" ? "Experiment" : "Unit"}
                  />
                )}
                {activeView === "agg" && <AggregationView units={units} unitCount={unitCount} />}
              </div>
            </>
          )}

          {mode === "manual" && (
            <div style={{ paddingTop:24 }}>
              <ManualPanel
                unitCount={unitCount} courseType={courseType}
                onLockUnit={lockManualUnit}
                unitsProcessed={units.map(u => u.processed)}
              />
              {allProcessed && (
                <div style={{ marginTop:24 }}>
                  <div className="section-divider">Final CO-PO Matrix</div>
                  <AggregationView units={units} unitCount={unitCount} />
                </div>
              )}
            </div>
          )}

        </div>
      </main>
      <Footer />
    </div>
  );
}

function AppHeader({ dept, deptColors, onReset, mode, setMode, showModeToggle, courseType, unitCount }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div>
          <div className="header-logo">
            SRKR CSE <span>COPO</span> Mapping Application
          </div>
          {courseType && (
            <div style={{ fontSize:11, color:"var(--text-3)", marginTop:2 }}>
              {courseType === "lab" ? "Lab Course" : "Theory Course"} · {unitCount} {courseType === "lab" ? "Experiment(s)" : "Unit(s)"}
            </div>
          )}
        </div>
        <div className="header-right">
          <span className="dept-badge" style={{ color: deptColors[dept] || "var(--accent-gold)" }}>{dept}</span>
          {showModeToggle && (
            <div className="mode-toggle">
              <button className={`mode-btn ${mode === "ai" ? "active" : ""}`} onClick={() => setMode("ai")}>⚡ AI Mode</button>
              <button className={`mode-btn ${mode === "manual" ? "active" : ""}`} onClick={() => setMode("manual")}>✎ Manual</button>
            </div>
          )}
          <button className="btn btn-secondary btn-sm" onClick={onReset}>← Restart</button>
        </div>
      </div>
    </header>
  );
}

function CourseSetup({ onConfirm }) {
  const [type, setType]   = useState(null);
  const [count, setCount] = useState(5);

  return (
    <div className="dept-selector">
      <div className="dept-hero">
        <h1>Course <em>Setup</em></h1>
        <p>Select your course type and number of units / experiments</p>
      </div>
      <div className="dept-cards">
        <div className="dept-card"
          style={{ border: type === "theory" ? "1px solid var(--accent-teal)" : undefined }}
          onClick={() => { setType("theory"); setCount(5); }}
          role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setType("theory")}>
          <span className="dept-card-icon">📘</span>
          <h2>Theory Course</h2>
          <p>Lecture-based course with 1–5 units (10 hrs each)</p>
          <span className="dept-card-tag">Up to 5 Units</span>
        </div>
        <div className="dept-card"
          style={{ border: type === "lab" ? "1px solid var(--accent-purple)" : undefined }}
          onClick={() => { setType("lab"); setCount(2); }}
          role="button" tabIndex={0} onKeyDown={e => e.key === "Enter" && setType("lab")}>
          <span className="dept-card-icon">🔬</span>
          <h2>Lab Course</h2>
          <p>Practical experiments — 2 to 5 experiments</p>
          <span className="dept-card-tag">2–5 Experiments</span>
        </div>
      </div>

      {type && (
        <div style={{ textAlign:"center", marginTop:8 }}>
          <label style={{ fontSize:13, color:"var(--text-2)", display:"block", marginBottom:10 }}>
            {type === "lab" ? "Number of Experiments" : "Number of Units"}
          </label>
          <div style={{ display:"flex", gap:10, justifyContent:"center", marginBottom:20 }}>
            {(type === "lab" ? [2,3,4,5] : [1,2,3,4,5]).map(n => (
              <button key={n}
                className={`btn ${count === n ? "btn-primary" : "btn-secondary"}`}
                style={{ width:52, justifyContent:"center" }}
                onClick={() => setCount(n)}>
                {n}
              </button>
            ))}
          </div>
          <button className="btn btn-primary" onClick={() => onConfirm(type, count)}>Continue →</button>
        </div>
      )}
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      borderTop:"1px solid var(--border)", padding:"14px 24px",
      textAlign:"center", fontSize:12, color:"var(--text-3)",
      background:"var(--bg-1)"
    }}>
      Powered by <span style={{ color:"var(--accent-teal)", fontWeight:600 }}>SRKR CSE Department</span>
    </footer>
  );
}
