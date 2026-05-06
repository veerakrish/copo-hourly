import LessonPlanTable from "./LessonPlanTable";
import MatrixTable     from "./MatrixTable";

export default function UnitInputPanel({
  unit, unitIdx, onUpdate, onProcess,
  cooldownActive, cooldownSeconds
}) {
  const canProcess = unit.syllabus.trim() && unit.coStatement.trim() && !unit.processing && !cooldownActive;
  const cooldownPct = cooldownActive
    ? Math.round((cooldownSeconds / 7) * 100)
    : 0;

  return (
    <div>
      {/* ── Input form ─────────────────────────── */}
      {!unit.processed && (
        <div className="panel" style={{ marginBottom: 24 }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Unit {unitIdx + 1} — Input</div>
              <div className="panel-sub">Enter syllabus topics and Course Outcome for this unit</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="field">
              <label>Syllabus Topics</label>
              <textarea
                placeholder="e.g. Introduction to data structures, Arrays and linked lists, Stack and queue operations..."
                value={unit.syllabus}
                onChange={e => onUpdate({ syllabus: e.target.value })}
                rows={5}
              />
            </div>

            <div className="form-row">
              <div className="field">
                <label>Course Outcome (CO) Statement</label>
                <input
                  type="text"
                  placeholder="e.g. Ability to implement and analyze linear data structures"
                  value={unit.coStatement}
                  onChange={e => onUpdate({ coStatement: e.target.value })}
                />
              </div>
              <div className="field">
                <label>CO Bloom's Level</label>
                <select
                  value={unit.coLevel}
                  onChange={e => onUpdate({ coLevel: e.target.value })}
                >
                  <option value="K1">K1 — Remember</option>
                  <option value="K2">K2 — Understand</option>
                  <option value="K3">K3 — Apply</option>
                  <option value="K4">K4 — Analyze</option>
                </select>
              </div>
            </div>

            {/* Cooldown bar */}
            {cooldownActive && (
              <div className="cooldown-bar" style={{ marginBottom: 16 }}>
                <div className="cooldown-progress">
                  <div className="cooldown-fill" style={{ width: `${cooldownPct}%` }} />
                </div>
                <span>⏱ Cooldown: {cooldownSeconds}s remaining</span>
              </div>
            )}

            {unit.error && (
              <div className="validation-err" style={{ marginBottom: 16 }}>
                <strong>Error:</strong> {unit.error}
              </div>
            )}

            <button
              className="btn btn-primary"
              onClick={onProcess}
              disabled={!canProcess}
            >
              {unit.processing
                ? <><span className="spinner" /> Processing with Mistral AI…</>
                : "⚡ Generate Lesson Plan + Matrices"
              }
            </button>
          </div>
        </div>
      )}

      {/* ── Results ────────────────────────────── */}
      {unit.processed && unit.result && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div className="validation-ok">
              ✓ Unit {unitIdx + 1} processed — {unit.result.lesson_plan?.length} topics · {unit.result.validation}
            </div>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onUpdate({ processed: false, result: null, error: null })}
              style={{ marginLeft: 12, flexShrink: 0 }}
            >
              ✎ Reprocess
            </button>
          </div>

          {/* Unit meta */}
          <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
            {[
              ["Department", unit.result.unit_meta?.dept],
              ["Unit", unit.result.unit_meta?.unit_id],
              ["CO Level", unit.result.unit_meta?.co_level],
              ["Total Hours", unit.result.lesson_plan?.reduce((s,t) => s + t.hours, 0) + "/10"]
            ].map(([label, val]) => (
              <div key={label} style={{
                background: "var(--bg-2)", border: "1px solid var(--border)",
                borderRadius: "var(--radius-md)", padding: "10px 16px"
              }}>
                <div style={{ fontSize: 11, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontFamily: "var(--font-mono)", fontWeight: 600, color: "var(--accent-teal)" }}>{val}</div>
              </div>
            ))}
          </div>

          <div className="section-divider">Lesson Plan</div>
          <div className="panel" style={{ marginBottom: 24 }}>
            <div className="panel-body" style={{ padding: 0 }}>
              <LessonPlanTable lessonPlan={unit.result.lesson_plan} />
            </div>
          </div>

          <div className="section-divider">CO-PO / PSO Matrices</div>
          <MatrixTable matrices={unit.result.unit_matrices} />
        </>
      )}
    </div>
  );
}
