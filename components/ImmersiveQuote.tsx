import * as React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { trackName } from '../lib/i18n';
import { getTheme } from '../lib/themes';
import { Type } from '../lib/design';
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
  const insets = useSafeAreaInsets();
  // Floating Liquid Glass tab bar needs generous clearance
  const TAB_BAR_CLEARANCE = 110;

  return (
    <View style={styles.container}>
      <LinearGradient colors={theme.bg} style={StyleSheet.absoluteFill} />

      {/* Top: streak + hearts progress — both tappable */}
      <View style={[styles.topRow, { paddingTop: insets.top + 12 }]}>
        <Pressable
          onPress={() => router.push('/(tabs)/companion')}
          style={styles.streakBadge}
          hitSlop={10}
        >
          <Ionicons name="flame" size={16} color={theme.accent} />
          <Text style={[styles.streakText, { color: theme.text }]}>{streak}</Text>
        </Pressable>
        <View style={styles.topRight}>
          <Pressable
            onPress={() => router.push('/(tabs)/favorites')}
            style={styles.heartsRow}
            hitSlop={10}
          >
            {[0, 1, 2, 3, 4].map((i) => (
              <Ionicons
                key={i}
                name={i < heartsToday ? 'heart' : 'heart-outline'}
                size={18}
                color={i < heartsToday ? '#ff4d6d' : theme.muted}
              />
            ))}
          </Pressable>
          {/* Music lives on its own screen (/music) — build 18 moved it
              out of Settings; this is its home-tab entry point. */}
          <Pressable
            onPress={() => router.push('/music')}
            style={styles.streakBadge}
            hitSlop={10}
            accessibilityLabel="Open Music"
          >
            <Ionicons name="musical-notes" size={16} color={theme.accent} />
          </Pressable>
        </View>
      </View>

      {/* Center: quote */}
      <View style={styles.quoteWrap}>
        <Text style={[styles.track, { color: theme.accent }]}>
          {trackName(primaryTrack).toUpperCase()}
        </Text>
        <Text style={[styles.quote, { color: theme.text }]}>{quote.text}</Text>
        <Text style={[styles.brand, { color: theme.muted }]}>HUSTLE &amp; HEART</Text>
      </View>

      {/* Bottom: actions — clear of the floating tab bar */}
      <View style={[styles.actions, { paddingBottom: insets.bottom + TAB_BAR_CLEARANCE }]}>
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
  topRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quoteWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  track: {
    ...Type.eyebrow,
    marginBottom: 20,
  },
  quote: {
    ...Type.display,
    textAlign: 'center',
  },
  brand: {
    ...Type.eyebrow,
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
