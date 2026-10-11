import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../components/Screen';
import { Glass } from '../../components/Glass';
import { TrackPicker } from '../../components/TrackPicker';
import { BRAND, LANGUAGES, type Language, type TrackId } from '../../lib/brand';
import { getLanguage, setLanguage, useStrings } from '../../lib/i18n';
import {
  getChosenTracks,
  isNotifEnabled,
  setChosenTracks,
  setNotifEnabled,
} from '../../lib/storage';
import {
  cancelDailyQuotes,
  ensureDailyQuotesScheduled,
  getPermissionStatus,
  requestPermission,
} from '../../lib/notifications';

export default function Settings() {
  const { t, lang } = useStrings();
  const [tracks, setTracks] = useState<TrackId[]>([]);
  const [notifOn, setNotifOn] = useState(false);
  const [restartNeeded, setRestartNeeded] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    getChosenTracks().then(setTracks);
    isNotifEnabled().then(setNotifOn);
  }, [lang]);

  const toggleTrack = async (id: TrackId) => {
    const next = tracks.includes(id) ? tracks.filter((x) => x !== id) : [...tracks, id];
    if (next.length === 0) return;
    setTracks(next);
    await setChosenTracks(next);
    if (notifOn) await ensureDailyQuotesScheduled(getLanguage(), next);
  };

  const pickLanguage = async (l: Language) => {
    if (l === lang) return;
    setRestartNeeded(await setLanguage(l));
  };

  const toggleNotif = async (on: boolean) => {
    if (busy) return;
    setBusy(true);
    try {
      if (on) {
        const { status } = await getPermissionStatus();
        const granted = status === 'granted' || (await requestPermission());
        setNotifOn(granted);
        await setNotifEnabled(granted);
        if (granted) await ensureDailyQuotesScheduled(getLanguage(), tracks);
      } else {
        setNotifOn(false);
        await setNotifEnabled(false);
        await cancelDailyQuotes();
      }
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text style={styles.h1}>{t('settings.title')}</Text>

        <Text style={styles.section}>{t('settings.language')}</Text>
        <View style={styles.list}>
          {LANGUAGES.map((l) => (
            <Pressable key={l} onPress={() => pickLanguage(l)}>
              <Glass style={[styles.row, lang === l && styles.rowActive]}>
                <Text style={styles.rowText}>{t(`languages.${l}`)}</Text>
                {lang === l ? <Ionicons name="checkmark-circle" size={22} color="#fff" /> : null}
              </Glass>
            </Pressable>
          ))}
        </View>
        {restartNeeded ? <Text style={styles.note}>{t('settings.restartNote')}</Text> : null}

        <Text style={styles.section}>{t('settings.tracks')}</Text>
        <TrackPicker selected={tracks} onToggle={toggleTrack} />

        <Text style={styles.section}>{t('settings.notifications')}</Text>
        <Glass style={styles.row}>
          <View style={styles.notifTexts}>
            <Text style={styles.rowText}>{t('settings.dailyReminder')}</Text>
            <Text style={styles.sub}>{t('settings.reminderTime')}</Text>
          </View>
          <Switch value={notifOn} onValueChange={toggleNotif} trackColor={{ true: '#fff' }} />
        </Glass>

        <Text style={styles.section}>{t('settings.about')}</Text>
        <Glass style={styles.about}>
          <Text style={styles.aboutText}>{t('settings.aboutText')}</Text>
          <Text style={styles.version}>
            {BRAND.SHORT_NAME} · 1.0.0 (1)
          </Text>
        </Glass>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { padding: 20, gap: 14 },
  h1: { color: '#fff', fontSize: 26, fontWeight: '800' },
  section: { color: '#999', fontSize: 13, fontWeight: '700', letterSpacing: 2, textTransform: 'uppercase', marginTop: 8 },
  list: { gap: 10 },
  row: { borderRadius: 16, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#2a2a2a' },
  rowActive: { borderColor: '#fff' },
  rowText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  sub: { color: '#666', fontSize: 13, marginTop: 2 },
  notifTexts: { flex: 1 },
  note: { color: '#f5c518', fontSize: 13 },
  about: { borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#2a2a2a', gap: 8 },
  aboutText: { color: '#999', fontSize: 14, lineHeight: 21 },
  version: { color: '#555', fontSize: 12 },
});
