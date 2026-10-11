import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStrings } from '../../lib/i18n';

const ICONS: Record<string, [string, string]> = {
  index: ['sunny-outline', 'sunny'],
  browse: ['grid-outline', 'grid'],
  favorites: ['heart-outline', 'heart'],
  journal: ['book-outline', 'book'],
  settings: ['settings-outline', 'settings'],
};

export default function TabsLayout() {
  const { t } = useStrings();
  return (
    <Tabs
      screenOptions={({ route }) => {
        const [outline, filled] = ICONS[route.name] ?? ['ellipse-outline', 'ellipse'];
        return {
          headerShown: false,
          tabBarStyle: { backgroundColor: '#000000', borderTopColor: '#1f1f1f', borderTopWidth: 1 },
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
      <Tabs.Screen name="favorites" options={{ title: t('tabs.favorites') }} />
      <Tabs.Screen name="journal" options={{ title: t('tabs.journal') }} />
      <Tabs.Screen name="settings" options={{ title: t('tabs.settings') }} />
    </Tabs>
  );
}
