// src/services/tts.js — Cross-Platform TTS (Web + Native)
// Web: Sarvam AI → HTML5 Audio (base64 data URL) → fallback: Web Speech API
// Native: Sarvam AI → expo-file-system → expo-av → fallback: expo-speech
import { Platform } from 'react-native';

const SARVAM_API_URL = 'https://api.sarvam.ai/text-to-speech';
const SARVAM_API_KEY = process.env.EXPO_PUBLIC_SARVAM_API_KEY;

// ── State ─────────────────────────────────────────────────────
let webAudioInstance = null;       // HTMLAudioElement on web
let nativeSound      = null;       // expo-av Sound on native

// ── Stop any current playback ─────────────────────────────────
export async function stopSpeaking() {
  // Web
  if (Platform.OS === 'web') {
    if (webAudioInstance) {
      webAudioInstance.pause();
      webAudioInstance.src = '';
      webAudioInstance = null;
    }
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    return;
  }
  // Native
  try {
    if (nativeSound) {
      await nativeSound.stopAsync();
      await nativeSound.unloadAsync();
      nativeSound = null;
    }
  } catch (_) {}
}

// ── Speak (main export) ─────────────────────────────────
export async function speak(text, langCode = 'hi-IN', options = {}) {
  if (!text) return;
  const { onStart, onDone, onError } = options;

  await stopSpeaking();
  if (onStart) onStart();

  try {
    const base64 = await fetchSarvamBase64(text, langCode);
    if (Platform.OS === 'web') {
      await playBase64Web(base64, { onDone, onError });
    } else {
      await playBase64Native(base64, { onDone, onError });
    }
  } catch (err) {
    console.warn('[TTS] Sarvam failed →', err.message, '— using fallback');
    fallbackSpeak(text, langCode, { onDone, onError });
  }
}

// ── Deprecated alias for backward compatibility ──────────
export async function speakHindi(text, options = {}) {
  return speak(text, 'hi-IN', options);
}

// ── Fetch base64 audio from Sarvam AI ────────────────────────
async function fetchSarvamBase64(text, langCode) {
  const chunks = chunkText(text, 450);
  // For simplicity, join chunks and send first chunk only for speed
  const firstChunk = chunks[0] || text;

  const res = await fetch(SARVAM_API_URL, {
    method: 'POST',
    headers: {
      'api-subscription-key': SARVAM_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: [firstChunk],
      target_language_code: langCode,
      speaker: 'meera',
      pitch: 0,
      pace: 0.88,
      loudness: 1.5,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: 'bulbul:v1',
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Sarvam ${res.status}: ${txt.slice(0, 100)}`);
  }

  const json = await res.json();
  const b64 = json.audios?.[0];
  if (!b64) throw new Error('No audio in Sarvam response');
  return b64;
}

// ── Web: Play base64 via HTML5 Audio ─────────────────────────
function playBase64Web(base64, { onDone, onError }) {
  return new Promise((resolve, reject) => {
    const audio = new Audio(`data:audio/wav;base64,${base64}`);
    webAudioInstance = audio;
    audio.onended = () => {
      webAudioInstance = null;
      if (onDone) onDone();
      resolve();
    };
    audio.onerror = (e) => {
      webAudioInstance = null;
      const err = new Error('HTML5 Audio error');
      if (onError) onError(err);
      reject(err);
    };
    audio.play().catch((e) => {
      // Autoplay blocked — tell caller
      if (onError) onError(e);
      reject(e);
    });
  });
}

// ── Native: Write to file and play via expo-av ────────────────
async function playBase64Native(base64, { onDone, onError }) {
  const { Audio } = await import('expo-av');
  const FileSystem = await import('expo-file-system');

  const fileUri = FileSystem.cacheDirectory + `sarvam_${Date.now()}.wav`;
  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  await Audio.setAudioModeAsync({
    allowsRecordingIOS: false,
    playsInSilentModeIOS: true,
    shouldDuckAndroid: true,
    playThroughEarpieceAndroid: false,
  });

  const { sound } = await Audio.Sound.createAsync({ uri: fileUri });
  nativeSound = sound;

  await new Promise((resolve, reject) => {
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        nativeSound = null;
        FileSystem.deleteAsync(fileUri, { idempotent: true }).catch(() => {});
        if (onDone) onDone();
        resolve();
      }
      if (status.error) {
        reject(new Error(status.error));
      }
    });
    sound.playAsync().catch(reject);
  });
}

// ── Fallback: Web Speech API / expo-speech ────────────────────
function fallbackSpeak(text, lang, { onDone, onError }) {
  if (Platform.OS === 'web') {
    if (typeof window === 'undefined' || !window.speechSynthesis) {
      if (onError) onError(new Error('No TTS available'));
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onend  = () => { if (onDone) onDone(); };
    utterance.onerror = () => { if (onError) onError(new Error('SpeechSynthesis error')); };
    window.speechSynthesis.speak(utterance);
  } else {
    // Native: expo-speech fallback (install expo-speech if needed)
    console.warn('[TTS] Native fallback: install expo-speech for offline TTS');
    if (onDone) setTimeout(onDone, 500);
  }
}

// ── Helpers ───────────────────────────────────────────────────
function chunkText(text, maxLen) {
  if (text.length <= maxLen) return [text];
  const result = [];
  const sentences = text.split(/(?<=[।.!?])\s+/);
  let cur = '';
  for (const s of sentences) {
    if ((cur + s).length > maxLen) { if (cur) result.push(cur.trim()); cur = s; }
    else cur += ' ' + s;
  }
  if (cur.trim()) result.push(cur.trim());
  return result;
}
