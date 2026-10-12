import { useCallback, useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import * as Sharing from 'expo-sharing';
import type { ShotHandle } from '../../components/QuoteCard';
import { ImmersiveQuote } from '../../components/ImmersiveQuote';
import { QuoteCard } from '../../components/QuoteCard';
import { type TrackId } from '../../lib/brand';
import { getLanguage, useStrings } from '../../lib/i18n';
import { getQuoteOfTheDay, getRandomQuote, type Quote } from '../../lib/quotes';
import {
  getChosenTracks,
  getFavorites,
  getStreak,
  getThemeId,
  recordOpen,
  toggleFavorite,
} from '../../lib/storage';
import { refreshQuoteLiveActivity } from '../../lib/liveActivity';

export default function Today() {
  const { lang } = useStrings();
  const [tracks, setTracks] = useState<TrackId[]>([]);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [streak, setStreak] = useState(0);
  const [isFav, setIsFav] = useState(false);
  const [themeId, setThemeId] = useState('midnight');
  const [heartsToday, setHeartsToday] = useState(0);
  const shotRef = useRef<ShotHandle | null>(null);

  const load = useCallback(async () => {
    const l = getLanguage();
    const tr = await getChosenTracks();
    setTracks(tr);
    const q = await getQuoteOfTheDay(l, tr);
    setQuote(q);
    setStreak(await recordOpen());
    setThemeId(await getThemeId());
    if (q) {
      const favs = await getFavorites();
      setIsFav(favs.includes(q.id));
      setHeartsToday(Math.min(favs.length, 5));
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
    const fav = await toggleFavorite(quote.id);
    setIsFav(fav);
    setHeartsToday(Math.min((await getFavorites()).length, 5));
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

  if (!quote) {
    return <View style={styles.loading} />;
  }

  return (
    <View style={styles.container}>
      <ImmersiveQuote
        quote={quote}
        themeId={themeId}
        streak={streak}
        heartsToday={heartsToday}
        isFav={isFav}
        onFavorite={onFavorite}
        onShare={onShare}
        onNewQuote={newQuote}
      />
      {/* Hidden share card for image export */}
      <View style={styles.hidden}>
        <QuoteCard quote={quote} shotRef={shotRef} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  loading: {
    flex: 1,
    backgroundColor: '#000',
  },
  hidden: {
    position: 'absolute',
    left: -10000,
    top: 0,
    width: 400,
  },
});
