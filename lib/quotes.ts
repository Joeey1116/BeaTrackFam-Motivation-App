import { supabase, isSupabaseConfigured } from './supabase';
import { NATIVE_TRACKS, type Language, type TrackId } from './brand';
import enData from '../data/quotes/en.json';
import heData from '../data/quotes/he.json';
import esData from '../data/quotes/es.json';

export interface Quote {
  id: string;
  text: string;
  tracks: TrackId[];
  /** True when shown in English because this track has no library in the user's language yet. */
  fallback?: boolean;
}

interface RawQuote {
  id: string;
  text: string;
  tracks: string[];
}

const BUNDLES: Record<Language, RawQuote[]> = {
  en: enData.quotes as RawQuote[],
  he: heData.quotes as RawQuote[],
  es: esData.quotes as RawQuote[],
};

const memCache = new Map<string, Quote[]>();

function nativeQuotes(lang: Language, tracks: TrackId[]): Quote[] {
  const native = new Set<TrackId>(NATIVE_TRACKS[lang] as readonly TrackId[]);
  return BUNDLES[lang]
    .filter((q) => q.tracks.some((t) => native.has(t as TrackId) && tracks.includes(t as TrackId)))
    .map((q) => ({ id: q.id, text: q.text, tracks: q.tracks as TrackId[] }));
}

function fallbackQuotes(lang: Language, tracks: TrackId[]): Quote[] {
  if (lang === 'en') return [];
  const native = new Set<TrackId>(NATIVE_TRACKS[lang] as readonly TrackId[]);
  const missing = tracks.filter((t) => !native.has(t));
  if (missing.length === 0) return [];
  return BUNDLES.en
    .filter((q) => q.tracks.some((t) => missing.includes(t as TrackId)))
    .map((q) => ({ id: q.id, text: q.text, tracks: q.tracks as TrackId[], fallback: true }));
}

function localQuotes(lang: Language, tracks: TrackId[]): Quote[] {
  const seen = new Set<string>();
  const out: Quote[] = [];
  for (const q of [...nativeQuotes(lang, tracks), ...fallbackQuotes(lang, tracks)]) {
    if (!seen.has(q.id)) {
      seen.add(q.id);
      out.push(q);
    }
  }
  return out;
}

async function remoteQuotes(lang: Language, tracks: TrackId[]): Promise<Quote[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const native = new Set<TrackId>(NATIVE_TRACKS[lang] as readonly TrackId[]);
    const nativeTracks = tracks.filter((t) => native.has(t));
    const missingTracks = tracks.filter((t) => !native.has(t));
    const out: Quote[] = [];

    if (nativeTracks.length > 0) {
      const { data, error } = await supabase!
        .from('quotes')
        .select('id, text, tracks')
        .eq('language', lang)
        .eq('active', true)
        .overlaps('tracks', nativeTracks);
      if (error) throw error;
      for (const row of (data ?? []) as { id: string; text: string; tracks: string[] }[]) {
        out.push({ id: row.id, text: row.text, tracks: row.tracks as TrackId[] });
      }
    }
    if (missingTracks.length > 0) {
      const { data, error } = await supabase!
        .from('quotes')
        .select('id, text, tracks')
        .eq('language', 'en')
        .eq('active', true)
        .overlaps('tracks', missingTracks);
      if (error) throw error;
      for (const row of (data ?? []) as { id: string; text: string; tracks: string[] }[]) {
        out.push({ id: row.id, text: row.text, tracks: row.tracks as TrackId[], fallback: true });
      }
    }
    if (out.length === 0) return null;
    const seen = new Set<string>();
    return out.filter((q) => (seen.has(q.id) ? false : (seen.add(q.id), true)));
  } catch {
    return null;
  }
}

/** All quotes for the user's language + chosen tracks. Remote first, bundled fallback. */
export async function getQuotes(lang: Language, tracks: TrackId[]): Promise<Quote[]> {
  if (tracks.length === 0) return [];
  const key = `${lang}:${[...tracks].sort().join(',')}`;
  const cached = memCache.get(key);
  if (cached) return cached;
  const remote = await remoteQuotes(lang, tracks);
  const result = remote ?? localQuotes(lang, tracks);
  memCache.set(key, result);
  return result;
}

/** Deterministic quote of the day: stable per calendar date, rotates through the pool. */
export async function getQuoteOfTheDay(
  lang: Language,
  tracks: TrackId[],
  date = new Date(),
): Promise<Quote | null> {
  const quotes = await getQuotes(lang, tracks);
  if (quotes.length === 0) return null;
  const dayIndex = Math.floor(date.getTime() / 86_400_000);
  return quotes[((dayIndex % quotes.length) + quotes.length) % quotes.length];
}

/** A random quote, optionally excluding one id (used by the "New quote" shuffle). */
export async function getRandomQuote(
  lang: Language,
  tracks: TrackId[],
  excludeId?: string,
): Promise<Quote | null> {
  const quotes = await getQuotes(lang, tracks);
  const pool = excludeId ? quotes.filter((q) => q.id !== excludeId) : quotes;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export async function getQuotesByTrack(
  lang: Language,
  track: TrackId,
): Promise<Quote[]> {
  return getQuotes(lang, [track]);
}

/** The next N days of quotes — used to pre-schedule notifications with real content. */
export async function getUpcomingQuotes(
  lang: Language,
  tracks: TrackId[],
  days: number,
): Promise<{ date: Date; quote: Quote }[]> {
  const out: { date: Date; quote: Quote }[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    const quote = await getQuoteOfTheDay(lang, tracks, d);
    if (quote) out.push({ date: d, quote });
  }
  return out;
}
