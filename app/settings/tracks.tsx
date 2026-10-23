import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Radius, Spacing, Type } from '../../lib/design';
import type { ThemePalette } from '../../lib/themes';
import { useTheme } from '../../lib/themeContext';
import { getChosenTracks, setChosenTracks } from '../../lib/storage';
import { TRACKS, type TrackId } from '../../lib/brand';
import { trackName, useStrings } from '../../lib/i18n';

/**
 * Faith & Topic Tracks — separate screen (not a popup).
 * Tap to toggle. Done → go back.
 */
export default function TracksScreen() {
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [chosen, setChosen] = useState<TrackId[]>([]);

  useEffect(() => {
    getChosenTracks().then(setChosen);
  }, []);

  const toggle = async (id: TrackId) => {
    const next = chosen.includes(id)
      ? chosen.filter((x) => x !== id)
      : [...chosen, id];
    // Keep at least one track.
    if (next.length === 0) return;
    setChosen(next);
    await setChosenTracks(next);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.h1}>{t('tracksScreen.title')}</Text>
        <Text style={styles.sub}>{t('tracksScreen.sub')}</Text>
        <View style={styles.list}>
          {TRACKS.map((id) => {
            const active = chosen.includes(id);
            return (
              <Pressable key={id} onPress={() => toggle(id)}>
                <Glass style={[styles.card, active && styles.cardActive]}>
                  <Text style={[styles.label, active && styles.labelActive]}>
                    {trackName(id)}
                  </Text>
                  {active && <Ionicons name="checkmark" size={22} color={palette.buttonText} />}
                </Glass>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => router.back()} style={styles.doneBtn}>
          <Text style={styles.doneText}>{t('common.done')}</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    body: { padding: Spacing.lg, gap: Spacing.sm, flexGrow: 1 },
    backRow: { paddingVertical: Spacing.xs },
    back: { color: p.textDim, fontSize: 17, fontWeight: '600' },
    h1: { ...Type.display, color: p.text },
    sub: { ...Type.body, color: p.textDim, marginBottom: Spacing.sm },
    list: { gap: Spacing.sm },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: Radius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: p.border,
    },
    cardActive: { backgroundColor: p.button, borderColor: p.button },
    label: { color: p.text, fontSize: 17, fontWeight: '600' },
    labelActive: { color: p.buttonText, fontWeight: '700' },
    doneBtn: {
      backgroundColor: p.button,
      borderRadius: Radius.lg,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      marginTop: Spacing.md,
    },
    doneText: { color: p.buttonText, fontSize: 17, fontWeight: '700' },
  });
}
