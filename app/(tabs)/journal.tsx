import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { useStrings } from '../../lib/i18n';
import {
  getGratitude,
  setGratitude,
  getMoodHistory,
  saveMood,
  getVentEntries,
  saveVent,
  deleteVent,
  logBreatheSession,
  type MoodEntry,
  type VentEntry,
} from '../../lib/storage';
import { MoodCheckIn } from '../../components/MoodCheckIn';
import { VentSpace } from '../../components/VentSpace';
import { Breathe } from '../../components/Breathe';

export default function Journal() {
  const { t, lang, rtl } = useStrings();
  const [text, setText] = useState('');
  const [savedTick, setSavedTick] = useState(0);

  // Wellness tools (merged from the old Wellness tab, Oct 2026)
  const [moodModal, setMoodModal] = useState(false);
  const [ventModal, setVentModal] = useState(false);
  const [breatheModal, setBreatheModal] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [ventEntries, setVentEntries] = useState<VentEntry[]>([]);

  useEffect(() => {
    getGratitude().then(setText);
  }, [lang]);

  const loadWellness = useCallback(async () => {
    setMoodHistory(await getMoodHistory());
    setVentEntries(await getVentEntries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWellness();
    }, [loadWellness])
  );

  const onChange = (v: string) => {
    setText(v);
    void setGratitude(v).then(() => setSavedTick((x) => x + 1));
  };

  const today = new Date().toLocaleDateString(
    lang === 'he' ? 'he-IL' : lang === 'es' ? 'es-ES' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' },
  );

  const todayMood = moodHistory.find(
    (m) => m.date === new Date().toISOString().split('T')[0]
  );

  const wellnessCards = [
    {
      key: 'mood',
      icon: 'happy-outline' as const,
      title: 'Mood Check-In',
      desc: todayMood
        ? `Today: ${todayMood.emotions.slice(0, 2).join(', ') || 'Checked in'}`
        : 'How are you feeling right now?',
      onPress: () => setMoodModal(true),
    },
    {
      key: 'vent',
      icon: 'chatbubble-ellipses-outline' as const,
      title: 'Vent Space',
      desc: ventEntries.length > 0
        ? `${ventEntries.length} ${ventEntries.length === 1 ? 'vent' : 'vents'} — get it out`
        : 'Free-write. No judgment, just space.',
      onPress: () => setVentModal(true),
    },
    {
      key: 'breathe',
      icon: 'leaf-outline' as const,
      title: 'Breathe',
      desc: 'Guided breathing for stress, anxiety, calm.',
      onPress: () => setBreatheModal(true),
    },
  ];

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{t('journal.title')}</Text>
        <Text style={styles.date}>{today}</Text>
        <Glass style={styles.card}>
          <View style={styles.promptRow}>
            <Ionicons name="sunny-outline" size={22} color="#f5c518" />
            <Text style={styles.prompt}>{t('journal.prompt')}</Text>
          </View>
          <TextInput
            style={[styles.input, rtl && styles.rtl]}
            value={text}
            onChangeText={onChange}
            placeholder={t('journal.placeholder')}
            placeholderTextColor={Colors.textDim}
            multiline
            textAlignVertical="top"
            maxLength={280}
          />
          {savedTick > 0 && text.length > 0 ? (
            <Text style={styles.saved}>{t('journal.saved')}</Text>
          ) : null}
        </Glass>

        <Text style={styles.sectionTitle}>Wellness</Text>
        {wellnessCards.map((c) => (
          <Pressable key={c.key} onPress={c.onPress}>
            <Glass style={styles.card}>
              <Ionicons name={c.icon} size={28} color={Colors.text} />
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{c.title}</Text>
                <Text style={styles.cardDesc}>{c.desc}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
            </Glass>
          </Pressable>
        ))}
      </ScrollView>

      <Modal visible={moodModal} animationType="slide" presentationStyle="pageSheet">
        <MoodCheckIn
          onSave={async (valence, emotions) => {
            await saveMood(valence, emotions);
            loadWellness();
          }}
          onClose={() => setMoodModal(false)}
        />
      </Modal>

      <Modal visible={ventModal} animationType="slide" presentationStyle="pageSheet">
        <VentSpace
          entries={ventEntries}
          onSave={async (v) => {
            await saveVent(v);
            loadWellness();
          }}
          onDelete={async (id) => {
            await deleteVent(id);
            loadWellness();
          }}
          onClose={() => setVentModal(false)}
        />
      </Modal>

      <Modal visible={breatheModal} animationType="slide" presentationStyle="pageSheet">
        <Breathe
          onComplete={async (exerciseId, minutes) => {
            await logBreatheSession(exerciseId, minutes);
          }}
          onClose={() => setBreatheModal(false)}
        />
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.sm },
  h1: { ...Type.display, color: Colors.text },
  date: { ...Type.body, color: Colors.textDim },
  card: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md, marginTop: Spacing.sm },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  prompt: { color: Colors.text, fontSize: 17, fontWeight: '700', flex: 1 },
  input: {
    color: Colors.text,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 140,
    backgroundColor: Colors.input,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  saved: { ...Type.caption, color: Colors.success, fontWeight: '600' },
  sectionTitle: { ...Type.title, color: Colors.text, fontWeight: '800', marginTop: Spacing.md },
  cardInfo: { flex: 1 },
  cardTitle: { color: Colors.text, fontSize: 17, fontWeight: '700', marginBottom: Spacing.xs },
  cardDesc: { ...Type.caption, color: Colors.textDim },
});
