/* ─────────────────────────────────────────────────
   Program Outcomes (PO1–PO12) — common to all depts
   ───────────────────────────────────────────────── */
const PROGRAM_OUTCOMES = {
  PO1:  "Engineering Knowledge: Apply mathematics, science, and engineering fundamentals.",
  PO2:  "Problem Analysis: Identify and formulate complex engineering problems.",
  PO3:  "Design/Development of Solutions: Design solutions meeting specified needs.",
  PO4:  "Conduct Investigations: Use research-based knowledge to investigate problems.",
  PO5:  "Modern Tool Usage: Apply appropriate techniques and modern engineering tools.",
  PO6:  "Engineer and Society: Apply reasoning for societal and safety implications.",
  PO7:  "Environment and Sustainability: Understand the impact of engineering solutions.",
  PO8:  "Ethics: Apply ethical principles and professional responsibilities.",
  PO9:  "Individual and Team Work: Function effectively in individual or team settings.",
  PO10: "Communication: Communicate effectively on complex engineering activities.",
  PO11: "Project Management: Apply management principles to engineering projects.",
  PO12: "Life-long Learning: Engage in independent and life-long learning."
};

/* ─────────────────────────────────────────────────
   Program Specific Outcomes per department
   ───────────────────────────────────────────────── */
const DEPT_PSO = {
  CSE: {
    PSO1: "Apply software engineering principles to design and develop scalable, reliable software systems.",
    PSO2: "Implement efficient data structures and algorithms to solve complex computational problems.",
    PSO3: "Develop system-level solutions and applications using modern frameworks and development tools."
  },
  AIML: {
    PSO1: "Apply machine learning algorithms and deep learning frameworks to solve real-world intelligent systems problems.",
    PSO2: "Build data intelligence solutions using advanced analytics, statistical modeling, and visualization.",
    PSO3: "Design and deploy automated systems and AI pipelines for intelligent decision making."
  },
  CIC: {
    PSO1: "Implement cybersecurity protocols and techniques to design secure network infrastructures.",
    PSO2: "Design IoT-based embedded systems and smart solutions for connected environments.",
    PSO3: "Manage, optimize, and scale digital infrastructure including cloud, edge, and enterprise systems."
  }
};

/* Bloom's K-Level mapping */
const BLOOMS_LEVELS = {
  K1: { name: "Remember",    verbs: ["List", "Recall", "Define", "Identify", "State", "Name", "Recognize", "Memorize"] },
  K2: { name: "Understand",  verbs: ["Explain", "Describe", "Summarize", "Classify", "Discuss", "Interpret", "Paraphrase", "Illustrate"] },
  K3: { name: "Apply",       verbs: ["Apply", "Solve", "Demonstrate", "Calculate", "Use", "Implement", "Execute", "Show"] },
  K4: { name: "Analyze",     verbs: ["Analyze", "Differentiate", "Compare", "Examine", "Break down", "Distinguish", "Investigate", "Categorize"] }
};

const BLOOMS_ORDER = ["K1", "K2", "K3", "K4"];

function klevelIndex(k) {
  return BLOOMS_ORDER.indexOf(k);
}

module.exports = { PROGRAM_OUTCOMES, DEPT_PSO, BLOOMS_LEVELS, BLOOMS_ORDER, klevelIndex };
