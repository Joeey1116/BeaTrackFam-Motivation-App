import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
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
            placeholderTextColor="#555"
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
  body: { padding: 20, gap: 12 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '800' },
  date: { color: '#666', fontSize: 14 },
  card: { borderRadius: 20, padding: 20, borderWidth: 1, borderColor: '#2a2a2a', gap: 14, marginTop: 8 },
  promptRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  prompt: { color: '#fff', fontSize: 17, fontWeight: '700', flex: 1 },
  input: {
    color: '#fff',
    fontSize: 17,
    lineHeight: 26,
    minHeight: 140,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 14,
    padding: 14,
  },
  rtl: { textAlign: 'right', writingDirection: 'rtl' },
  saved: { color: '#4caf50', fontSize: 13, fontWeight: '600' },
});
