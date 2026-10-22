import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import type { ThemePalette } from '../lib/themes';
import { useTheme } from '../lib/themeContext';

interface Props {
  onSuccess: () => void;
  onSkip: () => void;
}

// Google OAuth client ID (from Google Cloud Console). This is the iOS-type
// client bound to bundle ID com.beatrackfaminc.motivation; it is also listed
// under Supabase Dashboard → Authentication → Providers → Google → Client
// IDs, which is what lets Supabase accept the ID tokens it mints.
const GOOGLE_CLIENT_ID = '584493036670-ioeipe5lqocjiu64udhb15m0bm1po78u.apps.googleusercontent.com';

// Google's native-app policy (RFC 8252): for an iOS-type OAuth client the
// redirect URI's scheme MUST be the reversed client ID. An arbitrary custom
// scheme (the app's own "hustleandheart") is rejected by Google with
// "Access blocked — doesn't comply with Google's OAuth 2.0 policy for
// keeping apps secure / Error 400: invalid_request" (build 19 field
// report). The reversed scheme is registered in app.json "scheme" so iOS
// routes the auth-session return back into the app.
const GOOGLE_REDIRECT_SCHEME =
  'com.googleusercontent.apps.584493036670-ioeipe5lqocjiu64udhb15m0bm1po78u';

const googleDiscovery = {
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
  revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
};

/**
 * Optional sign-in — Sign in with Apple + Google.
 * App works fully without an account. Sign-in enables sync.
 */
export function SignIn({ onSuccess, onSkip }: Props) {
  const { palette } = useTheme();
  const styles = useMemo(() => createStyles(palette), [palette]);
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

      // Native Apple tokens carry aud = the app bundle ID
      // (com.beatrackfaminc.motivation). Supabase only accepts the token
      // if that bundle ID is listed under Authentication → Providers →
      // Apple → Client IDs in the Supabase dashboard — otherwise this
      // fails with "Unacceptable audience in id_token" (build 18 report).
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
    if (!isSupabaseConfigured() || !supabase) {
      Alert.alert('Not configured', 'Sign-in is not set up yet.');
      return;
    }
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert('Not configured', 'Google sign-in is not set up yet.');
      return;
    }

    setBusy(true);
    try {
      // ONE coherent flow (build 20): authorization-code + PKCE directly
      // against Google, then Supabase signInWithIdToken with the minted
      // ID token — the same shape as the (working) Apple flow.
      //
      // History of the broken versions:
      // - Build 18: implicit id_token flow WITH PKCE params — Google
      //   rejected code_challenge_method on an implicit request.
      // - Build 19: implicit flow without PKCE but redirecting to the
      //   app's custom scheme "hustleandheart" — Google blocked it under
      //   its native-app policy ("doesn't comply with Google's OAuth 2.0
      //   policy for keeping apps secure", Error 400 invalid_request):
      //   native public clients must use PKCE, and an iOS client's
      //   redirect scheme must be the reversed client ID.
      // The Supabase-hosted browser flow (signInWithOAuth) is NOT used:
      // it needs a Web-type client + secret in the dashboard, while this
      // app is configured with the iOS client.
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: GOOGLE_REDIRECT_SCHEME,
        path: 'oauth2redirect/google',
      });
      // A nonce binds the returned ID token to this request; Supabase
      // requires the same raw nonce when the token carries one.
      const nonce = Crypto.randomUUID();
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: { nonce },
      });
      const result = await request.promptAsync(googleDiscovery);

      if (result.type !== 'success') {
        if (result.type !== 'dismiss' && result.type !== 'cancel') {
          throw new Error('Google sign-in did not complete.');
        }
        return;
      }

      const code = result.params.code;
      if (!code || !request.codeVerifier) {
        throw new Error('Google sign-in did not complete.');
      }

      // Public (iOS) client: the PKCE verifier stands in for a client
      // secret at the token endpoint.
      const tokenResponse = await AuthSession.exchangeCodeAsync(
        {
          clientId: GOOGLE_CLIENT_ID,
          code,
          redirectUri,
          extraParams: { code_verifier: request.codeVerifier },
        },
        googleDiscovery
      );

      if (!tokenResponse.idToken) {
        throw new Error('Google did not return an identity token.');
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokenResponse.idToken,
        nonce,
      });

      if (error) throw error;
      onSuccess();
    } catch (e: any) {
      Alert.alert('Sign-in failed', e.message || 'Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const showGoogleButton = GOOGLE_CLIENT_ID.length > 0;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-upload-outline" size={48} color={palette.text} />
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

      {showGoogleButton && (
        <Pressable
          onPress={signInWithGoogle}
          style={[styles.googleBtn, busy && styles.disabled]}
          disabled={busy}
        >
          <Ionicons name="logo-google" size={20} color={palette.text} />
          <Text style={styles.googleText}>Sign in with Google</Text>
        </Pressable>
      )}

      <Pressable onPress={onSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>Skip — I'll stay offline</Text>
      </Pressable>

      <Text style={styles.note}>
        Your journal stays private. We never sell your data.
      </Text>
    </View>
  );
}

function createStyles(p: ThemePalette) {
  return StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: p.background,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: p.text,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 15,
    color: p.textDim,
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
    backgroundColor: p.surface,
    borderWidth: 1,
    borderColor: p.border,
  },
  googleText: {
    fontSize: 17,
    fontWeight: '600',
    color: p.text,
  },
  disabled: {
    opacity: 0.5,
  },
  skipBtn: {
    paddingVertical: 12,
  },
  skipText: {
    fontSize: 15,
    color: p.textDim,
    textDecorationLine: 'underline',
  },
  note: {
    fontSize: 12,
    color: p.textDim,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 18,
  },
  });
}
