import { useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from './Screen';
import { Spacing, Type } from '../lib/design';
import type { LegalSection } from '../lib/legal';
import type { ThemePalette } from '../lib/themes';
import { useTheme } from '../lib/themeContext';

interface Props {
  title: string;
  updated: string;
  sections: LegalSection[];
}

/**
 * In-app legal document — same chrome as the other secondary screens
 * (black background, white/gray brand type, simple back row) so the
 * policy/terms read as part of the app, not a web page.
 */
export function LegalDoc({ title, updated, sections }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>{title}</Text>
        <Text style={styles.updated}>{updated}</Text>
        {sections.map((s, i) => (
          <View key={i} style={styles.section}>
            {s.heading ? <Text style={styles.heading}>{s.heading}</Text> : null}
            <Text style={styles.text}>{s.body}</Text>
          </View>
        ))}
      </ScrollView>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    body: { padding: Spacing.lg, gap: Spacing.md, flexGrow: 1 },
    backRow: { paddingVertical: Spacing.xs },
    back: { color: p.textDim, fontSize: 17, fontWeight: '600' },
    h1: { ...Type.display, color: p.text },
    updated: { ...Type.caption, color: p.textDim, marginTop: -Spacing.sm },
    section: { gap: Spacing.xs },
    heading: { ...Type.section, color: p.text, marginTop: Spacing.sm },
    text: { ...Type.body, color: p.textMuted },
  });
}
