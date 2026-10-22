import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';
import { useTheme } from '../lib/themeContext';
import { withAlpha } from '../lib/themes';

/**
 * Liquid Glass container with graceful fallback.
 * iOS 26+: true Liquid Glass. Everywhere else: dark translucent card.
 */
export function Glass({ style, children, ...rest }: ViewProps) {
  const { palette } = useTheme();
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme="dark" style={style} {...rest}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[{ backgroundColor: withAlpha(palette.surface, 0.78) }, style]} {...rest}>
      {children}
    </View>
  );
}
