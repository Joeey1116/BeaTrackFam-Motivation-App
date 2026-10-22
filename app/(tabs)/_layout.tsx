import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStrings } from '../../lib/i18n';
import { GlassTabBar } from '../../components/GlassTabBar';

const ICONS: Record<string, [string, string]> = {
  index: ['sunny-outline', 'sunny'],
  browse: ['grid-outline', 'grid'],
  companion: ['happy-outline', 'happy'],
  journal: ['book-outline', 'book'],
  settings: ['settings-outline', 'settings'],
};

/**
 * Bottom navigation is the classic JS tab bar with a custom FLOATING
 * GLASS CAPSULE (components/GlassTabBar, build 20). Builds 18–19 used a
 * full-width bar with a glass background; over the app's black content
 * it read on device as a flat dark slab ("no Liquid Glass" reports).
 * The capsule — real GlassView material on iOS 26+, BlurView frost
 * elsewhere, bright rim, selection pill — is what reads as glass.
 *
 * NOTE: expo-router's `unstable-native-tabs` was reverted on Oct 14, 2026 —
 * the native RNSTabBarController SIGABRTs on iOS 26 TestFlight builds while
 * mounting, flashing an "Unmatched Route" screen before the process dies.
 * It was briefly restored in build 16 and is reverted AGAIN in build 18
 * for the same reason. Do NOT switch back to NativeTabs until that
 * upstream crash is resolved.
 *
 * 5 tabs (consolidated Oct 15, 2026): Today, Browse (Saved merged in),
 * Companion, Journal (Wellness tools merged in), Settings. Music moved
 * OUT of Settings in build 18 — it is its own screen (/music), reached
 * from the Today tab.
 */
export default function TabsLayout() {
  const { t } = useStrings();
  return (
    <Tabs
      tabBar={(props) => <GlassTabBar {...(props as any)} />}
      screenOptions={({ route }) => {
        const [outline, filled] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
        return {
          headerShown: false,
          tabBarIcon: ({ color, focused, size }) => (
            <Ionicons name={(focused ? filled : outline) as any} size={size} color={color} />
          ),
        };
      }}
    >
      <Tabs.Screen name="index" options={{ title: t('tabs.today') }} />
      <Tabs.Screen name="browse" options={{ title: t('tabs.browse') }} />
      <Tabs.Screen name="companion" options={{ title: t('tabs.companion') }} />
      <Tabs.Screen name="journal" options={{ title: t('tabs.journal') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
