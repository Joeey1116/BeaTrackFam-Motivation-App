import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../components/Screen';
import { Glass } from '../components/Glass';
import { BRAND, LANGUAGES, TRACKS, type Language, type TrackId } from '../lib/brand';
import { setLanguage, useStrings } from '../lib/i18n';
import {
  setChosenTracks,
  setGoals,
  setReminderTime,
  setNotifEnabled,
  setOnboarded,
  setPlan,
  setCompanionEnabled,
  setStreakBuddyEnabled,
  setRitualsEnabled,
} from '../lib/storage';
import { ensureDailyQuotesScheduled, requestPermission } from '../lib/notifications';
import { getLanguage } from '../lib/i18n';
import { getQuoteOfTheDay } from '../lib/quotes';
import { refreshQuoteLiveActivity } from '../lib/liveActivity';

const STEPS = [
  'welcome',
  'beliefs',
  'goals',
  'language',
  'makeItYours',
  'yourHome',
  'reminders',
  'premium',
  'notifications',
] as const;

type Step = (typeof STEPS)[number];

const GOALS = [
  'find-calm',
  'build-confidence',
  'improve-focus',
  'find-happiness',
  'reduce-stress',
  'stay-grateful',
] as const;
type GoalId = (typeof GOALS)[number];

const REMINDER_OPTIONS = [
  { id: '6am', label: '6:00 AM' },
  { id: '7am', label: '7:00 AM' },
  { id: '8am', label: '8:00 AM' },
  { id: '9am', label: '9:00 AM' },
  { id: 'none', label: 'No reminders' },
] as const;

const TRACK_LABELS: Record<TrackId, string> = {
  motivation: 'General Motivation',
  gratitude: 'Gratitude',
  'faith-christian': 'Christianity',
  'faith-jewish': 'Judaism',
  loyalty: 'Loyalty',
  hustle: 'Hustle',
  resilience: 'Resilience',
};

const GOAL_LABELS: Record<GoalId, string> = {
  'find-calm': 'Find calm',
  'build-confidence': 'Build confidence',
  'improve-focus': 'Improve focus',
  'find-happiness': 'Find happiness',
  'reduce-stress': 'Reduce stress',
  'stay-grateful': 'Stay grateful',
};

