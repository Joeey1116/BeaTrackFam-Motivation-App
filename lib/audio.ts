import { setAudioModeAsync } from 'expo-audio';

let configured = false;

/**
 * Configure the shared audio session so music keeps playing when the app
 * is backgrounded or the screen locks.
 *
 * - shouldPlayInBackground: keeps the session alive in the background
 *   (requires the "audio" UIBackgroundMode on iOS — set in app.json and
 *   via the expo-audio config plugin — plus the player's lock-screen
 *   activation on Android, handled in lib/music.ts).
 * - playsInSilentMode: music still plays with the iOS silent switch on.
 * - interruptionMode 'doNotMix': required by expo-audio when the lock
 *   screen controls are active; other apps' audio pauses instead of
 *   mixing under the music.
 *
 * Safe to call repeatedly; only the first call touches the session.
 */
export async function ensureBackgroundAudio(): Promise<void> {
  if (configured) return;
  try {
    await setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: true,
      interruptionMode: 'doNotMix',
      allowsRecording: false,
      shouldRouteThroughEarpiece: false,
    });
    configured = true;
  } catch {
    // Audio session setup is best-effort — playback still works in the
    // foreground if the platform refuses the mode.
  }
}
