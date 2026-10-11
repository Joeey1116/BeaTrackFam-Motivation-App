import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ShotHandle } from '../../components/QuoteCard';
import { Screen } from '../../components/Screen';
import { QuoteCard } from '../../components/QuoteCard';
import { getLanguage, useStrings } from '../../lib/i18n';
import { getQuoteOfTheDay, type Quote } from '../../lib/quotes';
import { getChosenTracks } from '../../lib/storage';

/** Deep-link target: hustleandheart://quote/today (notification + Live Activity taps). */
export default function QuoteToday() {
  const { t } = useStrings();
  const [quote, setQuote] = useState<Quote | null>(null);
  const shotRef = useRef<ShotHandle | null>(null);

  useEffect(() => {
    (async () => {
      setQuote(await getQuoteOfTheDay(getLanguage(), await getChosenTracks()));
    })();
  }, []);

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </Pressable>
        <Text style={styles.label}>{t('today.quoteOfTheDay')}</Text>
        {quote ? <QuoteCard quote={quote} shotRef={shotRef} /> : <View style={styles.empty} />}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 16 },
  back: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  label: { color: '#999', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
  empty: { height: 420 },
});
