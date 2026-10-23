import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Radius, Spacing, Type } from '../../lib/design';
import type { ThemePalette } from '../../lib/themes';
import { useTheme } from '../../lib/themeContext';
import { getUserName, setUserName } from '../../lib/storage';
import { useStrings } from '../../lib/i18n';

/**
 * Your Name — separate screen (not a popup).
 * Save → confirm + go back. Cancel → just go back.
 */
export default function NameScreen() {
  const { palette } = useTheme();
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [name, setName] = useState('');

  useEffect(() => {
    getUserName().then(setName);
  }, []);

  const onSave = async () => {
    const clean = name.trim().slice(0, 40);
    await setUserName(clean);
    Alert.alert(t('common.saved'), clean ? t('nameScreen.savedNamed', { name: clean }) : t('nameScreen.savedCleared'), [
      { text: t('common.ok'), onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.h1}>{t('nameScreen.title')}</Text>
        <Text style={styles.sub}>{t('nameScreen.sub')}</Text>
        <Glass style={styles.card}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder={t('nameScreen.placeholder')}
            placeholderTextColor={palette.textDim}
            maxLength={40}
            autoFocus
          />
        </Glass>
        <View style={styles.buttons}>
          <Pressable onPress={() => router.back()} style={[styles.btn, styles.cancelBtn]}>
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </Pressable>
          <Pressable onPress={onSave} style={[styles.btn, styles.saveBtn]}>
            <Text style={styles.saveText}>{t('common.save')}</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    body: { padding: Spacing.lg, gap: Spacing.md, flex: 1 },
    backRow: { paddingVertical: Spacing.xs },
    back: { color: p.textDim, fontSize: 17, fontWeight: '600' },
    h1: { ...Type.display, color: p.text },
    sub: { ...Type.body, color: p.textDim },
    card: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: p.border },
    input: { color: p.text, fontSize: 18, paddingVertical: Spacing.sm },
    buttons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
    btn: { flex: 1, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
    cancelBtn: { backgroundColor: p.surface, borderWidth: 1, borderColor: p.border },
    cancelText: { color: p.text, fontSize: 17, fontWeight: '600' },
    saveBtn: { backgroundColor: p.button },
    saveText: { color: p.buttonText, fontSize: 17, fontWeight: '700' },
  });
}
