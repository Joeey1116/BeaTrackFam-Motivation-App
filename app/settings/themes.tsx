import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Screen } from '../../components/Screen';
import { Radius, Spacing, Type } from '../../lib/design';
import { getPlan } from '../../lib/storage';
import { THEMES, type Theme, type ThemePalette } from '../../lib/themes';
import { useTheme } from '../../lib/themeContext';

/**
 * Themes — tap a theme and it applies IMMEDIATELY, app-wide (build 20):
 * the choice goes through the theme provider, so the Today quote, tab
 * bar, settings, modals — every themed surface — recolors in the same
 * render pass, and the choice is persisted via storage.setThemeId.
 * No confirmation popup, no dead taps.
 *
 * Rows are full-width with the theme's real gradient as a swatch, the
 * full name on one line, and a checkmark on the ONE selected theme.
 * Premium themes show a lock and prompt the Haven Plus upsell instead.
 */
export default function ThemesScreen() {
  const { themeId: current, chooseTheme, palette } = useTheme();
  const [isPlus, setIsPlus] = useState(false);
  const styles = useMemo(() => createStyles(palette), [palette]);

  useEffect(() => {
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
    // Optimistic + persisted inside the provider: the checkmark moves
    // now, the whole app recolors now, storage keeps it for next launch.
    await chooseTheme(theme.id);
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
            ? 'Make your home yours. Tap to apply — it takes effect everywhere, right away.'
            : 'Haven includes 3 themes. Haven Plus unlocks them all. Tap to apply — it takes effect everywhere, right away.'}
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
                  <Ionicons name="lock-closed" size={18} color={palette.textDim} />
                ) : active ? (
                  <Ionicons name="checkmark-circle" size={24} color={palette.text} />
                ) : (
                  <Ionicons name="ellipse-outline" size={24} color={palette.border} />
                )}
              </Pressable>
            );
          })}
        </View>
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
    sub: { ...Type.body, color: p.textMuted, marginBottom: Spacing.sm },
    list: { gap: Spacing.sm },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: Spacing.md,
      backgroundColor: p.surface,
      borderRadius: Radius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: p.border,
    },
    cardActive: { borderColor: p.text, backgroundColor: p.surfaceRaised },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: Radius.md,
      borderWidth: 1,
      borderColor: p.border,
    },
    label: { flex: 1, color: p.text, fontSize: 17, fontWeight: '600' },
    premiumTag: { ...Type.eyebrow, color: p.textDim },
  });
}
