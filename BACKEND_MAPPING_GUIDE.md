# AgriPulse Dual-Backend Integration Guide

This is a top-notch mapping guide for the backend teams. **AgriPulse uses a dual-architecture backend** to separate user management from high-frequency IoT sensor telemetry.

---

## Part 1: IoT Node & Soil Data Backend (REST / WebSocket)
This backend is responsible for receiving hardware sensor data (ESP32/LoRa) and providing it to the React Native app. 

### Expected Frontend JSON Structure
When the app fetches node data from your IoT backend, your API must return the data strictly mapped to the following JSON array structure so the **Smart Advisory Engine** can process it properly:

```json
{
  "farm_id": "farm_001",
  "recorded_at": "2026-04-10T14:30:00Z",
  "nodes": [
    { 
      "node_id": 1, 
      "moisture": 68,     // % (0-100)
      "temperature": 24.5,// Celsius
      "humidity": 45,     // % (0-100)
      "ec": 1.2,          // Electrical Conductivity 
      "battery": 92       // % (0-100) Node Hardware Battery
    },
    { 
      "node_id": 2, 
      "moisture": 18, 
      "temperature": 31.7, 
      "humidity": 30, 
      "ec": 2.8, 
      "battery": 12 
    }
  ],
  "npk_soil_actual": { 
    "N": 42, 
    "P": 18, 
    "K": 65, 
    "pH": 6.8 
  }
}
```
**CRITICAL:** If the `moisture`, `temperature`, or `ec` keys are missing or spelled differently, the AgriPulse advisory engine will not be able to generate the Hindi/Marathi voice alerts!

---

## Part 2: Supabase (Auth & Farmer Portal)
Supabase is strictly used for Farmer Authentication, Login, and generic Farm metadata.

### Table: `farms`
Stores the metadata for a specific agricultural plot.
- `id` (text, Primary Key): e.g., 'farm_001' (Must match `farm_id` in IoT payload)
- `farmer_name` (text)
- `farm_name` (text): e.g., "Rao's Farm"
- `current_crop` (text): e.g., "Soybean"

### Table: `farmers`
Maps the farmer to a farm for login capability.
- `id` (uuid or text, Primary Key)
- `farm_id` (Foreign Key -> farms.id)
- `phone` (text) - **Used for Farmer Portal mapping**
- `village` (text)
- `status` (text): `'active', 'inactive'`

### Integration Checklist for the Team:
1. **IoT Backend:** Expose an endpoint (e.g., `GET /api/sensors/:farm_id`) returning the exact JSON shape shown in Part 1.
2. **Supabase Backend:** Ensure the `farms` table is populated with `farm_001` so the login screen's default quick-access works perfectly for the judges.
3. Once the IoT endpoint is live, we will update `api.js` in the frontend to stop using `DEMO_NODES` and start `fetch(YOUR_IOT_URL)`.
