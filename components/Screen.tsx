import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

/** Floating Liquid Glass tab bar clearance */
export const TAB_BAR_CLEARANCE = 100;

/** Full-screen black container with safe-area handling + tab bar clearance. */
export function Screen({ style, children, ...rest }: ViewProps) {
  const insets = useSafeAreaInsets();
  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: '#000000' }}
      edges={['top', 'left', 'right']}
    >
      <View
        style={[
          { flex: 1, backgroundColor: '#000000', paddingBottom: insets.bottom + TAB_BAR_CLEARANCE },
          style,
        ]}
        {...rest}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}
