/* ─────────────────────────────────────────────────
   Program Outcomes (PO1–PO12) — common to all depts
   ───────────────────────────────────────────────── */
const PROGRAM_OUTCOMES = {
  PO1:  "Engineering Knowledge: Apply the knowledge of mathematics, science, engineering fundamentals, and an engineering specialization to the solution of complex engineering problems.",
  PO2:  "Problem Analysis: Identify, formulate, review research literature, and analyze complex engineering problems reaching substantiated conclusions using first principles of mathematics, natural sciences, and engineering sciences.",
  PO3:  "Design/Development of Solutions: Design solutions for complex engineering problems and design system components or processes that meet the specified needs with appropriate consideration for the public health and safety, and the cultural, societal, and environmental considerations.",
  PO4:  "Conduct Investigations: Use research-based knowledge and research methods including design of experiments, analysis and interpretation of data, and synthesis of the information to provide valid conclusions.",
  PO5:  "Modern Tool Usage: Create, select, and apply appropriate techniques, resources, and modern engineering and IT tools including prediction and modeling to complex engineering activities with an understanding of the limitations.",
  PO6:  "Engineer and Society: Apply reasoning informed by the contextual knowledge to assess societal, health, safety, legal and cultural issues and the consequent responsibilities relevant to the professional engineering practice.",
  PO7:  "Environment and Sustainability: Understand the impact of the professional engineering solutions in societal and environmental contexts, and demonstrate the knowledge of, and need for sustainable development.",
  PO8:  "Ethics: Apply ethical principles and commit to professional ethics and responsibilities and norms of the engineering practice.",
  PO9:  "Individual and Team Work: Function effectively as an individual, and as a member or leader in diverse teams, and in multidisciplinary settings.",
  PO10: "Communication: Communicate effectively on complex engineering activities with the engineering community and with society at large, such as, being able to comprehend and write effective reports and design documentation, make effective presentations, and give and receive clear instructions.",
  PO11: "Project Management: Demonstrate knowledge and understanding of the engineering and management principles and apply these to one's own work, as a member and leader in a team, to manage projects and in multidisciplinary environments.",
  PO12: "Life-long Learning: Recognize the need for, and have the preparation and ability to engage in independent and lifelong learning in the broadest context of technological change."
};

/* ─────────────────────────────────────────────────
   Program Specific Outcomes per department
   ───────────────────────────────────────────────── */
const DEPT_PSO = {
  CSE: {
    PSO1: "Ability to apply in depth problem solving and programming skills.",
    PSO2: "Ability to do collaborative development of software solutions for Trans-disciplinary engineering problems.",
    PSO3: "Ability to design an integrate hardware and software components for the advancement of technology."
  },
  AIML: {
    PSO1: "Ability to apply in-depth problem-solving and programming skills.",
    PSO2: "Ability to design, develop, and deploy AI and ML models to solve real-world problems."
  },
  CIC: {
    PSO1: "Ability to apply various tools related to IoT applications, Cyber Security solutions including Blockchain Technology.",
    PSO2: "Ability to design and develop various applications using IoT and Cyber Security to provide solutions to real world problems."
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
