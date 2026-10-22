import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TRACKS, type TrackId } from '../lib/brand';
import { trackDesc, trackName } from '../lib/i18n';
import { withAlpha, type ThemePalette } from '../lib/themes';
import { useTheme } from '../lib/themeContext';
import { Glass } from './Glass';

interface Props {
  selected: TrackId[];
  onToggle: (track: TrackId) => void;
}

/** Multi-select track cards — shared by onboarding and Settings. */
export function TrackPicker({ selected, onToggle }: Props) {
  const { palette } = useTheme();
  const styles = React.useMemo(() => createStyles(palette), [palette]);

  return (
    <View style={styles.list}>
      {TRACKS.map((track) => {
        const active = selected.includes(track);
        return (
          <Pressable key={track} onPress={() => onToggle(track)} accessibilityRole="checkbox">
            <Glass style={[styles.card, active && styles.cardActive]}>
              <View style={styles.row}>
                <View style={styles.texts}>
                  <Text style={styles.name}>{trackName(track)}</Text>
                  <Text style={styles.desc}>{trackDesc(track)}</Text>
                </View>
                <View style={[styles.check, active && styles.checkActive]}>
                  {active ? <Ionicons name="checkmark" size={18} color={palette.buttonText} /> : null}
                </View>
              </View>
            </Glass>
          </Pressable>
        );
      })}
    </View>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    list: { gap: 12 },
    card: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: p.border },
    cardActive: { borderColor: p.text },
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
    texts: { flex: 1, gap: 4 },
    name: { color: p.text, fontSize: 17, fontWeight: '800' },
    desc: { color: p.textDim, fontSize: 13, lineHeight: 18 },
    check: {
      width: 28,
      height: 28,
      borderRadius: 14,
      borderWidth: 1.5,
      borderColor: withAlpha(p.text, 0.35),
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkActive: { backgroundColor: p.button, borderColor: p.button },
  });
}
