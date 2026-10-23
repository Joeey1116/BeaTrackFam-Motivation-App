import { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';
import { Ionicons } from '@expo/vector-icons';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useStrings } from '../lib/i18n';
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
const GOOGLE_CLIENT_ID = '584493036670-rtp9oo468n0t241e4s6tikcth375dolq.apps.googleusercontent.com';

// Google's native-app policy (RFC 8252): for an iOS-type OAuth client the
// redirect URI's scheme MUST be the reversed client ID. An arbitrary custom
// scheme (the app's own "hustleandheart") is rejected by Google with
// "Access blocked — doesn't comply with Google's OAuth 2.0 policy for
// keeping apps secure / Error 400: invalid_request" (build 19 field
// report). The reversed scheme is registered in app.json "scheme" so iOS
// routes the auth-session return back into the app.
const GOOGLE_REDIRECT_SCHEME =
  'com.googleusercontent.apps.584493036670-rtp9oo468n0t241e4s6tikcth375dolq';

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
  const { t } = useStrings();
  const styles = useMemo(() => createStyles(palette), [palette]);
  const [busy, setBusy] = useState(false);

  const signInWithApple = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      Alert.alert(t('signin.notConfiguredTitle'), t('signin.notConfiguredBody'));
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
        throw new Error(t('signin.noIdentityToken'));
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
        Alert.alert(t('signin.failedTitle'), e.message || t('signin.tryAgain'));
      }
    } finally {
      setBusy(false);
    }
  };

  const signInWithGoogle = async () => {
    if (!isSupabaseConfigured() || !supabase) {
      Alert.alert(t('signin.notConfiguredTitle'), t('signin.notConfiguredBody'));
      return;
    }
    if (!GOOGLE_CLIENT_ID) {
      Alert.alert(t('signin.notConfiguredTitle'), t('signin.googleNotConfiguredBody'));
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
      // - Builds 19–22 (incl. build 20's auth-code + PKCE rewrite): the
      //   flow logic was right, but the redirect URI was built with
      //   AuthSession.makeRedirectUri({scheme, path}), which produces a
      //   DOUBLE-slash URI — "com.googleusercontent.apps.<id>://
      //   oauth2redirect/google". Google's iOS-type clients only accept
      //   the single-slash opaque form "<scheme>:/oauth2redirect", so
      //   every attempt died at the authorize step with the same
      //   "Access blocked / Error 400: invalid_request" page. Proven
      //   Oct 22, 2026 by Google's own on-device "error details", which
      //   flagged exactly that redirect_uri and nothing else.
      // - Build 23: the redirect URI is a literal string (below). NEVER
      //   route this redirect through makeRedirectUri again.
      // - Build 25: the TRUE root cause surfaces. Build 23's device test
      //   still failed, and this time Google's error page said why in
      //   plain language: "Custom scheme URIs are not allowed for 'WEB'
      //   client type." The client ID used through build 24
      //   (584493036670-ioeipe5…) was a WEB-type OAuth client all along —
      //   the "iOS client" label came from its slot in Supabase's Client
      //   IDs list, which says nothing about a client's type in Google
      //   Cloud. Web clients are banned from custom-scheme redirects
      //   entirely (either slash form), which is why every flow rewrite
      //   in builds 19–24 died at the same authorize step; the
      //   redirect_uri flagging was a symptom, not the disease. Build 25
      //   swaps in a genuine iOS-type client created in Google Cloud
      //   Console for bundle com.beatrackfaminc.motivation
      //   (584493036670-rtp9oo4…): GOOGLE_CLIENT_ID +
      //   GOOGLE_REDIRECT_SCHEME above and the app.json scheme entry all
      //   carry the new ID, and the new ID was added to Supabase's
      //   Google → Client IDs list so Supabase accepts its tokens. The
      //   old WEB client is NOT deleted: its ID + secret remain in
      //   Supabase's Google provider main settings as the provider
      //   anchor — it just no longer serves the app's sign-in flow.
      // - Build 26: Google's gate finally opens (real iOS client,
      //   build 25) and a token is issued, but Supabase rejects it
      //   with "Nonces mismatch". The nonce contract: the provider
      //   must receive the SHA-256 HASH of the nonce — that hash is
      //   what lands in the ID token's nonce claim — while Supabase
      //   receives the RAW nonce via signInWithIdToken and hashes it
      //   itself before comparing. Builds 20–25 sent the raw nonce to
      //   both sides, so Supabase compared hash(raw) against a claim
      //   holding raw — a mismatch by construction. Build 26 sends
      //   hashedNonce to Google and keeps the raw nonce for Supabase,
      //   per Supabase's documented nonce pattern.
      // The Supabase-hosted browser flow (signInWithOAuth) is NOT used:
      // it needs a Web-type client + secret in the dashboard, while this
      // app is configured with the iOS client.
      const redirectUri = `${GOOGLE_REDIRECT_SCHEME}:/oauth2redirect`;
      // Nonce contract (build 26 — see history above): Google receives
      // the SHA-256 HASH of the nonce, so the hash lands in the ID
      // token's nonce claim; Supabase receives the RAW nonce and
      // hashes it itself before comparing. Sending the raw value to
      // both sides guarantees a "Nonces mismatch" rejection.
      const nonce = Crypto.randomUUID();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        nonce
      );
      const request = new AuthSession.AuthRequest({
        clientId: GOOGLE_CLIENT_ID,
        redirectUri,
        scopes: ['openid', 'profile', 'email'],
        responseType: AuthSession.ResponseType.Code,
        usePKCE: true,
        extraParams: { nonce: hashedNonce },
      });
      const result = await request.promptAsync(googleDiscovery);

      if (result.type !== 'success') {
        if (result.type !== 'dismiss' && result.type !== 'cancel') {
          throw new Error(t('signin.googleIncomplete'));
        }
        return;
      }

      const code = result.params.code;
      if (!code || !request.codeVerifier) {
        throw new Error(t('signin.googleIncomplete'));
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
        throw new Error(t('signin.googleNoToken'));
      }

      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: tokenResponse.idToken,
        nonce,
      });

      if (error) throw error;
      onSuccess();
    } catch (e: any) {
      Alert.alert(t('signin.failedTitle'), e.message || t('signin.tryAgain'));
    } finally {
      setBusy(false);
    }
  };

  const showGoogleButton = GOOGLE_CLIENT_ID.length > 0;

  return (
    <View style={styles.container}>
      <Ionicons name="cloud-upload-outline" size={48} color={palette.text} />
      <Text style={styles.title}>{t('signin.title')}</Text>
      <Text style={styles.subtitle}>
        {t('signin.subtitle')}
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
          <Text style={styles.googleText}>{t('signin.google')}</Text>
        </Pressable>
      )}

      <Pressable onPress={onSkip} style={styles.skipBtn}>
        <Text style={styles.skipText}>{t('signin.skip')}</Text>
      </Pressable>

      <Text style={styles.note}>
        {t('signin.note')}
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
