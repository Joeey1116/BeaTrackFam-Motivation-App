import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
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
                  color={favs.includes(q.id) ? '#ff4d6d' : '#999'}
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
  body: { padding: 20, gap: 16 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '800' },
  chips: { gap: 10, paddingVertical: 4 },
  chip: { backgroundColor: '#1a1a1a', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#2a2a2a' },
  chipActive: { backgroundColor: '#fff', borderColor: '#fff' },
  chipText: { color: '#999', fontSize: 14, fontWeight: '700' },
  chipTextActive: { color: '#000' },
  desc: { color: '#666', fontSize: 14 },
  list: { gap: 12 },
  card: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#2a2a2a', gap: 10 },
  quote: { color: '#fff', fontSize: 17, fontWeight: '600', lineHeight: 26 },
  fallback: { color: '#555', fontSize: 11, fontStyle: 'italic' },
  favRow: { alignSelf: 'flex-end', padding: 4 },
});
