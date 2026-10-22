import { Platform, StyleSheet, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

let GlassView: any = null;
let glassAvailable = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('expo-glass-effect');
  GlassView = mod.GlassView;
  glassAvailable =
    typeof mod.isLiquidGlassAvailable === 'function'
      ? mod.isLiquidGlassAvailable()
      : Platform.OS === 'ios';
} catch {
  glassAvailable = false;
}

/**
 * Liquid Glass tab-bar background (iOS 26+). Falls back to a layered
 * frosted-glass look (blur + light sheen + edge highlight) on older
 * iOS / Android / web so the bar always reads as glass.
 */
export function GlassTabBackground() {
  if (glassAvailable && GlassView) {
    return (
      <GlassView
        glassEffectStyle="regular"
        // Neutral dark tint ONLY. Build 18 used rgba(40,10,60,0.5) — a
        // heavy purple wash that read on device as a flat dark slab,
        // not glass ("no Liquid Glass" field report). A light neutral
        // tint lets the material refract the content scrolling beneath
        // the bar, which is what makes it read as Liquid Glass.
        tintColor="rgba(22,22,25,0.32)"
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return (
    <View style={StyleSheet.absoluteFill}>
      <BlurView
        intensity={85}
        tint="dark"
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(18,18,21,0.42)' }]}
      />
      {/* Light sheen catching the top of the glass */}
      <LinearGradient
        colors={['rgba(255,255,255,0.14)', 'rgba(255,255,255,0.02)', 'transparent']}
        locations={[0, 0.45, 1]}
        style={StyleSheet.absoluteFill}
      />
      {/* Crisp glass edge highlight */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: 'rgba(255,255,255,0.28)',
        }}
      />
    </View>
  );
}
