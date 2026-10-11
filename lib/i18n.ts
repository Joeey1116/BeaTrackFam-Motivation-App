import * as React from 'react';
import { I18nManager } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { BRAND, LANGUAGES, RTL_LANGUAGES, type Language } from './brand';
import en from './locales/en.json';
import he from './locales/he.json';
import es from './locales/es.json';

const STRINGS = { en, he, es } as const;
type StringTable = typeof en;

const LANG_KEY = `${BRAND.STORAGE_PREFIX}/language`;

let current: Language = 'en';
const listeners = new Set<() => void>();

function isSupported(code: string | null | undefined): code is Language {
  return !!code && (LANGUAGES as readonly string[]).includes(code);
}

function detectDeviceLanguage(): Language {
  try {
    const locales = Localization.getLocales();
    const code = locales[0]?.languageCode ?? null;
    return isSupported(code) ? code : 'en';
  } catch {
    return 'en';
  }
}

function applyRtl(lang: Language): void {
  const rtl = (RTL_LANGUAGES as readonly string[]).includes(lang);
  try {
    I18nManager.allowRTL(rtl);
    I18nManager.forceRTL(rtl);
  } catch {
    // non-fatal
  }
}

/** Call once at startup before rendering. Returns the active language. */
export async function initLanguage(): Promise<Language> {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    current = isSupported(stored) ? stored : detectDeviceLanguage();
  } catch {
    current = detectDeviceLanguage();
  }
  applyRtl(current);
  return current;
}

export function getLanguage(): Language {
  return current;
}

export function isRTL(): boolean {
  return (RTL_LANGUAGES as readonly string[]).includes(current);
}

/**
 * Switch language. Returns true when the RTL direction changed and the app
 * needs a restart for the new layout to fully apply (Settings shows a note).
 */
export async function setLanguage(lang: Language): Promise<boolean> {
  const wasRtl = isRTL();
  current = lang;
  try {
    await AsyncStorage.setItem(LANG_KEY, lang);
  } catch {
    // non-fatal
  }
  const nowRtl = (RTL_LANGUAGES as readonly string[]).includes(lang);
  applyRtl(lang);
  listeners.forEach((fn) => fn());
  return wasRtl !== nowRtl;
}

function lookup(table: StringTable, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object' && key in acc) {
      return (acc as Record<string, unknown>)[key];
    }
    return undefined;
  }, table);
}

/** Translate a dotted key, e.g. t('tabs.today'). Falls back to English, then the key. */
export function t(path: string, params?: Record<string, string | number>): string {
  const val = lookup(STRINGS[current], path) ?? lookup(STRINGS.en, path);
  if (typeof val !== 'string') return path;
  return val.replace(/\{(\w+)\}/g, (_, k: string) => String(params?.[k] ?? `{${k}}`));
}

export function trackName(trackId: string): string {
  return t(`tracks.${trackId}.name`, undefined) !== `tracks.${trackId}.name`
    ? t(`tracks.${trackId}.name`)
    : trackId;
}

export function trackDesc(trackId: string): string {
  return t(`tracks.${trackId}.desc`);
}

function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

/** Re-render on language change; returns helpers bound to the active language. */
export function useStrings(): { t: typeof t; lang: Language; rtl: boolean; trackName: typeof trackName; trackDesc: typeof trackDesc } {
  const [, bump] = React.useReducer((x: number) => x + 1, 0);
  React.useEffect(() => subscribe(bump), []);
  return { t, lang: current, rtl: isRTL(), trackName, trackDesc };
}
