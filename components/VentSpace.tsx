import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../lib/themeContext';
import type { ThemePalette } from '../lib/themes';
import { containsCrisisLanguage } from './MoodCheckIn';
import { useStrings } from '../lib/i18n';

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
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
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
        <Text style={styles.title}>{t('vent.title')}</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Ionicons name="close" size={24} color={palette.text} />
        </Pressable>
      </View>

      <Text style={styles.subtitle}>
        {t('vent.subtitle')}
      </Text>

      <TextInput
        style={styles.input}
        multiline
        placeholder={t('vent.placeholder')}
        placeholderTextColor={palette.textDim}
        value={text}
        onChangeText={setText}
        textAlignVertical="top"
      />

      {showCrisisHint && (
        <View style={styles.crisisHint}>
          <Ionicons name="heart-outline" size={16} color="#ff8a8a" />
          <Text style={styles.crisisHintText}>
            {t('vent.crisisHint')}
          </Text>
        </View>
      )}

      <Pressable
        onPress={handleSave}
        style={[styles.saveBtn, text.trim().length === 0 && styles.saveBtnDisabled]}
        disabled={text.trim().length === 0}
      >
        <Text style={styles.saveText}>{t('vent.save')}</Text>
      </Pressable>

      <Text style={styles.historyTitle}>{t('vent.historyTitle')}</Text>
      <ScrollView style={styles.history}>
        {entries.length === 0 && (
          <Text style={styles.empty}>{t('vent.empty')}</Text>
        )}
        {entries.map((e) => (
          <View key={e.id} style={styles.entry}>
            <Text style={styles.entryDate}>{e.date}</Text>
            <Text style={styles.entryText} numberOfLines={3}>{e.text}</Text>
            <Pressable onPress={() => onDelete(e.id)} hitSlop={8}>
              <Ionicons name="trash-outline" size={18} color={palette.textDim} />
            </Pressable>
          </View>
        ))}
      </ScrollView>
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
    marginBottom: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: p.text,
  },
  subtitle: {
    fontSize: 14,
    color: p.textDim,
    marginBottom: 16,
    lineHeight: 20,
  },
  input: {
    backgroundColor: p.input,
    borderWidth: 1,
    borderColor: p.border,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: p.text,
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
    backgroundColor: p.button,
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
    color: p.buttonText,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: p.text,
    marginBottom: 12,
  },
  history: {
    flex: 1,
  },
  empty: {
    fontSize: 14,
    color: p.textDim,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 20,
  },
  entry: {
    backgroundColor: p.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  entryDate: {
    fontSize: 11,
    color: p.textDim,
    marginBottom: 4,
  },
  entryText: {
    fontSize: 14,
    color: p.textMuted,
    flex: 1,
    lineHeight: 20,
  },
  });
}
