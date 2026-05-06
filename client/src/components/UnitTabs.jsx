export default function UnitTabs({ units, activeUnit, onSelect }) {
  return (
    <div className="unit-tabs">
      {units.map((unit, idx) => {
        const locked   = idx > 0 && !units[idx - 1].processed;
        const done     = unit.processed;
        const active   = idx === activeUnit;

        let cls = "unit-tab";
        if (active)  cls += " active";
        if (done)    cls += " done";
        if (locked)  cls += " locked";

        let dotCls = "tab-dot";
        if (done)   dotCls += " done";
        if (active) dotCls += " active";

        return (
          <button
            key={idx}
            className={cls}
            onClick={() => !locked && onSelect(idx)}
            disabled={locked}
            title={locked ? "Complete previous unit first" : `Unit ${idx + 1}`}
          >
            <span className={dotCls} />
            Unit {idx + 1}
            {done && <span style={{ fontSize: 12 }}>✓</span>}
            {locked && <span style={{ fontSize: 11, opacity: 0.6 }}>🔒</span>}
          </button>
        );
      })}
    </div>
  );
}
