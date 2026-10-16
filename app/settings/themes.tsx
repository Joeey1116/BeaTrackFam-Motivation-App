import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { getThemeId, setThemeId, getPlan } from '../../lib/storage';
import { THEMES } from '../../lib/themes';

/**
 * Themes — separate screen (not a popup).
 * Tap a theme → apply + go back. Locked themes prompt upgrade.
 */
export default function ThemesScreen() {
  const [current, setCurrent] = useState<string>('');
  const [isPlus, setIsPlus] = useState(false);

  useEffect(() => {
    getThemeId().then(setCurrent);
    getPlan().then((p) => setIsPlus(p === 'haven-plus'));
  }, []);

  const pick = async (id: string, name: string, locked: boolean) => {
    if (locked) {
      Alert.alert('Haven Plus', 'Haven includes 3 themes. Haven Plus unlocks them all.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'See Plans', onPress: () => router.back() },
      ]);
      return;
    }
    await setThemeId(id);
    Alert.alert('Saved', `"${name}" applied.`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>Themes</Text>
        <Text style={styles.sub}>
          {isPlus ? 'Make your home yours.' : 'Haven includes 3 themes. Haven Plus unlocks them all.'}
        </Text>
        <View style={styles.list}>
          {THEMES.map((theme) => {
            const locked = !isPlus && theme.premium;
            const active = current === theme.id;
            return (
              <Pressable key={theme.id} onPress={() => pick(theme.id, theme.name, locked)}>
                <Glass style={[styles.card, active && styles.cardActive]}>
                  <Text style={[styles.label, active && styles.labelActive]}>
                    {locked ? '🔒 ' : ''}{theme.name}
                  </Text>
                  {active && <Ionicons name="checkmark" size={22} color={Colors.buttonText} />}
                </Glass>
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
  sub: { ...Type.body, color: Colors.textDim, marginBottom: Spacing.sm },
  list: { gap: Spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardActive: { backgroundColor: Colors.button, borderColor: Colors.button },
  label: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  labelActive: { color: Colors.buttonText, fontWeight: '700' },
});
