import * as React from 'react';
import { View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/** Full-screen black container with safe-area handling. */
export function Screen({ style, children, ...rest }: ViewProps) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#000000' }} edges={['top', 'bottom']}>
      <View style={[{ flex: 1, backgroundColor: '#000000' }, style]} {...rest}>
        {children}
      </View>
    </SafeAreaView>
  );
}
