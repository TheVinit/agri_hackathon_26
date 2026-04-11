# AgriPulse - Technical Documentation

## 1. Project Overview
**AgriPulse** is a "Voice-First, Farmer-First" Smart Agriculture application. It connects live farm sensors (moisture, temperature, EC) to a React Native mobile application, providing low-literacy farmers with actionable, data-driven crop advisory in their native languages (Hindi, Marathi, English) via a highly intuitive, voice-enabled interface.

## 2. Core Architecture
The platform is built using a modern, scalable tech stack aimed at high reliability and seamless hardware integration:

- **Frontend:** React Native (Expo) - Ensures cross-platform deployment (iOS/Android/Web) with native-like performance.
- **Backend & Database:** Supabase (PostgreSQL) - Handles farmer identity, farm telemetry data storage, and provides real-time updates via WebSockets.
- **Voice Intelligence:** Sarvam AI API / Web Speech API - Provides realistic, multilingual Text-to-Speech (TTS) capabilities for farm reports.
- **Live Weather Integration:** Open-Meteo API - Provides real-time weather stats based on location coordinates without polling rate limits.
- **State Management & Navigation:** React Navigation (`AppNavigator.js`) with custom Context APIs (`LanguageContext.js`) for deep localization.

## 3. Key Technological Innovations

### A. Smart Advisory Engine (`api.js`)
Instead of displaying raw sensor data, the Smart Advisory Engine computes real-time alerts. If soil moisture on Node 4 drops below 20%, the system automatically flags a "Critical Event," bumps the alert severity, and updates the overarching Farm Health Score.

### B. Voice-First UX Integration (`tts.js` & `Dashboard.js`)
The application flips the traditional dashboard hierarchy. Instead of presenting charts first, it prominently features a "Mic Orb." Tapping the orb synthesizes the current farm status (fetching the latest database values) into a dynamic report spoken aloud in the selected regional language.

### C. Resilient "Air-Gap" Fallbacks
The system is built to survive network latency or misconfigured backend keys:
- **Demo Mode Initialization:** If `Supabase` environment variables are missing or fail to connect, the `api.js` client safely degrades into "Demo Mode," supplying mocked but interactive data to ensure the UI (and hackathon presentations) never crash.
- **Hidden Admin Portal:** A dedicated Admin diagnostics screen is accessible via a 5-tap gesture sequence on the logo (Login/Dashboard) or via the header dropdown menu to protect internal configurations while remaining accessible for debugging.

## 4. Key UI/UX Principles
- **Data De-Prioritization:** Complex metrics (Raw EC, NPK values) are pushed below the fold. Primary real estate is reserved for Quick Actions and Voice output.
- **High Contrast & Accessible Typography:** Using `theme.js`, the color palette strictly maps `Safe (Green)`, `Warning (Orange)`, and `Danger (Red)` across the entire UI for immediate visual communication independent of reading ability.

## 5. Development Setup & Deployment

### Prerequisites
- Node.js (v18+)
- Expo CLI
- A deployed Supabase Project
- A Sarvam AI API Key (for native TTS integrations)

### Installation
```bash
# Install dependencies
npm install

# Start the Expo development server
npx expo start -c
```

### Environment Variables (`.env`)
To enable full production functionality, the following must be provided:
```env
EXPO_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
EXPO_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_KEY"
EXPO_PUBLIC_SARVAM_API_KEY="YOUR_SARVAM_KEY"
```

## 6. Future Roadmap
1. Native Mobile Bluetooth BLE integration for direct edge-node fetching without cellular data.
2. Direct integration with Drone-level multispectral imagery for advanced NPK heatmaps.
3. Expanded LLM integration to allow conversational Q&A beyond standard farm reports.