export default function Onboarding() {
  const { t: tr, lang } = useStrings();
  const [stepIdx, setStepIdx] = useState(0);
  const [tracks, setTracks] = useState<TrackId[]>(['motivation', 'gratitude', 'resilience']);
  const [goals, setGoalsState] = useState<GoalId[]>([]);
  const [reminder, setReminder] = useState<string>('8am');
  const [wantCompanion, setWantCompanion] = useState(true);
  const [wantBuddy, setWantBuddy] = useState(true);
  const [wantRituals, setWantRituals] = useState(true);
  const [busy, setBusy] = useState(false);

  const step: Step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  const next = () => {
    if (!isLast) setStepIdx(stepIdx + 1);
  };
  const back = () => {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  };
  const skip = () => {
    // X button — jump straight past premium/notifications to finish
    finish(false);
  };

  const toggleTrack = (id: TrackId) =>
    setTracks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const toggleGoal = (id: GoalId) =>
    setGoalsState((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const pickLanguage = async (l: Language) => {
    await setLanguage(l);
  };

  const finish = async (enableNotif: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      await setChosenTracks(tracks);
      await setGoals(goals);
      await setReminderTime(reminder);
      await setPlan('haven'); // Everyone starts on free; premium is opt-in
      await setCompanionEnabled(wantCompanion);
      await setStreakBuddyEnabled(wantBuddy);
      await setRitualsEnabled(wantRituals);
      if (enableNotif && reminder !== 'none') {
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

  const handlePremiumChoice = (choice: 'trial' | 'skip') => {
    if (choice === 'trial') {
      // TODO: Launch subscription purchase flow (StoreKit/Billing)
      // For now, mark as free — actual purchase comes in subscriptions task
      setPlan('haven');
    }
    next(); // Go to notifications step
  };

  return (
    <Screen>
      {/* Progress + X */}
      <View style={styles.topBar}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${((stepIdx + 1) / STEPS.length) * 100}%` }]} />
        </View>
        {(step === 'premium' || step === 'notifications') && (
          <Pressable onPress={skip} style={styles.xButton} hitSlop={12}>
            <Ionicons name="close" size={24} color="#fff" />
          </Pressable>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        {step === 'welcome' && (
          <View style={styles.center}>
            <Image source={require('../assets/mark.png')} style={styles.heroMark} />
            <Text style={styles.appName}>{BRAND.SHORT_NAME}</Text>
            <Text style={styles.tagline}>{BRAND.TAGLINE}</Text>
            <Text style={styles.welcomeSub}>
              Your daily home for motivation, calm, and strength.
            </Text>
          </View>
        )}

        {step === 'beliefs' && (
          <View style={styles.step}>
            <Text style={styles.h1}>What speaks to your heart?</Text>
            <Text style={styles.sub}>Pick the tracks that feel like home. You can change these anytime.</Text>
            <View style={styles.list}>
              {TRACKS.map((id) => (
                <Pressable key={id} onPress={() => toggleTrack(id)}>
                  <Glass style={[styles.opt, tracks.includes(id) && styles.optActive]}>
                    <Text style={styles.optText}>{TRACK_LABELS[id]}</Text>
                    {tracks.includes(id) ? (
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    ) : (
                      <View style={styles.radio} />
                    )}
                  </Glass>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 'goals' && (
          <View style={styles.step}>
            <Text style={styles.h1}>What do you want from this app?</Text>
            <Text style={styles.sub}>Select all that apply — we'll shape your experience around them.</Text>
            <View style={styles.list}>
              {GOALS.map((id) => (
                <Pressable key={id} onPress={() => toggleGoal(id)}>
                  <Glass style={[styles.opt, goals.includes(id) && styles.optActive]}>
                    <Text style={styles.optText}>{GOAL_LABELS[id]}</Text>
                    {goals.includes(id) ? (
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    ) : (
                      <View style={styles.radio} />
                    )}
                  </Glass>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 'language' && (
          <View style={styles.step}>
            <Text style={styles.h1}>{tr('onboarding.languageTitle')}</Text>
            <Text style={styles.sub}>{tr('onboarding.languageSubtitle')}</Text>
            <View style={styles.list}>
              {LANGUAGES.map((l) => (
                <Pressable key={l} onPress={() => pickLanguage(l)}>
                  <Glass style={[styles.opt, lang === l && styles.optActive]}>
                    <Text style={styles.optText}>{tr(`languages.${l}`)}</Text>
                    {lang === l ? (
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    ) : (
                      <View style={styles.radio} />
                    )}
                  </Glass>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 'makeItYours' && (
          <View style={styles.step}>
            <Text style={styles.h1}>Make it yours</Text>
            <Text style={styles.sub}>
              How do you want Hustle & Heart to feel? Turn on what speaks to you —
              the app works beautifully either way.
            </Text>
            <View style={styles.list}>
              <Pressable onPress={() => setWantCompanion(!wantCompanion)}>
                <Glass style={[styles.opt, wantCompanion && styles.optActive]}>
                  <View style={styles.optInfo}>
                    <Text style={styles.optText}>AI Companion</Text>
                    <Text style={styles.optDesc}>A friendly chat friend who's there when you need to talk</Text>
                  </View>
                  <View style={[styles.toggle, wantCompanion && styles.toggleOn]}>
                    <View style={[styles.knob, wantCompanion && styles.knobOn]} />
                  </View>
                </Glass>
              </Pressable>
              <Pressable onPress={() => setWantBuddy(!wantBuddy)}>
                <Glass style={[styles.opt, wantBuddy && styles.optActive]}>
                  <View style={styles.optInfo}>
                    <Text style={styles.optText}>Streak Buddy</Text>
                    <Text style={styles.optDesc}>A little companion that grows as your streak builds</Text>
                  </View>
                  <View style={[styles.toggle, wantBuddy && styles.toggleOn]}>
                    <View style={[styles.knob, wantBuddy && styles.knobOn]} />
                  </View>
                </Glass>
              </Pressable>
              <Pressable onPress={() => setWantRituals(!wantRituals)}>
                <Glass style={[styles.opt, wantRituals && styles.optActive]}>
                  <View style={styles.optInfo}>
                    <Text style={styles.optText}>Daily Rituals</Text>
                    <Text style={styles.optDesc}>Morning greeting and evening wind-down</Text>
                  </View>
                  <View style={[styles.toggle, wantRituals && styles.toggleOn]}>
                    <View style={[styles.knob, wantRituals && styles.knobOn]} />
                  </View>
                </Glass>
              </Pressable>
            </View>
            <Text style={styles.freeNote}>
              Not a fan of AI? Turn it off — you'll still get quotes, journal, and streaks.
            </Text>
          </View>
        )}

        {step === 'yourHome' && (
          <View style={styles.step}>
            <Text style={styles.h1}>This is your home</Text>
            <Text style={styles.sub}>
              Not tabs. Rooms. Each one is a space that's yours —
              walk in whenever you need it.
            </Text>
            <View style={styles.list}>
              <Glass style={styles.roomCard}>
                <Text style={styles.roomEmoji}>☀️</Text>
                <View style={styles.optInfo}>
                  <Text style={styles.optText}>Today</Text>
                  <Text style={styles.optDesc}>Your living room — daily quote, streak, grounding</Text>
                </View>
              </Glass>
              <Glass style={styles.roomCard}>
                <Text style={styles.roomEmoji}>📓</Text>
                <View style={styles.optInfo}>
                  <Text style={styles.optText}>Journal</Text>
                  <Text style={styles.optDesc}>Your private study — just for you, nobody else sees it</Text>
                </View>
              </Glass>
              <Glass style={styles.roomCard}>
                <Text style={styles.roomEmoji}>💭</Text>
                <View style={styles.optInfo}>
                  <Text style={styles.optText}>Mood</Text>
                  <Text style={styles.optDesc}>Your check-in corner — how are you, really?</Text>
                </View>
              </Glass>
              <Glass style={styles.roomCard}>
                <Text style={styles.roomEmoji}>🌬️</Text>
                <View style={styles.optInfo}>
                  <Text style={styles.optText}>Breathe</Text>
                  <Text style={styles.optDesc}>Your quiet room — calm is always here</Text>
                </View>
              </Glass>
              {wantCompanion && (
                <Glass style={styles.roomCard}>
                  <Text style={styles.roomEmoji}>💛</Text>
                  <View style={styles.optInfo}>
                    <Text style={styles.optText}>Companion</Text>
                    <Text style={styles.optDesc}>Where your friend hangs out — always here for you</Text>
                  </View>
                </Glass>
              )}
            </View>
          </View>
        )}

        {step === 'reminders' && (
          <View style={styles.step}>
            <Text style={styles.h1}>When should your quote arrive?</Text>
            <Text style={styles.sub}>A gentle nudge to start your day right.</Text>
            <View style={styles.list}>
              {REMINDER_OPTIONS.map((opt) => (
                <Pressable key={opt.id} onPress={() => setReminder(opt.id)}>
                  <Glass style={[styles.opt, reminder === opt.id && styles.optActive]}>
                    <Text style={styles.optText}>{opt.label}</Text>
                    {reminder === opt.id ? (
                      <Ionicons name="checkmark-circle" size={22} color="#fff" />
                    ) : (
                      <View style={styles.radio} />
                    )}
                  </Glass>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {step === 'premium' && (
          <View style={styles.step}>
            <View style={styles.premiumCard}>
              <Text style={styles.havenBadge}>You're on Haven</Text>
              <Text style={styles.premiumTitle}>Haven Plus</Text>
              <Text style={styles.premiumSub}>
                Lock-screen quotes, widgets, every theme, custom backgrounds,
                your own music, zero ads.
              </Text>
              <View style={styles.tierList}>
                <View style={styles.tier}>
                  <Text style={styles.tierName}>Monthly</Text>
                  <Text style={styles.tierPrice}>$2.99/mo</Text>
                </View>
                <View style={styles.tier}>
                  <Text style={styles.tierName}>3 Months</Text>
                  <Text style={styles.tierPrice}>$7.99</Text>
                </View>
                <View style={styles.tier}>
                  <Text style={styles.tierName}>6 Months</Text>
                  <Text style={styles.tierPrice}>$14.99</Text>
                </View>
                <View style={styles.tier}>
                  <Text style={styles.tierName}>Yearly</Text>
                  <Text style={styles.tierPrice}>$19.99</Text>
                  <Text style={styles.tierSave}>Best value</Text>
                </View>
              </View>
              <Text style={styles.trialNote}>14-day free trial on all plans. Cancel anytime in one tap. You choose — never automatic.</Text>
              <Pressable
                style={styles.premiumButton}
                onPress={() => handlePremiumChoice('trial')}
              >
                <Text style={styles.premiumButtonText}>Try Haven Plus Free</Text>
              </Pressable>
              <Pressable onPress={() => handlePremiumChoice('skip')}>
                <Text style={styles.skipPremium}>Stay on Haven (Free)</Text>
              </Pressable>
            </View>
            <Text style={styles.freeNote}>
              Haven is complete — daily quotes, all tracks, journal, wellness, companion, music.
              Haven Plus is just the extras.
            </Text>
          </View>
        )}

        {step === 'notifications' && (
          <View style={styles.center}>
            <Ionicons name="notifications-outline" size={64} color="#fff" />
            <Text style={styles.h1}>Stay in the flow</Text>
            <Text style={styles.sub}>
              Allow notifications so your daily quote and reminders can reach you.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bottom actions */}
      <View style={styles.footer}>
        {stepIdx > 0 && step !== 'premium' && (
          <Pressable onPress={back} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </Pressable>
        )}
        {step === 'welcome' && (
          <Pressable onPress={next} style={styles.primaryButton}>
            <Text style={styles.primaryText}>Get Started</Text>
          </Pressable>
        )}
        {['beliefs', 'goals', 'language', 'makeItYours', 'yourHome', 'reminders'].includes(step) && (
          <Pressable
            onPress={next}
            style={[styles.primaryButton, step === 'beliefs' && tracks.length === 0 && styles.disabled]}
            disabled={step === 'beliefs' && tracks.length === 0}
          >
            <Text style={styles.primaryText}>Continue</Text>
          </Pressable>
        )}
        {step === 'notifications' && (
          <View style={styles.notifRow}>
            <Pressable onPress={() => finish(false)} style={styles.secondaryButton}>
              <Text style={styles.secondaryText}>Not Now</Text>
            </Pressable>
            <Pressable onPress={() => finish(true)} style={styles.primaryButton}>
              <Text style={styles.primaryText}>Allow</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 12,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 2,
  },
  xButton: {
    padding: 4,
  },
  body: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  step: {
    flex: 1,
  },
  heroMark: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 17,
    color: '#999',
    textAlign: 'center',
  },
  welcomeSub: {
    fontSize: 15,
    color: '#777',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  h1: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: '#999',
    marginBottom: 20,
    lineHeight: 22,
  },
  list: {
    gap: 10,
  },
  opt: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 14,
  },
  optActive: {
    borderWidth: 1.5,
    borderColor: '#fff',
  },
  optText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  optInfo: {
    flex: 1,
    marginRight: 12,
  },
  optDesc: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
    lineHeight: 18,
  },
  toggle: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#333',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  toggleOn: {
    backgroundColor: '#fff',
  },
  knob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#666',
  },
  knobOn: {
    backgroundColor: '#000',
    alignSelf: 'flex-end',
  },
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  roomEmoji: {
    fontSize: 28,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    borderColor: '#555',
  },
  premiumCard: {
    backgroundColor: '#1a1a1a',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  premiumTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#fff',
  },
  premiumSub: {
    fontSize: 15,
    color: '#aaa',
    textAlign: 'center',
    lineHeight: 22,
  },
  priceRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  price: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
  },
  priceAlt: {
    fontSize: 15,
    color: '#888',
    marginTop: 2,
  },
  trialNote: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
  },
  premiumButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 8,
    width: '100%',
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  havenBadge: {
    fontSize: 13,
    fontWeight: '700',
    color: '#4CAF50',
    backgroundColor: '#1a2a1a',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tierList: {
    width: '100%',
    gap: 8,
    marginVertical: 16,
  },
  tier: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 14,
  },
  tierName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
  },
  tierPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  tierSave: {
    fontSize: 11,
    color: '#4CAF50',
    fontWeight: '600',
  },
  skipPremium: {
    fontSize: 15,
    color: '#888',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  freeNote: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 12,
  },
  primaryButton: {
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
  },
  primaryText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#000',
  },
  disabled: {
    opacity: 0.4,
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backText: {
    fontSize: 15,
    color: '#888',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    flex: 1,
  },
  secondaryText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  notifRow: {
    flexDirection: 'row',
    gap: 12,
  },
});
