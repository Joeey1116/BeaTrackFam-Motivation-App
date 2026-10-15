import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Glass } from '../../components/Glass';
import { Colors, Radius, Spacing, Type } from '../../lib/design';
import { getPlan, isCompanionEnabled, isStreakBuddyEnabled, isRitualsEnabled,
  setCompanionEnabled, setStreakBuddyEnabled, setRitualsEnabled,
  isNotifEnabled, setNotifEnabled, getUserName, setUserName,
  getChosenTracks, setChosenTracks, getThemeId, setThemeId } from '../../lib/storage';
import { useStrings, setLanguage } from '../../lib/i18n';
import { TRACKS, TRACK_LABELS, BRAND, type TrackId } from '../../lib/brand';
import { THEMES } from '../../lib/themes';
import { useHavenPlus, SKU_NAMES } from '../../lib/purchases';

const PRIVACY_URL = 'https://beatrackfam.info/pages/hustle-heart-motivation-app-privacy-policy';
const TERMS_URL = 'https://beatrackfam.info/pages/terms-of-service';
const REVIEW_URL = 'https://apps.apple.com/app/id6821567537?action=write-review';

/**
 * Settings — structured per Joey's blueprint:
 * HAVEN / ABOUT YOU / MAKE IT YOURS / ACCOUNT / SUPPORT US / FOLLOW US / HELP / OTHER
 */
