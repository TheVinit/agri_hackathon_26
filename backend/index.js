// ============================================================
//  AgriPulse Backend – Express.js API Server
//  Section 2 Backend | Agri Hackathon 2026
// ============================================================

const express = require('express');
const cors    = require('cors');

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Global Middleware ────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ─── Explicit CORS headers (for NodeMCU / hardware) ──────────
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin',  '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ─── IN-MEMORY SENSOR STORE ───────────────────────────────────
// Keyed by nodeId (number). Updated in real-time via POST /api/sensor-data.
// Falls back to dummy data if hardware hasn't connected yet.

const DUMMY_NODES = [
  { nodeId: 1, moisture: 68,   temperature: 24.5, ec: 1.2,  battery: 92, status: 'online', lastSeen: new Date().toISOString() },
  { nodeId: 2, moisture: 72,   temperature: 25.0, ec: 1.1,  battery: 85, status: 'online', lastSeen: new Date().toISOString() },
  { nodeId: 3, moisture: 55,   temperature: 27.3, ec: 1.5,  battery: 48, status: 'online', lastSeen: new Date().toISOString() },
  { nodeId: 4, moisture: 18,   temperature: 31.7, ec: 2.8,  battery: 12, status: 'online', lastSeen: new Date().toISOString() },
];

// Live sensor data store (starts empty — filled by hardware POSTs)
const liveNodes = {}; // { [nodeId]: { nodeId, moisture, temperature, ec, battery, lastSeen, status } }

/**
 * Returns merged node list: live data takes priority over dummy data.
 * If hardware is offline, dummy data is returned seamlessly.
 */
function getMergedNodes() {
  return DUMMY_NODES.map(dummy => {
    const live = liveNodes[dummy.nodeId];
    if (live) {
      // Check staleness — if last seen > 60 seconds, mark offline
      const secondsAgo = (Date.now() - new Date(live.lastSeen).getTime()) / 1000;
      return { ...live, status: secondsAgo > 60 ? 'offline' : 'online' };
    }
    return dummy; // fallback to dummy
  });
}

function deriveStatus(nodes) {
  const alerts = [];
  nodes.forEach(n => {
    if (n.moisture < 20) {
      alerts.push({
        nodeId: `node_${n.nodeId}`,
        severity: 'CRITICAL',
        message: `क्षेत्र ${n.nodeId} में नमी बहुत कम है (${n.moisture}%)। तुरंत सिंचाई करें!`,
        timestamp: new Date().toISOString(),
      });
    } else if (n.moisture < 35) {
      alerts.push({
        nodeId: `node_${n.nodeId}`,
        severity: 'WARNING',
        message: `क्षेत्र ${n.nodeId} में नमी कम हो रही है (${n.moisture}%)। जल्द सिंचाई करें।`,
        timestamp: new Date().toISOString(),
      });
    }
    if (n.battery < 15) {
      alerts.push({
        nodeId: `node_${n.nodeId}`,
        severity: 'WARNING',
        message: `क्षेत्र ${n.nodeId} का बैटरी लो है (${n.battery}%)।`,
        timestamp: new Date().toISOString(),
      });
    }
  });
  return alerts;
}

function nodeStatus(n) {
  if (n.moisture < 20 || n.battery < 15) return 'red';
  if (n.moisture < 40 || n.ec > 2.0)     return 'amber';
  return 'green';
}

// ─── Hardcoded advisory & NPK data (farm_001) ─────────────────
const advisoryData = {
  farmId: 'farm_001',
  date: new Date().toISOString().split('T')[0],
  irrigation: {
    decision: 'irrigate_now',
    durationMinutes: 45,
    urgency: 'HIGH',
    textHindi: 'खेत का नमी स्तर बहुत कम है। अभी 45 मिनट के लिए सिंचाई करें। पश्चिम क्षेत्र में पानी की सख्त जरूरत है। ड्रिप सिंचाई या फव्वारे से सिंचाई करें।',
    audioUrl: '',
  },
  nutrients: {
    status: 'low',
    textHindi: 'मिट्टी में नाइट्रोजन और फास्फोरस का स्तर कम है। अगले 3 दिन में DAP खाद 50 किलो प्रति हेक्टेयर और यूरिया 25 किलो प्रति हेक्टेयर का छिड़काव करें।',
    audioUrl: '',
  },
  nextCrop: {
    crop: 'Soybean',
    textHindi: 'गेहूं की कटाई के बाद सोयाबीन लगाना सबसे उचित रहेगा। मिट्टी का pH 6.8 सोयाबीन के लिए आदर्श है। बुवाई से पहले 2 टन प्रति हेक्टेयर जैव खाद मिलाएं।',
    audioUrl: '',
  },
};

const lastNPK = { N: 42, P: 18, K: 65, pH: 6.8 };

