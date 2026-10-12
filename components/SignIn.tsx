import { useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface Props {
  onSuccess: () => void;
  onSkip: () => void;
}

/**
 * Optional sign-in — Sign in with Apple + Google.
 * App works fully without an account. Sign-in enables sync.
 */
export function SignIn({ onSuccess, onSkip }: Props) {
  const [busy, setBusy] = useState(false);

  const signInWithApple = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      Alert.alert('Not configured', 'Sign-in is not set up yet.');
      return;
    }

    setBusy(true);
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        throw new Error('No identity token');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) throw error;
      onSuccess();
    } catch (e: any) {
      if (e.code !== 'ERR_REQUEST_CANCELED') {
        Alert.alert('Sign-in failed', e.message || 'Please try again.');
      }
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    // TODO: Implement with expo-auth-session + Supabase
    Alert.alert('Coming soon', 'Google sign-in is coming soon.');
  };

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-upload-outline" size={48} color="#fff" />
      <Text style={styles.title}>Keep your data safe</Text>
      <Text style={styles.subtitle}>
        Sign in to sync your journal, favorites, and streaks across devices.
        The app works fully without an account — this is optional.
      </Text>

      {Platform.OS === 'ios' && (
        <AppleAuthentication.AppleAuthenticationButton
          buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
          buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
          cornerRadius={14}
          style={styles.appleBtn}
          onPress={signInWithApple}
        />
      )}

      <Pressable
        onPress={signInWithGoogle}
        style={[styles.googleBtn, busy && styles.disabled]}
        disabled={busy}
      >
        <Ionicons name="logo-google" size={20} color="#fff" />
        <Text style={styles.googleText}>Sign in with Google</Text>
      </Pressable>

      <Pressable onPress={onSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip — I'll stay offline</Text>
      </Pressable>

      <Text style={styles.note}>
        Your journal stays private. We never sell your data.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 8,
  },
  appleBtn: {
    width: '100%',
    height: 50,
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    height: 50,
    borderRadius: 14,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333',
  },
  googleText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  disabled: {
    opacity: 0.5,
  },
  skipBtn: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: '#888',
    textDecorationLine: 'underline',
  },
  note: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
});
