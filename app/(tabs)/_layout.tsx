import React from 'react';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useStrings } from '../../lib/i18n';
import { useTheme } from '../../lib/themeContext';

/**
 * Bottom navigation is the OS's OWN tab bar (UITabBar on iOS, the
 * Material navigation bar on Android) — on iOS 26 the system draws it
 * as the floating Liquid Glass capsule, the genuine Apple article.
 *
 * HISTORY: unstable-native-tabs was reverted on Oct 14, 2026 after a
 * SIGABRT (RNSTabBarController mounting crash) on iOS 26 TestFlight
 * builds, and builds 18–21 shipped a JS Tabs bar instead — first a
 * glass-background bar, then a custom floating GlassView capsule
 * (builds 20–21). Neither imitation satisfied: on device the capsule
 * read as a flat dark slab next to the real thing. RESTORED in build
 * 22 (Oct 22, 2026, Joey's explicit call): the Fam Rewards app runs
 * this exact NativeTabs setup on the identical library versions
 * (expo ~57.0.26, expo-router ~57.0.24, react-native-screens ~4.26.0)
 * and has been stable through heavy on-device use, so Motivation
 * mirrors Rewards' layout structure and props.
 *
 * CRASH WATCH (build 22 device check): the Oct 14 signature was a
 * SIGABRT ~1s after the tabs mounted — system crash dialog, no JS
 * redbox — often right as a permission prompt appeared. If it ever
 * recurs, it will be visible immediately on launch/tab-switch.
 *
 * The bar's colors come from the ACTIVE theme (build 20's
 * ThemeProvider): tint/icon/label selected color = palette.tabActive,
 * unselected = palette.tabInactive, so picking a theme recolors the
 * bar's active state along with the rest of the app. Midnight's
 * tab colors (#FFFFFF / #666666) are exactly Rewards' hardcoded ones.
 *
 * 5 tabs (consolidated Oct 15, 2026): Today, Browse (Saved merged in),
 * Companion, Journal (Wellness tools merged in), Settings. Music is
 * its own screen (/music), reached from the Today tab.
 */
export default function TabsLayout() {
  const { t } = useStrings();
  const { palette } = useTheme();
  return (
    <NativeTabs
      tintColor={palette.tabActive}
      iconColor={{ default: palette.tabInactive, selected: palette.tabActive }}
      labelStyle={{
        default: { color: palette.tabInactive, fontWeight: '500' },
        selected: { color: palette.tabActive, fontWeight: '700' },
      }}
    >
      <NativeTabs.Trigger
        name="index"
        contentStyle={{ backgroundColor: palette.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t('tabs.today')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'sun.max', selected: 'sun.max.fill' }}
          md="sunny"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="browse"
        contentStyle={{ backgroundColor: palette.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t('tabs.browse')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }}
          md="grid_view"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="companion"
        contentStyle={{ backgroundColor: palette.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t('tabs.companion')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'face.smiling', selected: 'face.smiling.fill' }}
          md="mood"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="journal"
        contentStyle={{ backgroundColor: palette.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t('tabs.journal')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'book', selected: 'book.fill' }}
          md="menu_book"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="settings"
        contentStyle={{ backgroundColor: palette.background }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t('tabs.settings')}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: 'gearshape', selected: 'gearshape.fill' }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
