import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../lib/themeContext';
import { useStrings } from '../lib/i18n';
import type { ThemePalette } from '../lib/themes';

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
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const stage = getStage(streak);
  const emoji = getEmoji(stage, plantType);
  const message =
    streak === 0 ? t('buddy.messages.waiting') : t(`buddy.messages.${stage}`);

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>{emoji}</Text>
      <Text style={styles.stage}>{t(`buddy.stages.${stage}`)}</Text>
      <Text style={styles.message}>{message}</Text>
      <Text style={styles.streak}>
        {streak === 1
          ? t('buddy.daysStrongOne')
          : t('buddy.daysStrongMany', { n: streak })}
      </Text>
    </View>
  );
}

type StageId = 'seed' | 'sprout' | 'seedling' | 'sapling' | 'youngTree' | 'tree' | 'flourishing';

function getStage(streak: number): StageId {
  if (streak === 0) return 'seed';
  if (streak <= 2) return 'sprout';
  if (streak <= 6) return 'seedling';
  if (streak <= 13) return 'sapling';
  if (streak <= 29) return 'youngTree';
  if (streak <= 59) return 'tree';
  return 'flourishing';
}

function getEmoji(stage: StageId, plantType: string): string {
  const map: Record<string, Record<StageId, string>> = {
    sprout: {
      seed: '🌰', sprout: '🌱', seedling: '🌿',
      sapling: '🪴', youngTree: '🌳', tree: '🌳', flourishing: '🌲',
    },
    sunflower: {
      seed: '🌰', sprout: '🌱', seedling: '🌿',
      sapling: '🌻', youngTree: '🌻', tree: '🌻', flourishing: '🌻',
    },
    oak: {
      seed: '🌰', sprout: '🌱', seedling: '🌿',
      sapling: '🪴', youngTree: '🌳', tree: '🌳', flourishing: '🌳',
    },
    succulent: {
      seed: '🌰', sprout: '🌱', seedling: '🌵',
      sapling: '🌵', youngTree: '🌵', tree: '🌵', flourishing: '🌵',
    },
  };
  return map[plantType]?.[stage] ?? '🌱';
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
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
    color: p.text,
  },
  message: {
    fontSize: 14,
    color: p.textDim,
    textAlign: 'center',
    lineHeight: 20,
  },
  streak: {
    fontSize: 13,
    color: p.textDim,
    fontWeight: '600',
  },
  });
}
