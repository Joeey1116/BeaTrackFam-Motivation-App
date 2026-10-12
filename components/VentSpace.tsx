import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { containsCrisisLanguage } from './MoodCheckIn';

interface VentEntry {
  id: string;
  text: string;
  date: string;
}

interface Props {
  entries: VentEntry[];
  onSave: (text: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

/**
 * Vent Space — free-write area for getting feelings out.
 * No structure, no prompts, no judgment. Just space.
 * Crisis language detection surfaces resources quietly (not forced).
 */
export function VentSpace({ entries, onSave, onDelete, onClose }: Props) {
  const [text, setText] = useState('');
  const [showCrisisHint, setShowCrisisHint] = useState(false);

  useEffect(() => {
    if (text.length > 20) {
      setShowCrisisHint(containsCrisisLanguage(text));
    } else {
      setShowCrisisHint(false);
    }
  }, [text]);

  const handleSave = () => {
    if (text.trim().length === 0) return;
    onSave(text.trim());
    setText('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vent Space</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={24} color="#fff" />
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        Get it out. No structure, no judgment. This is just for you.
      </Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder="What's on your mind? Let it out..."
        placeholderTextColor="#555"
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />

      {showCrisisHint && (
        <View style={styles.crisisHint}>
          <Ionicons name="heart-outline" size={16} color="#ff8a8a" />
          <Text style={styles.crisisHintText}>
            If you need someone to talk to, support is available in Settings → Help.
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleSave}
        style={[styles.saveBtn, text.trim().length === 0 && styles.saveBtnDisabled]}
        disabled={text.trim().length === 0}
      >
        <Text style={styles.saveText}>Let It Out</Text>
      </Pressable>

      <Text style={styles.historyTitle}>Previous vents</Text>
      <ScrollView style={styles.history}>
        {entries.length === 0 && (
          <Text style={styles.empty}>Nothing here yet. Your vents stay private, on your device.</Text>
        )}
        {entries.map((e) => (
          <View key={e.id} style={styles.entry}>
            <Text style={styles.entryDate}>{e.date}</Text>
            <Text style={styles.entryText} numberOfLines={3}>{e.text}</Text>
            <Pressable onPress={() => onDelete(e.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color="#666" />
            </Pressable>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: '#111',
    borderWidth: 1,
    borderColor: '#222',
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: '#fff',
    minHeight: 140,
    maxHeight: 200,
    marginBottom: 12,
  },
  crisisHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#1a1111',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  crisisHintText: {
    fontSize: 13,
    color: '#ff8a8a',
    flex: 1,
    lineHeight: 18,
  },
  saveBtn: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  saveBtnDisabled: {
    opacity: 0.3,
  },
  saveText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
  },
  history: {
    flex: 1,
  },
  empty: {
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  entry: {
    backgroundColor: '#111',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  entryDate: {
    fontSize: 11,
    color: '#555',
    marginBottom: 4,
  },
  entryText: {
    fontSize: 14,
    color: '#ccc',
    flex: 1,
    lineHeight: 20,
  },
});
