import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import * as FileSystem from 'expo-file-system';
import type { Session } from '@supabase/supabase-js';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import type { ThemePalette } from '../../lib/themes';
import { useTheme } from '../../lib/themeContext';
import { isSupabaseConfigured, supabase } from '../../lib/supabase';
import { clearAllLocalData } from '../../lib/storage';
import { readImportedList, stopPlayback } from '../../lib/music';

/**
 * Account — the app's account home (Settings → Account).
 *
 * Signed out: explains optional sync and offers Sign In.
 * Signed in: shows the account email, Sign Out, and Delete Account.
 * Delete Account renders ONLY for a signed-in user (never when signed
 * out) and, after two confirmations, deletes the account server-side via
 * the `delete-account` Edge Function, wipes all on-device app data, and
 * returns the app to its first-run start.
 */
export default function AccountScreen() {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const configured = isSupabaseConfigured();
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(configured);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    const { data } = await supabase.auth.getSession();
    setSession(data.session);
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  useEffect(() => {
    if (!supabase) return;
    const { data } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const email = session?.user?.email ?? null;

  const signOut = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    try {
      await supabase.auth.signOut();
      setSession(null);
      Alert.alert('Signed out', 'Your data stays on this device.');
    } catch (e: any) {
      Alert.alert('Sign-out failed', e?.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const wipeDevice = async () => {
    // Music: stop playback and delete imported audio files.
    stopPlayback();
    try {
      const imported = await readImportedList();
      for (const t of imported) {
        await FileSystem.deleteAsync(t.uri, { idempotent: true });
      }
    } catch {
      // Best effort — storage wipe below still proceeds.
    }
    await clearAllLocalData();
  };

  const deleteAccount = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    try {
      const { error } = await supabase.functions.invoke('delete-account', {
        method: 'POST',
      });
      if (error) throw error;
      // Account is gone server-side. Wipe the device, drop the (now
      // invalid) local session, and restart from the top.
      await wipeDevice();
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch {
        // Session is already invalid server-side — nothing to clean up.
      }
      setSession(null);
      router.replace('/');
    } catch (e: any) {
      Alert.alert(
        'Could not delete account',
        e?.message ||
          'Something went wrong deleting your account. Please try again, or email contact@beatrackfam.info and we will delete it for you.'
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This permanently deletes your Hustle & Heart account and erases everything the app stored on this device — journal, favorites, streaks, settings. This cannot be undone.',
      [
        { text: 'Keep my account', style: 'cancel' },
        {
          text: 'Continue',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Your account and all on-device data will be deleted forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete forever', style: 'destructive', onPress: deleteAccount },
              ]
            );
          },
        },
      ]
    );
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => router.back()} style={styles.backRow}>
          <Text style={styles.back}>‹ Back</Text>
        </Pressable>
        <Text style={styles.h1}>Account</Text>

        {loading ? (
          <ActivityIndicator color={palette.textDim} style={styles.spinner} />
        ) : !configured ? (
          <>
            <Text style={styles.sub}>
              Hustle & Heart works fully without an account — everything is
              stored on your device. Optional sign-in for sync across devices
              isn't enabled in this build yet.
            </Text>
            <Glass style={styles.card}>
              <Text style={styles.cardTitle}>You're using the app offline</Text>
              <Text style={styles.cardBody}>
                Your journal, favorites, and streaks live only on this
                phone. Uninstalling the app removes them.
              </Text>
            </Glass>
          </>
        ) : !session ? (
          <>
            <Text style={styles.sub}>
              Sign in to sync your journal, favorites, and streaks across
              devices. The app works fully without an account — this is
              optional.
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push('/settings/signin')}
            >
              <Text style={styles.primaryBtnText}>Sign In</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sub}>You're signed in.</Text>
            <Glass style={styles.card}>
              <Text style={styles.cardLabel}>EMAIL</Text>
              <Text style={styles.cardTitle}>{email ?? 'Signed-in account'}</Text>
              <Text style={styles.cardBody}>
                Your journal, favorites, and streaks sync with this account.
              </Text>
            </Glass>

            <Pressable
              style={[styles.secondaryBtn, busy && styles.disabled]}
              onPress={signOut}
              disabled={busy}
            >
              <Text style={styles.secondaryBtnText}>Sign Out</Text>
            </Pressable>

            {/* Delete Account — signed-in users only, by design. */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>Danger zone</Text>
              <Pressable
                style={[styles.dangerBtn, busy && styles.disabled]}
                onPress={confirmDelete}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={Colors.danger} />
                ) : (
                  <Text style={styles.dangerBtnText}>Delete Account</Text>
                )}
              </Pressable>
              <Text style={styles.dangerNote}>
                Permanently deletes your account and everything the app
                stored on this device. This cannot be undone.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </Screen>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
    body: { padding: Spacing.lg, gap: Spacing.md, flexGrow: 1 },
    backRow: { paddingVertical: Spacing.xs },
    back: { color: p.textDim, fontSize: 17, fontWeight: '600' },
    h1: { ...Type.display, color: p.text },
    sub: { ...Type.body, color: p.textMuted },
    spinner: { marginTop: Spacing.xl },
    card: { borderRadius: Radius.lg, padding: Spacing.md, gap: Spacing.xs },
    cardLabel: { ...Type.eyebrow, color: p.textDim },
    cardTitle: { ...Type.title, color: p.text },
    cardBody: { ...Type.caption, color: p.textMuted },
    primaryBtn: {
      backgroundColor: p.button,
      borderRadius: Radius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
      marginTop: Spacing.sm,
    },
    primaryBtnText: { ...Type.title, color: p.buttonText },
    secondaryBtn: {
      borderWidth: 1,
      borderColor: p.border,
      borderRadius: Radius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    secondaryBtnText: { ...Type.title, color: p.text },
    dangerZone: { marginTop: Spacing.xl, gap: Spacing.sm },
    dangerTitle: { ...Type.eyebrow, color: Colors.danger },
    dangerBtn: {
      borderWidth: 1,
      borderColor: Colors.danger,
      borderRadius: Radius.md,
      paddingVertical: Spacing.md,
      alignItems: 'center',
    },
    dangerBtnText: { ...Type.title, color: Colors.danger },
    dangerNote: { ...Type.caption, color: p.textDim },
    disabled: { opacity: 0.5 },
  });
}
