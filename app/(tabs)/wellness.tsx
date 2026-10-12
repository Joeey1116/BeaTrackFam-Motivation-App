import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_CLEARANCE } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { MoodCheckIn } from '../../components/MoodCheckIn';
import { VentSpace } from '../../components/VentSpace';
import { Breathe } from '../../components/Breathe';
import {
  getMoodHistory,
  saveMood,
  getVentEntries,
  saveVent,
  deleteVent,
  logBreatheSession,
  type MoodEntry,
  type VentEntry,
} from '../../lib/storage';

/**
 * Wellness room — the quiet space in your home.
 * Mood check-in, Vent Space, and Breathing exercises.
 */
export default function Wellness() {
  const insets = useSafeAreaInsets();
  const [moodModal, setMoodModal] = useState(false);
  const [ventModal, setVentModal] = useState(false);
  const [breatheModal, setBreatheModal] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [ventEntries, setVentEntries] = useState<VentEntry[]>([]);

  const load = useCallback(async () => {
    setMoodHistory(await getMoodHistory());
    setVentEntries(await getVentEntries());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const handleMoodSave = async (valence: number, emotions: string[]) => {
    await saveMood(valence, emotions);
    load();
  };

  const handleVentSave = async (text: string) => {
    await saveVent(text);
    load();
  };

  const handleVentDelete = async (id: string) => {
    await deleteVent(id);
    load();
  };

  const handleBreatheComplete = async (exerciseId: string, minutes: number) => {
    await logBreatheSession(exerciseId, minutes);
  };

  const todayMood = moodHistory.find(
    (m) => m.date === new Date().toISOString().split('T')[0]
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
      ]}
    >
      <Text style={styles.title}>Wellness</Text>
      <Text style={styles.subtitle}>
        Your quiet room. Check in with yourself, let it out, breathe.
      </Text>

      <Pressable onPress={() => setMoodModal(true)}>
        <Glass style={styles.card}>
          <Ionicons name="happy-outline" size={28} color="#fff" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Mood Check-In</Text>
            <Text style={styles.cardDesc}>
              {todayMood
                ? `Today: ${todayMood.emotions.slice(0, 2).join(', ') || 'Checked in'}`
                : 'How are you feeling right now?'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Glass>
      </Pressable>

      <Pressable onPress={() => setVentModal(true)}>
        <Glass style={styles.card}>
          <Ionicons name="chatbubble-ellipses-outline" size={28} color="#fff" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Vent Space</Text>
            <Text style={styles.cardDesc}>
              {ventEntries.length > 0
                ? `${ventEntries.length} ${ventEntries.length === 1 ? 'vent' : 'vents'} — get it out`
                : 'Free-write. No judgment, just space.'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Glass>
      </Pressable>

      <Pressable onPress={() => setBreatheModal(true)}>
        <Glass style={styles.card}>
          <Ionicons name="leaf-outline" size={28} color="#fff" />
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>Breathe</Text>
            <Text style={styles.cardDesc}>
              Guided breathing for stress, anxiety, calm.
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Glass>
      </Pressable>

      <Modal visible={moodModal} animationType="slide" presentationStyle="pageSheet">
        <MoodCheckIn onSave={handleMoodSave} onClose={() => setMoodModal(false)} />
      </Modal>

      <Modal visible={ventModal} animationType="slide" presentationStyle="pageSheet">
        <VentSpace
          entries={ventEntries}
          onSave={handleVentSave}
          onDelete={handleVentDelete}
          onClose={() => setVentModal(false)}
        />
      </Modal>

      <Modal visible={breatheModal} animationType="slide" presentationStyle="pageSheet">
        <Breathe onComplete={handleBreatheComplete} onClose={() => setBreatheModal(false)} />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    gap: 12,
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
    marginBottom: 16,
    lineHeight: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 18,
    gap: 14,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
});
