export default function DeptSelector({ onSelect }) {
  const depts = [
    {
      id: "CSE",
      icon: "💻",
      name: "CSE",
      full: "Computer Science & Engineering",
      focus: "Software Engineering · Data Structures · Systems",
      tag: "PO1–PO12 + PSO1–PSO3"
    },
    {
      id: "AIML",
      icon: "🧠",
      name: "AIML",
      full: "Artificial Intelligence & Machine Learning",
      focus: "Machine Learning · Data Intelligence · Automation",
      tag: "PO1–PO12 + PSO1–PSO3"
    },
    {
      id: "CIC",
      icon: "🔒",
      name: "CIC",
      full: "Cybersecurity, IoT & Cloud",
      focus: "Cybersecurity · IoT Systems · Infrastructure",
      tag: "PO1–PO12 + PSO1–PSO3"
    }
  ];

  return (
    <div className="dept-selector">
      <div className="dept-hero">
        <h1>Accreditation <em>Architect</em></h1>
        <p>NBA / NAAC CO-PO Mapping · Bloom's Taxonomy · 3-Matrix Calculator</p>
      </div>

      <div className="dept-cards">
        {depts.map(d => (
          <div
            key={d.id}
            className="dept-card"
            onClick={() => onSelect(d.id)}
            role="button"
            tabIndex={0}
            onKeyDown={e => e.key === "Enter" && onSelect(d.id)}
          >
            <span className="dept-card-icon">{d.icon}</span>
            <h2>{d.name}</h2>
            <p style={{ fontWeight: 500, color: "var(--text-1)", marginBottom: 4 }}>{d.full}</p>
            <p>{d.focus}</p>
            <span className="dept-card-tag">{d.tag}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 13, color: "var(--text-3)", textAlign: "center" }}>
        Select your department to begin generating lesson plans and CO-PO matrices
      </p>
    </div>
  );
}
