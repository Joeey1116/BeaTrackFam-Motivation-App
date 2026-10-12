import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useStrings } from '../../lib/i18n';

/**
 * Bottom navigation is the OS's OWN tab bar (UITabBar on iOS, the
 * Material navigation bar on Android) — the same as the main BeaTrackFam
 * app. On iOS 26+ the system draws it as the floating Liquid Glass
 * capsule, the genuine article rendered by Apple, not an imitation.
 */
export default function TabsLayout() {
  const { t } = useStrings();
  return (
    <NativeTabs
      tintColor="#ffffff"
      iconColor={{ default: '#666666', selected: '#ffffff' }}
      labelStyle={{
        default: { color: '#666666', fontWeight: '500' },
        selected: { color: '#ffffff', fontWeight: '700' },
      }}
    >
      <NativeTabs.Trigger name="index" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t('tabs.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'sunrise', selected: 'sunrise.fill' }}
          md="wb_sunny"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="browse" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t('tabs.browse')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="favorites" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t('tabs.favorites')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'heart', selected: 'heart.fill' }}
          md="favorite"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="journal" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t('tabs.journal')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'book', selected: 'book.fill' }}
          md="book"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings" disableTransparentOnScrollEdge>
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gear', selected: 'gear' }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
