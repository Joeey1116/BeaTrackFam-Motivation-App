import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { getLanguage, trackName, useStrings } from '../../lib/i18n';
import { getQuotes, type Quote } from '../../lib/quotes';
import { getChosenTracks, getFavorites, toggleFavorite } from '../../lib/storage';

export default function Favorites() {
  const { t, lang } = useStrings();
  const [quotes, setQuotes] = useState<Quote[]>([]);

  const load = async () => {
    const favs = await getFavorites();
    const all = await getQuotes(getLanguage(), await getChosenTracks());
    setQuotes(all.filter((q) => favs.includes(q.id)));
  };

  useEffect(() => {
    load();
  }, [lang]);

  const remove = async (id: string) => {
    await toggleFavorite(id);
    load();
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{t('favorites.title')}</Text>
        {quotes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color="#333" />
            <Text style={styles.emptyText}>{t('favorites.empty')}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {quotes.map((q) => (
              <Glass key={q.id} style={styles.card}>
                <Text style={styles.track}>{trackName(q.tracks[0]).toUpperCase()}</Text>
                <Text style={styles.quote}>{q.text}</Text>
                <Pressable onPress={() => remove(q.id)} style={styles.favRow}>
                  <Ionicons name="heart" size={20} color="#ff4d6d" />
                </Pressable>
              </Glass>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 16, flexGrow: 1 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '800' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 16, paddingTop: 80 },
  emptyText: { color: '#666', fontSize: 15, textAlign: 'center', lineHeight: 22, paddingHorizontal: 32 },
  list: { gap: 12 },
  card: { borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#2a2a2a', gap: 8 },
  track: { color: '#666', fontSize: 11, fontWeight: '700', letterSpacing: 2 },
  quote: { color: '#fff', fontSize: 17, fontWeight: '600', lineHeight: 26 },
  favRow: { alignSelf: 'flex-end', padding: 4 },
});
