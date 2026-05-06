import { useState, useEffect } from "react";
import { buildMatricesFromMap, validateHoursSum } from "../utils/matrixCalc";
import MatrixTable from "./MatrixTable";

const PO_KEYS  = ["po1","po2","po3","po4","po5","po6","po7","po8","po9","po10","po11","po12"];
const PSO_KEYS = ["pso1","pso2","pso3"];
const ALL_KEYS = [...PO_KEYS, ...PSO_KEYS];

const UNIT_COLS = [1,2,3,4,5];

const PRETTY = {
  po1:"PO1 – Engg Knowledge", po2:"PO2 – Problem Analysis",
  po3:"PO3 – Design", po4:"PO4 – Investigations",
  po5:"PO5 – Modern Tools", po6:"PO6 – Engg & Society",
  po7:"PO7 – Sustainability", po8:"PO8 – Ethics",
  po9:"PO9 – Team Work", po10:"PO10 – Communication",
  po11:"PO11 – Project Mgmt", po12:"PO12 – Lifelong Learning",
  pso1:"PSO1",pso2:"PSO2",pso3:"PSO3"
};

function emptyTable() {
  // { outcome_key: { unitIndex: hours } }
  const t = {};
  for (const k of ALL_KEYS) {
    t[k] = {};
    for (const u of UNIT_COLS) t[k][u] = 0;
  }
  return t;
}

export default function ManualPanel({ onLockUnit, unitsLocked }) {
  const [table, setTable]       = useState(emptyTable);
  const [lockedUnits, setLockedUnits] = useState(new Set());

  // Total hours per unit column (should be 10)
  function colTotal(unitIdx) {
    return ALL_KEYS.reduce((s, k) => s + (Number(table[k][unitIdx]) || 0), 0);
  }

  function setCell(key, unitIdx, val) {
    const n = Math.max(0, Math.min(10, Number(val) || 0));
    setTable(prev => ({ ...prev, [key]: { ...prev[key], [unitIdx]: n } }));
  }

  function lockUnit(unitIdx) {
    const total = colTotal(unitIdx);
    if (total !== 10) return alert(`Unit ${unitIdx} hours must sum to exactly 10 (currently ${total}).`);

    const hourMap = {};
    for (const k of ALL_KEYS) {
      if (table[k][unitIdx] > 0) hourMap[k] = table[k][unitIdx];
    }
    const matrices = buildMatricesFromMap(hourMap, 10);

    const result = {
      unit_meta:     { unit_id: unitIdx, co_level: "K3", dept: "MANUAL" },
      lesson_plan:   [],
      unit_matrices: matrices,
      validation:    `Manual entry. Hours = ${total}/10.`
    };

    onLockUnit(unitIdx - 1, result);
    setLockedUnits(prev => new Set([...prev, unitIdx]));
  }

  const allLocked = UNIT_COLS.every(u => lockedUnits.has(u));

  return (
    <div>
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Manual Hour Entry</div>
            <div className="panel-sub">Enter mapped hours per PO/PSO per unit (each column must total 10)</div>
          </div>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="manual-table-wrap">
            <table className="manual-table">
              <thead>
                <tr>
                  <th style={{ width: 200 }}>Outcome</th>
                  {UNIT_COLS.map(u => (
                    <th key={u}>
                      Unit {u}
                      {lockedUnits.has(u) && <span style={{ color: "var(--accent-teal)" }}> ✓</span>}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {/* POs section */}
                <tr>
                  <td colSpan={6} style={{
                    background: "var(--bg-2)", color: "var(--accent-teal)",
                    fontFamily: "var(--font-mono)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.06em", padding: "8px 12px"
                  }}>
                    PROGRAM OUTCOMES (PO1–PO12)
                  </td>
                </tr>
                {PO_KEYS.map(k => (
                  <tr key={k}>
                    <td style={{ textAlign: "left", color: "var(--text-2)", fontSize: 12 }}>
                      {PRETTY[k]}
                    </td>
                    {UNIT_COLS.map(u => (
                      <td key={u}>
                        <input
                          type="number" min="0" max="10" step="1"
                          className="manual-input"
                          value={table[k][u] || ""}
                          disabled={lockedUnits.has(u)}
                          onChange={e => setCell(k, u, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* PSOs section */}
                <tr>
                  <td colSpan={6} style={{
                    background: "var(--bg-2)", color: "var(--accent-purple)",
                    fontFamily: "var(--font-mono)", fontSize: 11,
                    fontWeight: 600, letterSpacing: "0.06em", padding: "8px 12px"
                  }}>
                    PROGRAM SPECIFIC OUTCOMES (PSO1–PSO3)
                  </td>
                </tr>
                {PSO_KEYS.map(k => (
                  <tr key={k}>
                    <td style={{ textAlign: "left", color: "var(--text-2)", fontSize: 12 }}>
                      {PRETTY[k]}
                    </td>
                    {UNIT_COLS.map(u => (
                      <td key={u}>
                        <input
                          type="number" min="0" max="10" step="1"
                          className="manual-input"
                          value={table[k][u] || ""}
                          disabled={lockedUnits.has(u)}
                          onChange={e => setCell(k, u, e.target.value)}
                          placeholder="0"
                        />
                      </td>
                    ))}
                  </tr>
                ))}

                {/* Totals row */}
                <tr className="hours-total-row">
                  <td style={{ textAlign: "left", fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--text-2)" }}>
                    Total Hours
                  </td>
                  {UNIT_COLS.map(u => {
                    const total = colTotal(u);
                    const ok    = total === 10;
                    return (
                      <td key={u} style={{ color: ok ? "var(--s3)" : total === 0 ? "var(--text-3)" : "var(--s1)" }}>
                        {total}/10
                      </td>
                    );
                  })}
                </tr>

                {/* Lock buttons row */}
                <tr>
                  <td style={{ fontSize: 12, color: "var(--text-2)" }}>Lock Unit</td>
                  {UNIT_COLS.map(u => (
                    <td key={u}>
                      {lockedUnits.has(u) ? (
                        <span style={{ color: "var(--accent-teal)", fontSize: 14 }}>✓</span>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ padding: "5px 12px", fontSize: 12 }}
                          onClick={() => lockUnit(u)}
                          disabled={colTotal(u) !== 10}
                        >
                          Lock
                        </button>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {allLocked && (
        <div className="validation-ok">
          ✓ All 5 units locked. Switch to the Aggregation tab to generate the final matrix.
        </div>
      )}
    </div>
  );
}
