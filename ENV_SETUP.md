# 🔐 AgriPulse: Local Environment & Security Setup

**ATTENTION TEAM:** 
We have stripped all sensitive API Keys from the frontend codebase. If you try to run `npm start` or the Android/iOS bundle right now, the app will crash and fail to connect to Supabase or the Voice TTS engine. 

Follow these exact steps to restore your local development environment.

## 1. Create your Local `.env` File
In the root directory of the project (where `package.json` is), create a new file named exactly `.env`.

Paste the following variables into the file:

```env
# 🐘 Supabase Database Keys
EXPO_PUBLIC_SUPABASE_URL=https://aekmiuxibmfjiakhkkrc.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFla21pdXhpYm1mamlha2hra3JjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4Mjk5MTYsImV4cCI6MjA5MTQwNTkxNn0.iwbzLIGx2fEKhbdn7Wxrk7ssJpfCjrxu-47ee3mWye0

# 🎙️ Voice Generation (Sarvam AI)
EXPO_PUBLIC_SARVAM_API_KEY=sk_7dzs8sxh_qB26MScLaSCD9LyD0XFGe6dy
```

🚨 **CRITICAL:** Do NOT push the `.env` file to Github. It is already added to our `.gitignore` to prevent leaks. 

---

## 2. Restart the Metro Bundler
Because Expo caches environment variables wildly, simply hot-reloading the app is not enough. You must completely clear the Metro cache to inject the `.env` variables into the React Native context.

Run this command in your terminal to restart your local environment:
```bash
npx expo start -c
```

---

## 3. Vercel Production Environment
If you are responsible for deploying the final build to Vercel for the judges:
- You must go to the **Vercel Project Dashboard > Settings > Environment Variables**.
- Add all three `EXPO_PUBLIC_` keys exactly as they appear in the snippet above.
- Vercel automatically injects these into the web build process so the app can compile statically without exposing our keys in the source repositories.
- If you forget to add these on Vercel, the app UI will load and immediately crash when it tries to fetch the Dashboard data. 

**Demo Ready Status:** If your `.env` is configured correctly, the Hardware Cloudflare endpoint will successfully stream NodeMCU sensor data to Supabase, and the app will read it contextually via the secure `.env` URLs. Happy coding and good luck during the Hackathon pitch!
