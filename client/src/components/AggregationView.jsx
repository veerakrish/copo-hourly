/**
 * AggregationView
 * Rows    = CO1, CO2 … (label only, no statement)
 * Columns = ALL PO1–PO12 + dept PSOs (always shown, empty if not mapped)
 * Last row = column averages (only over mapped COs for that column)
 */

// All standard columns — always rendered
const ALL_PO_COLS  = ["PO1","PO2","PO3","PO4","PO5","PO6","PO7","PO8","PO9","PO10","PO11","PO12"];
// PSO count per dept
const DEPT_PSO_COUNT = { CSE: 3, AIML: 2, CIC: 2 };

function getPsoCols(dept) {
  const count = DEPT_PSO_COUNT[dept] || 3;
  return Array.from({ length: count }, (_, i) => `PSO${i + 1}`);
}

function strengthStyle(v) {
  if (!v || v === 0) return {};
  const n = parseFloat(v);
  if (n >= 2.5) return { color: "var(--s3)", fontWeight: 700 };
  if (n >= 1.5) return { color: "var(--s2)", fontWeight: 600 };
  return { color: "var(--s1)", fontWeight: 500 };
}
function strengthBg(v) {
  if (!v || v === 0) return "transparent";
  const n = parseFloat(v);
  if (n >= 2.5) return "rgba(34,197,94,0.08)";
  if (n >= 1.5) return "rgba(245,158,11,0.08)";
  return "rgba(239,68,68,0.08)";
}

