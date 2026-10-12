import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioPlayer } from 'expo-audio';
import { Glass } from './Glass';

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: string;
  file: any;
}

const TRACKS: Track[] = [
  { id: '1', title: 'Meditation Impromptu 01', artist: 'Kevin MacLeod', genre: 'Meditation', duration: '5:00', file: require('../assets/music/meditation_01.mp3') },
  { id: '2', title: 'Meditation Impromptu 02', artist: 'Kevin MacLeod', genre: 'Meditation', duration: '6:00', file: require('../assets/music/Meditation_Impromptu_02.mp3') },
  { id: '3', title: 'Meditation Impromptu 03', artist: 'Kevin MacLeod', genre: 'Meditation', duration: '6:00', file: require('../assets/music/Meditation_Impromptu_03.mp3') },
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
  const insets = useSafeAreaInsets();
  const player = useAudioPlayer(TRACKS[0].file);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        player.pause();
      } catch {
        // ignore
      }
    };
  }, []);

  const filtered = genre === 'All'
    ? TRACKS
    : TRACKS.filter((t) => t.genre === genre);

  const togglePlay = async (id: string) => {
    try {
      if (playingId === id) {
        player.pause();
        setPlayingId(null);
        return;
      }
      const track = TRACKS.find((t) => t.id === id);
      if (!track) return;
      // Swap the audio source if it's a different track, then play
      if (playingId !== null) {
        player.replace(track.file);
      } else {
        // First play — make sure the right source is loaded
        const current = TRACKS.find((t) => t.id === playingId);
        if (!current || current.id !== id) {
          player.replace(track.file);
        }
      }
      player.play();
      setPlayingId(id);
    } catch (e) {
      console.error('Audio playback failed:', e);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 120 }]}>
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
        <Pressable
          style={styles.importBtn}
          onPress={() =>
            Alert.alert(
              'Import Your Music',
              'Import your own calming tracks from your library. Coming in the next update.'
            )
          }
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.importText}>Import Your Own Music</Text>
        </Pressable>
      )}

      <Text style={styles.credit}>
        Music by Kevin MacLeod (incompetech.com){'\n'}Licensed under Creative Commons CC BY 4.0
      </Text>
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
  credit: {
    fontSize: 11,
    color: '#444',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 16,
  },
});
