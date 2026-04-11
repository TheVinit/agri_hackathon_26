// src/services/tts.js
import { Platform } from 'react-native';
// import * as Speech from 'expo-speech';
// import { Audio as ExpoAudio } from 'expo-av';


const SARVAM_API_URL = 'https://api.sarvam.ai/v1/tts'; // Reverting to V1 common endpoint
const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY;

let webAudioInstance = null;
let nativeSoundInstance = null;

export async function speak(text, lang = 'hi', options = {}) {
  const sarvamLangMap = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN' };
  const targetLangCode = sarvamLangMap[lang] || 'hi-IN';

  try {
    if (!SARVAM_API_KEY) throw new Error('Key missing');
    const base64 = await fetchSarvamBase64(text, targetLangCode);
    
    if (Platform.OS === 'web') {
      await playBase64Web(base64, options);
    } else {
      await playBase64Native(base64, options);
    }
  } catch (err) {
    console.warn('[TTS] Sarvam failed → using fallback', err.message);
    fallbackSpeak(text, targetLangCode, options);
  }
}

export function stopSpeaking() {
  if (Platform.OS === 'web') {
    if (webAudioInstance) { try { webAudioInstance.pause(); } catch(e){} webAudioInstance = null; }
    if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
  } else {
    if (nativeSoundInstance) { try { nativeSoundInstance.stopAsync(); } catch(e){} nativeSoundInstance = null; }
    try {
      const Speech = require('expo-speech');
      Speech.stop();
    } catch(e) {}
  }
}

async function fetchSarvamBase64(text, langCode) {
  const chunk = text.slice(0, 450);
  const res = await fetch(SARVAM_API_URL, {
    method: 'POST',
    headers: {
      'api-subscription-key': SARVAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [chunk],
      target_language_code: langCode,
      speaker: 'meera',
      model: 'bulbul:v1',
    }),
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  return json.audios?.[0];
}

function playBase64Web(base64, { onDone, onError }) {
  return new Promise((resolve) => {
    const audio = new window.Audio(`data:audio/wav;base64,${base64}`);
    webAudioInstance = audio;
    audio.onended = () => { webAudioInstance = null; onDone?.(); resolve(); };
    audio.onerror = (e) => { webAudioInstance = null; onError?.(e); resolve(); };
    audio.play().catch(e => { onError?.(e); resolve(); });
  });
}

async function playBase64Native(base64, { onDone, onError }) {
  try {
    const { Audio } = require('expo-av');
    const { sound } = await Audio.Sound.createAsync(
      { uri: `data:audio/mp3;base64,${base64}` },
      { shouldPlay: true }
    );
    nativeSoundInstance = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) { nativeSoundInstance = null; onDone?.(); }
    });
  } catch (e) {
    onError?.(e);
  }
}

function fallbackSpeak(text, lang, { onDone, onError }) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.onend = onDone;
    window.speechSynthesis.speak(utterance);
  } else {
    try {
      const Speech = require('expo-speech');
      Speech.speak(text, { language: lang, onDone, onError });
    } catch(e) {
      onDone?.();
    }
  }
}
export async function speakAdvisory(nodes, lang = 'hi', options = {}) {
  let text = '';
  if (lang === 'hi') {
    text = `खेत की स्थिति रिपोर्ट: `;
    const avgMoisture = Math.round(nodes.reduce((s, n) => s + n.moisture, 0) / nodes.length);
    text += `औसत नमी ${avgMoisture} प्रतिशत है। `;
    if (avgMoisture < 45) text += `मिट्टी में नमी कम है, कृपया सिंचाई करें। `;
    const avgTemp = (nodes.reduce((s, n) => s + n.temperature, 0) / nodes.length).toFixed(1);
    if (parseFloat(avgTemp) > 32) text += `तापमान अधिक है। `;
  } else {
    text = `Farm status report: `;
    const avgMoisture = Math.round(nodes.reduce((s, n) => s + n.moisture, 0) / nodes.length);
    text += `Average moisture is ${avgMoisture} percent. `;
    const avgTemp = (nodes.reduce((s, n) => s + n.temperature, 0) / nodes.length).toFixed(1);
    text += `Average temperature is ${avgTemp} degrees. `;
  }

  return speak(text, lang, options);
}
