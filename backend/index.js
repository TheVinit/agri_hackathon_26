const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins and JSON parsing
app.use(cors());
app.use(express.json());

// In-memory data store for sensors
// We pre-populate farm_001 with some initial data so the dashboard works 
// even before the NodeMCU sends the first ping.
const sensorStore = {
  "farm_001": {
    1: { node_id: 1, moisture: 68, temperature: 24.5, humidity: 45, ec: 1.2, battery: 92 },
    2: { node_id: 2, moisture: 18, temperature: 31.7, humidity: 45, ec: 2.8, battery: 12 }
  }
};

// 1. POST /api/sensor-data
// Receives data from NodeMCU ESP8266
app.post('/api/sensor-data', (req, res) => {
  const { farmId, nodeId, moisture, temperature, ec, battery } = req.body;

  if (!farmId || nodeId === undefined) {
    return res.status(400).json({ error: 'farmId and nodeId are required' });
  }

  // Initialize farm if it doesn't exist
  if (!sensorStore[farmId]) {
    sensorStore[farmId] = {};
  }

  // Store the latest reading mapped to the required frontend schema
  sensorStore[farmId][nodeId] = {
    node_id: nodeId,
    moisture: moisture || 0,
    temperature: temperature || 0,
    humidity: 45, // Hardcoded default as NodeMCU has no humidity sensor
    ec: ec || 0,
    battery: battery || 0
  };

  console.log(`[Sensor Data] Updated node ${nodeId} for farm ${farmId}`);
  
  res.status(200).json({ success: true });
});

// 2. GET /api/sensors/:farm_id
// Returns exactly the structure expected by the frontend Advisory Engine
app.get('/api/sensors/:farm_id', (req, res) => {
  const farm_id = req.params.farm_id;
  const nodesRecord = sensorStore[farm_id] || {};
  
  const responseData = {
    farm_id: farm_id,
    recorded_at: new Date().toISOString(),
    nodes: Object.values(nodesRecord),
    npk_soil_actual: {
      N: 42,
      P: 18,
      K: 65,
      pH: 6.8
    }
  };

  res.status(200).json(responseData);
});

// 3. GET /api/health
// Health check endpoint for Render
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Catch-All for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Start the server (Binding to 0.0.0.0 is crucial for Render)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ IoT Sensor Backend running on port ${PORT}`);
});

module.exports = app;
