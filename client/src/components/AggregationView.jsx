import { aggregateMatrices } from "../utils/matrixCalc";

function strengthClass(s) {
  return ["s0","s1","s2","s3"][s] || "s0";
}

export default function AggregationView({ units }) {
  const processedUnits = units.filter(u => u.processed && u.result);

  if (processedUnits.length < 5) {
    return (
      <div className="empty-state">
        <h3>Final Matrix Not Ready</h3>
        <p>Complete all 5 units to generate the final course-level CO-PO articulation matrix.</p>
        <p style={{ marginTop: 8, color: "var(--text-3)" }}>
          {processedUnits.length}/5 units processed
        </p>
      </div>
    );
  }

  const { finalArticulation, finalM3Rounded, allKeys } = aggregateMatrices(
    processedUnits.map(u => u.result)
  );

  const unitMetas = processedUnits.map(u => u.result?.unit_meta);

  return (
    <div>
      <div className="agg-header">
        <h2>Final CO-PO Articulation Matrix</h2>
        <p>Course-level aggregation across 5 units · 50 total hours</p>
      </div>

      {/* ── Per-unit M3 grid ─────────────────── */}
      <div className="panel" style={{ marginBottom: 24 }}>
        <div className="panel-head">
          <div>
            <div className="panel-title">Unit-wise M3 Strength Values</div>
            <div className="panel-sub">Individual unit articulation before averaging</div>
          </div>
        </div>
        <div className="panel-body" style={{ padding: 0 }}>
          <div className="agg-table-wrap">
            <table className="agg-table">
              <thead>
                <tr>
                  <th>Outcome</th>
                  {processedUnits.map((u, i) => (
                    <th key={i}>
                      Unit {u.result?.unit_meta?.unit_id || i + 1}
                      <span style={{ display: "block", fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--text-3)", fontWeight: 400 }}>
                        {u.result?.unit_meta?.co_level}
                      </span>
                    </th>
                  ))}
                  <th style={{ color: "var(--accent-teal)" }}>Average</th>
                  <th>Rounded</th>
                </tr>
              </thead>
              <tbody>
                {allKeys.map(key => {
                  const vals = processedUnits.map(u =>
                    u.result?.unit_matrices?.m3_strength?.[key] ?? 0
                  );
                  const avg  = finalArticulation[key];
                  const rnd  = finalM3Rounded[key];
                  return (
                    <tr key={key}>
                      <td>{key.toUpperCase()}</td>
                      {vals.map((v, i) => (
                        <td key={i}>
                          <span className={`strength-chip ${strengthClass(v)}`}>{v}</span>
                        </td>
                      ))}
                      <td className="avg-col" style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                        {avg.toFixed(2)}
                      </td>
                      <td>
                        <span className={`strength-chip ${strengthClass(rnd)}`}>{rnd}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Final articulation matrix ─────────── */}
      <div className="panel">
        <div className="panel-head">
          <div>
            <div className="panel-title">Final Articulation Matrix (Rounded)</div>
            <div className="panel-sub">≥70% → 3 &nbsp;|&nbsp; 50–69% → 2 &nbsp;|&nbsp; &lt;50% → 1 &nbsp;|&nbsp; Not mapped → 0</div>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => {
              const rows = [["Outcome", ...processedUnits.map((_,i) => `Unit ${i+1}`), "Average", "Strength"]];
              for (const key of allKeys) {
                const vals = processedUnits.map(u => u.result?.unit_matrices?.m3_strength?.[key] ?? 0);
                rows.push([key.toUpperCase(), ...vals, finalArticulation[key].toFixed(2), finalM3Rounded[key]]);
              }
              const csv = rows.map(r => r.join(",")).join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const a = document.createElement("a");
              a.href = URL.createObjectURL(blob);
              a.download = "co_po_matrix.csv";
              a.click();
            }}
          >
            ↓ Export CSV
          </button>
        </div>
        <div className="panel-body">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {allKeys.map(key => {
              const rnd = finalM3Rounded[key];
              return (
                <div key={key} style={{
                  background: "var(--bg-2)", border: "1px solid var(--border)",
                  borderRadius: "var(--radius-md)", padding: "12px 16px",
                  minWidth: 100, textAlign: "center"
                }}>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--text-2)", marginBottom: 8 }}>
                    {key.toUpperCase()}
                  </div>
                  <span className={`strength-chip ${strengthClass(rnd)}`} style={{ width: 40, height: 40, fontSize: 18, borderRadius: 10 }}>
                    {rnd}
                  </span>
                  <div style={{ fontSize: 11, color: "var(--text-3)", marginTop: 6 }}>
                    avg {finalArticulation[key].toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ marginTop: 24, padding: "12px 16px", background: "var(--bg-2)", borderRadius: "var(--radius-md)", fontSize: 13, color: "var(--text-2)" }}>
            <strong style={{ color: "var(--text-1)" }}>Legend: </strong>
            <span className="strength-chip s3" style={{ marginRight: 8, verticalAlign: "middle" }}>3</span> Strong (≥70%) &nbsp;·&nbsp;
            <span className="strength-chip s2" style={{ marginRight: 8, verticalAlign: "middle" }}>2</span> Moderate (50–69%) &nbsp;·&nbsp;
            <span className="strength-chip s1" style={{ marginRight: 8, verticalAlign: "middle" }}>1</span> Low (&lt;50%) &nbsp;·&nbsp;
            <span className="strength-chip s0" style={{ marginRight: 8, verticalAlign: "middle" }}>0</span> Not mapped
          </div>
        </div>
      </div>
    </div>
  );
}
