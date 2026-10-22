import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import type { ShotHandle } from '../../components/QuoteCard';
import { Screen } from '../../components/Screen';
import { QuoteCard } from '../../components/QuoteCard';
import { getLanguage, useStrings } from '../../lib/i18n';
import { getQuoteOfTheDay, type Quote } from '../../lib/quotes';
import { getChosenTracks } from '../../lib/storage';
import type { ThemePalette } from '../../lib/themes';
import { useTheme } from '../../lib/themeContext';

/** Deep-link target: hustleandheart://quote/today (notification + Live Activity taps). */
export default function QuoteToday() {
  const { t } = useStrings();
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
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
          <Ionicons name="arrow-back" size={24} color={palette.text} />
        </Pressable>
        <Text style={styles.label}>{t('today.quoteOfTheDay')}</Text>
        {quote ? <QuoteCard quote={quote} shotRef={shotRef} /> : <View style={styles.empty} />}
      </ScrollView>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    body: { padding: 20, gap: 16 },
    back: { width: 44, height: 44, borderRadius: 22, backgroundColor: p.surface, alignItems: 'center', justifyContent: 'center' },
    label: { color: p.textDim, fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase' },
    empty: { height: 420 },
  });
}
