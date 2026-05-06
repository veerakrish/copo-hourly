require("dotenv").config();

const express     = require("express");
const cors        = require("cors");

const processUnit = require("./routes/processUnit");
const validate    = require("./routes/validate");
const aggregate   = require("./routes/aggregate");

const app  = express();
const PORT = process.env.PORT || 3001;

/* ── Middleware ────────────────────────────────── */
app.use(cors({
  origin: process.env.CLIENT_ORIGIN || "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "x-session-id"]
}));
app.use(express.json({ limit: "2mb" }));

/* ── Health check ──────────────────────────────── */
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    mistralConfigured: !!process.env.MISTRAL_API_KEY
  });
});

/* ── Routes ────────────────────────────────────── */
app.use("/api/process-unit", processUnit);
app.use("/api/validate",     validate);
app.use("/api/aggregate",    aggregate);

/* ── 404 catch-all ─────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found.` });
});

/* ── Global error handler ──────────────────────── */
app.use((err, req, res, _next) => {
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal server error." });
});

app.listen(PORT, () => {
  console.log(`✅  Accreditation server running on port ${PORT}`);
  if (!process.env.MISTRAL_API_KEY) {
    console.warn("⚠️  MISTRAL_API_KEY not set — AI mode will fail.");
  }
});
