// ============================================================
//  AgriPulse Backend – Express.js API Server
//  Section 2 Backend | Agri Hackathon 2026
// ============================================================

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────
app.use(cors());           // Allow all origins (CORS open)
app.use(express.json());   // Parse incoming JSON bodies

// ─── HARDCODED DATA ───────────────────────────────────────────

const farmDashboardData = {
  farmId: "farm_001",
  farmerName: "रामराव शिंदे",
  farmName: "रामराव शिंदे की खेत",
  currentCrop: "wheat",
  nodes: [
    {
      id: "node_1",
      label: "Node 1 – North Field",
      moisture: 68,
      ec: 1.2,
      temperature: 24.5,
      battery: 92,
      status: "green"
    },
    {
      id: "node_2",
      label: "Node 2 – South Field",
      moisture: 72,
      ec: 1.1,
      temperature: 25.0,
      battery: 85,
      status: "green"
    },
    {
      id: "node_3",
      label: "Node 3 – East Field",
      moisture: 55,
      ec: 1.5,
      temperature: 27.3,
      battery: 48,
      status: "amber"
    },
    {
      id: "node_4",
      label: "Node 4 – West Field",
      moisture: 18,
      ec: 2.8,
      temperature: 31.7,
      battery: 12,
      status: "red"
    }
  ],
  lastNPK: {
    N: 42,
    P: 18,
    K: 65,
    pH: 6.8
  },
  alerts: [
    {
      nodeId: "node_4",
      severity: "CRITICAL",
      message: "Node 4 – Critical: Very low moisture (18%) and low battery (12%). Immediate attention required!",
      timestamp: new Date().toISOString()
    }
  ]
};

const advisoryData = {
  farmId: "farm_001",
  date: new Date().toISOString().split('T')[0],
  irrigation: {
    decision: "irrigate_now",
    durationMinutes: 45,
    urgency: "HIGH",
    textHindi: "खेत का नमी स्तर बहुत कम है। अभी 45 मिनट के लिए सिंचाई करें। Node 4 में पानी की सख्त जरूरत है।",
    audioUrl: ""
  },
  nutrients: {
    status: "LOW",
    textHindi: "मिट्टी में नाइट्रोजन (N=42) और फास्फोरस (P=18) का स्तर कम है। अगले 3 दिन में DAP और यूरिया का छिड़काव करें।",
    audioUrl: ""
  },
  nextCrop: {
    crop: "Soybean",
    textHindi: "गेहूं की कटाई के बाद सोयाबीन लगाना सबसे उचित रहेगा। मिट्टी का pH 6.8 सोयाबीन के लिए आदर्श है।",
    audioUrl: ""
  }
};

// ─── ENDPOINT 1: Farm Dashboard ───────────────────────────────
// GET /api/farms/farm_001/dashboard
app.get('/api/farms/farm_001/dashboard', (req, res) => {
  res.status(200).json(farmDashboardData);
});

// ─── ENDPOINT 2: Advisory for Today ──────────────────────────
// GET /api/advisory/farm_001/today
app.get('/api/advisory/farm_001/today', (req, res) => {
  res.status(200).json(advisoryData);
});

// ─── ENDPOINT 3: Submit NPK Reading ──────────────────────────
// POST /api/farms/farm_001/npk-readings
app.post('/api/farms/farm_001/npk-readings', (req, res) => {
  const body = req.body;

  // ── Validation ────────────────────────────────────────────
  const requiredFields = ['nitrogen', 'phosphorus', 'potassium', 'pH'];
  const missingFields  = requiredFields.filter(field => body[field] === undefined || body[field] === null);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Missing required fields: ${missingFields.join(', ')}`,
      requiredFields
    });
  }

  // Type checks – all must be numbers
  const invalidFields = requiredFields.filter(field => typeof body[field] !== 'number');
  if (invalidFields.length > 0) {
    return res.status(400).json({
      success: false,
      error: `Fields must be numeric values: ${invalidFields.join(', ')}`
    });
  }

  // ── Log incoming reading to console ──────────────────────
  console.log('\n📡 [NPK Reading Received]', JSON.stringify(body, null, 2));

  // ── Success response ──────────────────────────────────────
  return res.status(201).json({
    success: true,
    readingId: `npk_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    data: body
  });
});

// ─── HEALTH CHECK ─────────────────────────────────────────────
// GET /health
app.get('/health', (req, res) => {
  res.status(200).json({
    status: "ok",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: "AgriPulse Backend API",
    version: "1.0.0"
  });
});

// ─── 404 Catch-All ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: "Route not found",
    path: req.originalUrl,
    method: req.method
  });
});

// ─── START SERVER ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║        🌾  AgriPulse Backend API  🌾         ║');
  console.log('╠══════════════════════════════════════════════╣');
  console.log(`║  ✅  Server running on port : ${PORT}           ║`);
  console.log(`║  🌐  Base URL : http://127.0.0.1:${PORT}        ║`);
  console.log('╠══════════════════════════════════════════════╣');
  console.log('║  Available Endpoints:                        ║');
  console.log(`║  GET  /health                                ║`);
  console.log(`║  GET  /api/farms/farm_001/dashboard          ║`);
  console.log(`║  GET  /api/advisory/farm_001/today           ║`);
  console.log(`║  POST /api/farms/farm_001/npk-readings       ║`);
  console.log('╚══════════════════════════════════════════════╝');
});


module.exports = app;
