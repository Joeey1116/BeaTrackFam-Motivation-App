import { useCallback, useState } from 'react';
import { View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { MusicPlayer } from '../../components/MusicPlayer';
import { getPlan } from '../../lib/storage';

/**
 * Music room — calming tracks by genre.
 */
export default function Music() {
  const [isHavenPlus, setIsHavenPlus] = useState(false);

  const load = useCallback(async () => {
    const plan = await getPlan();
    setIsHavenPlus(plan === 'haven-plus');
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <MusicPlayer isHavenPlus={isHavenPlus} />
    </View>
  );
}
