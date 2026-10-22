import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initLanguage } from '../lib/i18n';
import { ensureDailyQuotesScheduled, initNotificationHandler } from '../lib/notifications';
import { getChosenTracks, hasOnboarded, recordOpen } from '../lib/storage';
import { getQuoteOfTheDay } from '../lib/quotes';
import { refreshQuoteLiveActivity } from '../lib/liveActivity';
import { maybeRequestTracking } from '../lib/tracking';
import { useHavenPlus } from '../lib/purchases';
import { ensureBackgroundAudio } from '../lib/audio';

/**
 * Mounts the IAP hook at launch: prefetches StoreKit products so the
 * paywall never opens on a cold fetch, and attaches the global purchase
 * listener so entitlements grant correctly. Renders nothing.
 */
function PurchaseBootstrap() {
  useHavenPlus();
  return null;
}

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      initNotificationHandler();
      // Music must keep playing with the app backgrounded (build 18).
      await ensureBackgroundAudio();
      const lang = await initLanguage();
      await recordOpen();
      await maybeRequestTracking();
      const tracks = await getChosenTracks();
      if (await hasOnboarded()) {
        await ensureDailyQuotesScheduled(lang, tracks);
        const qotd = await getQuoteOfTheDay(lang, tracks);
        if (qotd) await refreshQuoteLiveActivity(qotd);
      }
      setReady(true);
    })();
  }, []);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="light" />
      <PurchaseBootstrap />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          // NOT 'fade': the cross-fade rendered pushed screens (Themes,
          // Tracks, Account…) semi-transparent over the live tab screen
          // beneath, so rows ghosted/overlapped illegibly mid-navigation
          // (build 18 screen recording). An opaque slide keeps exactly
          // one screen visible at a time.
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="quote/today" options={{ presentation: 'card' }} />
      </Stack>
    </>
  );
}
