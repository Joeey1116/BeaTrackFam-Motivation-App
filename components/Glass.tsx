import * as React from 'react';
import { Platform, View, type ViewProps } from 'react-native';
import { GlassView, isLiquidGlassAvailable } from 'expo-glass-effect';

/**
 * Liquid Glass container with graceful fallback.
 * iOS 26+: true Liquid Glass. Everywhere else: dark translucent card.
 */
export function Glass({ style, children, ...rest }: ViewProps) {
  if (Platform.OS === 'ios' && isLiquidGlassAvailable()) {
    return (
      <GlassView glassEffectStyle="regular" colorScheme="dark" style={style} {...rest}>
        {children}
      </GlassView>
    );
  }
  return (
    <View style={[{ backgroundColor: 'rgba(30,30,32,0.78)' }, style]} {...rest}>
      {children}
    </View>
  );
}
