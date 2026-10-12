/**
 * Themes for the immersive quote experience.
 * BeaTrackFam palette: black, white, light gray — original, not copied.
 */

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
  },
  {
    id: 'dawn',
    name: 'Dawn',
    bg: ['#1a0f2e', '#0a0a0a'],
    text: '#ffffff',
    accent: '#c9a96e',
    muted: '#8a7a9e',
    premium: false,
  },
  {
    id: 'storm',
    name: 'Storm',
    bg: ['#2a2a2a', '#0f0f0f'],
    text: '#f5f5f5',
    accent: '#cccccc',
    muted: '#777777',
    premium: false,
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
  },
  {
    id: 'ocean',
    name: 'Deep Ocean',
    bg: ['#0a1e2e', '#050a0f'],
    text: '#e7f5ff',
    accent: '#4da6ff',
    muted: '#5a7a9e',
    premium: true,
  },
  {
    id: 'forest',
    name: 'Forest',
    bg: ['#0a2e1a', '#050f0a'],
    text: '#e7ffe7',
    accent: '#4dff88',
    muted: '#5a9e7a',
    premium: true,
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
