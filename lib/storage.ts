import AsyncStorage from '@react-native-async-storage/async-storage';
import { BRAND, TRACKS, type TrackId } from './brand';

const P = BRAND.STORAGE_PREFIX;
const KEYS = {
  FAVORITES: `${P}/favorites`,
  LAST_OPEN: `${P}/last_open_date`,
  STREAK: `${P}/streak`,
  GRATITUDE_PREFIX: `${P}/gratitude/`,
  ONBOARDED: `${P}/onboarded`,
  NOTIF_SCHEDULED_THROUGH: `${P}/notif_scheduled_through`,
  TRACKS: `${P}/tracks`,
  NOTIF_ENABLED: `${P}/notif_enabled`,
  GOALS: `${P}/goals`,
  REMINDER_TIME: `${P}/reminder_time`,
  PLAN: `${P}/plan`,
  THEME: `${P}/theme`,
} as const;

function dayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// ---------- Favorites ----------
export async function getFavorites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.FAVORITES);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function toggleFavorite(id: string): Promise<boolean> {
  const favs = await getFavorites();
  const next = favs.includes(id) ? favs.filter((f) => f !== id) : [...favs, id];
  await AsyncStorage.setItem(KEYS.FAVORITES, JSON.stringify(next));
  return next.includes(id);
}

// ---------- Tracks ----------
const DEFAULT_TRACKS: TrackId[] = ['motivation', 'gratitude', 'resilience'];

export async function getChosenTracks(): Promise<TrackId[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.TRACKS);
    if (!raw) return DEFAULT_TRACKS;
    const parsed = JSON.parse(raw) as string[];
    const valid = parsed.filter((t): t is TrackId => (TRACKS as readonly string[]).includes(t));
    return valid.length > 0 ? valid : DEFAULT_TRACKS;
  } catch {
    return DEFAULT_TRACKS;
  }
}

export async function setChosenTracks(tracks: TrackId[]): Promise<void> {
  const valid = tracks.filter((t) => (TRACKS as readonly string[]).includes(t));
  await AsyncStorage.setItem(KEYS.TRACKS, JSON.stringify(valid.length > 0 ? valid : DEFAULT_TRACKS));
}

// ---------- Streak ----------
/** Call on every app foreground. Returns the current streak. */
export async function recordOpen(): Promise<number> {
  const today = dayKey();
  try {
    const last = await AsyncStorage.getItem(KEYS.LAST_OPEN);
    let streak = parseInt((await AsyncStorage.getItem(KEYS.STREAK)) ?? '0', 10) || 0;
    if (last === today) return streak;
    const yesterday = dayKey(new Date(Date.now() - 86_400_000));
    streak = last === yesterday ? streak + 1 : 1;
    await AsyncStorage.multiSet([
      [KEYS.LAST_OPEN, today],
      [KEYS.STREAK, String(streak)],
    ]);
    return streak;
  } catch {
    return 0;
  }
}

export async function getStreak(): Promise<number> {
  try {
    return parseInt((await AsyncStorage.getItem(KEYS.STREAK)) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

// ---------- Gratitude journal ----------
export async function getGratitude(date = new Date()): Promise<string> {
  try {
    return (await AsyncStorage.getItem(KEYS.GRATITUDE_PREFIX + dayKey(date))) ?? '';
  } catch {
    return '';
  }
}

export async function setGratitude(text: string, date = new Date()): Promise<void> {
  await AsyncStorage.setItem(KEYS.GRATITUDE_PREFIX + dayKey(date), text);
}

// ---------- Onboarding ----------
export async function hasOnboarded(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.ONBOARDED)) === '1';
}

export async function setOnboarded(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDED, '1');
}

// ---------- Notifications ----------
export async function getNotifScheduledThrough(): Promise<string | null> {
  return AsyncStorage.getItem(KEYS.NOTIF_SCHEDULED_THROUGH);
}

export async function setNotifScheduledThrough(dateKey: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIF_SCHEDULED_THROUGH, dateKey);
}

export async function isNotifEnabled(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.NOTIF_ENABLED)) === '1';
}

export async function setNotifEnabled(on: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.NOTIF_ENABLED, on ? '1' : '0');
}

// ---------- Goals ----------
export async function getGoals(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.GOALS);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export async function setGoals(goals: string[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.GOALS, JSON.stringify(goals));
}

// ---------- Reminder time ----------
export async function getReminderTime(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.REMINDER_TIME)) ?? '8am';
}

export async function setReminderTime(time: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.REMINDER_TIME, time);
}

// ---------- Plan (free / premium) ----------
export type PlanId = 'free' | 'premium';
export async function getPlan(): Promise<PlanId> {
  const raw = await AsyncStorage.getItem(KEYS.PLAN);
  return raw === 'premium' ? 'premium' : 'free';
}

export async function setPlan(plan: PlanId): Promise<void> {
  await AsyncStorage.setItem(KEYS.PLAN, plan);
}

// ---------- Theme ----------
export async function getThemeId(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.THEME)) ?? 'midnight';
}

export async function setThemeId(id: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.THEME, id);
}
