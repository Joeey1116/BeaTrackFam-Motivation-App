import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { getLanguage, trackDesc, trackName, useStrings } from '../../lib/i18n';
import { getQuotesByTrack, type Quote } from '../../lib/quotes';
import { getChosenTracks, getFavorites, toggleFavorite } from '../../lib/storage';
import type { TrackId } from '../../lib/brand';

export default function Browse() {
  const { t, lang } = useStrings();
  const [tracks, setTracks] = useState<TrackId[]>([]);
  const [active, setActive] = useState<TrackId | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [favs, setFavs] = useState<string[]>([]);

  useEffect(() => {
    getChosenTracks().then((tr) => {
      setTracks(tr);
      setActive((prev) => prev ?? tr[0] ?? null);
    });
    getFavorites().then(setFavs);
  }, [lang]);

  useEffect(() => {
    if (active) getQuotesByTrack(getLanguage(), active).then(setQuotes);
  }, [active, lang]);

  const onFav = async (id: string) => {
    await toggleFavorite(id);
    setFavs(await getFavorites());
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{t('browse.title')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {tracks.map((tr) => (
            <Pressable key={tr} onPress={() => setActive(tr)}>
              <View style={[styles.chip, active === tr && styles.chipActive]}>
                <Text style={[styles.chipText, active === tr && styles.chipTextActive]}>
                  {trackName(tr)}
                </Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>
        {active ? <Text style={styles.desc}>{trackDesc(active)}</Text> : null}
        <View style={styles.list}>
          {quotes.map((q) => (
            <Glass key={q.id} style={styles.card}>
              <Text style={styles.quote}>{q.text}</Text>
              {q.fallback === true ? <Text style={styles.fallback}>{t('today.fallbackNote')}</Text> : null}
              <Pressable onPress={() => onFav(q.id)} style={styles.favRow}>
                <Ionicons
                  name={favs.includes(q.id) ? 'heart' : 'heart-outline'}
                  size={20}
                  color={favs.includes(q.id) ? '#ff4d6d' : Colors.textDim}
                />
              </Pressable>
            </Glass>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.md },
  h1: { ...Type.display, color: Colors.text },
  chips: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  chip: { backgroundColor: Colors.surface, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: Colors.border },
  chipActive: { backgroundColor: Colors.button, borderColor: Colors.button },
  chipText: { ...Type.body, color: Colors.textDim, fontWeight: '700' },
  chipTextActive: { color: Colors.buttonText },
  desc: { ...Type.body, color: Colors.textDim },
  list: { gap: Spacing.sm },
  card: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  quote: { color: Colors.text, fontSize: 17, fontWeight: '600', lineHeight: 26 },
  fallback: { color: Colors.textDim, fontSize: 11, fontStyle: 'italic' },
  favRow: { alignSelf: 'flex-end', padding: Spacing.xs },
});
