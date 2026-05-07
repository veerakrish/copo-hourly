/**
 * AggregationView
 * Layout: COs as rows, POs/PSOs as columns.
 * Cells are empty (not 0) when not mapped.
 * Last row = average of each column across all COs.
 */

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

  // Collect all PO/PSO columns that appear in any unit
  const colSet = new Set();
  for (const u of processed) {
    for (const k of Object.keys(u.result.unit_matrices?.m3_strength || {})) {
      colSet.add(k.toUpperCase());
    }
  }

  // Sort columns: PO1..PO12 first, then PSO1..PSO3
  const sortOutcome = k => {
    if (k.startsWith("PO"))  return parseInt(k.slice(2)) || 99;
    if (k.startsWith("PSO")) return 100 + parseInt(k.slice(3));
    return 200;
  };
  const cols = [...colSet].sort((a,b) => sortOutcome(a) - sortOutcome(b));

  // Build rows — one per CO (unit)
  const rows = processed.map((u, i) => {
    const meta = u.result.unit_meta;
    const m3   = u.result.unit_matrices?.m3_strength || {};
    const coId = `CO${meta.unit_id || i+1}`;
    const stmt = meta.co_statement ? ` — ${meta.co_statement}` : "";
    return { label: coId, stmt, m3 };
  });

  // Average per column (only over rows where a value exists / is > 0)
  const avgRow = {};
  for (const col of cols) {
    const key = col.toLowerCase();
    const vals = rows.map(r => r.m3[key]).filter(v => v !== undefined && v > 0);
    avgRow[col] = vals.length > 0
      ? (vals.reduce((s,v)=>s+v,0) / vals.length).toFixed(2)
      : "";
  }

  function strengthStyle(v) {
    if (v === "" || v === undefined || v === 0) return {};
    const n = typeof v === "string" ? parseFloat(v) : v;
    if (n >= 2.5) return { color:"var(--s3)", fontWeight:700 };
    if (n >= 1.5) return { color:"var(--s2)", fontWeight:600 };
    return { color:"var(--s1)", fontWeight:500 };
  }

  function strengthBg(v) {
    if (!v || v === 0) return "transparent";
    const n = typeof v === "string" ? parseFloat(v) : v;
    if (n >= 2.5) return "rgba(34,197,94,0.08)";
    if (n >= 1.5) return "rgba(245,158,11,0.08)";
    return "rgba(239,68,68,0.08)";
  }

  function exportCSV() {
    const header = ["CO", ...cols];
    const dataRows = rows.map(r => [
      r.label,
      ...cols.map(col => {
        const v = r.m3[col.toLowerCase()];
        return (v !== undefined && v > 0) ? v : "";
      })
    ]);
    const avgLine = ["Average", ...cols.map(col => avgRow[col])];
    const all = [header, ...dataRows, avgLine];
    const csv = all.map(r => r.join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], {type:"text/csv"}));
    a.download = "SRKR_COPO_Matrix.csv";
    a.click();
  }

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
              Strength: &nbsp;
              <span style={{color:"var(--s3)",fontWeight:600}}>3</span> (≥70%) &nbsp;·&nbsp;
              <span style={{color:"var(--s2)",fontWeight:600}}>2</span> (50–69%) &nbsp;·&nbsp;
              <span style={{color:"var(--s1)",fontWeight:600}}>1</span> (&lt;50%) &nbsp;·&nbsp;
              <span style={{color:"var(--text-3)"}}>— not mapped</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={exportCSV}>↓ Export CSV</button>
        </div>

        <div className="panel-body" style={{ padding:0, overflowX:"auto" }}>
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13, minWidth: 480 }}>
            <thead>
              <tr>
                <th style={{
                  padding:"10px 16px", textAlign:"left",
                  fontSize:11, fontWeight:600, color:"var(--text-2)",
                  textTransform:"uppercase", letterSpacing:"0.05em",
                  borderBottom:"2px solid var(--border-med)",
                  background:"var(--bg-2)", position:"sticky", left:0, zIndex:2
                }}>
                  Course Outcome
                </th>
                {cols.map(col => (
                  <th key={col} style={{
                    padding:"10px 12px", textAlign:"center",
                    fontSize:11, fontWeight:700, color:"var(--accent-teal)",
                    fontFamily:"var(--font-mono)",
                    textTransform:"uppercase", letterSpacing:"0.04em",
                    borderBottom:"2px solid var(--border-med)",
                    background:"var(--bg-2)", whiteSpace:"nowrap"
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} style={{ borderBottom:"1px solid var(--border)" }}>
                  <td style={{
                    padding:"11px 16px",
                    background:"var(--bg-card)",
                    position:"sticky", left:0, zIndex:1,
                    borderRight:"1px solid var(--border)"
                  }}>
                    <span style={{ fontFamily:"var(--font-mono)", fontWeight:700, color:"var(--accent-teal)", marginRight:8 }}>
                      {row.label}
                    </span>
                    {row.stmt && (
                      <span style={{ fontSize:12, color:"var(--text-2)" }}>{row.stmt}</span>
                    )}
                  </td>
                  {cols.map(col => {
                    const v = row.m3[col.toLowerCase()];
                    const show = v !== undefined && v > 0;
                    return (
                      <td key={col} style={{
                        padding:"10px 12px", textAlign:"center",
                        fontFamily:"var(--font-mono)", fontWeight: show ? 700 : 400,
                        fontSize:14,
                        background: show ? strengthBg(v) : "transparent",
                        ...strengthStyle(v)
                      }}>
                        {show ? v : <span style={{ color:"var(--bg-3)" }}>—</span>}
                      </td>
                    );
                  })}
                </tr>
              ))}

              {/* Average row */}
              <tr style={{ borderTop:"2px solid var(--border-med)", background:"var(--bg-2)" }}>
                <td style={{
                  padding:"11px 16px",
                  fontWeight:700, fontSize:12,
                  color:"var(--accent-gold)",
                  fontFamily:"var(--font-mono)",
                  textTransform:"uppercase",
                  letterSpacing:"0.05em",
                  background:"var(--bg-2)",
                  position:"sticky", left:0, zIndex:1,
                  borderRight:"1px solid var(--border)"
                }}>
                  Average
                </td>
                {cols.map(col => {
                  const v = avgRow[col];
                  const show = v !== "" && v !== undefined;
                  return (
                    <td key={col} style={{
                      padding:"10px 12px", textAlign:"center",
                      fontFamily:"var(--font-mono)", fontWeight:700,
                      fontSize:13,
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

      {/* Legend */}
      <div style={{ marginTop:16, fontSize:12, color:"var(--text-3)", textAlign:"center" }}>
        Values represent M3 Articulation Strength · Empty cells indicate outcome not mapped for that CO
      </div>
    </div>
  );
}