export default function Settings() {
  const { t, lang } = useStrings();
  const { purchase, restore, subscriptions, productsLoading } = useHavenPlus();
  const [plan, setPlanState] = useState<'haven' | 'haven-plus'>('haven');
  const [companion, setCompanion] = useState(true);
  const [buddy, setBuddy] = useState(true);
  const [rituals, setRituals] = useState(true);
  const [notifOn, setNotifOn] = useState(false);
  const [userName, setUserNameState] = useState('');
  const [busy, setBusy] = useState(false);
  const insets = useSafeAreaInsets();

  const load = useCallback(async () => {
    const p = await getPlan();
    setPlanState(p === 'haven-plus' ? 'haven-plus' : 'haven');
    setCompanion(await isCompanionEnabled());
    setBuddy(await isStreakBuddyEnabled());
    setRituals(await isRitualsEnabled());
    setNotifOn(await isNotifEnabled());
    setUserNameState(await getUserName());
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const openAppleSubs = () => {
    Linking.openURL('https://apps.apple.com/account/subscriptions');
  };

  const openPlaySubs = () => {
    Linking.openURL('https://play.google.com/store/account/subscriptions');
  };

  const manageSubscription = () => {
    Alert.alert(
      'Manage Subscription',
      'Your subscription is billed by Apple or Google. Tap below to manage it.',
      [
        { text: 'Apple Subscriptions', onPress: openAppleSubs },
        { text: 'Google Play Subscriptions', onPress: openPlaySubs },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const upgradeToPlus = () => {
    // Never open the paywall on a cold StoreKit fetch — that was the
    // "takes forever" sheet. Products are prefetched at app launch.
    if (productsLoading || subscriptions.length === 0) {
      Alert.alert(
        'One moment',
        'Loading Haven Plus plans…',
        [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }
    Alert.alert(
      'Haven Plus',
      'Lock-screen quotes, widgets, every theme, custom backgrounds, your own music, zero ads.\n\n14-day free trial on all plans — you choose, never automatic.',
      [
        // Live StoreKit prices — never hardcoded, so they can't drift.
        ...subscriptions.map((sub) => ({
          text: `${SKU_NAMES[sub.id] ?? sub.title} ${sub.displayPrice}`,
          onPress: () => handlePurchase(sub.id),
        })),
        { text: 'Restore Purchase', onPress: handleRestore },
        { text: 'Not Now', style: 'cancel' },
      ]
    );
  };

  const handlePurchase = async (sku: string) => {
    if (busy) return;
    setBusy(true);
    try {
      // purchase() resolves true ONLY on a verified transaction for this
      // SKU (see lib/purchases.ts). Cancel/failure → false, no grant.
      const ok = await purchase(sku);
      if (ok) {
        await load();
        Alert.alert(
          'Welcome to Haven Plus 💛',
          'Your subscription is active. Enjoy everything.'
        );
      }
      // Cancelled or failed → stay silent; the store sheet already said so.
    } finally {
      setBusy(false);
    }
  };

  const handleRestore = async () => {
    if (busy) return;
    setBusy(true);
    try {
      // restore() grants haven-plus itself on success (lib/purchases.ts).
      const ok = await restore();
      Alert.alert(
        ok ? 'Restored' : 'No Purchase Found',
        ok
          ? 'Your Haven Plus subscription has been restored.'
          : 'We couldn\'t find a previous Haven Plus purchase on this account.'
      );
      if (ok) load();
    } finally {
      setBusy(false);
    }
  };

  const editName = () => {
    Alert.prompt(
      'Your Name',
      'So your companion knows what to call you.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save',
          onPress: async (name?: string) => {
            const clean = (name ?? '').trim().slice(0, 40);
            await setUserName(clean);
            setUserNameState(clean);
          },
        },
      ],
      'plain-text',
      userName
    );
  };

  const editBeliefs = async () => {
    const chosen = await getChosenTracks();
    Alert.alert(
      'Faith & Topic Tracks',
      'Pick the tracks that feel like home. Tap to toggle.',
      [
        ...TRACKS.map((id: TrackId) => ({
          text: `${chosen.includes(id) ? '✓ ' : ''}${TRACK_LABELS[id]}`,
          onPress: async () => {
            const next = chosen.includes(id)
              ? chosen.filter((x) => x !== id)
              : [...chosen, id];
            // Keep at least one track
            if (next.length === 0) return;
            await setChosenTracks(next);
          },
        })),
        { text: 'Done', style: 'cancel' },
      ]
    );
  };

  const editLanguage = () => {
    const names: Record<string, string> = { en: 'English', he: 'עברית', es: 'Español' };
    Alert.alert(
      'Language',
      'Choose your language.',
      [
        ...(['en', 'he', 'es'] as const).map((l) => ({
          text: `${lang === l ? '✓ ' : ''}${names[l]}`,
          onPress: async () => {
            await setLanguage(l);
          },
        })),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const editThemes = async () => {
    const current = await getThemeId();
    const isPlus = plan === 'haven-plus';
    Alert.alert(
      'Themes',
      isPlus
        ? 'Make your home yours.'
        : 'Haven includes 3 themes. Haven Plus unlocks them all.',
      [
        ...THEMES.map((theme) => {
          const locked = !isPlus && theme.premium;
          return {
            text: `${current === theme.id ? '✓ ' : ''}${locked ? '🔒 ' : ''}${theme.name}`,
            onPress: async () => {
              if (locked) {
                upgradeToPlus();
                return;
              }
              await setThemeId(theme.id);
            },
          };
        }),
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const openSignIn = () => {
    Alert.alert(
      'Sign In (Optional)',
      'Sign in to sync your quotes, journal, and streak across devices. Coming in the next update — your data stays safe on this device for now.'
    );
  };

  const shareApp = async () => {
    try {
      await Share.share({
        message: 'Hustle & Heart — daily fuel for your grind. You are not alone. You are loved. 💛',
      });
    } catch {
      // dismissed
    }
  };

  const leaveReview = () => {
    Linking.openURL(REVIEW_URL).catch(() => {
      Alert.alert('Thank you!', 'You can leave a review on the App Store page for Hustle & Heart.');
    });
  };

  const whyWeBuiltThis = () => {
    Alert.alert(
      'Why We Built This',
      "We're a merch company — that's what we're known for. But we wanted to do something DIFFERENT.\n\nHustle & Heart is our love letter to everyone grinding through hard days. You are not alone. You are loved. 💛\n\n— Joey, BeaTrackFam"
    );
  };

  const supportResources = () => {
    Alert.alert(
      'Support Resources',
      'If you\'re struggling, please reach out. You matter.\n\n988 Suicide & Crisis Lifeline: call or text 988\nCrisis Text Line: text HOME to 741741\nNational Domestic Violence Hotline: 1-800-799-7233 or text START to 88788',
      [{ text: 'Close', style: 'cancel' }]
    );
  };

  const contactUs = () => {
    Linking.openURL('mailto:contact@beatrackfam.info?subject=Hustle%20%26%20Heart%20App');
  };

  const toggleCompanion = async (v: boolean) => {
    setCompanion(v);
    await setCompanionEnabled(v);
  };

  const toggleBuddy = async (v: boolean) => {
    setBuddy(v);
    await setStreakBuddyEnabled(v);
  };

  const toggleRituals = async (v: boolean) => {
    setRituals(v);
    await setRitualsEnabled(v);
  };

  const toggleNotif = async (v: boolean) => {
    setNotifOn(v);
    await setNotifEnabled(v);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.content,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 120 },
      ]}
    >
      <Text style={styles.title}>Settings</Text>

      {/* HAVEN */}
      <Text style={styles.section}>HAVEN</Text>
      <Glass style={styles.group}>
        <Pressable
          style={styles.row}
          onPress={plan === 'haven-plus' ? manageSubscription : upgradeToPlus}
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>
              {plan === 'haven-plus' ? 'Haven Plus' : 'Haven'} Plan
            </Text>
            <Text style={styles.rowDesc}>
              {plan === 'haven-plus'
                ? 'You\'re on Haven Plus. Thank you 💛 Tap to manage.'
                : productsLoading
                  ? 'Loading plans…'
                  : 'You\'re on the free Haven plan. Tap to see Haven Plus.'}
            </Text>
          </View>
          {productsLoading && plan !== 'haven-plus' ? (
            <ActivityIndicator size="small" color={Colors.textDim} />
          ) : (
            <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
          )}
        </Pressable>
        {plan === 'haven-plus' && (
          <Pressable onPress={manageSubscription} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Manage Subscription</Text>
              <Text style={styles.rowDesc}>Cancel or change — as easy as signing up.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
          </Pressable>
        )}
        {plan !== 'haven-plus' && (
          <Pressable onPress={handleRestore} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Restore Purchase</Text>
              <Text style={styles.rowDesc}>Already subscribed? Restore it here.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
          </Pressable>
        )}
      </Glass>

      {/* ABOUT YOU */}
      <Text style={styles.section}>ABOUT YOU</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row} onPress={editName}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Name</Text>
            <Text style={styles.rowDesc}>
              {userName ? `Hi, ${userName}!` : 'So your companion knows what to call you'}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
        <Pressable style={styles.row} onPress={editBeliefs}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Beliefs</Text>
            <Text style={styles.rowDesc}>Faith and topic tracks</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
      </Glass>

      {/* MAKE IT YOURS */}
      <Text style={styles.section}>MAKE IT YOURS</Text>
      <Glass style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>AI Companion</Text>
            <Text style={styles.rowDesc}>Friendly chat friend</Text>
          </View>
          <Switch value={companion} onValueChange={toggleCompanion} />
        </View>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Streak Buddy</Text>
            <Text style={styles.rowDesc}>Grows with your streak</Text>
          </View>
          <Switch value={buddy} onValueChange={toggleBuddy} />
        </View>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Daily Rituals</Text>
            <Text style={styles.rowDesc}>Morning greeting, evening wind-down</Text>
          </View>
          <Switch value={rituals} onValueChange={toggleRituals} />
        </View>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Notifications</Text>
            <Text style={styles.rowDesc}>Daily reminders and rituals</Text>
          </View>
          <Switch value={notifOn} onValueChange={toggleNotif} />
        </View>
        <Pressable style={styles.row} onPress={editLanguage}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Language</Text>
            <Text style={styles.rowDesc}>English, עברית, Español</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
        <Pressable style={styles.row} onPress={editThemes}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Themes</Text>
            <Text style={styles.rowDesc}>Make your home yours</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
      </Glass>

      {/* ACCOUNT */}
      <Text style={styles.section}>ACCOUNT</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row} onPress={openSignIn}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Sign In</Text>
            <Text style={styles.rowDesc}>Sync across devices (optional)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
      </Glass>

      {/* SUPPORT US */}
      <Text style={styles.section}>SUPPORT US</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row} onPress={shareApp}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Share Hustle & Heart</Text>
            <Text style={styles.rowDesc}>Tell someone who needs this</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
        <Pressable style={styles.row} onPress={leaveReview}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Leave a Review</Text>
            <Text style={styles.rowDesc}>It means the world to us</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
      </Glass>

      {/* FOLLOW US */}
      <Text style={styles.section}>FOLLOW US</Text>
      <Glass style={styles.group}>
        <Pressable
          style={styles.row}
          onPress={() => Linking.openURL('https://instagram.com/beatrackfam')}
        >
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Instagram</Text>
            <Text style={styles.rowDesc}>@beatrackfam</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
      </Glass>

      {/* HELP */}
      <Text style={styles.section}>HELP</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row} onPress={whyWeBuiltThis}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Why We Built This</Text>
            <Text style={styles.rowDesc}>Our story</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
        <Pressable style={styles.row} onPress={supportResources}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Support Resources</Text>
            <Text style={styles.rowDesc}>988, Crisis Text Line, DV Hotline — always here</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
        <Pressable style={styles.row} onPress={contactUs}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Contact Us</Text>
            <Text style={styles.rowDesc}>contact@beatrackfam.info</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
      </Glass>

      {/* OTHER */}
      <Text style={styles.section}>OTHER</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row} onPress={() => Linking.openURL(PRIVACY_URL)}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
        <Pressable style={styles.row} onPress={() => Linking.openURL(TERMS_URL)}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={Colors.textDim} />
        </Pressable>
      </Glass>

      <Text style={styles.footer}>
        Hustle & Heart v0.1{'\n'}You're not alone. You're loved. 💛
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    ...Type.display,
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  section: {
    ...Type.eyebrow,
    color: Colors.textDim,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  group: {
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    ...Type.title,
    color: Colors.text,
    marginBottom: 2,
  },
  rowDesc: {
    ...Type.caption,
    color: Colors.textMuted,
  },
  footer: {
    ...Type.caption,
    color: Colors.textDim,
    textAlign: 'center',
    marginTop: Spacing.xl,
  },
});
