import React from "react";
import { NativeTabs } from "expo-router/unstable-native-tabs";
import { useStrings } from "../../lib/i18n";

/**
 * Bottom navigation is the OS's OWN tab bar (UITabBar on iOS, the
 * Material navigation bar on Android). On iOS 26 the system draws it as
 * the floating Liquid Glass capsule — the genuine article, rendered by
 * Apple, not an imitation.
 *
 * Consolidated Oct 15, 2026: 8 tabs → 5. Favorites lives inside Browse
 * (Saved segment), Wellness tools live inside Journal, Music lives
 * inside Settings.
 */
export default function TabsLayout() {
  const { t } = useStrings();
  return (
    <NativeTabs
      tintColor="#ffffff"
      iconColor={{ default: "#666666", selected: "#ffffff" }}
      labelStyle={{
        default: { color: "#666666", fontWeight: "500" },
        selected: { color: "#ffffff", fontWeight: "700" },
      }}
    >
      <NativeTabs.Trigger
        name="index"
        contentStyle={{ backgroundColor: "#000000" }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t("tabs.today")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "sun.max", selected: "sun.max.fill" }}
          md="wb_sunny"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="browse"
        contentStyle={{ backgroundColor: "#000000" }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t("tabs.browse")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "square.grid.2x2", selected: "square.grid.2x2.fill" }}
          md="grid_view"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="companion"
        contentStyle={{ backgroundColor: "#000000" }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t("tabs.companion")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "face.smiling", selected: "face.smiling.fill" }}
          md="mood"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="journal"
        contentStyle={{ backgroundColor: "#000000" }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t("tabs.journal")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "book", selected: "book.fill" }}
          md="menu_book"
        />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger
        name="settings"
        contentStyle={{ backgroundColor: "#000000" }}
        disableTransparentOnScrollEdge
      >
        <NativeTabs.Trigger.Label>{t("tabs.settings")}</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon
          sf={{ default: "gearshape", selected: "gearshape.fill" }}
          md="settings"
        />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
