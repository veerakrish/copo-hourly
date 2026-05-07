import { useState } from "react";
import { buildMatricesFromMap } from "../utils/matrixCalc";
import MatrixTable from "./MatrixTable";

const ALL_POS  = ["PO1","PO2","PO3","PO4","PO5","PO6","PO7","PO8","PO9","PO10","PO11","PO12"];
const ALL_PSOS = ["PSO1","PSO2","PSO3"];
const ALL_OUTCOMES = [...ALL_POS, ...ALL_PSOS];

const BLOOMS = ["K1","K2","K3","K4"];

export default function ManualPanel({ unitCount, courseType, onLockUnit, unitsProcessed }) {
  const label = courseType === "lab" ? "Experiment" : "Unit";

  // Which unit is being edited (1-based)
  const [selectedUnit, setSelectedUnit] = useState(1);
  // Per-unit topics: { [unitIdx]: [{topic, hours, coLevel, mappings:[]}] }
  const [unitTopics, setUnitTopics]     = useState({});
  // Per-unit CO statements
  const [unitCOs, setUnitCOs]           = useState({});
  // Current topic form
  const [form, setForm] = useState({ topic:"", hours:1, coLevel:"K3", mappings:[] });
  const [lockedUnits, setLockedUnits]   = useState(new Set());

  const topics    = unitTopics[selectedUnit] || [];
  const totalHrs  = topics.reduce((s,t) => s + Number(t.hours), 0);
  const coStmt    = unitCOs[selectedUnit] || "";

  function setCoStmt(v) {
    setUnitCOs(prev => ({ ...prev, [selectedUnit]: v }));
  }

  function toggleMapping(out) {
    setForm(f => ({
      ...f,
      mappings: f.mappings.includes(out)
        ? f.mappings.filter(x => x !== out)
        : [...f.mappings, out]
    }));
  }

  function addTopic() {
    if (!form.topic.trim() || form.mappings.length === 0) return;
    const newTopic = { ...form, hours: Number(form.hours) };
    setUnitTopics(prev => ({
      ...prev,
      [selectedUnit]: [...(prev[selectedUnit] || []), newTopic]
    }));
    setForm({ topic:"", hours:1, coLevel:"K3", mappings:[] });
  }

  function removeTopic(idx) {
    setUnitTopics(prev => ({
      ...prev,
      [selectedUnit]: prev[selectedUnit].filter((_,i) => i !== idx)
    }));
  }

  function computeAndLock() {
    if (topics.length === 0) return;
    // Build hour map per outcome key
    const hourMap = {};
    for (const t of topics) {
      for (const m of t.mappings) {
        const k = m.toLowerCase();
        hourMap[k] = (hourMap[k] || 0) + Number(t.hours);
      }
    }
    const matrices = buildMatricesFromMap(hourMap, totalHrs || 10);
    const result = {
      unit_meta: {
        unit_id:      selectedUnit,
        co_level:     topics[0]?.coLevel || "K3",
        co_statement: coStmt,
        dept:         "MANUAL"
      },
      lesson_plan: topics.map(t => ({
        topic:       t.topic,
        bloom_level: t.coLevel,
        hours:       t.hours,
        mappings:    t.mappings
      })),
      unit_matrices: matrices,
      validation: `Manual: ${topics.length} topics, ${totalHrs} hrs`
    };
    onLockUnit(selectedUnit - 1, result);
    setLockedUnits(prev => new Set([...prev, selectedUnit]));
    // Advance to next unlocked
    const next = Array.from({length: unitCount}, (_,i) => i+1).find(n => n > selectedUnit && !lockedUnits.has(n) && n !== selectedUnit);
    if (next) setSelectedUnit(next);
  }

  const isLocked = lockedUnits.has(selectedUnit);

  return (
    <div>
      {/* ── Unit selector pills ───────────────── */}
      <div style={{ display:"flex", gap:8, marginBottom:24, flexWrap:"wrap", alignItems:"center" }}>
        <span style={{ fontSize:13, color:"var(--text-2)", marginRight:4 }}>Select {label}:</span>
        {Array.from({ length: unitCount }, (_,i) => i+1).map(n => {
          const locked = lockedUnits.has(n);
          const active = n === selectedUnit;
          return (
            <button key={n}
              onClick={() => setSelectedUnit(n)}
              className={`btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`}
              style={{ minWidth:48, position:"relative" }}>
              {label} {n}
              {locked && <span style={{ position:"absolute", top:-4, right:-4, fontSize:10, background:"var(--accent-teal)", color:"#000", borderRadius:"50%", width:14, height:14, display:"flex", alignItems:"center", justifyContent:"center" }}>✓</span>}
            </button>
          );
        })}
      </div>

      {/* ── CO Statement ──────────────────────── */}
      <div className="panel" style={{ marginBottom:20 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">{label} {selectedUnit} — Course Outcome</div>
            <div className="panel-sub">Enter the CO statement for this {label.toLowerCase()}</div>
          </div>
          {isLocked && <span style={{ color:"var(--accent-teal)", fontSize:13, fontWeight:600 }}>✓ Locked</span>}
        </div>
        <div className="panel-body">
          <div className="field" style={{ margin:0 }}>
            <input type="text" placeholder={`e.g. Students will be able to implement sorting algorithms`}
              value={coStmt} onChange={e => setCoStmt(e.target.value)}
              disabled={isLocked} />
          </div>
        </div>
      </div>

      {/* ── Add topic form ────────────────────── */}
      {!isLocked && (
        <div className="panel" style={{ marginBottom:20 }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">Add Learning Outcome / Topic</div>
              <div className="panel-sub">Add topics one at a time and map them to POs and PSOs</div>
            </div>
          </div>
          <div className="panel-body">
            <div className="form-row" style={{ marginBottom:16 }}>
              <div className="field" style={{ margin:0 }}>
                <label>Learning Outcome / Topic</label>
                <input type="text"
                  placeholder="e.g. Implement bubble sort algorithm"
                  value={form.topic}
                  onChange={e => setForm(f => ({ ...f, topic:e.target.value }))} />
              </div>
              <div style={{ display:"flex", gap:12 }}>
                <div className="field" style={{ margin:0, flex:1 }}>
                  <label>Hours</label>
                  <input type="number" min="1" max="50" value={form.hours}
                    onChange={e => setForm(f => ({ ...f, hours: Number(e.target.value) }))}
                    style={{ width:"100%" }} />
                </div>
                <div className="field" style={{ margin:0, flex:1 }}>
                  <label>Bloom's Level</label>
                  <select value={form.coLevel} onChange={e => setForm(f => ({ ...f, coLevel:e.target.value }))}>
                    <option value="K1">K1 – Remember</option>
                    <option value="K2">K2 – Understand</option>
                    <option value="K3">K3 – Apply</option>
                    <option value="K4">K4 – Analyze</option>
                  </select>
                </div>
              </div>
            </div>

            {/* PO/PSO picker */}
            <div className="field" style={{ marginBottom:16 }}>
              <label>Map to POs / PSOs (select all that apply)</label>
              <div style={{ marginBottom:8 }}>
                <span style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Program Outcomes</span>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
                  {ALL_POS.map(po => {
                    const active = form.mappings.includes(po);
                    return (
                      <button key={po} type="button"
                        onClick={() => toggleMapping(po)}
                        style={{
                          padding:"4px 10px", borderRadius:6, fontSize:12, cursor:"pointer",
                          fontFamily:"var(--font-mono)", border:"1px solid",
                          borderColor: active ? "var(--accent-teal)" : "var(--border)",
                          background:  active ? "rgba(0,212,170,0.15)" : "var(--bg-input)",
                          color:       active ? "var(--accent-teal)" : "var(--text-2)",
                          fontWeight:  active ? 600 : 400
                        }}>
                        {po}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <span style={{ fontSize:11, color:"var(--text-3)", textTransform:"uppercase", letterSpacing:"0.05em" }}>Program Specific Outcomes</span>
                <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginTop:6 }}>
                  {ALL_PSOS.map(pso => {
                    const active = form.mappings.includes(pso);
                    return (
                      <button key={pso} type="button"
                        onClick={() => toggleMapping(pso)}
                        style={{
                          padding:"4px 10px", borderRadius:6, fontSize:12, cursor:"pointer",
                          fontFamily:"var(--font-mono)", border:"1px solid",
                          borderColor: active ? "var(--accent-purple)" : "var(--border)",
                          background:  active ? "rgba(167,139,250,0.15)" : "var(--bg-input)",
                          color:       active ? "var(--accent-purple)" : "var(--text-2)",
                          fontWeight:  active ? 600 : 400
                        }}>
                        {pso}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {form.mappings.length > 0 && form.topic.trim() && (
              <div style={{ marginBottom:12, fontSize:12, color:"var(--text-2)" }}>
                Mapped: {form.mappings.map(m => (
                  <span key={m} className="mapping-tag" style={{ marginRight:4 }}>{m}</span>
                ))}
              </div>
            )}

            <button className="btn btn-primary"
              onClick={addTopic}
              disabled={!form.topic.trim() || form.mappings.length === 0}>
              + Add Topic
            </button>
          </div>
        </div>
      )}

      {/* ── Topics entered so far ─────────────── */}
      {topics.length > 0 && (
        <div className="panel" style={{ marginBottom:20 }}>
          <div className="panel-head">
            <div>
              <div className="panel-title">{label} {selectedUnit} — Topics ({topics.length})</div>
              <div className="panel-sub">Total hours: <strong style={{ color:"var(--accent-teal)" }}>{totalHrs}</strong></div>
            </div>
            {!isLocked && (
              <button className="btn btn-primary" onClick={computeAndLock} disabled={topics.length === 0 || !coStmt.trim()}>
                ✓ Compute & Lock {label} {selectedUnit}
              </button>
            )}
          </div>
          <div className="panel-body" style={{ padding:0 }}>
            <div className="lesson-table-wrap">
              <table className="lesson-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Learning Outcome / Topic</th>
                    <th>Level</th>
                    <th>Hrs</th>
                    <th>Mappings</th>
                    {!isLocked && <th></th>}
                  </tr>
                </thead>
                <tbody>
                  {topics.map((t, i) => (
                    <tr key={i}>
                      <td style={{ fontFamily:"var(--font-mono)", color:"var(--text-3)" }}>{i+1}</td>
                      <td>{t.topic}</td>
                      <td><span className={`bloom-badge bloom-${t.coLevel.toLowerCase()}`}>{t.coLevel}</span></td>
                      <td style={{ textAlign:"center", fontFamily:"var(--font-mono)", fontWeight:600 }}>{t.hours}</td>
                      <td>{t.mappings.map(m => <span key={m} className="mapping-tag">{m}</span>)}</td>
                      {!isLocked && (
                        <td>
                          <button className="btn btn-danger btn-sm" style={{ padding:"3px 8px" }} onClick={() => removeTopic(i)}>✕</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {topics.length === 0 && !isLocked && (
        <div className="empty-state">
          <h3>No topics yet</h3>
          <p>Use the form above to add learning outcomes for {label} {selectedUnit}</p>
        </div>
      )}

      {isLocked && topics.length > 0 && (
        <div>
          <div className="validation-ok" style={{ marginBottom:16 }}>
            ✓ {label} {selectedUnit} locked · {topics.length} topics · {totalHrs} hrs
          </div>
          <MatrixTable matrices={(unitTopics[selectedUnit]?.length ? (() => {
            const hourMap = {};
            for (const t of unitTopics[selectedUnit]) {
              for (const m of t.mappings) {
                const k = m.toLowerCase();
                hourMap[k] = (hourMap[k] || 0) + Number(t.hours);
              }
            }
            return buildMatricesFromMap(hourMap, totalHrs || 10);
          })() : null)} />
        </div>
      )}
    </div>
  );
}