export default function AggregationView({ units, unitCount }) {
  const processed = units.filter(u => u.processed && u.result);

  if (processed.length < unitCount) {
    return (
      <div className="empty-state">
        <h3>Final Matrix Not Ready</h3>
        <p>{processed.length}/{unitCount} units completed. Finish all entries to generate the final CO-PO matrix.</p>
      </div>
    );
  }

  // Detect dept from first processed unit (fallback CSE)
  const dept = processed[0]?.result?.unit_meta?.dept || "CSE";
  const psoCols = getPsoCols(dept);
  const allCols = [...ALL_PO_COLS, ...psoCols];

  // Build rows — one per CO
  const rows = processed.map((u, i) => {
    const meta  = u.result.unit_meta;
    const m3    = u.result.unit_matrices?.m3_strength || {};
    const coId  = `CO${meta.unit_id || i + 1}`;
    return { label: coId, m3 };
  });

  // Average per column — only over COs that have a non-zero value for that column
  const avgRow = {};
  for (const col of allCols) {
    const key  = col.toLowerCase();
    const vals = rows.map(r => r.m3[key]).filter(v => v !== undefined && v > 0);
    avgRow[col] = vals.length > 0
      ? (vals.reduce((s, v) => s + v, 0) / vals.length).toFixed(2)
      : "";
  }

  function exportCSV() {
    const header   = ["CO", ...allCols];
    const dataRows = rows.map(r => [
      r.label,
      ...allCols.map(col => {
        const v = r.m3[col.toLowerCase()];
        return (v !== undefined && v > 0) ? v : "";
      })
    ]);
    const avgLine  = ["Average", ...allCols.map(col => avgRow[col])];
    const csv      = [header, ...dataRows, avgLine].map(r => r.join(",")).join("\n");
    const a        = document.createElement("a");
    a.href         = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download     = "SRKR_COPO_Matrix.csv";
    a.click();
  }

  const thBase = {
    padding: "10px 10px",
    fontSize: 11, fontWeight: 700,
    fontFamily: "var(--font-mono)",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: "2px solid var(--border-med)",
    background: "var(--bg-2)",
    whiteSpace: "nowrap",
    textAlign: "center"
  };

  return (
    <div>
      <div className="agg-header">
        <h2>CO-PO / PSO Articulation Matrix</h2>
        <p>SRKR Engineering College · CSE Department · NBA/NAAC Format</p>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Final Articulation Matrix</div>
            <div className="panel-sub">
              Strength:&nbsp;
              <span style={{ color:"var(--s3)", fontWeight:600 }}>3</span> (≥70%)&nbsp;·&nbsp;
              <span style={{ color:"var(--s2)", fontWeight:600 }}>2</span> (50–69%)&nbsp;·&nbsp;
              <span style={{ color:"var(--s1)", fontWeight:600 }}>1</span> (&lt;50%)&nbsp;·&nbsp;
              <span style={{ color:"var(--text-3)" }}>— not mapped</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>↓ Export CSV</button>
        </div>

        <div className="panel-body" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              {/* Group header: POs | PSOs */}
              <tr>
                <th style={{ ...thBase, textAlign:"left", position:"sticky", left:0, zIndex:3, borderRight:"1px solid var(--border-med)" }} rowSpan={2}>
                  CO
                </th>
                <th style={{ ...thBase, color:"var(--accent-teal)", borderLeft:"1px solid var(--border-med)" }} colSpan={12}>
                  Program Outcomes
                </th>
                <th style={{ ...thBase, color:"var(--accent-purple)", borderLeft:"1px solid var(--border-med)" }} colSpan={psoCols.length}>
                  PSOs
                </th>
              </tr>
              {/* Individual column headers */}
              <tr>
                {ALL_PO_COLS.map((col, i) => (
                  <th key={col} style={{
                    ...thBase,
                    color: "var(--accent-teal)",
                    borderLeft: i === 0 ? "1px solid var(--border-med)" : undefined
                  }}>
                    {col}
                  </th>
                ))}
                {psoCols.map((col, i) => (
                  <th key={col} style={{
                    ...thBase,
                    color: "var(--accent-purple)",
                    borderLeft: i === 0 ? "1px solid var(--border-med)" : undefined
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} style={{ borderBottom: "1px solid var(--border)" }}>
                  {/* CO label */}
                  <td style={{
                    padding: "10px 16px",
                    fontFamily: "var(--font-mono)", fontWeight: 700,
                    color: "var(--accent-teal)",
                    background: "var(--bg-card)",
                    position: "sticky", left: 0, zIndex: 1,
                    borderRight: "1px solid var(--border)"
                  }}>
                    {row.label}
                  </td>
                  {/* PO cells */}
                  {ALL_PO_COLS.map((col, i) => {
                    const v    = row.m3[col.toLowerCase()];
                    const show = v !== undefined && v > 0;
                    return (
                      <td key={col} style={{
                        padding: "10px 8px", textAlign: "center",
                        fontFamily: "var(--font-mono)", fontSize: 14,
                        borderLeft: i === 0 ? "1px solid var(--border-med)" : undefined,
                        background: show ? strengthBg(v) : "transparent",
                        ...strengthStyle(show ? v : null)
                      }}>
                        {show ? v : <span style={{ color:"var(--bg-3)", fontSize:12 }}>—</span>}
                      </td>
                    );
                  })}
                  {/* PSO cells */}
                  {psoCols.map((col, i) => {
                    const v    = row.m3[col.toLowerCase()];
                    const show = v !== undefined && v > 0;
                    return (
                      <td key={col} style={{
                        padding: "10px 8px", textAlign: "center",
                        fontFamily: "var(--font-mono)", fontSize: 14,
                        borderLeft: i === 0 ? "1px solid var(--border-med)" : undefined,
                        background: show ? strengthBg(v) : "transparent",
                        ...strengthStyle(show ? v : null)
                      }}>
                        {show ? v : <span style={{ color:"var(--bg-3)", fontSize:12 }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Average row */}
              <tr style={{ borderTop: "2px solid var(--border-med)", background: "var(--bg-2)" }}>
                <td style={{
                  padding: "11px 16px",
                  fontFamily: "var(--font-mono)", fontWeight: 700,
                  fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em",
                  color: "var(--accent-gold)",
                  background: "var(--bg-2)",
                  position: "sticky", left: 0, zIndex: 1,
                  borderRight: "1px solid var(--border)"
                }}>
                  Average
                </td>
                {ALL_PO_COLS.map((col, i) => {
                  const v    = avgRow[col];
                  const show = v !== "";
                  return (
                    <td key={col} style={{
                      padding: "10px 8px", textAlign: "center",
                      fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                      borderLeft: i === 0 ? "1px solid var(--border-med)" : undefined,
                      color: show ? "var(--accent-gold)" : "transparent",
                      background: show ? "rgba(244,165,53,0.08)" : "transparent"
                    }}>
                      {show ? v : "—"}
                    </td>
                  );
                })}
                {psoCols.map((col, i) => {
                  const v    = avgRow[col];
                  const show = v !== "";
                  return (
                    <td key={col} style={{
                      padding: "10px 8px", textAlign: "center",
                      fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 13,
                      borderLeft: i === 0 ? "1px solid var(--border-med)" : undefined,
                      color: show ? "var(--accent-gold)" : "transparent",
                      background: show ? "rgba(244,165,53,0.08)" : "transparent"
                    }}>
                      {show ? v : "—"}
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 12, fontSize: 12, color: "var(--text-3)", textAlign: "center" }}>
        Empty cells indicate the CO does not map to that outcome · Average computed only over mapped COs per column
      </div>
    </div>
  );
}
