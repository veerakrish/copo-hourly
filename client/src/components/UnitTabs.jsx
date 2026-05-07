export default function UnitTabs({ units, activeUnit, onSelect, label = "Unit" }) {
  return (
    <div className="unit-tabs">
      {units.map((unit, idx) => {
        const locked = idx > 0 && !units[idx - 1].processed;
        const done   = unit.processed;
        const active = idx === activeUnit;
        let cls    = "unit-tab" + (active?" active":"") + (done?" done":"") + (locked?" locked":"");
        let dotCls = "tab-dot"  + (done?" done":"") + (active?" active":"");
        return (
          <button key={idx} className={cls}
            onClick={() => !locked && onSelect(idx)}
            disabled={locked}
            title={locked ? "Complete previous entry first" : `${label} ${idx+1}`}>
            <span className={dotCls} />
            {label} {idx + 1}
            {done   && <span style={{ fontSize:12 }}>✓</span>}
            {locked && <span style={{ fontSize:11, opacity:0.6 }}>🔒</span>}
          </button>
        );
      })}
    </div>
  );
}
