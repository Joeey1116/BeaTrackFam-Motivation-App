import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_CLEARANCE } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { CompanionChat } from '../../components/CompanionChat';
import { StreakBuddy } from '../../components/StreakBuddy';
import { isCompanionEnabled, isStreakBuddyEnabled, getStreak, getUserName } from '../../lib/storage';

/**
 * Companion room — where your friend hangs out.
 * AI chat + streak buddy. Only shown if user opted in during onboarding.
 */
export default function Companion() {
  const insets = useSafeAreaInsets();
  const [chatOpen, setChatOpen] = useState(false);
  const [companionOn, setCompanionOn] = useState(true);
  const [buddyOn, setBuddyOn] = useState(true);
  const [streak, setStreak] = useState(0);
  const [userName, setUserName] = useState<string | undefined>();

  const load = useCallback(async () => {
    setCompanionOn(await isCompanionEnabled());
    setBuddyOn(await isStreakBuddyEnabled());
    setStreak(await getStreak());
    setUserName((await getUserName()) || undefined);
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  if (!companionOn && !buddyOn) {
    return (
      <View style={styles.container}>
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color="#444" />
          <Text style={styles.emptyTitle}>Companion is off</Text>
          <Text style={styles.emptyText}>
            You chose a clean experience during onboarding. You can turn on the
            companion and streak buddy anytime in Settings.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }]}>
      <Text style={styles.title}>Companion</Text>
      <Text style={styles.subtitle}>
        Your friend is here. You're not alone. 💛
      </Text>

      {buddyOn && (
        <Glass style={styles.buddyCard}>
          <StreakBuddy streak={streak} />
        </Glass>
      )}

      {companionOn && (
        <Pressable onPress={() => setChatOpen(true)}>
          <Glass style={styles.chatCard}>
            <Ionicons name="chatbubbles-outline" size={28} color="#fff" />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Talk to me</Text>
              <Text style={styles.cardDesc}>
                Struggling, celebrating, or just want company — I'm here.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Glass>
        </Pressable>
      )}

      <Modal visible={chatOpen} animationType="slide" presentationStyle="pageSheet">
        <CompanionChat userName={userName} onClose={() => setChatOpen(false)} />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
  buddyCard: {
    borderRadius: 16,
    padding: 8,
  },
  chatCard: {
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
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
});
