# Compliance checklist — Hustle & Heart Motivation v1.0.0

## Apple (App Store)

- [x] **Liquid Glass** — `expo-glass-effect` (~57.0.4) on cards/sheets; `isLiquidGlassAvailable()`
      gates true iOS 26 glass, graceful dark-translucent fallback elsewhere.
- [x] **App Tracking Transparency** — `expo-tracking-transparency` linked;
      `NSUserTrackingUsageDescription` present in Info.plist. The prompt is
      **never shown in v1**: `lib/tracking.ts` gates it behind `TRACKING_ENABLED = false`.
      There are no ads and no third-party tracking SDKs.
- [x] **Privacy manifest** — `ios/HustleHeartMotivation/PrivacyInfo.xcprivacy` is
      generated at prebuild from `ios.privacyManifests` in app.json (verified):
      required-reason APIs declared (UserDefaults CA92.1, file timestamps C617.1,
      system boot time 35F9.1, disk space E174.1). `NSPrivacyTracking = false`,
      no tracking domains, no collected data types.
- [x] **Push entitlement** — `expo-notifications` adds `aps-environment`. Only
      *local* scheduled notifications are used; no push tokens leave the device.
- [x] **Live Activities** — `NSSupportsLiveActivities = true` in Info.plist;
      the `expo-widgets` config plugin generates the widget extension target at
      prebuild (no manual Xcode target needed). iOS 16.2+.
- [x] **Purpose strings** — notifications (system-provided), tracking usage
      description (present but unused in v1).
- [x] **Encryption** — `ITSAppUsesNonExemptEncryption = false` (no custom crypto).

## Google (Play)

- [x] **Target API** — `targetSdkVersion 36`, `compileSdkVersion 36`,
      `minSdkVersion 24` (Android 7.0+) via `expo-build-properties`.
- [x] **16 KB page-size readiness** — Android Gradle Plugin 8.x aligns native
      libraries for 16 KB pages by default; no `android:pageSizeCompat` needed.
- [x] **Data Safety** (fill in Play Console from this):
      - Data collected: **none** (favorites, streak, gratitude journal stay on-device
        in AsyncStorage; quotes are fetched read-only from Supabase, no personal
        data is sent).
      - Data shared with third parties: **none**.
      - No ads, no analytics SDKs, no tracking SDKs.
- [x] **Permissions** — no custom Android permissions declared. (No AD_ID:
      there are no ads.)

## Both stores

- [x] No ads, no third-party tracking, no account required.
- [x] All content original (380 quotes written for this app); no copyrighted text.
- [x] Faith content is opt-in per track; the app shell is faith-neutral.
