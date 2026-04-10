# 📡 Hardware Integration Guide — AgriPulse
## For the NodeMCU / Hardware Team

---

### Backend URL
```
https://divine-wind-cf72.crazything344.workers.dev/
```

---

### 1. Send Sensor Data (POST every 15 seconds)

**Endpoint:**
```
POST /api/sensor-data
Content-Type: application/json
```

**Payload:**
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

- `nodeId` → integer: 1, 2, 3, or 4 (matching farm zones)
- `moisture` → % (0–100)
- `temperature` → °C
- `ec` → mS/cm (electrical conductivity)
- `battery` → % (0–100)

**Success Response:**
```json
{
  "success": true,
  "message": "Data received",
  "receivedAt": "2026-04-10T10:30:00Z",
  "nodeId": 1
}
```

---

### 2. CORS Headers (already set on backend)
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, OPTIONS
Access-Control-Allow-Headers: Content-Type
```
No auth needed.

---

### 3. Arduino / NodeMCU Sample Code
```cpp
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ArduinoJson.h>

const char* ssid      = "YOUR_WIFI_SSID";
const char* password  = "YOUR_WIFI_PASSWORD";
const char* serverURL = "https://divine-wind-cf72.crazything344.workers.dev/api/sensor-data";

const int NODE_ID = 1; // Change per node: 1, 2, 3, or 4

void sendSensorData(float moisture, float temperature, float ec, float battery) {
  if (WiFi.status() != WL_CONNECTED) return;

  WiFiClientSecure client;
  client.setInsecure();
  HTTPClient http;
  http.begin(client, serverURL);
  http.addHeader("Content-Type", "application/json");

  StaticJsonDocument<256> doc;
  doc["farmId"]      = "farm_001";
  doc["nodeId"]      = NODE_ID;
  doc["moisture"]    = moisture;
  doc["temperature"] = temperature;
  doc["ec"]          = ec;
  doc["battery"]     = battery;

  String payload;
  serializeJson(doc, payload);

  int httpCode = http.POST(payload);
  if (httpCode == 200) {
    Serial.println("[OK] Data sent: " + payload);
  } else {
    Serial.println("[ERR] HTTP " + String(httpCode));
  }
  http.end();
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi connected!");
}

void loop() {
  float moisture    = analogRead(A0) / 10.24; // 0-100%
  float temperature = 24.6;   // DHT reading
  float ec          = 1.85;   // EC sensor
  float battery     = 87.0;   // Battery %

  sendSensorData(moisture, temperature, ec, battery);
  delay(15000); // Every 15 seconds
}
```

---

### 4. Zone to Node ID Mapping
| Node ID | Farm Direction |
|---------|----------------|
| 1       | North (उत्तर)   |
| 2       | South (दक्षिण)  |
| 3       | East  (पूर्व)   |
| 4       | West  (पश्चिम)  |

---

### 5. Test with cURL
```bash
curl -X POST https://divine-wind-cf72.crazything344.workers.dev/api/sensor-data \
  -H "Content-Type: application/json" \
  -d '{"farmId":"farm_001","nodeId":1,"moisture":68.4,"temperature":24.6,"ec":1.85,"battery":87}'
```

### 6. Health Check
```
GET /health
```
Returns `"dataSource": "hardware"` once a node has posted. Dummy data is used as fallback automatically.

> Note: In-memory storage resets on server restart. For production, use a database.
