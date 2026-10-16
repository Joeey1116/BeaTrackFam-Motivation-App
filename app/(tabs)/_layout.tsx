import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStrings } from '../../lib/i18n';
import { GlassTabBackground } from '../../components/GlassTabBackground';

const ICONS: Record<string, [string, string]> = {
  index: ['sunny-outline', 'sunny'],
  browse: ['grid-outline', 'grid'],
  companion: ['happy-outline', 'happy'],
  journal: ['book-outline', 'book'],
  settings: ['settings-outline', 'settings'],
};

/**
 * Bottom navigation is the classic JS tab bar with the GlassTabBackground
 * (Liquid Glass on iOS 26+, frosted-glass fallback elsewhere).
 *
 * NOTE: expo-router's `unstable-native-tabs` was reverted on Oct 14, 2026 —
 * the native RNSTabBarController SIGABRTs on iOS 26 TestFlight builds while
 * mounting, flashing an "Unmatched Route" screen before the process dies.
 * Do NOT switch back to NativeTabs until that upstream crash is resolved.
 *
 * 5 tabs (consolidated Oct 15, 2026): Today, Browse (Saved merged in),
 * Companion, Journal (Wellness tools merged in), Settings (Music merged in).
 */
export default function TabsLayout() {
  const { t } = useStrings();
  return (
    <Tabs
      screenOptions={({ route }) => {
        const [outline, filled] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
        return {
          headerShown: false,
          tabBarBackground: () => <GlassTabBackground />,
          tabBarStyle: { backgroundColor: 'transparent', borderTopColor: '#1f1f1f', borderTopWidth: 1, position: 'absolute' },
          tabBarActiveTintColor: '#ffffff',
          tabBarInactiveTintColor: '#666666',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
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
