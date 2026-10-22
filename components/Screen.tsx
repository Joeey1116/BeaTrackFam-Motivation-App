import * as React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/themeContext';

/** Floating glass tab bar clearance */
export const TAB_BAR_CLEARANCE = 100;

/**
 * Full-screen container with safe-area handling + tab bar clearance.
 * Build 20: the backdrop is the SELECTED THEME's gradient (was a
 * hardcoded black), so a theme choice recolors every screen that sits
 * on Screen — settings stack, account, music, legal, pickers.
 */
export function Screen({ style, children, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();
  const { theme, palette } = useTheme();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: palette.background }}
      edges={['top', 'left', 'right']}
    >
      <LinearGradient
        colors={theme.bg}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        style={[
          { flex: 1, paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
