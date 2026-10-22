import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { hasOnboarded } from '../lib/storage';
import { useTheme } from '../lib/themeContext';

export default function Index() {
  const { palette } = useTheme();
  const [dest, setDest] = useState<'/(tabs)' | '/onboarding' | null>(null);

  useEffect(() => {
    hasOnboarded().then((o) => setDest(o ? '/(tabs)' : '/onboarding'));
  }, []);

  if (!dest) return <View style={{ flex: 1, backgroundColor: palette.background }} />;
  return <Redirect href={dest} />;
}
