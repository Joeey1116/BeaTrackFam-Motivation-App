import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { getUserName, setUserName } from '../../lib/storage';

/**
 * Your Name — separate screen (not a popup).
 * Save → confirm + go back. Cancel → just go back.
 */
export default function NameScreen() {
  const [name, setName] = useState('');

  useEffect(() => {
    getUserName().then(setName);
  }, []);

  const onSave = async () => {
    const clean = name.trim().slice(0, 40);
    await setUserName(clean);
    Alert.alert('Saved', clean ? `Your companion will call you ${clean}.` : 'Name cleared.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <View style={styles.body}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>Your Name</Text>
        <Text style={styles.sub}>So your companion knows what to call you.</Text>
        <Glass style={styles.card}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="What should we call you?"
            placeholderTextColor={Colors.textDim}
            maxLength={40}
            autoFocus
          />
        </Glass>
        <View style={styles.buttons}>
          <Pressable onPress={() => router.back()} style={[styles.btn, styles.cancelBtn]}>
            <Text style={styles.cancelText}>Cancel</Text>
          </Pressable>
          <Pressable onPress={onSave} style={[styles.btn, styles.saveBtn]}>
            <Text style={styles.saveText}>Save</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.md, flex: 1 },
  backRow: { paddingVertical: Spacing.xs },
  back: { color: Colors.textDim, fontSize: 17, fontWeight: '600' },
  h1: { ...Type.display, color: Colors.text },
  sub: { ...Type.body, color: Colors.textDim },
  card: { borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  input: { color: Colors.text, fontSize: 18, paddingVertical: Spacing.sm },
  buttons: { flexDirection: 'row', gap: Spacing.sm, marginTop: Spacing.sm },
  btn: { flex: 1, borderRadius: Radius.lg, paddingVertical: Spacing.md, alignItems: 'center' },
  cancelBtn: { backgroundColor: Colors.surface, borderWidth: 1, borderColor: Colors.border },
  cancelText: { color: Colors.text, fontSize: 17, fontWeight: '600' },
  saveBtn: { backgroundColor: Colors.button },
  saveText: { color: Colors.buttonText, fontSize: 17, fontWeight: '700' },
});
