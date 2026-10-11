import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Glass } from '../components/Glass';
import { TrackPicker } from '../components/TrackPicker';
import { BRAND, LANGUAGES, type Language, type TrackId } from '../lib/brand';
import { setLanguage, t, useStrings } from '../lib/i18n';
import { setChosenTracks, setNotifEnabled, setOnboarded } from '../lib/storage';
import { ensureDailyQuotesScheduled, requestPermission } from '../lib/notifications';
import { getLanguage } from '../lib/i18n';
import { getQuoteOfTheDay } from '../lib/quotes';
import { refreshQuoteLiveActivity } from '../lib/liveActivity';

const STEPS = ['welcome', 'language', 'tracks', 'notifications'] as const;

export default function Onboarding() {
  const { t: tr, lang } = useStrings();
  const [step, setStep] = useState(0);
  const [tracks, setTracks] = useState<TrackId[]>(['motivation', 'gratitude', 'resilience']);
  const [restartNeeded, setRestartNeeded] = useState(false);
  const [busy, setBusy] = useState(false);

  const toggleTrack = (id: TrackId) =>
    setTracks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const pickLanguage = async (l: Language) => {
    const needsRestart = await setLanguage(l);
    setRestartNeeded(needsRestart);
  };

  const finish = async (enableNotif: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      await setChosenTracks(tracks);
      if (enableNotif) {
        const granted = await requestPermission();
        await setNotifEnabled(granted);
        if (granted) {
          const q = await getQuoteOfTheDay(getLanguage(), tracks);
          await ensureDailyQuotesScheduled(getLanguage(), tracks);
          if (q) await refreshQuoteLiveActivity(q);
        }
      } else {
        await setNotifEnabled(false);
      }
      await setOnboarded();
      router.replace('/(tabs)');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {step === 0 && (
          <View style={styles.center}>
            <Image source={require('../assets/mark.png')} style={styles.heroMark} />
            <Text style={styles.appName}>{BRAND.SHORT_NAME}</Text>
            <Text style={styles.tagline}>{tr('onboarding.tagline')}</Text>
          </View>
        )}

        {step === 1 && (
          <View style={styles.step}>
            <Text style={styles.h1}>{tr('onboarding.languageTitle')}</Text>
            <Text style={styles.sub}>{tr('onboarding.languageSubtitle')}</Text>
            <View style={styles.list}>
              {LANGUAGES.map((l) => (
                <Pressable key={l} onPress={() => pickLanguage(l)}>
                  <Glass style={[styles.opt, lang === l && styles.optActive]}>
                    <Text style={styles.optText}>{tr(`languages.${l}`)}</Text>
                    {lang === l ? <Ionicons name="checkmark-circle" size={22} color="#fff" /> : null}
                  </Glass>
                </Pressable>
              ))}
            </View>
            {restartNeeded ? <Text style={styles.note}>{tr('settings.restartNote')}</Text> : null}
          </View>
        )}

        {step === 2 && (
          <View style={styles.step}>
            <Text style={styles.h1}>{tr('onboarding.tracksTitle')}</Text>
            <Text style={styles.sub}>{tr('onboarding.tracksSubtitle')}</Text>
            <TrackPicker selected={tracks} onToggle={toggleTrack} />
            <Text style={styles.hint}>{tr('onboarding.tracksHint')}</Text>
          </View>
        )}

        {step === 3 && (
          <View style={styles.center}>
            <View style={styles.bellWrap}>
              <Ionicons name="notifications" size={48} color="#fff" />
            </View>
            <Text style={styles.h1}>{tr('onboarding.notifTitle')}</Text>
            <Text style={styles.subCenter}>{tr('onboarding.notifBody')}</Text>
            <Pressable
              style={[styles.primary, busy && styles.disabled]}
              onPress={() => finish(true)}
              disabled={busy}
            >
              <Text style={styles.primaryText}>{tr('onboarding.allow')}</Text>
            </Pressable>
            <Pressable onPress={() => finish(false)} disabled={busy} style={styles.skip}>
              <Text style={styles.skipText}>{tr('onboarding.skip')}</Text>
            </Pressable>
          </View>
        )}

        {step < 3 && (
          <Pressable
            style={[styles.primary, step === 2 && tracks.length === 0 && styles.disabled]}
            disabled={step === 2 && tracks.length === 0}
            onPress={() => setStep(step + 1)}
          >
            <Text style={styles.primaryText}>{tr('onboarding.continue')}</Text>
          </Pressable>
        )}

        <View style={styles.dots}>
          {STEPS.map((_, i) => (
            <View key={i} style={[styles.dot, i === step && styles.dotActive]} />
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flexGrow: 1, padding: 24, justifyContent: 'center', gap: 24 },
  center: { alignItems: 'center', gap: 16 },
  step: { gap: 12 },
  heroMark: { width: 110, height: 110 },
  appName: { color: '#fff', fontSize: 34, fontWeight: '900', letterSpacing: -0.5, textAlign: 'center' },
  tagline: { color: '#999', fontSize: 16, textAlign: 'center' },
  h1: { color: '#fff', fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  sub: { color: '#999', fontSize: 15, lineHeight: 22 },
  subCenter: { color: '#999', fontSize: 15, lineHeight: 22, textAlign: 'center' },
  list: { gap: 12, marginTop: 8 },
  opt: { borderRadius: 16, padding: 18, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  optActive: { borderColor: '#fff' },
  optText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  note: { color: '#f5c518', fontSize: 13, marginTop: 4 },
  hint: { color: '#666', fontSize: 13 },
  bellWrap: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#1a1a1a', alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: '#fff', borderRadius: 16, padding: 18, alignItems: 'center', marginTop: 8 },
  primaryText: { color: '#000', fontSize: 17, fontWeight: '800' },
  disabled: { opacity: 0.4 },
  skip: { padding: 12 },
  skipText: { color: '#999', fontSize: 15, fontWeight: '600' },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#333' },
  dotActive: { backgroundColor: '#fff' },
});
