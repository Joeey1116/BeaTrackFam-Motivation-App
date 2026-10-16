import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { getChosenTracks, setChosenTracks } from '../../lib/storage';
import { TRACKS, TRACK_LABELS, type TrackId } from '../../lib/brand';

/**
 * Faith & Topic Tracks — separate screen (not a popup).
 * Tap to toggle. Done → go back.
 */
export default function TracksScreen() {
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
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>Faith & Topic Tracks</Text>
        <Text style={styles.sub}>Pick the tracks that feel like home. Tap to toggle.</Text>
        <View style={styles.list}>
          {TRACKS.map((id) => {
            const active = chosen.includes(id);
            return (
              <Pressable key={id} onPress={() => toggle(id)}>
                <Glass style={[styles.card, active && styles.cardActive]}>
                  <Text style={[styles.label, active && styles.labelActive]}>
                    {TRACK_LABELS[id]}
                  </Text>
                  {active && <Ionicons name="checkmark" size={22} color={Colors.buttonText} />}
                </Glass>
              </Pressable>
            );
          })}
        </View>
        <Pressable onPress={() => router.back()} style={styles.doneBtn}>
          <Text style={styles.doneText}>Done</Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.sm, flexGrow: 1 },
  backRow: { paddingVertical: Spacing.xs },
  back: { color: Colors.textDim, fontSize: 17, fontWeight: '600' },
  h1: { ...Type.display, color: Colors.text },
  sub: { ...Type.body, color: Colors.textDim, marginBottom: Spacing.sm },
  list: { gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: { backgroundColor: Colors.button, borderColor: Colors.button },
  label: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  labelActive: { color: Colors.buttonText, fontWeight: '700' },
  doneBtn: {
    backgroundColor: Colors.button,
    borderRadius: Radius.lg,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    marginTop: Spacing.md,
  },
  doneText: { color: Colors.buttonText, fontSize: 17, fontWeight: '700' },
});
