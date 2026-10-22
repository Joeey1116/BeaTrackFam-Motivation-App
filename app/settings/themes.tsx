import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { getThemeId, setThemeId, getPlan } from '../../lib/storage';
import { THEMES, type Theme } from '../../lib/themes';

/**
 * Themes — tap a theme and it applies IMMEDIATELY (persisted via
 * storage.setThemeId; the Today screen re-reads it on focus, so the new
 * theme is live when you go back). No confirmation popup, no dead taps.
 *
 * Rows are full-width with the theme's real gradient as a swatch, the
 * full name on one line, and a checkmark on the ONE selected theme.
 * Premium themes show a lock and prompt the Haven Plus upsell instead.
 */
export default function ThemesScreen() {
  const [current, setCurrent] = useState<string>('');
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    getThemeId().then(setCurrent);
    getPlan().then((p) => setIsPlus(p === 'haven-plus'));
  }, []);

  const pick = async (theme: Theme) => {
    const locked = !isPlus && theme.premium;
    if (locked) {
      Alert.alert('Haven Plus', 'Haven includes 3 themes. Haven Plus unlocks them all.', [
        { text: 'Not Now', style: 'cancel' },
        { text: 'OK', onPress: () => router.back() },
      ]);
      return;
    }
    // Optimistic + persisted: the checkmark moves now, storage keeps it.
    setCurrent(theme.id);
    await setThemeId(theme.id);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>Themes</Text>
        <Text style={styles.sub}>
          {isPlus
            ? 'Make your home yours. Tap to apply — it takes effect right away.'
            : 'Haven includes 3 themes. Haven Plus unlocks them all. Tap to apply — it takes effect right away.'}
        </Text>
        <View style={styles.list}>
          {THEMES.map((theme) => {
            const locked = !isPlus && theme.premium;
            const active = current === theme.id;
            return (
              <Pressable
                key={theme.id}
                onPress={() => pick(theme)}
                style={[styles.card, active && styles.cardActive]}
              >
                <LinearGradient
                  colors={theme.bg}
                  style={styles.swatch}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                />
                <Text style={styles.label} numberOfLines={1}>
                  {theme.name}
                </Text>
                {theme.premium && (
                  <Text style={styles.premiumTag}>{isPlus ? '' : 'PLUS'}</Text>
                )}
                {locked ? (
                  <Ionicons name="lock-closed" size={18} color={Colors.textDim} />
                ) : active ? (
                  <Ionicons name="checkmark-circle" size={24} color={Colors.text} />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color={Colors.border} />
                )}
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.sm, flexGrow: 1 },
  backRow: { paddingVertical: Spacing.xs },
  back: { color: Colors.textDim, fontSize: 17, fontWeight: '600' },
  h1: { ...Type.display, color: Colors.text },
  sub: { ...Type.body, color: Colors.textMuted, marginBottom: Spacing.sm },
  list: { gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: { borderColor: Colors.text, backgroundColor: Colors.surfaceRaised },
  swatch: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  label: { flex: 1, color: Colors.text, fontSize: 17, fontWeight: '600' },
  premiumTag: { ...Type.eyebrow, color: Colors.textDim },
});
