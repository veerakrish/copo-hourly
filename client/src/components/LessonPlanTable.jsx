import { BLOOMS } from "../utils/bloomsValidator";

export default function LessonPlanTable({ lessonPlan }) {
  if (!lessonPlan?.length) return null;

  const totalHours = lessonPlan.reduce((s, t) => s + (t.hours || 0), 0);

  return (
    <div className="lesson-table-wrap">
      <table className="lesson-table">
        <thead>
          <tr>
            <th style={{ width: "40%" }}>Topic</th>
            <th>Bloom's</th>
            <th>Hours</th>
            <th>PO / PSO Mapping</th>
          </tr>
        </thead>
        <tbody>
          {lessonPlan.map((topic, i) => (
            <tr key={i}>
              <td>{topic.topic}</td>
              <td>
                <span className={`bloom-badge ${BLOOMS[topic.bloom_level]?.color || ""}`}>
                  {topic.bloom_level} — {BLOOMS[topic.bloom_level]?.name}
                </span>
              </td>
              <td style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 600 }}>
                {topic.hours}
              </td>
              <td>
                {(topic.mappings || []).map(m => (
                  <span key={m} className="mapping-tag">{m}</span>
                ))}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={2} />
            <td style={{ textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-teal)" }}>
              {totalHours}/10
            </td>
            <td />
          </tr>
        </tbody>
      </table>
    </div>
  );
}
