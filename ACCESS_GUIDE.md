# 🔑 AgriPulse Access Credentials

To access the platform for the hackathon demo, use the following credentials.

## 👨‍🌾 Farmer App Access (Mobile)
The login screen is now active. Use these dummy credentials for the demo:

| Field | Value |
| :--- | :--- |
| **Farmer ID** | `farm_001` |
| **Password** | `agri123` |

> [!TIP]
> The login screen supports **Hindi**, **English**, and **Marathi**. You can toggle the language at the top of the login card.

---

## 🛠 Admin & Data Management
The "Admin" interface is provided via the **Supabase Dashboard**. This is where you can see the hardware sensor data, NPK readings, and farmer details in real-time.

### How to Access the Backend:
1.  **URL**: [https://supabase.com/dashboard](https://supabase.com/dashboard)
2.  **Project**: `aekmiuxibmfjiakhkkrc` (AgriPulse - Hackathon)
3.  **Key Tables**:
    *   `soil_data`: Real-time moisture/temp from NodeMCU.
    *   `npk_readings`: Soil test results submitted from the app.
    *   `farming_advisory`: The AI-generated advice displayed in the app.

---

## 🔐 Hidden Developer / Admin Mode
There is a hidden debug/admin mode built into the app for developers:
1.  **How to Activate**: On the bottom navigation bar, **Long Press** the "Home" icon **3 times** quickly.
2.  **Admin Password**: `agri2026`
3.  **Function**: This allows you to toggle data sources, reset mock data, and view technical logs.

---

## 🚀 Environment Configuration
Ensure your `.env` or Vercel Environment Variables are set:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://aekmiuxibmfjiakhkkrc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
EXPO_PUBLIC_SARVAM_API_KEY=YOUR_SARVAM_KEY
```
