import { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { Screen } from '../components/Screen';
import { MusicPlayer } from '../components/MusicPlayer';
import { Spacing, Type } from '../lib/design';
import type { ThemePalette } from '../lib/themes';
import { useTheme } from '../lib/themeContext';
import { getPlan } from '../lib/storage';
import { useStrings } from '../lib/i18n';

/**
 * Music — its own screen (moved OUT of Settings in build 18, per Joey).
 * Reached from the music button on the Today tab. Playback keeps going
 * when you leave this screen or background the app (see lib/music.ts).
 */
export default function MusicScreen() {
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
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
          <Text style={styles.back}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.h1}>{t('music.title')}</Text>
        <MusicPlayer isHavenPlus={isPlus} />
      </View>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    body: { padding: Spacing.lg, gap: Spacing.sm, flex: 1 },
    backRow: { paddingVertical: Spacing.xs },
    back: { color: p.textDim, fontSize: 17, fontWeight: '600' },
    h1: { ...Type.display, color: p.text },
  });
}
