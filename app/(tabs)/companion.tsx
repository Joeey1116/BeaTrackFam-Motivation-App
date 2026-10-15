import { useCallback, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_CLEARANCE } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
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
          <Ionicons name="heart-outline" size={48} color={Colors.border} />
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
            <Ionicons name="chatbubbles-outline" size={28} color={Colors.text} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Talk to me</Text>
              <Text style={styles.cardDesc}>
                Struggling, celebrating, or just want company — I'm here.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
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
    backgroundColor: Colors.background,
    padding: Spacing.lg,
    paddingTop: 60,
    gap: Spacing.sm,
  },
  title: {
    ...Type.display,
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Type.body,
    color: Colors.textDim,
    marginBottom: Spacing.md,
  },
  buddyCard: {
    borderRadius: Radius.lg,
    padding: Spacing.sm,
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    color: Colors.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    ...Type.caption,
    color: Colors.textDim,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    padding: 40,
  },
  emptyTitle: {
    ...Type.section,
    color: Colors.text,
  },
  emptyText: {
    ...Type.body,
    color: Colors.textDim,
    textAlign: 'center',
  },
});
