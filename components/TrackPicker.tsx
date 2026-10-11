import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TRACKS, type TrackId } from '../lib/brand';
import { trackDesc, trackName } from '../lib/i18n';
import { Glass } from './Glass';

interface Props {
  selected: TrackId[];
  onToggle: (track: TrackId) => void;
}

/** Multi-select track cards — shared by onboarding and Settings. */
export function TrackPicker({ selected, onToggle }: Props) {
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
                  {active ? <Ionicons name="checkmark" size={18} color="#000000" /> : null}
                </View>
              </View>
            </Glass>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 12 },
  card: { borderRadius: 18, padding: 16, borderWidth: 1, borderColor: '#2a2a2a' },
  cardActive: { borderColor: '#ffffff' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  texts: { flex: 1, gap: 4 },
  name: { color: '#ffffff', fontSize: 17, fontWeight: '800' },
  desc: { color: '#999999', fontSize: 13, lineHeight: 18 },
  check: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#555555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkActive: { backgroundColor: '#ffffff', borderColor: '#ffffff' },
});
