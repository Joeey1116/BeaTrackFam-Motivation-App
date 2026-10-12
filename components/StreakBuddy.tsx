import { StyleSheet, Text, View } from 'react-native';

interface Props {
  streak: number;
  plantType?: 'sprout' | 'sunflower' | 'oak' | 'succulent';
}

/**
 * Living streak companion — grows as your streak builds.
 * Seed → Sprout → Sapling → Tree → Flourishing.
 * Never dies, never guilts. Just waits for you.
 */
export function StreakBuddy({ streak, plantType = 'sprout' }: Props) {
  const stage = getStage(streak);
  const emoji = getEmoji(stage, plantType);
  const message = getMessage(stage, streak);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.stage}>{stage}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.streak}>{streak} day{streak === 1 ? '' : 's'} strong</Text>
    </View>
  );
}

function getStage(streak: number): string {
  if (streak === 0) return 'Seed';
  if (streak <= 2) return 'Sprout';
  if (streak <= 6) return 'Seedling';
  if (streak <= 13) return 'Sapling';
  if (streak <= 29) return 'Young Tree';
  if (streak <= 59) return 'Tree';
  return 'Flourishing';
}

function getEmoji(stage: string, plantType: string): string {
  const map: Record<string, Record<string, string>> = {
    sprout: {
      'Seed': '🌰', 'Sprout': '🌱', 'Seedling': '🌿',
      'Sapling': '🪴', 'Young Tree': '🌳', 'Tree': '🌳', 'Flourishing': '🌲',
    },
    sunflower: {
      'Seed': '🌰', 'Sprout': '🌱', 'Seedling': '🌿',
      'Sapling': '🌻', 'Young Tree': '🌻', 'Tree': '🌻', 'Flourishing': '🌻',
    },
    oak: {
      'Seed': '🌰', 'Sprout': '🌱', 'Seedling': '🌿',
      'Sapling': '🪴', 'Young Tree': '🌳', 'Tree': '🌳', 'Flourishing': '🌳',
    },
    succulent: {
      'Seed': '🌰', 'Sprout': '🌱', 'Seedling': '🌵',
      'Sapling': '🌵', 'Young Tree': '🌵', 'Tree': '🌵', 'Flourishing': '🌵',
    },
  };
  return map[plantType]?.[stage] ?? '🌱';
}

function getMessage(stage: string, streak: number): string {
  if (streak === 0) return 'Your buddy is waiting. Open the app tomorrow to plant the seed.';
  if (stage === 'Sprout') return 'Look — it\'s sprouting! Keep showing up.';
  if (stage === 'Seedling') return 'Growing strong. You\'re doing this.';
  if (stage === 'Sapling') return 'A whole week! Your buddy is thriving.';
  if (stage === 'Young Tree') return 'Two weeks of showing up. That\'s real.';
  if (stage === 'Tree') return 'A month. Look how far you\'ve come.';
  return 'Flourishing — just like you.';
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    gap: 8,
  },
  emoji: {
    fontSize: 64,
  },
  stage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
  },
  message: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },
  streak: {
    fontSize: 13,
    color: '#555',
    fontWeight: '600',
  },
});
