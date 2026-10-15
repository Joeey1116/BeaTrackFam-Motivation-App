import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { useStrings } from '../../lib/i18n';
import { getGratitude, setGratitude } from '../../lib/storage';

export default function Journal() {
  const { t, lang, rtl } = useStrings();
  const [text, setText] = useState('');
  const [savedTick, setSavedTick] = useState(0);

  useEffect(() => {
    getGratitude().then(setText);
  }, [lang]);

  const onChange = (v: string) => {
    setText(v);
    void setGratitude(v).then(() => setSavedTick((x) => x + 1));
  };

  const today = new Date().toLocaleDateString(
    lang === 'he' ? 'he-IL' : lang === 'es' ? 'es-ES' : 'en-US',
    { weekday: 'long', month: 'long', day: 'numeric' },
  );

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{t('journal.title')}</Text>
        <Text style={styles.date}>{today}</Text>
        <Glass style={styles.card}>
          <View style={styles.promptRow}>
            <Ionicons name="sunny-outline" size={22} color="#f5c518" />
            <Text style={styles.prompt}>{t('journal.prompt')}</Text>
          </View>
          <TextInput
            style={[styles.input, rtl && styles.rtl]}
            value={text}
            onChangeText={onChange}
            placeholder={t('journal.placeholder')}
            placeholderTextColor={Colors.textDim}
            multiline
            textAlignVertical="top"
            maxLength={280}
          />
          {savedTick > 0 && text.length > 0 ? (
            <Text style={styles.saved}>{t('journal.saved')}</Text>
          ) : null}
        </Glass>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.sm },
  h1: { ...Type.display, color: Colors.text },
  date: { ...Type.body, color: Colors.textDim },
  card: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border, gap: Spacing.md, marginTop: Spacing.sm },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  prompt: { color: Colors.text, fontSize: 17, fontWeight: '700', flex: 1 },
  input: {
    color: Colors.text,
    fontSize: 17,
    lineHeight: 26,
    minHeight: 140,
    backgroundColor: Colors.input,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  saved: { ...Type.caption, color: Colors.success, fontWeight: '600' },
});
