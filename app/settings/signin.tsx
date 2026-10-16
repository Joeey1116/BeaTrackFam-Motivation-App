import { Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen } from '../../components/Screen';
import { Colors, Spacing, Type } from '../../lib/design';
import { SignIn } from '../../components/SignIn';

/**
 * Sign In — separate screen (not a popup).
 * Uses the real SignIn component (Apple + Google).
 */
export default function SignInScreen() {
  return (
    <Screen>
      <View style={styles.body}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <View style={styles.content}>
          <SignIn onSuccess={() => router.back()} onSkip={() => router.back()} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: Spacing.lg, gap: Spacing.md, flex: 1 },
  backRow: { paddingVertical: Spacing.xs },
  back: { color: Colors.textDim, fontSize: 17, fontWeight: '600' },
  content: { flex: 1 },
});
