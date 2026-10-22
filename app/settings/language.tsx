import { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Radius, Spacing, Type } from '../../lib/design';
import type { ThemePalette } from '../../lib/themes';
import { useTheme } from '../../lib/themeContext';
import { useStrings, setLanguage } from '../../lib/i18n';

const LANGS = [
  { id: 'en' as const, name: 'English' },
  { id: 'he' as const, name: 'עברית' },
  { id: 'es' as const, name: 'Español' },
];

/**
 * Language — separate screen (not a popup).
 * Tap a language → confirm + go back.
 */
export default function LanguageScreen() {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const { lang } = useStrings();

  const pick = async (id: 'en' | 'he' | 'es', name: string) => {
    if (id === lang) {
      router.back();
      return;
    }
    await setLanguage(id);
    Alert.alert('Saved', `Language set to ${name}. Restart the app to apply the new layout.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>Language</Text>
        <Text style={styles.sub}>Choose your language.</Text>
        <View style={styles.list}>
          {LANGS.map((l) => {
            const active = lang === l.id;
            return (
              <Pressable key={l.id} onPress={() => pick(l.id, l.name)}>
                <Glass style={[styles.card, active && styles.cardActive]}>
                  <Text style={[styles.label, active && styles.labelActive]}>{l.name}</Text>
                  {active && <Ionicons name="checkmark" size={22} color={palette.buttonText} />}
                </Glass>
              </Pressable>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    body: { padding: Spacing.lg, gap: Spacing.sm, flex: 1 },
    backRow: { paddingVertical: Spacing.xs },
    back: { color: p.textDim, fontSize: 17, fontWeight: '600' },
    h1: { ...Type.display, color: p.text },
    sub: { ...Type.body, color: p.textDim, marginBottom: Spacing.sm },
    list: { gap: Spacing.sm },
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: Radius.lg,
      padding: Spacing.md,
      borderWidth: 1,
      borderColor: p.border,
    },
    cardActive: { backgroundColor: p.button, borderColor: p.button },
    label: { color: p.text, fontSize: 17, fontWeight: '600' },
    labelActive: { color: p.buttonText, fontWeight: '700' },
  });
}
