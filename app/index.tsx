import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Redirect } from 'expo-router';
import { hasOnboarded } from '../lib/storage';

export default function Index() {
  const [dest, setDest] = useState<'/(tabs)' | '/onboarding' | null>(null);

  useEffect(() => {
    hasOnboarded().then((o) => setDest(o ? '/(tabs)' : '/onboarding'));
  }, []);

  if (!dest) return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  return <Redirect href={dest} />;
}
