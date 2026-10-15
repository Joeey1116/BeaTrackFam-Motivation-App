import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
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
            <Ionicons name="heart-outline" size={48} color={Colors.border} />
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
  body: { padding: Spacing.lg, gap: Spacing.md, flexGrow: 1 },
  h1: { ...Type.display, color: Colors.text },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingTop: 80 },
  emptyText: { ...Type.title, color: Colors.textDim, fontWeight: '400', textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.xl },
  list: { gap: Spacing.sm },
  card: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.sm },
  track: { ...Type.eyebrow, color: Colors.textDim, letterSpacing: 2 },
  quote: { color: Colors.text, fontSize: 17, fontWeight: '600', lineHeight: 26 },
  favRow: { alignSelf: 'flex-end', padding: Spacing.xs },
});
