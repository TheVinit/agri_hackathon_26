// src/services/voiceCommand.js
// Voice Command Recognition for AgriPulse
// Web: Web Speech API (SpeechRecognition)
// Native: expo-speech-recognition
import { Platform } from 'react-native';

// Optional native import
let ExpoSpeechRecognition = null;
if (Platform.OS !== 'web') {
  try {
    ExpoSpeechRecognition = require('expo-speech-recognition').ExpoSpeechRecognition;
  } catch (e) {
    console.warn('[Voice] Native speech recognition module not found. Voice commands may be limited.');
  }
}

// ─── Intent Map ────────────────────────────────────────────────
// Maps spoken phrases → action tokens (multi-language)
const INTENTS = [
  {
    action: 'navigate_home',
    keywords: [
      'home', 'होम', 'मुख्य', 'dashboard', 'डैशबोर्ड', 'मुख्यपृष्ठ', 'घर',
      'मुख्य पृष्ठ', 'घरी जा', 'वापस', 'back',
    ],
  },
  {
    action: 'navigate_advisory',
    keywords: [
      'advisory', 'सलाह', 'सल्ला', 'counsel', 'advice', 'farming advice',
      'farming advisory', 'कृषि सलाह', 'कृषी सल्ला', 'tip', 'tips', 'मदद', 'help',
    ],
  },
  {
    action: 'navigate_soil',
    keywords: [
      'soil', 'मिट्टी', 'माती', 'npk', 'soil test', 'मिट्टी जाँच',
      'माती परीक्षण', 'nitrogen', 'phosphorus', 'potassium', 'npk test',
    ],
  },
  {
    action: 'navigate_map',
    keywords: [
      'map', 'नक्शा', 'नकाशा', 'farm map', 'location', 'field', 'खेत',
      'खेत का नक्शा', 'शेत', 'satellite', 'zone',
    ],
  },
  {
    action: 'speak_report',
    keywords: [
      'report', 'रिपोर्ट', 'status', 'स्थिति', 'read', 'बताओ', 'what',
      'खेत की स्थिति', 'क्या हो रहा है', 'सांगा', 'ऐका', 'listen',
      'play report', 'play audio', 'speak', 'बोलो',
    ],
  },
  {
    action: 'check_moisture',
    keywords: [
      'moisture', 'नमी', 'ओलावा', 'water level', 'पानी', 'पाणी',
      'नमी का स्तर', 'how wet', 'wet', 'dry',
    ],
  },
  {
    action: 'check_temperature',
    keywords: [
      'temperature', 'तापमान', 'temp', 'heat', 'गर्मी', 'गरम', 'hot',
      'degree', 'degrees', 'celsius',
    ],
  },
  {
    action: 'logout',
    keywords: [
      'logout', 'log out', 'sign out', 'exit', 'बाहर', 'निकलो', 'बाहेर',
      'लॉगआउट', 'बाहर जाओ', 'बाहेर जा', 'signout',
    ],
  },
];

// ─── Parse transcript to intent ────────────────────────────────
export function parseIntent(transcript) {
  if (!transcript) return null;
  const lower = transcript.toLowerCase().trim();

  for (const intent of INTENTS) {
    for (const kw of intent.keywords) {
      if (lower.includes(kw.toLowerCase())) {
        return { action: intent.action, transcript, confidence: 0.9 };
      }
    }
  }
  return { action: 'unknown', transcript, confidence: 0 };
}

// ─── Recognition state ──────────────────────────────────────────
let webRecognitionInstance = null; 

export function isVoiceSupported() {
  if (Platform.OS === 'web') {
    return typeof window !== 'undefined' &&
      (window.SpeechRecognition || window.webkitSpeechRecognition);
  }
  // On native, supported if the module loaded OR we have fallback logic
  return !!ExpoSpeechRecognition; 
}

// ─── Start Listening ────────────────────────────────────────────
export function startListening({ lang = 'hi-IN', onResult, onError, onEnd }) {
  if (Platform.OS === 'web') {
    return startWebListening({ lang, onResult, onError, onEnd });
  } else {
    return startNativeListening({ lang, onResult, onError, onEnd });
  }
}

// ─── Web Implementation ─────────────────────────────────────────
function startWebListening({ lang, onResult, onError, onEnd }) {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    if (onError) onError(new Error('SpeechRecognition not supported'));
    return;
  }
  stopListening();
  const recognition = new SpeechRecognition();
  webRecognitionInstance = recognition;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = lang;
  recognition.onresult = (event) => {
    const best = event.results[0][0].transcript;
    const intent = parseIntent(best);
    if (onResult) onResult({ transcript: best, intent });
  };
  recognition.onerror = (event) => { if (onError) onError(new Error(event.error)); };
  recognition.onend = () => { webRecognitionInstance = null; if (onEnd) onEnd(); };
  recognition.start();
}

// ─── Native Implementation ──────────────────────────────────────
async function startNativeListening({ lang, onResult, onError, onEnd }) {
  try {
    if (!ExpoSpeechRecognition) throw new Error('Speech recognition not available on this device');

    const { status } = await ExpoSpeechRecognition.requestPermissionsAsync();
    if (status !== 'granted') throw new Error('Microphone permission denied');

    ExpoSpeechRecognition.start({
      lang,
      interimResults: false,
      onResult: (event) => {
        const best = event.results[0]?.transcript || '';
        const intent = parseIntent(best);
        if (onResult) onResult({ transcript: best, intent });
      },
      onError: (event) => { if (onError) onError(new Error(event.error)); },
      onEnd: () => {
        if (onEnd) onEnd();
      },
    });
  } catch (err) {
    console.warn('[Voice] Native listener error:', err.message);
    if (onError) onError(err);
  }
}

export function stopListening() {
  if (Platform.OS === 'web') {
    if (webRecognitionInstance) {
      try { webRecognitionInstance.stop(); } catch (_) {}
      webRecognitionInstance = null;
    }
  } else {
    try {
      if (ExpoSpeechRecognition) ExpoSpeechRecognition.stop();
    } catch (_) {}
  }
}

export function getRecognitionLang(appLang) {
  const map = { hi: 'hi-IN', en: 'en-IN', mr: 'mr-IN' };
  return map[appLang] || 'hi-IN';
}
