import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '../components/Screen';
import { MusicPlayer } from '../components/MusicPlayer';
import { Colors, Spacing, Type } from '../lib/design';
import { getPlan } from '../lib/storage';

/**
 * Music — its own screen (moved OUT of Settings in build 18, per Joey).
 * Reached from the music button on the Today tab. Playback keeps going
 * when you leave this screen or background the app (see lib/music.ts).
 */
export default function MusicScreen() {
  const [isPlus, setIsPlus] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getPlan().then((p) => setIsPlus(p === 'haven-plus'));
    }, [])
  );

  return (
    <Screen>
      <View style={styles.body}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>Music</Text>
        <MusicPlayer isHavenPlus={isPlus} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.sm, flex: 1 },
  backRow: { paddingVertical: Spacing.xs },
  back: { color: Colors.textDim, fontSize: 17, fontWeight: '600' },
  h1: { ...Type.display, color: Colors.text },
});
