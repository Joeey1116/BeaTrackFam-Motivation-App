import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onComplete: (exerciseId: string, minutes: number) => void;
  onClose: () => void;
}

interface Exercise {
  id: string;
  name: string;
  desc: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
}

const EXERCISES: Exercise[] = [
  {
    id: 'box',
    name: 'Box Breathing',
    desc: 'Calm your nervous system. Used by Navy SEALs.',
    inhale: 4, hold: 4, exhale: 4, cycles: 4,
  },
  {
    id: '478',
    name: '4-7-8 Breathing',
    desc: 'Melt away anxiety and prepare for rest.',
    inhale: 4, hold: 7, exhale: 8, cycles: 3,
  },
  {
    id: 'calm',
    name: 'Deep Calm',
    desc: 'Slow, gentle breaths to center yourself.',
    inhale: 5, hold: 2, exhale: 5, cycles: 5,
  },
];

/**
 * Guided breathing exercises with animated circle.
 * Completing a session logs mindful minutes (future HealthKit write).
 */
export function Breathe({ onComplete, onClose }: Props) {
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
          <Text style={styles.title}>Breathe</Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        </View>
        <Text style={styles.subtitle}>
          A few minutes of breathing can shift your whole day.
        </Text>
        {EXERCISES.map((ex) => (
          <Pressable key={ex.id} onPress={() => startExercise(ex)} style={styles.card}>
            <Text style={styles.cardName}>{ex.name}</Text>
            <Text style={styles.cardDesc}>{ex.desc}</Text>
            <Text style={styles.cardMeta}>
              {ex.cycles} rounds · ~{Math.round(((ex.inhale + ex.hold + ex.exhale) * ex.cycles) / 60)} min
            </Text>
          </Pressable>
        ))}
      </View>
    );
  }

  const phaseText = {
    inhale: 'Breathe in...',
    hold: 'Hold...',
    exhale: 'Breathe out...',
    done: 'Complete',
  }[phase];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{selected.name}</Text>
        <Pressable onPress={() => { setRunning(false); setSelected(null); scale.setValue(1); }} hitSlop={12}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>

      {phase === 'done' ? (
        <View style={styles.doneWrap}>
          <Ionicons name="checkmark-circle" size={64} color="#fff" />
          <Text style={styles.doneTitle}>Beautiful.</Text>
          <Text style={styles.doneText}>
            You just gave yourself a moment of calm. That's strength.
          </Text>
          <Pressable onPress={() => { setSelected(null); scale.setValue(1); }} style={styles.doneBtn}>
            <Text style={styles.doneBtnText}>Done</Text>
          </Pressable>
        </View>
      ) : (
        <View style={styles.breatheWrap}>
          <Text style={styles.cycleText}>
            Round {cycle} of {selected.cycles}
          </Text>
          <Animated.View style={[styles.circle, { transform: [{ scale }] }]}>
            <Text style={styles.phaseText}>{phaseText}</Text>
          </Animated.View>
          <Pressable
            onPress={() => { setRunning(false); setSelected(null); scale.setValue(1); }}
            style={styles.stopBtn}
          >
            <Text style={styles.stopText}>End Session</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
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
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    lineHeight: 20,
  },
  card: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 16,
    padding: 18,
    marginBottom: 12,
  },
  cardName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 14,
    color: '#888',
    marginBottom: 8,
    lineHeight: 20,
  },
  cardMeta: {
    fontSize: 12,
    color: '#555',
  },
  breatheWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 32,
  },
  cycleText: {
    fontSize: 14,
    color: '#666',
  },
  circle: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  phaseText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
  },
  stopBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  stopText: {
    fontSize: 14,
    color: '#666',
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
    color: '#fff',
  },
  doneText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
  },
  doneBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 48,
    marginTop: 12,
  },
  doneBtnText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
});
