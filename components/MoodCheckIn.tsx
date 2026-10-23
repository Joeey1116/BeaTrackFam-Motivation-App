import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Slider from '@react-native-community/slider';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/themeContext';
import type { ThemePalette } from '../lib/themes';
import { useStrings } from '../lib/i18n';

interface Props {
  onSave: (valence: number, emotions: string[], note?: string) => void | Promise<void>;
  onClose: () => void;
  /** Today's already-saved check-in, if any — the form opens prefilled
   *  with it so a saved check-in is visibly remembered, not blank. */
  initial?: { valence: number; emotions: string[] } | null;
}

/**
 * Emotion values are STORED in English (they're saved mood data and old
 * entries already hold them); only the displayed label is localized,
 * via `emotions.<key>`.
 */
export const EMOTIONS: { value: string; key: string }[] = [
  { value: 'Calm', key: 'calm' },
  { value: 'Anxious', key: 'anxious' },
  { value: 'Grateful', key: 'grateful' },
  { value: 'Stressed', key: 'stressed' },
  { value: 'Hopeful', key: 'hopeful' },
  { value: 'Sad', key: 'sad' },
  { value: 'Energized', key: 'energized' },
  { value: 'Lonely', key: 'lonely' },
  { value: 'Content', key: 'content' },
  { value: 'Overwhelmed', key: 'overwhelmed' },
  { value: 'Peaceful', key: 'peaceful' },
  { value: 'Frustrated', key: 'frustrated' },
  { value: 'Joyful', key: 'joyful' },
  { value: 'Tired', key: 'tired' },
  { value: 'Motivated', key: 'motivated' },
];

/** Locale key for a stored emotion value (unknown values pass through). */
export function emotionKey(value: string): string | null {
  return EMOTIONS.find((e) => e.value === value)?.key ?? null;
}

const CRISIS_KEYWORDS = [
  'kill myself', 'suicide', 'end it', 'hurt myself', 'self harm',
  'want to die', 'no reason to live',
  // Hebrew
  'להרוג את עצמי', 'להתאבד', 'התאבדות', 'רוצה למות', 'לפגוע בעצמי',
  'אין לי סיבה לחיות', 'לסיים עם הכל',
  // Spanish
  'matarme', 'suicidio', 'suicidarme', 'quiero morir', 'hacerme daño',
  'no quiero vivir', 'quitarme la vida', 'sin razón para vivir',
];

/**
 * Apple Health-style mood check-in.
 * Slider from Very Unpleasant (-1) to Very Pleasant (+1), emotion picker.
 * Detects crisis language and surfaces resources immediately.
 */
export function MoodCheckIn({ onSave, onClose, initial }: Props) {
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
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
    if (valence <= -0.6) return t('mood.veryUnpleasant');
    if (valence <= -0.2) return t('mood.unpleasant');
    if (valence < 0.2) return t('mood.neutral');
    if (valence < 0.6) return t('mood.pleasant');
    return t('mood.veryPleasant');
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
          <Text style={styles.crisisTitle}>{t('mood.crisisTitle')}</Text>
          <Text style={styles.crisisText}>
            {t('mood.crisisText')}
          </Text>
          <Pressable style={styles.crisisBtn}>
            <Text style={styles.crisisBtnText}>{t('mood.crisisCall988')}</Text>
          </Pressable>
          <Pressable style={styles.crisisBtn}>
            <Text style={styles.crisisBtnText}>{t('mood.crisisText741741')}</Text>
          </Pressable>
          <Pressable style={styles.crisisBtn}>
            <Text style={styles.crisisBtnText}>{t('mood.crisisCallDV')}</Text>
          </Pressable>
          <Pressable onPress={() => setShowCrisis(false)}>
            <Text style={styles.backLink}>{t('mood.backToCheckIn')}</Text>
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
        <Text style={styles.title}>{t('mood.title')}</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={24} color={palette.text} />
        </Pressable>
      </View>

      <Text style={[styles.valenceLabel, { color: valence < 0 ? '#ff8a8a' : valence > 0 ? '#8affa0' : palette.text }]}>
        {getValenceLabel()}
      </Text>

      <Slider
        style={styles.slider}
        minimumValue={-1}
        maximumValue={1}
        value={valence}
        onValueChange={setValence}
        minimumTrackTintColor={palette.textDim}
        maximumTrackTintColor={palette.border}
        thumbTintColor={palette.text}
      />
      <View style={styles.sliderLabels}>
        <Text style={styles.sliderLabel}>{t('mood.veryUnpleasant')}</Text>
        <Text style={styles.sliderLabel}>{t('mood.veryPleasant')}</Text>
      </View>

      <Text style={styles.sectionTitle}>{t('mood.wordsFit')}</Text>
      <View style={styles.emotionGrid}>
        {EMOTIONS.map((e) => (
          <Pressable
            key={e.value}
            onPress={() => toggleEmotion(e.value)}
            style={[styles.emotionChip, selected.includes(e.value) && styles.emotionChipActive]}
          >
            <Text style={[styles.emotionText, selected.includes(e.value) && styles.emotionTextActive]}>
              {t(`emotions.${e.key}`)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Pressable onPress={() => setShowCrisis(true)}>
        <Text style={styles.crisisLink}>{t('mood.needSupport')}</Text>
      </Pressable>

      <Pressable onPress={handleSave} style={styles.saveBtn} disabled={saving}>
        <Text style={styles.saveText}>
          {saving ? t('mood.saving') : initial ? t('mood.updateCheckIn') : t('mood.saveCheckIn')}
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

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
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
    color: p.text,
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
    color: p.textDim,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: p.text,
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
    borderColor: p.border,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  emotionChipActive: {
    backgroundColor: p.button,
    borderColor: p.button,
  },
  emotionText: {
    fontSize: 14,
    color: p.textMuted,
  },
  emotionTextActive: {
    color: p.buttonText,
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
    backgroundColor: p.button,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 17,
    fontWeight: '700',
    color: p.buttonText,
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
    color: p.text,
    textAlign: 'center',
  },
  crisisText: {
    fontSize: 16,
    color: p.textMuted,
    textAlign: 'center',
    marginBottom: 8,
  },
  crisisBtn: {
    backgroundColor: p.surface,
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
    color: p.text,
  },
  backLink: {
    fontSize: 14,
    color: p.textDim,
    marginTop: 12,
  },
  });
}
