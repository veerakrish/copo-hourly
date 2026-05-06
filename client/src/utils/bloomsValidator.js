/** bloomsValidator.js — client-side Bloom's checks */

export const BLOOMS = {
  K1: { name: "Remember",   color: "bloom-k1", verbs: ["List","Recall","Define","Identify","State","Name","Recognize"] },
  K2: { name: "Understand", color: "bloom-k2", verbs: ["Explain","Describe","Summarize","Classify","Discuss","Interpret"] },
  K3: { name: "Apply",      color: "bloom-k3", verbs: ["Apply","Solve","Demonstrate","Calculate","Use","Implement","Execute"] },
  K4: { name: "Analyze",    color: "bloom-k4", verbs: ["Analyze","Differentiate","Compare","Examine","Distinguish","Investigate"] }
};

export const BLOOMS_ORDER = ["K1","K2","K3","K4"];

export function bloomIndex(level) {
  return BLOOMS_ORDER.indexOf(level);
}

export function levelExceedsCO(topicLevel, coLevel) {
  return bloomIndex(topicLevel) > bloomIndex(coLevel);
}

export const PO_LABELS = {
  po1:  "PO1 – Engineering Knowledge",
  po2:  "PO2 – Problem Analysis",
  po3:  "PO3 – Design/Development",
  po4:  "PO4 – Investigations",
  po5:  "PO5 – Modern Tools",
  po6:  "PO6 – Engineer & Society",
  po7:  "PO7 – Sustainability",
  po8:  "PO8 – Ethics",
  po9:  "PO9 – Team Work",
  po10: "PO10 – Communication",
  po11: "PO11 – Project Mgmt",
  po12: "PO12 – Life-long Learning",
  pso1: "PSO1",
  pso2: "PSO2",
  pso3: "PSO3"
};

export function prettyKey(key) {
  return PO_LABELS[key.toLowerCase()] || key.toUpperCase();
}
