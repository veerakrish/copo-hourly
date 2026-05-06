export default function MatrixTable({ matrices }) {
  if (!matrices) return null;
  const { m1_raw, m2_percent, m3_strength } = matrices;
  const keys = Object.keys(m3_strength || {}).sort();
  if (!keys.length) return null;

  function strengthClass(s) {
    return ["s0","s1","s2","s3"][s] || "s0";
  }

  return (
    <div className="matrices-grid">
      {/* M1 Raw */}
      <div className="matrix-card">
        <div className="matrix-card-head">
          <span className="matrix-label">M1</span>
          <span className="matrix-name">Raw Distribution</span>
        </div>
        <div className="matrix-body">
          {keys.map(k => (
            <div className="matrix-row" key={k}>
              <span className="matrix-key">{k.toUpperCase()}</span>
              <span className="matrix-val">{m1_raw[k] || "0/10"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* M2 Percent */}
      <div className="matrix-card">
        <div className="matrix-card-head">
          <span className="matrix-label">M2</span>
          <span className="matrix-name">Coverage %</span>
        </div>
        <div className="matrix-body">
          {keys.map(k => {
            const pct = m2_percent[k] || 0;
            return (
              <div className="matrix-row" key={k}>
                <span className="matrix-key">{k.toUpperCase()}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{
                    width: 60, height: 4, background: "var(--bg-3)", borderRadius: 2, overflow: "hidden"
                  }}>
                    <div style={{
                      width: `${pct}%`, height: "100%", borderRadius: 2,
                      background: pct >= 70 ? "var(--s3)" : pct >= 50 ? "var(--s2)" : "var(--s1)"
                    }} />
                  </div>
                  <span className="matrix-val">{pct}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* M3 Strength */}
      <div className="matrix-card">
        <div className="matrix-card-head">
          <span className="matrix-label">M3</span>
          <span className="matrix-name">Articulation</span>
        </div>
        <div className="matrix-body">
          {keys.map(k => {
            const s = m3_strength[k] ?? 0;
            return (
              <div className="matrix-row" key={k}>
                <span className="matrix-key">{k.toUpperCase()}</span>
                <span className={`strength-chip ${strengthClass(s)}`}>{s}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
