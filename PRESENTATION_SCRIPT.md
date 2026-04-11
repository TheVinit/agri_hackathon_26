# AgriPulse: Winning Hackathon Presentation Script 🏆

## Pitch Hook (Start here - 30 seconds)
"Meet Ramesh. He is a farmer with 5 acres of land, but he struggles with technology. He can't read complex charts or understand raw EC/NPK numbers. Today, he usually waits for a government official to visit his farm. But with **AgriPulse**, Ramesh doesn't need to read. He just needs to **talk**."

## The Demo Flow (Step-by-Step)

### 1. The Welcome (Login/Onboarding)
- **Show the Screen:** "We start with a professional, multilingual onboarding. No complex passwords—just easy Google Auth."
- **Action:** Tap 'Get My Location'.
- **Talking Point:** "We use native high-accuracy GPS to pin the farm's exact location, ensuring the weather and soil data are hyper-local."

### 2. Voice-First Dashboard (The 'WOW' Moment)
- **Show the Dashboard:** "Look at this interface. It's clean, high-contrast, and prioritizes the **'Mic Orb'**."
- **Action:** Tap the big Microphone button.
- **Talking Point:** "Ramesh doesn't search for info. He just asks. Listen as the AI synthesizes real-time sensor data into a simple report in his native language."
- **Voice Response:** *(Let the AI speak the report)*

### 3. Voice-Controlled Navigation (The Technical Edge)
- **Action:** Tap the 'Ask by Voice' button and say: **"नक्शा दिखाओ" (Show Map)**.
- **Talking Point:** "Our platform supports full voice-controlled navigation. For a farmer with muddy hands or low literacy, this is a game-changer. We've bridged the Web Speech API with native Expo modules for high reliability even on low-end phones."

### 4. Hardware Connectivity (Virtual Nodes)
- **Show the Map/Sensor Grid:** "This isn't just a UI. It shows 4 active edge-nodes. If a node goes offline, it switches to a 'Virtual Node' mode using historical data and predictive AI to keep the farmer informed."

### 5. AI Farm Assistant
- **Show AIAssistant Screen:** "Finally, our AgriPulse AI isn't just a chatbot. It Pro-actively analyzes the farm data the moment you open it. It detects water stress before the farmer even sees the wilting leaves."

## The "Closer" (The Impact)
"AgriPulse turns raw data into a human conversation. We are bridgeing the gap between 'Smart Agriculture' and the 'Real Farmer'. Thank you."

---

## Technical Highlights for Judges (If they ask):
- **Stack:** React Native (Expo), Supabase, Sarvam AI (Regional TTS), Open-Meteo API.
- **Offline First:** Native fallback to `expo-speech` if API keys fail.
- **GPS:** High-accuracy `expo-location` integration.
- **Accessibility:** 100% icon-driven and voice-driven UX.
