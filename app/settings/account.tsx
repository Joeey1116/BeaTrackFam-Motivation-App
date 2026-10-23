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
import { useStrings } from '../../lib/i18n';

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
  const { t } = useStrings();
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
      Alert.alert(t('account.signedOutTitle'), t('account.signedOutBody'));
    } catch (e: any) {
      Alert.alert(t('account.signOutFailed'), e?.message || t('account.tryAgain'));
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
        t('account.deleteFailTitle'),
        e?.message || t('account.deleteFailBody')
      );
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = () => {
    Alert.alert(
      t('account.confirm1Title'),
      t('account.confirm1Body'),
      [
        { text: t('account.keepAccount'), style: 'cancel' },
        {
          text: t('common.continue'),
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              t('account.confirm2Title'),
              t('account.confirm2Body'),
              [
                { text: t('common.cancel'), style: 'cancel' },
                { text: t('account.deleteForever'), style: 'destructive', onPress: deleteAccount },
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
          <Text style={styles.back}>{t('common.back')}</Text>
        </Pressable>
        <Text style={styles.h1}>{t('account.title')}</Text>

        {loading ? (
          <ActivityIndicator color={palette.textDim} style={styles.spinner} />
        ) : !configured ? (
          <>
            <Text style={styles.sub}>
              {t('account.offlineSub')}
            </Text>
            <Glass style={styles.card}>
              <Text style={styles.cardTitle}>{t('account.offlineCardTitle')}</Text>
              <Text style={styles.cardBody}>
                {t('account.offlineCardBody')}
              </Text>
            </Glass>
          </>
        ) : !session ? (
          <>
            <Text style={styles.sub}>
              {t('account.signinSub')}
            </Text>
            <Pressable
              style={styles.primaryBtn}
              onPress={() => router.push('/settings/signin')}
            >
              <Text style={styles.primaryBtnText}>{t('account.signInBtn')}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <Text style={styles.sub}>{t('account.signedInSub')}</Text>
            <Glass style={styles.card}>
              <Text style={styles.cardLabel}>{t('account.emailLabel')}</Text>
              <Text style={styles.cardTitle}>{email ?? t('account.signedInAccount')}</Text>
              <Text style={styles.cardBody}>
                {t('account.cardBody')}
              </Text>
            </Glass>

            <Pressable
              style={[styles.secondaryBtn, busy && styles.disabled]}
              onPress={signOut}
              disabled={busy}
            >
              <Text style={styles.secondaryBtnText}>{t('account.signOutBtn')}</Text>
            </Pressable>

            {/* Delete Account — signed-in users only, by design. */}
            <View style={styles.dangerZone}>
              <Text style={styles.dangerTitle}>{t('account.dangerZone')}</Text>
              <Pressable
                style={[styles.dangerBtn, busy && styles.disabled]}
                onPress={confirmDelete}
                disabled={busy}
              >
                {busy ? (
                  <ActivityIndicator color={Colors.danger} />
                ) : (
                  <Text style={styles.dangerBtnText}>{t('account.deleteBtn')}</Text>
                )}
              </Pressable>
              <Text style={styles.dangerNote}>
                {t('account.dangerNote')}
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
