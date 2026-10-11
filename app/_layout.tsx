import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { initLanguage } from '../lib/i18n';
import { ensureDailyQuotesScheduled, initNotificationHandler } from '../lib/notifications';
import { getChosenTracks, hasOnboarded, recordOpen } from '../lib/storage';
import { getQuoteOfTheDay } from '../lib/quotes';
import { refreshQuoteLiveActivity } from '../lib/liveActivity';

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      initNotificationHandler();
      const lang = await initLanguage();
      await recordOpen();
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
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade',
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
