import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Radius, Spacing, Type } from '../../lib/design';
import { useTheme } from '../../lib/themeContext';
import type { ThemePalette } from '../../lib/themes';
import { getLanguage, trackDesc, trackName, useStrings } from '../../lib/i18n';
import { getQuotes, getQuotesByTrack, type Quote } from '../../lib/quotes';
import { getChosenTracks, getFavorites, toggleFavorite } from '../../lib/storage';
import type { TrackId } from '../../lib/brand';

type Segment = 'browse' | 'saved';

export default function Browse() {
  const { t, lang } = useStrings();
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [segment, setSegment] = useState<Segment>('browse');
  const [tracks, setTracks] = useState<TrackId[]>([]);
  const [active, setActive] = useState<TrackId | null>(null);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [favs, setFavs] = useState<string[]>([]);
  const [savedQuotes, setSavedQuotes] = useState<Quote[]>([]);

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

  useEffect(() => {
    if (segment !== 'saved') return;
    (async () => {
      const favIds = await getFavorites();
      const all = await getQuotes(getLanguage(), await getChosenTracks());
      setSavedQuotes(all.filter((q) => favIds.includes(q.id)));
    })();
  }, [segment, lang]);

  const onFav = async (id: string) => {
    await toggleFavorite(id);
    const updated = await getFavorites();
    setFavs(updated);
    if (segment === 'saved') {
      const all = await getQuotes(getLanguage(), await getChosenTracks());
      setSavedQuotes(all.filter((q) => updated.includes(q.id)));
    }
  };

  const renderQuoteCard = (q: Quote, showTrack = false) => (
    <Glass key={q.id} style={styles.card}>
      {showTrack ? <Text style={styles.track}>{trackName(q.tracks[0]).toUpperCase()}</Text> : null}
      <Text style={styles.quote}>{q.text}</Text>
      {q.fallback === true ? <Text style={styles.fallback}>{t('today.fallbackNote')}</Text> : null}
      <Pressable onPress={() => onFav(q.id)} style={styles.favRow}>
        <Ionicons
          name={favs.includes(q.id) ? 'heart' : 'heart-outline'}
          size={20}
          color={favs.includes(q.id) ? '#ff4d6d' : palette.textDim}
        />
      </Pressable>
    </Glass>
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{t('browse.title')}</Text>
        <View style={styles.segments}>
          {(['browse', 'saved'] as Segment[]).map((s) => (
            <Pressable key={s} onPress={() => setSegment(s)} style={[styles.segment, segment === s && styles.segmentActive]}>
              <Text style={[styles.segmentText, segment === s && styles.segmentTextActive]}>
                {s === 'browse' ? t('browse.title') : t('favorites.title')}
              </Text>
            </Pressable>
          ))}
        </View>
        {segment === 'browse' ? (
          <>
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
              {quotes.map((q) => renderQuoteCard(q))}
            </View>
          </>
        ) : savedQuotes.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="heart-outline" size={48} color={palette.border} />
            <Text style={styles.emptyText}>{t('favorites.empty')}</Text>
          </View>
        ) : (
          <View style={styles.list}>
            {savedQuotes.map((q) => renderQuoteCard(q, true))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
  // paddingBottom clears the floating tab bar so the
  // last cards can scroll up past it instead of hiding behind it.
  body: { padding: Spacing.lg, paddingBottom: 120, gap: Spacing.md },
  h1: { ...Type.display, color: p.text },
  segments: { flexDirection: 'row', backgroundColor: p.surface, borderRadius: Radius.pill, padding: 4, gap: 4 },
  segment: { flex: 1, borderRadius: Radius.pill, paddingVertical: Spacing.sm, alignItems: 'center' },
  segmentActive: { backgroundColor: p.button },
  segmentText: { ...Type.body, color: p.textDim, fontWeight: '700' },
  segmentTextActive: { color: p.buttonText },
  chips: { gap: Spacing.sm, paddingVertical: Spacing.xs },
  chip: { backgroundColor: p.surface, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm, borderWidth: 1, borderColor: p.border },
  chipActive: { backgroundColor: p.button, borderColor: p.button },
  chipText: { ...Type.body, color: p.textDim, fontWeight: '700' },
  chipTextActive: { color: p.buttonText },
  desc: { ...Type.body, color: p.textDim },
  list: { gap: Spacing.sm },
  card: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: p.border, gap: Spacing.sm },
  quote: { color: p.text, fontSize: 17, fontWeight: '600', lineHeight: 26 },
  fallback: { color: p.textDim, fontSize: 11, fontStyle: 'italic' },
  favRow: { alignSelf: 'flex-end', padding: Spacing.xs },
  empty: { alignItems: 'center', justifyContent: 'center', gap: Spacing.md, paddingTop: 60 },
  emptyText: { ...Type.title, color: p.textDim, fontWeight: '400', textAlign: 'center', lineHeight: 22, paddingHorizontal: Spacing.xl },
  track: { ...Type.eyebrow, color: p.textDim, letterSpacing: 2 },
  });
}
