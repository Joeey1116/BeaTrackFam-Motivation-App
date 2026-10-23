import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/themeContext';
import type { ThemePalette } from '../lib/themes';
import { useStrings } from '../lib/i18n';

interface Props {
  onComplete: (exerciseId: string, minutes: number) => void;
  onClose: () => void;
}

interface Exercise {
  id: string;
  /** Locale key under breathe.exercises (id '478' is not a valid key start). */
  key: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
}

const EXERCISES: Exercise[] = [
  { id: 'box', key: 'box', inhale: 4, hold: 4, exhale: 4, cycles: 4 },
  { id: '478', key: 'f478', inhale: 4, hold: 7, exhale: 8, cycles: 3 },
  { id: 'calm', key: 'calm', inhale: 5, hold: 2, exhale: 5, cycles: 5 },
];

/**
 * Guided breathing exercises with animated circle.
 * Completing a session logs mindful minutes (future HealthKit write).
 */
export function Breathe({ onComplete, onClose }: Props) {
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [selected, setSelected] = useState<Exercise | null>(null);
  const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale' | 'done'>('inhale');
  const [cycle, setCycle] = useState(1);
  const [running, setRunning] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const phaseRef = useRef(phase);
  phaseRef.current = phase;

  const startExercise = (ex: Exercise) => {
    setSelected(ex);
    setPhase('inhale');
    setCycle(1);
    setRunning(true);
  };

  useEffect(() => {
    if (!running || !selected) return;

    const runPhase = () => {
      const ex = selected;
      const currentPhase = phaseRef.current;

      if (currentPhase === 'inhale') {
        setPhase('inhale');
        Animated.timing(scale, {
          toValue: 1.5,
          duration: ex.inhale * 1000,
          useNativeDriver: true,
        }).start(() => {
          if (ex.hold > 0) {
            setPhase('hold');
            setTimeout(() => {
              setPhase('exhale');
              Animated.timing(scale, {
                toValue: 1,
                duration: ex.exhale * 1000,
                useNativeDriver: true,
              }).start(() => {
                if (cycle < ex.cycles) {
                  setCycle((c) => c + 1);
                  setPhase('inhale');
                } else {
                  setPhase('done');
                  setRunning(false);
                  const minutes = Math.round(
                    ((ex.inhale + ex.hold + ex.exhale) * ex.cycles) / 60
                  );
                  onComplete(ex.id, Math.max(1, minutes));
                }
              });
            }, ex.hold * 1000);
          }
        });
      }
    };

    if (phase === 'inhale') {
      runPhase();
    }
  }, [running, selected, phase, cycle]);

  if (!selected) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('breathe.title')}</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color={palette.text} />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          {t('breathe.subtitle')}
        </Text>
        {EXERCISES.map((ex) => (
          <Pressable key={ex.id} onPress={() => startExercise(ex)} style={styles.card}>
            <Text style={styles.cardName}>{t(`breathe.exercises.${ex.key}.name`)}</Text>
            <Text style={styles.cardDesc}>{t(`breathe.exercises.${ex.key}.desc`)}</Text>
            <Text style={styles.cardMeta}>
              {t('breathe.roundsMeta', {
                rounds: ex.cycles,
                min: Math.round(((ex.inhale + ex.hold + ex.exhale) * ex.cycles) / 60),
              })}
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  const phaseText = {
    inhale: t('breathe.inhale'),
    hold: t('breathe.hold'),
    exhale: t('breathe.exhale'),
    done: t('breathe.complete'),
  }[phase];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t(`breathe.exercises.${selected.key}.name`)}</Text>
        <Pressable onPress={() => { setRunning(false); setSelected(null); scale.setValue(1); }} hitSlop={12}>
          <Ionicons name="close" size={24} color={palette.text} />
        </Pressable>
      </View>

      {phase === 'done' ? (
        <View style={styles.doneWrap}>
          <Ionicons name="checkmark-circle" size={64} color={palette.text} />
          <Text style={styles.doneTitle}>{t('breathe.doneTitle')}</Text>
          <Text style={styles.doneText}>
            {t('breathe.doneText')}
          </Text>
          <Pressable onPress={() => { setSelected(null); scale.setValue(1); }} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>{t('breathe.done')}</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.breatheWrap}>
          <Text style={styles.cycleText}>
            {t('breathe.roundOf', { cycle, total: selected.cycles })}
          </Text>
          <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <Text style={styles.phaseText}>{phaseText}</Text>
          </Animated.View>
          <Pressable
            onPress={() => { setRunning(false); setSelected(null); scale.setValue(1); }}
            style={styles.stopBtn}
          >
            <Text style={styles.stopText}>{t('breathe.endSession')}</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: p.text,
  },
  subtitle: {
    fontSize: 14,
    color: p.textDim,
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.border,
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: p.text,
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: p.textDim,
    marginBottom: 8,
    lineHeight: 20,
  },
  cardMeta: {
    fontSize: 12,
    color: p.textDim,
  },
  breatheWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  cycleText: {
    fontSize: 14,
    color: p.textDim,
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: p.surface,
    borderWidth: 2,
    borderColor: p.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    color: p.text,
  },
  stopBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  stopText: {
    fontSize: 14,
    color: p.textDim,
  },
  doneWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
    padding: 20,
  },
  doneTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: p.text,
  },
  doneText: {
    fontSize: 16,
    color: p.textDim,
    textAlign: 'center',
    lineHeight: 24,
  },
  doneBtn: {
    backgroundColor: p.button,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 12,
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: p.buttonText,
  },
  });
}
