import { useCallback, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Glass } from '../../components/Glass';
import { getPlan, isCompanionEnabled, isStreakBuddyEnabled, isRitualsEnabled,
  setCompanionEnabled, setStreakBuddyEnabled, setRitualsEnabled,
  isNotifEnabled, setNotifEnabled } from '../../lib/storage';
import { useStrings } from '../../lib/i18n';

/**
 * Settings — structured per Joey's blueprint:
 * HAVEN / ABOUT YOU / MAKE IT YOURS / ACCOUNT / SUPPORT US / FOLLOW US / HELP / OTHER
 */
export default function Settings() {
  const { t } = useStrings();
  const [plan, setPlanState] = useState<'haven' | 'haven-plus'>('haven');
  const [companion, setCompanion] = useState(true);
  const [buddy, setBuddy] = useState(true);
  const [rituals, setRituals] = useState(true);
  const [notifOn, setNotifOn] = useState(false);

  const load = useCallback(async () => {
    const p = await getPlan();
    setPlanState(p === 'haven-plus' ? 'haven-plus' : 'haven');
    setCompanion(await isCompanionEnabled());
    setBuddy(await isStreakBuddyEnabled());
    setRituals(await isRitualsEnabled());
    setNotifOn(await isNotifEnabled());
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* HAVEN */}
      <Text style={styles.section}>HAVEN</Text>
      <Glass style={styles.group}>
        <View style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>
              {plan === 'haven-plus' ? 'Haven Plus' : 'Haven'} Plan
            </Text>
            <Text style={styles.rowDesc}>
              {plan === 'haven-plus'
                ? 'You\'re on Haven Plus. Thank you 💛'
                : 'You\'re on the free Haven plan.'}
            </Text>
          </View>
        </View>
        {plan === 'haven-plus' && (
          <Pressable onPress={manageSubscription} style={styles.row}>
            <View style={styles.rowInfo}>
              <Text style={styles.rowTitle}>Manage Subscription</Text>
              <Text style={styles.rowDesc}>Cancel or change — as easy as signing up.</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </Pressable>
        )}
      </Glass>

      {/* ABOUT YOU */}
      <Text style={styles.section}>ABOUT YOU</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Name</Text>
            <Text style={styles.rowDesc}>So your companion knows what to call you</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Beliefs</Text>
            <Text style={styles.rowDesc}>Faith and topic tracks</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
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
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Language</Text>
            <Text style={styles.rowDesc}>English, עברית, Español</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Themes</Text>
            <Text style={styles.rowDesc}>Make your home yours</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
      </Glass>

      {/* ACCOUNT */}
      <Text style={styles.section}>ACCOUNT</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Sign In</Text>
            <Text style={styles.rowDesc}>Sync across devices (optional)</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
      </Glass>

      {/* SUPPORT US */}
      <Text style={styles.section}>SUPPORT US</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Share Hustle & Heart</Text>
            <Text style={styles.rowDesc}>Tell someone who needs this</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Leave a Review</Text>
            <Text style={styles.rowDesc}>It means the world to us</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
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
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
      </Glass>

      {/* HELP */}
      <Text style={styles.section}>HELP</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Why We Built This</Text>
            <Text style={styles.rowDesc}>Our story</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Support Resources</Text>
            <Text style={styles.rowDesc}>988, Crisis Text Line, DV Hotline — always here</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Contact Us</Text>
            <Text style={styles.rowDesc}>contact@beatrackfam.info</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
      </Glass>

      {/* OTHER */}
      <Text style={styles.section}>OTHER</Text>
      <Glass style={styles.group}>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Privacy Policy</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
        </Pressable>
        <Pressable style={styles.row}>
          <View style={styles.rowInfo}>
            <Text style={styles.rowTitle}>Terms of Service</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#666" />
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
    backgroundColor: '#000',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 20,
  },
  section: {
    fontSize: 12,
    fontWeight: '700',
    color: '#666',
    letterSpacing: 1,
    marginTop: 20,
    marginBottom: 8,
    marginLeft: 4,
  },
  group: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1a1a1a',
  },
  rowInfo: {
    flex: 1,
  },
  rowTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  rowDesc: {
    fontSize: 13,
    color: '#888',
    lineHeight: 18,
  },
  footer: {
    fontSize: 12,
    color: '#444',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 20,
  },
});
