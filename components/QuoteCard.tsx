import * as React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import ViewShot, { type ViewShotRef } from 'react-native-view-shot';

export type ShotHandle = ViewShotRef;
import { BRAND } from '../lib/brand';
import type { ThemePalette } from '../lib/themes';
import { useTheme } from '../lib/themeContext';
import { trackName, useStrings } from '../lib/i18n';
import type { Quote } from '../lib/quotes';

interface Props {
  quote: Quote;
  shotRef: React.RefObject<ShotHandle | null>;
}

/**
 * The signature full-screen typography card: black, white bold condensed type,
 * neutral sunrise mark. Wrapped in ViewShot so it can be exported as a share image.
 */
export const QuoteCard = React.forwardRef<ShotHandle | null, Props>(function QuoteCard(
  { quote, shotRef },
  _ref,
) {
  const { t } = useStrings();
  const { theme, palette } = useTheme();
  const styles = React.useMemo(() => createStyles(palette), [palette]);
  const primaryTrack = quote.tracks[0];
  return (
    <ViewShot
      ref={shotRef}
      options={{ format: 'png', quality: 1 }}
      style={styles.shot}
    >
      <LinearGradient colors={theme.bg} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }} style={styles.card}>
        <View style={styles.header}>
          <Image source={require('../assets/mark.png')} style={styles.mark} resizeMode="contain" />
          <Text style={styles.track}>{trackName(primaryTrack).toUpperCase()}</Text>
        </View>
        <Text style={styles.quote}>{quote.text}</Text>
        <View style={styles.footer}>
          <Text style={styles.brand}>{BRAND.SHORT_NAME.toUpperCase()}</Text>
          {quote.fallback === true ? <Text style={styles.fallback}>{t('today.fallbackNote')}</Text> : null}
        </View>
      </LinearGradient>
    </ViewShot>
  );
});

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    shot: { width: '100%' },
    card: {
      borderColor: p.border,
      borderRadius: 24,
      borderWidth: 1,
      minHeight: 420,
      padding: 28,
      justifyContent: 'space-between',
    },
    header: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    mark: { width: 34, height: 34 },
    track: { color: p.textDim, fontSize: 12, fontWeight: '700', letterSpacing: 3 },
    quote: {
      color: p.text,
      fontSize: 30,
      fontWeight: '800',
      letterSpacing: -0.5,
      lineHeight: 42,
      marginVertical: 24,
    },
    footer: { gap: 8 },
    brand: { color: p.textDim, fontSize: 12, fontWeight: '800', letterSpacing: 4 },
    fallback: { color: p.textDim, fontSize: 11, fontStyle: 'italic' },
  });
}
