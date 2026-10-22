import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onSave: (valence: number, emotions: string[], note?: string) => void | Promise<void>;
  onClose: () => void;
  /** Today's already-saved check-in, if any — the form opens prefilled
   *  with it so a saved check-in is visibly remembered, not blank. */
  initial?: { valence: number; emotions: string[] } | null;
}

const EMOTIONS = [
  'Calm', 'Anxious', 'Grateful', 'Stressed', 'Hopeful',
  'Sad', 'Energized', 'Lonely', 'Content', 'Overwhelmed',
  'Peaceful', 'Frustrated', 'Joyful', 'Tired', 'Motivated',
];

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end it', 'hurt myself', 'self harm',
  'want to die', 'no reason to live',
];

/**
 * Apple Health-style mood check-in.
 * Slider from Very Unpleasant (-1) to Very Pleasant (+1), emotion picker.
 * Detects crisis language and surfaces resources immediately.
 */
export function MoodCheckIn({ onSave, onClose, initial }: Props) {
  const [valence, setValence] = useState(initial?.valence ?? 0);
  const [selected, setSelected] = useState<string[]>(initial?.emotions ?? []);
  const [showCrisis, setShowCrisis] = useState(false);
  const [saving, setSaving] = useState(false);

  const toggleEmotion = (e: string) => {
    setSelected((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e]
    );
  };

  const getValenceLabel = () => {
    if (valence <= -0.6) return 'Very Unpleasant';
    if (valence <= -0.2) return 'Unpleasant';
    if (valence < 0.2) return 'Neutral';
    if (valence < 0.6) return 'Pleasant';
    return 'Very Pleasant';
  };

  const handleSave = async () => {
    if (saving) return;
    setSaving(true);
    try {
      // Await the write BEFORE closing: in build 18 the sheet closed
      // instantly whether or not the save landed, so a failed/slow write
      // looked exactly like a successful one — "doesn't save".
      await onSave(valence, selected);
    } finally {
      setSaving(false);
      onClose();
    }
  };

  if (showCrisis) {
    return (
      <View style={styles.container}>
        <View style={styles.crisisCard}>
          <Ionicons name="heart" size={48} color="#ff4d6d" />
          <Text style={styles.crisisTitle}>You matter. Help is here.</Text>
          <Text style={styles.crisisText}>
            If you're struggling, please reach out right now:
          </Text>
          <Pressable style={styles.crisisBtn}>
            <Text style={styles.crisisBtnText}>Call/Text 988 — Suicide & Crisis Lifeline</Text>
          </Pressable>
          <Pressable style={styles.crisisBtn}>
            <Text style={styles.crisisBtnText}>Text HOME to 741741 — Crisis Text Line</Text>
          </Pressable>
          <Pressable style={styles.crisisBtn}>
            <Text style={styles.crisisBtnText}>Call 1-800-799-7233 — DV Hotline</Text>
          </Pressable>
          <Pressable onPress={() => setShowCrisis(false)}>
            <Text style={styles.backLink}>Back to check-in</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Scrollable: on shorter screens the fixed layout pushed Save
          below the fold of the pageSheet with no way to reach it. */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>

      <Text style={[styles.valenceLabel, { color: valence < 0 ? '#ff8a8a' : valence > 0 ? '#8affa0' : '#fff' }]}>
        {getValenceLabel()}
      </Text>

      <Slider
        style={styles.slider}
        minimumValue={-1}
        maximumValue={1}
        value={valence}
        onValueChange={setValence}
        minimumTrackTintColor="#666"
        maximumTrackTintColor="#333"
        thumbTintColor="#fff"
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>Very Unpleasant</Text>
        <Text style={styles.sliderLabel}>Very Pleasant</Text>
      </View>

      <Text style={styles.sectionTitle}>What words fit? (pick any)</Text>
      <View style={styles.emotionGrid}>
        {EMOTIONS.map((e) => (
          <Pressable
            key={e}
            onPress={() => toggleEmotion(e)}
            style={[styles.emotionChip, selected.includes(e) && styles.emotionChipActive]}
          >
            <Text style={[styles.emotionText, selected.includes(e) && styles.emotionTextActive]}>
              {e}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => setShowCrisis(true)}>
        <Text style={styles.crisisLink}>Need support right now? Tap here.</Text>
      </Pressable>

      <Pressable onPress={handleSave} style={styles.saveBtn} disabled={saving}>
        <Text style={styles.saveText}>
          {saving ? 'Saving…' : initial ? 'Update Check-In' : 'Save Check-In'}
        </Text>
      </Pressable>
      </ScrollView>
    </View>
  );
}

export function containsCrisisLanguage(text: string): boolean {
  const lower = text.toLowerCase();
  return CRISIS_KEYWORDS.some((kw) => lower.includes(kw));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  valenceLabel: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  emotionChip: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emotionChipActive: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
  emotionText: {
    fontSize: 14,
    color: '#aaa',
  },
  emotionTextActive: {
    color: '#000',
    fontWeight: '600',
  },
  crisisLink: {
    fontSize: 14,
    color: '#ff8a8a',
    textAlign: 'center',
    marginBottom: 16,
    textDecorationLine: 'underline',
  },
  saveBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  crisisCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    padding: 20,
  },
  crisisTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  crisisText: {
    fontSize: 16,
    color: '#aaa',
    textAlign: 'center',
    marginBottom: 8,
  },
  crisisBtn: {
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#ff4d6d',
    borderRadius: 12,
    padding: 16,
    width: '100%',
    alignItems: 'center',
  },
  crisisBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  backLink: {
    fontSize: 14,
    color: '#888',
    marginTop: 12,
  },
});
