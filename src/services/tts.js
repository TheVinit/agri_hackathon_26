import { Audio } from "expo-av";

// ─── Module-Level State ───────────────────────────────────────────────────────

/** @type {Audio.Sound | null} */
let currentSound = null;

/** @type {boolean} */
let _isPlaying = false;

// ─── Audio URLs (AgriPulse Cloudinary Assets) ─────────────────────────────────

export const AUDIO_URLS = {
  mainAdvisory:
    "https://res.cloudinary.com/dy3jinwkn/video/upload/v1774183533/Main_advisory_w8ccrj.mp3",
  critical:
    "https://res.cloudinary.com/dy3jinwkn/video/upload/v1774183533/critical_b0gda5.mp3",
  allGood:
    "https://res.cloudinary.com/dy3jinwkn/video/upload/v1774183533/all_good_yiwwtb.mp3",
};

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Safely stop and unload the current sound object, then clear state.
 */
const _unloadCurrent = async () => {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
    } catch (_) {
      // Already stopped — ignore
    }
    try {
      await currentSound.unloadAsync();
    } catch (_) {
      // Already unloaded — ignore
    }
    currentSound = null;
    _isPlaying = false;
  }
};

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Load and play an advisory audio from a remote URL.
 *
 * @param {string | null | undefined} audioUrl  Remote MP3/audio URL to play.
 * @returns {Promise<void>}
 *
 * Usage:
 *   await playAdvisory(AUDIO_URLS.mainAdvisory);
 *   await playAdvisory(AUDIO_URLS.critical);
 *   await playAdvisory(AUDIO_URLS.allGood);
 */
export const playAdvisory = async (audioUrl) => {
  // Guard: empty / null URL
  if (!audioUrl || audioUrl.trim() === "") {
    console.log("[TTS] playAdvisory called with empty/null URL — skipping.");
    return;
  }

  try {
    // 1. Configure audio session for both iOS silent mode and Android
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });

    // 2. Stop and unload any currently playing sound
    await _unloadCurrent();

    // 3. Create and load the new sound
    console.log(`[TTS] Loading audio: ${audioUrl}`);
    const { sound } = await Audio.Sound.createAsync(
      { uri: audioUrl },
      { shouldPlay: false }
    );

    currentSound = sound;

    // 4. Attach playback status listener
    currentSound.setOnPlaybackStatusUpdate((status) => {
      if (!status.isLoaded) {
        if (status.error) {
          console.error(`[TTS] Playback error: ${status.error}`);
        }
        _isPlaying = false;
        return;
      }

      _isPlaying = status.isPlaying;

      if (status.didJustFinish) {
        console.log("[TTS] Playback finished.");
        _isPlaying = false;
        // Auto-unload after finish to free memory
        _unloadCurrent();
      }
    });

    // 5. Start playback
    await currentSound.playAsync();
    console.log("[TTS] Playback started.");
  } catch (err) {
    console.error("[TTS] playAdvisory error:", err.message ?? err);
    _isPlaying = false;
  }
};

/**
 * Stop and unload the currently playing advisory audio.
 *
 * @returns {Promise<void>}
 */
export const stopAdvisory = async () => {
  if (!currentSound) {
    console.log("[TTS] stopAdvisory — nothing is playing.");
    return;
  }
  console.log("[TTS] Stopping current audio.");
  await _unloadCurrent();
};

/**
 * Returns whether audio is currently playing.
 *
 * @returns {boolean}
 */
export const isPlaying = () => _isPlaying;
