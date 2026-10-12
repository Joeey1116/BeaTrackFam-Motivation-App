import { Platform, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';

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
 * Liquid Glass tab-bar background (iOS 26+). Falls back to a frosted
 * blur on older iOS / Android / web so the bar always looks glassy.
 */
export function GlassTabBackground() {
  if (glassAvailable && GlassView) {
    return (
      <GlassView
        glassEffectStyle="regular"
        tintColor="rgba(40,10,60,0.5)"
        style={StyleSheet.absoluteFill}
      />
    );
  }
  return (
    <BlurView
      intensity={80}
      tint="dark"
      style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(20,8,28,0.45)' }]}
    />
  );
}
