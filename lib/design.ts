import type { TextStyle } from 'react-native';

/**
 * Hustle & Heart design system — ported from the main BeaTrackFam app
 * (v12.2.3, constants/theme.ts). Same SYSTEM: type scale, spacing scale,
 * radius scale, button and card patterns. The app keeps its own
 * black/white/gray brand identity and stays dark-first; no BeaTrackFam
 * logos or store content are used.
 *
 * Colors below are the main app's dark palette verbatim
 * (DarkColors in the main app) — Hustle & Heart is a dark-mode app.
 */
export const Colors = {
  background: '#000000',
  surface: '#161616',
  surfaceRaised: '#1E1E1E',
  input: '#1C1C1C',
  border: '#2A2A2A',
  text: '#FFFFFF',
  textMuted: '#B5B5B5',
  textDim: '#8A8A8A',
  button: '#FFFFFF',
  buttonText: '#000000',
  tabBar: '#0A0A0A',
  danger: '#F2555A',
  success: '#3FB96B',
  overlay: 'rgba(0,0,0,0.6)',
  /** Logo blue-gray — glows on black. Theme-aware accent. */
  accent: '#DFE4E8',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  pill: 999,
} as const;

/**
 * Type scale — system font, weight-800 headlines, tight tracking on the
 * big display lines. Spread into Text styles: {...Type.headline}.
 */
export const Type: Record<string, TextStyle> = {
  /** Hero greetings / screen titles. */
  display: { fontSize: 30, fontWeight: '800', lineHeight: 36, letterSpacing: -0.4 },
  /** Screen-level headlines. */
  headline: { fontSize: 24, fontWeight: '800', lineHeight: 30, letterSpacing: -0.3 },
  /** Section headers. */
  section: { fontSize: 19, fontWeight: '800', lineHeight: 24 },
  /** Card + row titles. */
  title: { fontSize: 15, fontWeight: '700', lineHeight: 20 },
  /** Default body copy. */
  body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  /** Small print under titles. */
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  /** "See all" / inline links. */
  link: { fontSize: 13, fontWeight: '700' },
  /** Uppercase kickers above sections. */
  eyebrow: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
};
