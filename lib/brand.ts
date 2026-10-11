/**
 * BRAND — the single identity source for the app.
 *
 * OFFICIAL NAME (locked Oct 11, 2026): "Hustle & Heart Motivation"
 * ("Hustle & Heart" alone was taken in Apple's App Store; 25 chars fits both stores’ 30-char limits.)
 * Use SHORT_NAME inside the app UI where space is tight (headers, tab titles).
 * Use APP_NAME for the official title: app display name, store listing, README.
 *
 * This app is STANDALONE: made by the same developer as BeaTrackFam but NOT a
 * BeaTrackFam product. No BeaTrackFam branding, logos, store links, or product
 * mentions may appear anywhere in the app, its content, or its listing.
 * The app SHELL stays faith-neutral and welcoming to all — no single-faith
 * iconography. Faith content lives ONLY inside opt-in tracks.
 */

export const BRAND = {
  APP_NAME: 'Hustle & Heart: Daily Motivation',
  SHORT_NAME: 'Hustle & Heart',
  SCHEME: 'hustleandheart',
  SLUG: 'hustle-heart',
  TAGLINE: 'Daily fuel for your grind.',
  STORAGE_PREFIX: '@hustleheart',
} as const;

/** The 7 content tracks. Users pick theirs during onboarding; changeable in Settings. */
export const TRACKS = [
  'motivation',
  'gratitude',
  'faith-christian',
  'faith-jewish',
  'loyalty',
  'hustle',
  'resilience',
] as const;

export type TrackId = (typeof TRACKS)[number];

/** Languages shipped in v1. Hebrew is RTL. */
export const LANGUAGES = ['en', 'he', 'es'] as const;
export type Language = (typeof LANGUAGES)[number];

export const RTL_LANGUAGES: readonly Language[] = ['he'];

/** Which tracks have native (non-English-fallback) quote libraries per language. */
export const NATIVE_TRACKS: Record<Language, readonly TrackId[]> = {
  en: ['motivation', 'gratitude', 'faith-christian', 'faith-jewish', 'loyalty', 'hustle', 'resilience'],
  he: ['faith-jewish', 'motivation'],
  es: ['motivation'],
};
