how to use this
# 1. Unzip and enter folder
unzip accreditation-architect.zip && cd accreditation-architect

# 2. Create server/.env from example
cp .env.example server/.env
# → edit server/.env and add: MISTRAL_API_KEY=your_key_here

# 3. Install both
cd server && npm install
cd ../client && npm install

# 4. Run in two terminals
# Terminal 1:
cd server && npm run dev

# Terminal 2:
cd client && npm run dev
# → opens at http://localhost:5173
copo-hourly/
├── server/
│   ├── index.js                  ← Express app entry, CORS, routes
│   ├── middleware/cooldown.js    ← 7s per-session rate gate
│   ├── routes/
│   │   ├── processUnit.js        ← POST /api/process-unit → Mistral
│   │   ├── validate.js           ← POST /api/validate → Agent B logic
│   │   ├── aggregate.js          ← POST /api/aggregate → final avg
│   │   └── agentAPrompt.js       ← Dept-aware Mistral prompt builder
│   └── utils/psoData.js          ← All PO/PSO definitions per dept
│
├── client/src/
│   ├── App.jsx                   ← Root: dept select, AI/manual mode switch
│   ├── components/
│   │   ├── DeptSelector          ← Landing card picker (CSE/AIML/CIC)
│   │   ├── UnitTabs              ← Sequential unlock tabs
│   │   ├── UnitInputPanel        ← AI mode: syllabus form + Mistral result
│   │   ├── ManualPanel           ← Manual table with real-time M3 math
│   │   ├── MatrixTable           ← M1/M2/M3 display with strength chips
│   │   ├── LessonPlanTable       ← Bloom's-tagged lesson plan rows
│   │   └── AggregationView       ← Final 50-hr matrix + CSV export
│   ├── hooks/useUnitProcessor.js ← Sequential API calls + cooldown UI
│   └── utils/
│       ├── matrixCalc.js         ← Pure M1/M2/M3 math functions
│       └── bloomsValidator.js    ← K-level check utilities
│
├── render.yaml                   ← One-click Render Blueprint deploy
└── .env.example
