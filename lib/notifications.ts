import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Linking from 'expo-linking';
import {
  SchedulableTriggerInputTypes,
  addNotificationResponseReceivedListener,
  cancelAllScheduledNotificationsAsync,
  getPermissionsAsync,
  requestPermissionsAsync,
  scheduleNotificationAsync,
  setNotificationChannelAsync,
  setNotificationHandler,
  type NotificationPermissionsStatus,
} from 'expo-notifications';
import { BRAND, type Language, type TrackId } from './brand';
import { t } from './i18n';
import { getUpcomingQuotes } from './quotes';
import { getNotifScheduledThrough, setNotifScheduledThrough } from './storage';

export const DAILY_HOUR = 8; // 8:00 AM local
export const SCHEDULE_AHEAD_DAYS = 14;
const CHANNEL_ID = 'daily-quotes';

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

/** Must be called once at app startup (before any scheduling). */
export function initNotificationHandler(): void {
  setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  if (Platform.OS === 'android') {
    void setNotificationChannelAsync(CHANNEL_ID, {
      name: t('notifications.channelName'),
      description: t('notifications.channelDesc', { app: BRAND.SHORT_NAME }),
      importance: 4, // MAX
      vibrationPattern: [0, 250, 250, 250],
    });
  }

  // Deep link on tap: opens the quote of the day screen.
  addNotificationResponseReceivedListener((response) => {
    const url = response.notification.request.content.data?.url;
    if (typeof url === 'string' && url.length > 0) {
      void Linking.openURL(url);
    }
  });
}

export async function getPermissionStatus(): Promise<NotificationPermissionsStatus> {
  return getPermissionsAsync();
}

/**
 * Request push permission. Call this ONLY after the user taps through the
 * in-app soft prompt (onboarding), never cold on launch.
 */
export async function requestPermission(): Promise<boolean> {
  if (!Device.isDevice) return false;
  const { status } = await requestPermissionsAsync({
    ios: { allowAlert: true, allowBadge: false, allowSound: true },
  });
  return status === 'granted';
}

/**
 * Ensure the next SCHEDULE_AHEAD_DAYS of 8:00 AM notifications exist, each
 * carrying that day's actual quote in the user's language and tracks.
 * Idempotent and safe to call on every foreground: it only reschedules when
 * the window has lapsed or the language/tracks changed (tracked via key).
 */
export async function ensureDailyQuotesScheduled(
  lang: Language,
  tracks: TrackId[],
): Promise<void> {
  const { status } = await getPermissionsAsync();
  if (status !== 'granted' || tracks.length === 0) return;

  const today = new Date();
  const windowKey = `${dayKey(today)}|${lang}|${[...tracks].sort().join(',')}`;
  const scheduledThrough = await getNotifScheduledThrough();
  if (scheduledThrough === windowKey) return; // window still valid

  // Rebuild the full window (cancels stale entries first).
  await cancelAllScheduledNotificationsAsync();

  const upcoming = await getUpcomingQuotes(lang, tracks, SCHEDULE_AHEAD_DAYS);
  for (const { date, quote } of upcoming) {
    const fireDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), DAILY_HOUR, 0, 0);
    if (fireDate.getTime() <= Date.now()) continue; // today's 8am already passed
    await scheduleNotificationAsync({
      content: {
        title: `${BRAND.SHORT_NAME} — ${t('onboarding.notifTitle')}`,
        body: quote.text,
        data: { url: `${BRAND.SCHEME}://quote/today`, quoteId: quote.id },
        ...(Platform.OS === 'android' ? { channelId: CHANNEL_ID } : {}),
      },
      trigger: {
        type: SchedulableTriggerInputTypes.DATE,
        date: fireDate,
      },
    });
  }

  await setNotifScheduledThrough(windowKey);
}

/** Call when the user disables reminders in Settings. */
export async function cancelDailyQuotes(): Promise<void> {
  await cancelAllScheduledNotificationsAsync();
  await setNotifScheduledThrough('');
}
