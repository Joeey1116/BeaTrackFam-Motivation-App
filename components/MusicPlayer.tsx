import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Glass } from './Glass';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
}

const TRACKS: Track[] = [
  { id: '1', title: 'Morning Calm', artist: 'Hustle & Heart', genre: 'Ambient', duration: '5:00' },
  { id: '2', title: 'Peaceful Piano', artist: 'Hustle & Heart', genre: 'Piano', duration: '4:30' },
  { id: '3', title: 'Forest Rain', artist: 'Hustle & Heart', genre: 'Nature', duration: '6:00' },
  { id: '4', title: 'Deep Meditation', artist: 'Hustle & Heart', genre: 'Meditation', duration: '10:00' },
  { id: '5', title: 'Gentle Guitar', artist: 'Hustle & Heart', genre: 'Acoustic', duration: '3:45' },
  { id: '6', title: 'Night Lo-Fi', artist: 'Hustle & Heart', genre: 'Lo-Fi', duration: '4:15' },
];

const GENRES = ['All', 'Ambient', 'Piano', 'Nature', 'Meditation', 'Acoustic', 'Lo-Fi'];

interface Props {
  isHavenPlus: boolean;
  onClose?: () => void;
}

/**
 * Music room — calming tracks by genre.
 * Free (Haven): built-in tracks with occasional ads.
 * Haven Plus: no ads + import own library (coming soon).
 */
export function MusicPlayer({ isHavenPlus }: Props) {
  const [genre, setGenre] = useState('All');
  const [playingId, setPlayingId] = useState<string | null>(null);

  const filtered = genre === 'All'
    ? TRACKS
    : TRACKS.filter((t) => t.genre === genre);

  const togglePlay = (id: string) => {
    setPlayingId(playingId === id ? null : id);
    // TODO: integrate expo-av Audio.Sound for actual playback
    // TODO: show ad for free users (1-2 per session)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Music</Text>
      <Text style={styles.subtitle}>
        Calming sounds for your home. Pick your vibe.
      </Text>

      {!isHavenPlus && (
        <View style={styles.adNote}>
          <Ionicons name="information-circle-outline" size={16} color="#888" />
          <Text style={styles.adNoteText}>
            Free tracks include occasional ads. Haven Plus removes them.
          </Text>
        </View>
      )}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.genres}>
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

      <ScrollView style={styles.tracks}>
        {filtered.map((track) => (
          <Pressable key={track.id} onPress={() => togglePlay(track.id)}>
            <Glass style={styles.track}>
              <Pressable style={styles.playBtn} onPress={() => togglePlay(track.id)}>
                <Ionicons
                  name={playingId === track.id ? 'pause' : 'play'}
                  size={20}
                  color="#000"
                />
              </Pressable>
              <View style={styles.trackInfo}>
                <Text style={styles.trackTitle}>{track.title}</Text>
                <Text style={styles.trackMeta}>
                  {track.artist} · {track.genre} · {track.duration}
                </Text>
              </View>
              {playingId === track.id && (
                <Ionicons name="musical-notes" size={20} color="#fff" />
              )}
            </Glass>
          </Pressable>
        ))}
      </ScrollView>

      {isHavenPlus && (
        <Pressable style={styles.importBtn}>
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.importText}>Import Your Own Music</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 12,
    lineHeight: 20,
  },
  adNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#111',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  adNoteText: {
    fontSize: 12,
    color: '#888',
    flex: 1,
  },
  genres: {
    marginBottom: 16,
    maxHeight: 40,
  },
  genreChip: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  genreChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  genreText: {
    fontSize: 14,
    color: '#888',
  },
  genreTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  tracks: {
    flex: 1,
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    gap: 12,
  },
  playBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    flex: 1,
  },
  trackTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  trackMeta: {
    fontSize: 12,
    color: '#666',
  },
  importBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 14,
    paddingVertical: 14,
    marginTop: 12,
  },
  importText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
});
