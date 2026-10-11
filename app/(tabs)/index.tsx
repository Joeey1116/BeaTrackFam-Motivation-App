import { useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Sharing from 'expo-sharing';
import type { ShotHandle } from '../../components/QuoteCard';
import { Screen } from '../../components/Screen';
import { QuoteCard } from '../../components/QuoteCard';
import { BRAND, type TrackId } from '../../lib/brand';
import { getLanguage, useStrings } from '../../lib/i18n';
import { getQuoteOfTheDay, getRandomQuote, type Quote } from '../../lib/quotes';
import { getChosenTracks, getFavorites, getStreak, recordOpen, toggleFavorite } from '../../lib/storage';
import { refreshQuoteLiveActivity } from '../../lib/liveActivity';

export default function Today() {
  const { t, lang } = useStrings();
  const [tracks, setTracks] = useState<TrackId[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [streak, setStreak] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const shotRef = useRef<ShotHandle | null>(null);

  const load = useCallback(async () => {
    const l = getLanguage();
    const tr = await getChosenTracks();
    setTracks(tr);
    const q = await getQuoteOfTheDay(l, tr);
    setQuote(q);
    setStreak(await recordOpen());
    if (q) {
      setIsFav((await getFavorites()).includes(q.id));
      await refreshQuoteLiveActivity(q);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load, lang]);

  const newQuote = async () => {
    const q = await getRandomQuote(getLanguage(), tracks, quote?.id);
    if (!q) return;
    setQuote(q);
    setIsFav((await getFavorites()).includes(q.id));
  };

  const onFavorite = async () => {
    if (!quote) return;
    setIsFav(await toggleFavorite(quote.id));
  };

  const onShare = async () => {
    try {
      const uri = await shotRef.current?.capture?.();
      if (uri && (await Sharing.isAvailableAsync())) {
        await Sharing.shareAsync(uri);
      }
    } catch {
      // share cancelled or unavailable — non-fatal
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <Text style={styles.brand}>{BRAND.SHORT_NAME.toUpperCase()}</Text>
          <View style={styles.streak}>
            <Ionicons name="flame" size={16} color="#f5a623" />
            <Text style={styles.streakText}>{t('today.streakDays', { n: streak })}</Text>
          </View>
        </View>

        <Text style={styles.label}>{t('today.quoteOfTheDay')}</Text>

        {quote ? (
          <QuoteCard quote={quote} shotRef={shotRef} />
        ) : (
          <View style={styles.empty} />
        )}

        <View style={styles.actions}>
          <Pressable style={styles.btn} onPress={newQuote}>
            <Ionicons name="refresh" size={20} color="#000" />
            <Text style={styles.btnText}>{t('today.newQuote')}</Text>
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={onFavorite} accessibilityRole="button">
            <Ionicons name={isFav ? 'heart' : 'heart-outline'} size={24} color={isFav ? '#ff4d6d' : '#fff'} />
          </Pressable>
          <Pressable style={styles.iconBtn} onPress={onShare} accessibilityRole="button">
            <Ionicons name="share-outline" size={24} color="#fff" />
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 16 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { color: '#666', fontSize: 13, fontWeight: '800', letterSpacing: 3 },
  streak: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#1a1a1a', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  streakText: { color: '#fff', fontSize: 13, fontWeight: '700' },
  label: { color: '#999', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  empty: { height: 420 },
  actions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  btn: { flex: 1, flexDirection: 'row', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnText: { color: '#000', fontSize: 16, fontWeight: '800' },
  iconBtn: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
});
