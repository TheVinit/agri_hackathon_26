# 🌾 AgriPulse API Integration Guide (Supabase & Edge)

The AgriPulse backend has been migrated from Render/Express to a cloud-native **Supabase** architecture. This document outlines how the frontend and hardware connect to the new infrastructure.

## 1. Production Credentials
All keys have been abstracted into environment variables. Ensure your `.env` contains:
```env
EXPO_PUBLIC_SUPABASE_URL=https://aekmiuxibmfjiakhkkrc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<YOUR_SUPABASE_KEY>
```

---

## 2. Dashboard Data (Frontend)
The app no longer uses a custom API server. It fetches data directly from Supabase via **PostgREST** or the **Supabase JavaScript Client**.

**Example Implementation (src/services/api.js):**
```javascript
const { data: rawNodes } = await supabase
  .from('sensor_data')
  .select('*')
  .eq('farm_id', farmId)
  .order('created_at', { ascending: false })
  .limit(4);
```

---

## 3. IoT Sensor Ingestion (Hardware)
Hardware (NodeMCU) now pings a **Supabase Edge Function** to ensure immediate processing and database persistence.

**Endpoint:** `POST https://aekmiuxibmfjiakhkkrc.supabase.co/functions/v1/sensor-data`

**Request Body:**
```json
{
  "farmId": "farm_001",
  "nodeId": 1,
  "moisture": 68.4,
  "temperature": 24.6,
  "ec": 1.85,
  "battery": 87
}
```

---

## 4. Text-to-Speech (Sarvam AI)
Regional language reports are generated using the Sarvam AI Edge integration.
**Key:** `EXPO_PUBLIC_SARVAM_API_KEY`

---

## 🚀 Migration Status
- [x] Deprecated Render Base URL (`https://agri-hackathon-26.onrender.com`)
- [x] Switched to direct Supabase PostgREST for Dashboards
- [x] Hardware now pings `/functions/v1/sensor-data`