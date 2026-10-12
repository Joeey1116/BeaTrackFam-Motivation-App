import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { trackName } from '../lib/i18n';
import { getTheme } from '../lib/themes';
import type { Quote } from '../lib/quotes';

interface Props {
  quote: Quote;
  themeId: string;
  streak: number;
  heartsToday: number;
  isFav: boolean;
  onFavorite: () => void;
  onShare: () => void;
  onNewQuote: () => void;
}

/**
 * Immersive full-screen quote experience.
 * BeaTrackFam black/white aesthetic — original, not copied from any app.
 */
export function ImmersiveQuote({
  quote,
  themeId,
  streak,
  heartsToday,
  isFav,
  onFavorite,
  onShare,
  onNewQuote,
}: Props) {
  const theme = getTheme(themeId);
  const primaryTrack = quote.tracks[0];

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.bg} style={StyleSheet.absoluteFill} />

      {/* Top: streak + hearts progress */}
      <View style={styles.topRow}>
        <View style={styles.streakBadge}>
          <Ionicons name="flame" size={16} color={theme.accent} />
          <Text style={[styles.streakText, { color: theme.text }]}>{streak}</Text>
        </View>
        <View style={styles.heartsRow}>
          {[0, 1, 2, 3, 4].map((i) => (
            <Ionicons
              key={i}
              name={i < heartsToday ? 'heart' : 'heart-outline'}
              size={18}
              color={i < heartsToday ? '#ff4d6d' : theme.muted}
            />
          ))}
        </View>
      </View>

      {/* Center: quote */}
      <View style={styles.quoteWrap}>
        <Text style={[styles.track, { color: theme.accent }]}>
          {trackName(primaryTrack).toUpperCase()}
        </Text>
        <Text style={[styles.quote, { color: theme.text }]}>{quote.text}</Text>
        <Text style={[styles.brand, { color: theme.muted }]}>HUSTLE & HEART</Text>
      </View>

      {/* Bottom: actions */}
      <View style={styles.actions}>
        <Pressable onPress={onShare} style={styles.actionBtn} hitSlop={12}>
          <Ionicons name="share-outline" size={28} color={theme.text} />
        </Pressable>
        <Pressable onPress={onNewQuote} style={styles.newQuoteBtn}>
          <Ionicons name="refresh" size={20} color="#000" />
          <Text style={styles.newQuoteText}>New quote</Text>
        </Pressable>
        <Pressable onPress={onFavorite} style={styles.actionBtn} hitSlop={12}>
          <Ionicons
            name={isFav ? 'heart' : 'heart-outline'}
            size={28}
            color={isFav ? '#ff4d6d' : theme.text}
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  streakText: {
    fontSize: 15,
    fontWeight: '700',
  },
  heartsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  quoteWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  track: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 3,
    marginBottom: 20,
  },
  quote: {
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    lineHeight: 38,
  },
  brand: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 2,
    marginTop: 24,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingBottom: 32,
    paddingHorizontal: 20,
  },
  actionBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newQuoteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#fff',
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 30,
  },
  newQuoteText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
  },
});
