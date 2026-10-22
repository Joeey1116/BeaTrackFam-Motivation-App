import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim();
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();

let client: SupabaseClient | null = null;

if (url && anonKey) {
  try {
    // Standard React Native wiring (build 20): without an explicit
    // storage adapter supabase-js keeps the session in memory only, so
    // a successful Apple/Google sign-in evaporated on app restart and
    // the Account screen fell back to "signed out". AsyncStorage makes
    // the session durable; detectSessionInUrl is false because auth
    // returns arrive via native flows (Apple/Google ID tokens), never
    // via a URL the client should parse.
    client = createClient(url, anonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    });
  } catch {
    client = null;
  }
}

/**
 * Supabase client, or null when credentials are missing/invalid.
 * When null the app runs fully offline on the bundled quote seed.
 * Never throws at import time.
 */
export const supabase: SupabaseClient | null = client;

export function isSupabaseConfigured(): boolean {
  return client !== null;
}
