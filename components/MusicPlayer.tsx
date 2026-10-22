import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system';
import { Radius, Spacing, Type } from '../lib/design';
import type { ThemePalette } from '../lib/themes';
import { useTheme } from '../lib/themeContext';
import {
  BUNDLED_TRACKS,
  loadImportedTracks,
  readImportedList,
  saveImportedTracks,
  stopIfPlaying,
  useMusicPlayback,
  type Track,
} from '../lib/music';

const GENRES = ['All', 'Ambient', 'Piano', 'Nature', 'Meditation', 'Acoustic', 'Lo-Fi'];

interface Props {
  isHavenPlus: boolean;
}

/**
 * Music room — calming tracks by genre.
 * Free (Haven): built-in tracks with occasional ads.
 * Haven Plus: no ads + import your own tracks from your device.
 *
 * Playback lives in lib/music.ts (one app-wide player): leaving this
 * screen or backgrounding the app does NOT stop the music.
 */
export function MusicPlayer({ isHavenPlus }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [genre, setGenre] = useState('All');
  const [tracks, setTracks] = useState<Track[]>(BUNDLED_TRACKS);
  const { playingId, togglePlay } = useMusicPlayback();

  // Load imported tracks on mount.
  useEffect(() => {
    loadImportedTracks().then((imported) => {
      if (imported.length > 0) setTracks([...BUNDLED_TRACKS, ...imported]);
    });
  }, []);

  const filtered =
    genre === 'All' ? tracks : tracks.filter((t) => t.genre === genre);

  const importTrack = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'audio/*',
        copyToCacheDirectory: true,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];

      // Copy into the app's document directory so it survives cache clears.
      const destUri = `${FileSystem.Paths.document.uri}music-${Date.now()}-${asset.name}`;
      await FileSystem.copyAsync({ from: asset.uri, to: destUri });

      const imported = {
        id: `imported-${Date.now()}`,
        title: asset.name.replace(/\.[^.]+$/, ''),
        uri: destUri,
      };

      const list = await readImportedList();
      list.push(imported);
      await saveImportedTracks(list);

      const newTrack: Track = {
        id: imported.id,
        title: imported.title,
        artist: 'Your library',
        genre: 'Imported',
        duration: '',
        file: { uri: imported.uri },
        imported: true,
      };
      setTracks((prev) => [...prev, newTrack]);
      Alert.alert('Added', `"${imported.title}" is now in your music.`);
    } catch (e) {
      console.error('Import failed:', e);
      Alert.alert('Could not import', 'That file could not be added. Try another audio file.');
    }
  };

  const removeImported = (id: string) => {
    Alert.alert('Remove track?', 'This deletes the imported file from the app.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            const track = tracks.find((t) => t.id === id);
            if (track?.imported && track.file?.uri) {
              await FileSystem.deleteAsync(track.file.uri, { idempotent: true });
            }
            const list = await readImportedList();
            await saveImportedTracks(list.filter((t) => t.id !== id));
            stopIfPlaying(id);
            setTracks((prev) => prev.filter((t) => t.id !== id));
          } catch {
            // Best effort — track is gone from the list regardless.
            stopIfPlaying(id);
            setTracks((prev) => prev.filter((t) => t.id !== id));
          }
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>
        Calming sounds for your home. Pick your vibe — music keeps playing
        when you leave this screen.
      </Text>

      {!isHavenPlus && (
        <View style={styles.adNote}>
          <Ionicons name="information-circle-outline" size={16} color={palette.textDim} />
          <Text style={styles.adNoteText}>
            Free tracks include occasional ads. Haven Plus removes them.
          </Text>
        </View>
      )}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.genres}
        contentContainerStyle={styles.genresContent}
      >
        {GENRES.map((g) => (
          <Pressable
            key={g}
            onPress={() => setGenre(g)}
            style={[styles.genreChip, genre === g && styles.genreChipActive]}
          >
            <Text style={[styles.genreText, genre === g && styles.genreTextActive]}>
              {g}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <ScrollView style={styles.tracks} showsVerticalScrollIndicator={false}>
        {filtered.map((track) => {
          const isPlaying = playingId === track.id;
          return (
            <Pressable
              key={track.id}
              onPress={() => togglePlay(track)}
              onLongPress={track.imported ? () => removeImported(track.id) : undefined}
              style={[styles.track, isPlaying && styles.trackPlaying]}
            >
              <View style={styles.playBtn}>
                <Ionicons name={isPlaying ? 'pause' : 'play'} size={20} color={palette.buttonText} />
              </View>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle} numberOfLines={1}>
                  {track.title}
                </Text>
                <Text style={styles.trackMeta} numberOfLines={1}>
                  {track.artist}
                  {track.genre ? ` · ${track.genre}` : ''}
                  {track.duration ? ` · ${track.duration}` : ''}
                </Text>
              </View>
              {isPlaying && (
                <Ionicons name="musical-notes" size={20} color={palette.text} />
              )}
            </Pressable>
          );
        })}
        {filtered.length === 0 && (
          <Text style={styles.empty}>No tracks in this genre yet.</Text>
        )}
      </ScrollView>

      {isHavenPlus && (
        <Pressable style={styles.importBtn} onPress={importTrack}>
          <Ionicons name="add-circle-outline" size={20} color={palette.text} />
          <Text style={styles.importText}>Import Your Own Music</Text>
        </Pressable>
      )}

      <Text style={styles.credit}>
        Music by Kevin MacLeod (incompetech.com){'\n'}Licensed under Creative Commons CC BY 4.0
      </Text>
    </View>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
  container: { flex: 1, gap: Spacing.sm },
  subtitle: { ...Type.body, color: p.textMuted },
  adNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: p.surface,
    borderRadius: Radius.md,
    padding: Spacing.sm + 2,
  },
  adNoteText: { ...Type.caption, color: p.textDim, flex: 1 },
  genres: { flexGrow: 0 },
  genresContent: { paddingVertical: Spacing.xs, alignItems: 'center' },
  genreChip: {
    borderWidth: 1,
    borderColor: p.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
  },
  genreChipActive: { backgroundColor: p.button, borderColor: p.button },
  genreText: { fontSize: 14, color: p.textDim },
  genreTextActive: { color: p.buttonText, fontWeight: '600' },
  tracks: { flex: 1 },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.border,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  trackPlaying: { borderColor: p.text },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: p.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: { flex: 1 },
  trackTitle: { ...Type.title, color: p.text, marginBottom: 2 },
  trackMeta: { ...Type.caption, color: p.textDim },
  empty: { ...Type.body, color: p.textDim, textAlign: 'center', marginTop: Spacing.lg },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: p.surfaceRaised,
    borderWidth: 1,
    borderColor: p.border,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
  },
  importText: { ...Type.title, color: p.text },
  credit: {
    fontSize: 11,
    color: p.textDim,
    textAlign: 'center',
    lineHeight: 16,
  },
  });
}
