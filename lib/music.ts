import { useSyncExternalStore } from 'react';
import { createAudioPlayer, type AudioPlayer } from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ensureBackgroundAudio } from './audio';

export interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  /** require() asset for bundled tracks, { uri } for imported files. */
  file: any;
  imported?: boolean;
}

export const BUNDLED_TRACKS: Track[] = [
  { id: '1', title: 'Meditation Impromptu 01', artist: 'Kevin MacLeod', genre: 'Meditation', duration: '5:00', file: require('../assets/music/meditation_01.mp3') },
  { id: '2', title: 'Meditation Impromptu 02', artist: 'Kevin MacLeod', genre: 'Meditation', duration: '6:00', file: require('../assets/music/Meditation_Impromptu_02.mp3') },
  { id: '3', title: 'Meditation Impromptu 03', artist: 'Kevin MacLeod', genre: 'Meditation', duration: '6:00', file: require('../assets/music/Meditation_Impromptu_03.mp3') },
];

export const IMPORTED_TRACKS_KEY = '@hustle-heart.imported-tracks';

interface ImportedTrack {
  id: string;
  title: string;
  uri: string;
}

export async function loadImportedTracks(): Promise<Track[]> {
  try {
    const raw = await AsyncStorage.getItem(IMPORTED_TRACKS_KEY);
    if (!raw) return [];
    const list: ImportedTrack[] = JSON.parse(raw);
    // Drop any whose file no longer exists.
    const valid: Track[] = [];
    for (const t of list) {
      const info = await FileSystem.getInfoAsync(t.uri);
      if (info.exists) {
        valid.push({
          id: t.id,
          title: t.title,
          artist: 'Your library',
          genre: 'Imported',
          duration: '',
          file: { uri: t.uri },
          imported: true,
        });
      }
    }
    return valid;
  } catch {
    return [];
  }
}

export async function saveImportedTracks(tracks: ImportedTrack[]): Promise<void> {
  try {
    await AsyncStorage.setItem(IMPORTED_TRACKS_KEY, JSON.stringify(tracks));
  } catch {
    // Storage unavailable — import still works for this session.
  }
}

export async function readImportedList(): Promise<ImportedTrack[]> {
  try {
    const raw = await AsyncStorage.getItem(IMPORTED_TRACKS_KEY);
    return raw ? (JSON.parse(raw) as ImportedTrack[]) : [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// Playback — ONE player for the whole app, created lazily and kept alive at
// module level. It is deliberately NOT owned by any screen: leaving the
// Music screen (or backgrounding the app) must not stop the music.
// ---------------------------------------------------------------------------

let player: AudioPlayer | null = null;

function getPlayer(): AudioPlayer {
  if (!player) {
    player = createAudioPlayer(BUNDLED_TRACKS[0].file);
  }
  return player;
}

interface PlaybackState {
  playingId: string | null;
}

let state: PlaybackState = { playingId: null };
const listeners = new Set<() => void>();

function setPlayingId(id: string | null) {
  state = { playingId: id };
  for (const l of listeners) l();
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getSnapshot(): PlaybackState {
  return state;
}

/** Reactive view of what's playing, for any screen that shows music UI. */
export function useMusicPlayback(): {
  playingId: string | null;
  togglePlay: (track: Track) => Promise<void>;
} {
  const snap = useSyncExternalStore(subscribe, getSnapshot);
  return { playingId: snap.playingId, togglePlay };
}

export async function togglePlay(track: Track): Promise<void> {
  try {
    const p = getPlayer();
    if (state.playingId === track.id) {
      p.pause();
      setPlayingId(null);
      return;
    }
    await ensureBackgroundAudio();
    p.replace(track.file);
    // Lock-screen / notification controls — on Android these are what let
    // playback survive more than a few minutes in the background.
    try {
      p.setActiveForLockScreen(true, {
        title: track.title,
        artist: track.artist,
      });
    } catch {
      // Not supported everywhere (web, older OS) — playback continues.
    }
    p.play();
    setPlayingId(track.id);
  } catch (e) {
    console.error('Audio playback failed:', e);
  }
}

/** Stop playback entirely (e.g. when the playing track is removed). */
export function stopPlayback() {
  try {
    player?.pause();
    try {
      player?.setActiveForLockScreen(false);
    } catch {
      // ignore
    }
  } catch {
    // ignore
  }
  setPlayingId(null);
}

export function stopIfPlaying(id: string) {
  if (state.playingId === id) stopPlayback();
}
