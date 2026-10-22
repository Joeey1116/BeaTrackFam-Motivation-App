import { useCallback, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TAB_BAR_CLEARANCE } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Radius, Spacing, Type } from '../../lib/design';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../lib/themeContext';
import type { ThemePalette } from '../../lib/themes';
import { CompanionChat } from '../../components/CompanionChat';
import { StreakBuddy } from '../../components/StreakBuddy';
import { isCompanionEnabled, isStreakBuddyEnabled, getStreak, getUserName } from '../../lib/storage';

/**
 * Companion room — where your friend hangs out.
 * AI chat + streak buddy. Only shown if user opted in during onboarding.
 */
export default function Companion() {
  const insets = useSafeAreaInsets();
  const { theme, palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
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
        <LinearGradient colors={theme.bg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={48} color={palette.border} />
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
      <LinearGradient colors={theme.bg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={StyleSheet.absoluteFill} />
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
            <Ionicons name="chatbubbles-outline" size={28} color={palette.text} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardTitle}>Talk to me</Text>
              <Text style={styles.cardDesc}>
                Struggling, celebrating, or just want company — I'm here.
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={palette.textDim} />
          </Glass>
        </Pressable>
      )}

      <Modal visible={chatOpen} animationType="slide" presentationStyle="pageSheet">
        <CompanionChat userName={userName} onClose={() => setChatOpen(false)} />
      </Modal>
    </View>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
    padding: Spacing.lg,
    paddingTop: 60,
    gap: Spacing.sm,
  },
  title: {
    ...Type.display,
    color: p.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    ...Type.body,
    color: p.textDim,
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
    color: p.text,
    fontSize: 17,
    fontWeight: '700',
    marginBottom: Spacing.xs,
  },
  cardDesc: {
    ...Type.caption,
    color: p.textDim,
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
    color: p.text,
  },
  emptyText: {
    ...Type.body,
    color: p.textDim,
    textAlign: 'center',
  },
  });
}