// ─── ENDPOINT 1: Receive Sensor Data (Hardware → Backend) ────
// POST /api/sensor-data
// NodeMCU posts: { farmId, nodeId, moisture, temperature, ec, battery }
app.post('/api/sensor-data', (req, res) => {
  const { farmId, nodeId, moisture, temperature, ec, battery } = req.body;

  if (!nodeId || moisture === undefined) {
    return res.status(400).json({ success: false, error: 'nodeId and moisture are required' });
  }

  const entry = {
    nodeId:      Number(nodeId),
    moisture:    Number(moisture),
    temperature: Number(temperature) || 0,
    ec:          Number(ec) || 0,
    battery:     Number(battery) || 100,
    lastSeen:    new Date().toISOString(),
    status:      'online',
  };

  liveNodes[nodeId] = entry;

  console.log(`📡 [Sensor Data] Node ${nodeId} → moisture:${moisture}% temp:${temperature}°C ec:${ec} battery:${battery}%`);

  return res.status(200).json({
    success: true,
    message: 'Data received',
    receivedAt: entry.lastSeen,
    nodeId,
  });
});

// ─── ENDPOINT 2: Farm Dashboard (App polls this) ──────────────
// GET /api/farms/:farmId/dashboard
app.get('/api/farms/:farmId/dashboard', (req, res) => {
  const nodes = getMergedNodes();

  const responseNodes = nodes.map(n => ({
    id:          `node_${n.nodeId}`,
    label:       `Node ${n.nodeId}`,
    nodeId:      n.nodeId,
    moisture:    n.moisture,
    temperature: n.temperature,
    ec:          n.ec,
    battery:     n.battery,
    status:      nodeStatus(n),
    lastSeen:    n.lastSeen,
  }));

  return res.status(200).json({
    farmId:      'farm_001',
    farmerName:  'रामराव शिंदे',
    farmName:    'रामराव शिंदे की खेत',
    currentCrop: 'wheat',
    nodes:       responseNodes,
    lastNPK,
    alerts:      deriveStatus(nodes),
    updatedAt:   new Date().toISOString(),
    dataSource:  Object.keys(liveNodes).length > 0 ? 'hardware' : 'demo',
  });
});

// ─── ENDPOINT 3: Advisory ─────────────────────────────────────
// GET /api/advisory/:farmId/today
app.get('/api/advisory/:farmId/today', (req, res) => {
  // Dynamically update advisory based on live sensor data
  const nodes = getMergedNodes();
  const lowMoistureNode = nodes.find(n => n.moisture < 30);
  const response = { ...advisoryData };

  if (lowMoistureNode) {
    response.irrigation.decision = 'irrigate_now';
    response.irrigation.textHindi = `क्षेत्र ${lowMoistureNode.nodeId} में नमी बहुत कम है (${lowMoistureNode.moisture}%)। अभी 45 मिनट के लिए सिंचाई करें।`;
  } else {
    response.irrigation.decision = 'no_irrigation';
    response.irrigation.textHindi = 'खेत में नमी का स्तर ठीक है। अभी सिंचाई की जरूरत नहीं है। 2 दिन बाद दोबारा जाँचें।';
  }

  res.status(200).json(response);
});

// ─── ENDPOINT 4: Submit NPK Reading ──────────────────────────
// POST /api/farms/:farmId/npk-readings
app.post('/api/farms/:farmId/npk-readings', (req, res) => {
  const { nitrogen, phosphorus, potassium, pH } = req.body;

  const required = ['nitrogen', 'phosphorus', 'potassium', 'pH'];
  const missing = required.filter(f => req.body[f] === undefined);
  if (missing.length > 0) {
    return res.status(400).json({ success: false, error: `Missing: ${missing.join(', ')}` });
  }

  // Update in-memory NPK values
  lastNPK.N  = Number(nitrogen);
  lastNPK.P  = Number(phosphorus);
  lastNPK.K  = Number(potassium);
  lastNPK.pH = Number(pH);

  console.log('🧪 [NPK Reading]', lastNPK);

  return res.status(201).json({
    success: true,
    readingId: `npk_${Date.now()}`,
    receivedAt: new Date().toISOString(),
    data: lastNPK,
  });
});

// ─── HEALTH CHECK ─────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.status(200).json({
    status:       'ok',
    uptime:       process.uptime(),
    timestamp:    new Date().toISOString(),
    service:      'AgriPulse Backend API',
    version:      '2.0.0',
    liveNodes:    Object.keys(liveNodes).length,
    dataSource:   Object.keys(liveNodes).length > 0 ? 'hardware' : 'demo',
  });
});

// ─── 404 Catch-All ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found', path: req.originalUrl, method: req.method });
});

// ─── START SERVER ─────────────────────────────────────────────
app.listen(PORT, '0.0.0.0', () => {
  console.log('╔══════════════════════════════════════════════════╗');
  console.log('║       🌾  AgriPulse Backend API v2.0  🌾        ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log(`║  ✅  Running on port : ${PORT}                     ║`);
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  Hardware Endpoint (NodeMCU):                    ║');
  console.log('║  POST /api/sensor-data                           ║');
  console.log('╠══════════════════════════════════════════════════╣');
  console.log('║  App Endpoints:                                  ║');
  console.log('║  GET  /api/farms/:farmId/dashboard               ║');
  console.log('║  GET  /api/advisory/:farmId/today                ║');
  console.log('║  POST /api/farms/:farmId/npk-readings            ║');
  console.log('║  GET  /health                                    ║');
  console.log('╚══════════════════════════════════════════════════╝');
});

module.exports = app;
