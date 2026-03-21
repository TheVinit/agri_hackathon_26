# AgriPulse - Farming Assistant App 🚜🌾

AgriPulse is a premium React Native Expo application designed to assist Indian farmers with real-time soil analysis, sensor monitoring, and intelligent voice-based agricultural advisory.

---

## ✨ Features (Premium Edition)

*   **Farmer-Centric Dashboard**: Personalized welcome (नमस्कार) and status-coded farm insights.
*   **Real-time Sensor Monitoring**: 4-node grid tracking Moisture, EC, and Temperature.
*   **Soil NPK Analysis**: Automated soil health check with immediate OK/LOW nutrition alerts.
*   **Intelligent Advisory**: Bi-lingual (Hindi/English) irrigation, nutrient, and crop recommendations.
*   **Integrated Farm Map**: Google Satellite View tracking sensor health across your geofenced area.
*   **Multi-Platform Ready**: Optimized for Android, iOS, and Web browsers.

---

## 🛠️ Quick Setup for Developers

Follow these steps to get the project running locally on your machine.

### 1. Prerequisites
Ensure you have **Node.js** and **npm** installed.

### 2. Install Dependencies
Run the following in the root directory to install the core Expo engine and premium UI libraries:
```bash
npm install
```

### 3. Start the Development Server
Use the standard Expo command to launch the Metro Bundler:
```bash
npx expo start
```

### 4. Running the App
*   **On Android/iOS**: Scan the QR code displayed in the terminal using the **Expo Go** app.
*   **On Web**: Press `w` in the terminal or run `npx expo start --web`.
*   **Clear Cache**: If you encounter any bundling issues, run `npx expo start -c`.

---

## 📂 Project Structure

*   `App.js` & `index.js`: Main entry points.
*   `src/screens`: Contains Dashboard, NPK Test, Advisory, and Map screens.
*   `src/components`: Custom reusable UI components (NodeCard, NPKBar).
*   `src/mockData.js`: Simulates real-time sensor streams and advisory logic.
*   `babel.config.js`: Customized for Expo 52 compilation.

---

## 🚀 Deployment Instructions (Git)

The current work is pushed to the specialized branch: **`app-foundation_vinit`**.
To contribute:
```bash
git pull origin app-foundation_vinit
```

---

*Developed for the Agri Hackathon 2026*
**AgriPulse - Empowering Farmers with Data.**
