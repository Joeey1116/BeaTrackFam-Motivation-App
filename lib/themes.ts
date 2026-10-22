/**
 * Themes for the immersive quote experience.
 * BeaTrackFam palette: black, white, light gray — original, not copied.
 */

/**
 * Full app palette derived from a theme (build 20 — themes apply
 * app-wide, not just to the Today quote). Token names mirror lib/design
 * `Colors` so screens convert 1:1. `danger`/`success`/`overlay` stay
 * global semantic colors in lib/design and are NOT themed.
 */
export interface ThemePalette {
  /** Solid base behind gradients and the nav container. */
  background: string;
  surface: string;
  surfaceRaised: string;
  input: string;
  border: string;
  text: string;
  textMuted: string;
  textDim: string;
  accent: string;
  /** Primary CTA fill (white in Midnight, the theme accent elsewhere). */
  button: string;
  buttonText: string;
  tabActive: string;
  tabInactive: string;
}

export interface Theme {
  id: string;
  name: string;
  // Background gradient colors [top, bottom]
  bg: [string, string];
  // Quote text color
  text: string;
  // Accent (track label, buttons)
  accent: string;
  // Muted text
  muted: string;
  premium: boolean;
  // App-wide palette (build 20)
  palette: ThemePalette;
}

/** '#RRGGBB' + alpha 0..1 → rgba() string (for glass fills, scrims). */
export function withAlpha(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export const THEMES: Theme[] = [
  {
    id: 'midnight',
    name: 'Midnight',
    bg: ['#0a0a0a', '#1a1a1a'],
    text: '#ffffff',
    accent: '#ffffff',
    muted: '#888888',
    premium: false,
    // Midnight reproduces the original design.ts palette exactly, so
    // the default theme's look is unchanged by the app-wide rollout.
    palette: {
      background: '#000000',
      surface: '#161616',
      surfaceRaised: '#1E1E1E',
      input: '#1C1C1C',
      border: '#2A2A2A',
      text: '#FFFFFF',
      textMuted: '#B5B5B5',
      textDim: '#8A8A8A',
      accent: '#DFE4E8',
      button: '#FFFFFF',
      buttonText: '#000000',
      tabActive: '#FFFFFF',
      tabInactive: '#666666',
    },
  },
  {
    id: 'dawn',
    name: 'Dawn',
    bg: ['#1a0f2e', '#0a0a0a'],
    text: '#ffffff',
    accent: '#c9a96e',
    muted: '#8a7a9e',
    premium: false,
    palette: {
      background: '#0D0716',
      surface: '#1E1533',
      surfaceRaised: '#291D42',
      input: '#221739',
      border: '#3A2B57',
      text: '#FFFFFF',
      textMuted: '#C9BEDD',
      textDim: '#8A7A9E',
      accent: '#C9A96E',
      button: '#C9A96E',
      buttonText: '#1A0F2E',
      tabActive: '#FFFFFF',
      tabInactive: '#7A6A94',
    },
  },
  {
    id: 'storm',
    name: 'Storm',
    bg: ['#2a2a2a', '#0f0f0f'],
    text: '#f5f5f5',
    accent: '#cccccc',
    muted: '#777777',
    premium: false,
    palette: {
      background: '#0B0B0B',
      surface: '#1B1B1B',
      surfaceRaised: '#242424',
      input: '#202020',
      border: '#333333',
      text: '#F5F5F5',
      textMuted: '#BCBCBC',
      textDim: '#8F8F8F',
      accent: '#CCCCCC',
      button: '#EDEDED',
      buttonText: '#101010',
      tabActive: '#F5F5F5',
      tabInactive: '#6E6E6E',
    },
  },
  // Premium themes
  {
    id: 'gold',
    name: 'Gold Hour',
    bg: ['#2e1f0a', '#0a0a0a'],
    text: '#fff8e7',
    accent: '#ffd700',
    muted: '#a08c5a',
    premium: true,
    palette: {
      background: '#0F0A03',
      surface: '#241A0C',
      surfaceRaised: '#31230F',
      input: '#291D0C',
      border: '#46351A',
      text: '#FFF8E7',
      textMuted: '#D8C9A3',
      textDim: '#A08C5A',
      accent: '#FFD700',
      button: '#FFD700',
      buttonText: '#241A02',
      tabActive: '#FFF8E7',
      tabInactive: '#8A7648',
    },
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    bg: ['#0a1e2e', '#050a0f'],
    text: '#e7f5ff',
    accent: '#4da6ff',
    muted: '#5a7a9e',
    premium: true,
    palette: {
      background: '#04090F',
      surface: '#0C1D2C',
      surfaceRaised: '#122839',
      input: '#0F2233',
      border: '#1E3D57',
      text: '#E7F5FF',
      textMuted: '#A9C6DE',
      textDim: '#5A7A9E',
      accent: '#4DA6FF',
      button: '#4DA6FF',
      buttonText: '#04121F',
      tabActive: '#E7F5FF',
      tabInactive: '#4A6A88',
    },
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: ['#0a2e1a', '#050f0a'],
    text: '#e7ffe7',
    accent: '#4dff88',
    muted: '#5a9e7a',
    premium: true,
    palette: {
      background: '#040D08',
      surface: '#0C2417',
      surfaceRaised: '#12301F',
      input: '#0F2819',
      border: '#1E4630',
      text: '#E7FFE7',
      textMuted: '#ABD8BC',
      textDim: '#5A9E7A',
      accent: '#4DFF88',
      button: '#4DFF88',
      buttonText: '#04150A',
      tabActive: '#E7FFE7',
      tabInactive: '#4A8262',
    },
  },
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

export function getFreeThemes(): Theme[] {
  return THEMES.filter((t) => !t.premium);
}

export function getPremiumThemes(): Theme[] {
  return THEMES.filter((t) => t.premium);
}
