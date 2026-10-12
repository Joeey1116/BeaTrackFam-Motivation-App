# HealthKit Integration Guide — Hustle & Heart Motivation
Researched October 12, 2026. Target: Expo SDK 57 (RN 0.86), iOS only.

## Recommended library: `@kingstinct/react-native-healthkit`

**Version:** 8.5.0 (latest stable as of research date; verify with `npm view` at install time)
**Peer dependency:** `react-native-nitro-modules` (0.37.x for Expo SDK 57 / RN 0.86)

Why this one:
- Actively maintained, maps HealthKit ~1:1 into TypeScript (Apple docs apply directly)
- Ships an **Expo config plugin** — works with `expo prebuild` / CNG, which is how this
  app's CI builds iOS (GitHub Actions → prebuild → xcodebuild). No manual Xcode steps.
- Supports everything we need: mindful sessions (write), State of Mind / mood (write,
  iOS 18+ in this library), sleep analysis (read), quantity types (read)
- Uses Nitro Modules (New Architecture) — Expo SDK 57 runs the New Architecture by default

Why NOT the alternatives:
- `react-native-health` — stale; real projects are migrating OFF it to kingstinct
  (see hear-o/hearo ADR-002). No StateOfMind support, aging native code.
- `@appeeky/expo-healthkit` — Expo-native and tested on SDK 57, but much newer and
  less proven; no StateOfMind write support found. Revisit only if kingstinct breaks.

## Installation

```sh
npx expo install @kingstinct/react-native-healthkit react-native-nitro-modules
```

Then add the config plugin to `app.json`:

```json
{
  "expo": {
    "plugins": [
      ["@kingstinct/react-native-healthkit", {
        "NSHealthShareUsageDescription": "Hustle & Heart reads your sleep and mindfulness data to personalize your daily motivation and show your wellness trends.",
        "NSHealthUpdateUsageDescription": "Hustle & Heart saves your breathing sessions as Mindful Minutes and your mood check-ins to Apple Health.",
        "background": false
      }]
    ]
  }
}
```

What the plugin does (no manual Xcode work needed):
- Adds the `com.apple.developer.healthkit` entitlement (always)
- `background: false` omits the background-delivery entitlement — we don't need
  background delivery for this app (we write on user action, read on screen focus)
- Writes both `NSHealthShareUsageDescription` and `NSHealthUpdateUsageDescription`
  into Info.plist

After changing plugin options: `npx expo prebuild` (CI does this fresh every build).

### Apple Developer portal step (one-time, manual)
The HealthKit capability must be enabled on the App ID in the
Apple Developer portal (Certificates, Identifiers & Profiles → App IDs →
`com.beatrackfaminc.motivation` → enable HealthKit). The config plugin handles the
entitlement file, but the portal capability must exist or signing/provisioning fails.

### Does NOT work in Expo Go
HealthKit requires a development build or release build. This app already ships via
CI release builds to TestFlight, so this is a non-issue — but local `expo start`
web preview and Expo Go can't test HealthKit code paths. Guard all calls with
`isHealthDataAvailable()` and `Platform.OS === 'ios'`.

## Code

Create `lib/healthkit.ts` (lazy-load the native module so web/Android never touch it):

```ts
import { Platform } from 'react-native';

type HK = typeof import('@kingstinct/react-native-healthkit');
let hk: HK | null = null;

export function getHealthKit(): HK | null {
  if (Platform.OS !== 'ios') return null;
  if (!hk) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      hk = require('@kingstinct/react-native-healthkit');
    } catch {
      return null;
    }
  }
  return hk;
}

export async function isHealthKitAvailable(): Promise<boolean> {
  const mod = getHealthKit();
  if (!mod) return false;
  try {
    return await mod.isHealthDataAvailable();
  } catch {
    return false;
  }
}
```

### 1. Request authorization (call once, e.g. from Settings "Connect Apple Health")

Request READ and WRITE separately so the user understands each. Request in context
(Apple HIG: ask when the feature is used, not at launch).

```ts
import {
  requestAuthorization,
  authorizationStatusFor,
  AuthorizationStatus,
} from '@kingstinct/react-native-healthkit';

// Call this when the user taps "Connect Apple Health" or finishes a breathing session
export async function requestHealthKitAccess(): Promise<boolean> {
  const mod = getHealthKit();
  if (!mod) return false;
  try {
    await mod.requestAuthorization({
      toRead: [
        'HKCategoryTypeIdentifierSleepAnalysis',
        'HKCategoryTypeIdentifierMindfulSession',
      ],
      toShare: [
        'HKCategoryTypeIdentifierMindfulSession',
        'HKStateOfMindTypeIdentifier',
      ],
    });
    return true;
  } catch {
    return false;
  }
}

// Gate "Save to Health" UI on actual write permission
export async function canWriteMindfulMinutes(): Promise<boolean> {
  const mod = getHealthKit();
  if (!mod) return false;
  const s = await mod.authorizationStatusFor('HKCategoryTypeIdentifierMindfulSession');
  return s === AuthorizationStatus.sharingAuthorized;
}
```

NOTE: if the user previously denied a permission, iOS will NOT re-prompt.
Direct them to iOS Settings → Health → Data Access & Devices → Hustle & Heart.

### 2. Write Mindful Minutes (after a breathing exercise completes)

Mindful sessions are category samples. Write one per completed session:

```ts
import {
  saveCategorySample,
  CategoryValueNotApplicable,
} from '@kingstinct/react-native-healthkit';

export async function saveBreathingSessionToHealth(
  startedAt: Date,
  endedAt: Date,
): Promise<void> {
  const mod = getHealthKit();
  if (!mod) return;
  // Ensure write permission first (requestHealthKitAccess above)
  await mod.saveCategorySample(
    'HKCategoryTypeIdentifierMindfulSession',
    CategoryValueNotApplicable.notApplicable,
    startedAt,
    endedAt,
  );
}
```

Apple's Health app will show these under Mindfulness → Mindful Minutes automatically
(it sums session durations).

### 3. Write mood / State of Mind (after a mood check-in)

```ts
import {
  saveStateOfMindSample,
  StateOfMindKind,
  StateOfMindLabel,
  StateOfMindAssociation,
} from '@kingstinct/react-native-healthkit';

// valence: -1 (very unpleasant) … 0 (neutral) … +1 (very pleasant)
// Map the app's mood slider directly onto valence.
export async function saveMoodToHealth(
  valence: number,
  labels: StateOfMindLabel[],       // e.g. [StateOfMindLabel.calm, StateOfMindLabel.grateful]
  kind: StateOfMindKind = StateOfMindKind.momentaryEmotion,
): Promise<void> {
  const mod = getHealthKit();
  if (!mod) return;
  await mod.saveStateOfMindSample(
    new Date(),
    kind,
    Math.max(-1, Math.min(1, valence)),
    labels,
    [], // associations optional
  );
}
```

Available `StateOfMindKind`: `dailyMood`, `momentaryEmotion`.
`StateOfMindLabel` includes: happy, calm, grateful, stressed, anxious, sad,
angry, tired, etc. (typed enum — TypeScript will list them).
**Requires iOS 18+** in this library (Apple's underlying API is iOS 17+, but
kingstinct gates it at 18). App deployment target is iOS 16.4, so guard with a
runtime check or try/catch — older devices just skip the Health write.

### 4. Read sleep (to personalize, e.g. "rough night? here's a gentle quote")

```ts
import {
  queryCategorySamples,
  CategoryValueSleepAnalysis,
} from '@kingstinct/react-native-healthkit';

export async function getLastNightSleepHours(): Promise<number | null> {
  const mod = getHealthKit();
  if (!mod) return null;
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const samples = await mod.queryCategorySamples(
    'HKCategoryTypeIdentifierSleepAnalysis',
    { limit: 0, filter: { date: { startDate: yesterday } } },
  );
  const asleep = samples.filter((s) =>
    s.value === CategoryValueSleepAnalysis.asleepCore ||
    s.value === CategoryValueSleepAnalysis.asleepDeep ||
    s.value === CategoryValueSleepAnalysis.asleepREM ||
    s.value === CategoryValueSleepAnalysis.asleepUnspecified,
  );
  const ms = asleep.reduce(
    (sum, s) => sum + (s.endDate.getTime() - s.startDate.getTime()),
    0,
  );
  return ms / 3_600_000;
}
```

Also useful: `getMostRecentCategorySample('HKCategoryTypeIdentifierMindfulSession')`
for "last breathed" display, and the `useMostRecentCategorySample` hook for
live-updating UI (must request authorization BEFORE the hook mounts).

## App Store review requirements (Guideline 5.1.3 — HealthKit)

Non-negotiable:
1. **Privacy policy is MANDATORY.** An app using HealthKit without a privacy policy
   URL in App Store Connect will be rejected. The Motivation app already has a
   privacy policy draft — it MUST gain a HealthKit clause, e.g.:
   > "Hustle & Heart accesses Apple Health data only with your explicit permission:
   > we write Mindful Minutes for completed breathing sessions and mood check-ins,
   > and read sleep and mindfulness data to personalize your experience. We never
   > use Health data for advertising or marketing, and never share it with third
   > parties. You can revoke access anytime in iOS Settings → Health → Data Access
   > & Devices."
2. **No advertising / data mining with Health data.** Ever. (Also update the Google
   Play Data Safety — currently "no data collected" — HealthKit doesn't apply to
   Android, but the accounts feature already forces a Data Safety update.)
3. **Request each data type individually** (read vs write, per type) — the code above
   does this.
4. **Write specific usage descriptions.** Generic strings ("needs health data")
   are a common rejection reason. The examples above explain the why.
5. **Don't write false data.** Only write real completed sessions / real check-ins.
6. **Don't store Health data in iCloud.** Keep HealthKit reads/writes on-device;
   do NOT sync raw Health samples to Supabase.
7. **Identify HealthKit in the UI.** The Settings screen should clearly label the
   "Connect Apple Health" feature and what it does (Guideline 27.6).
8. **App Store Connect privacy labels** must declare Health data usage.

## Conflicts

- **expo-router/unstable-native-tabs**: none. NativeTabs is a tab-bar UI component;
  it shares no native modules, entitlements, or Info.plist keys with HealthKit.
- **expo-blur / expo-glass-effect**: none.
- **Other config plugins**: the kingstinct plugin composes cleanly with other Expo
  plugins (it only touches HealthKit entitlement + two Info.plist keys).
- **Android builds**: the library is iOS-only; on Android all calls must be
  guarded (the `getHealthKit()` helper returns null). The Android AAB builds fine
  — the native module simply never loads.

## Blockers & gotchas

1. **Apple Developer portal capability** — one-time manual step (see above). Without
   it, the release build fails at signing. Not automatable.
2. **No Expo Go testing** — HealthKit code paths can only be tested in a
   TestFlight/dev build on a real device. Simulator HAS HealthKit but with fake
   data (fine for smoke-testing the code path, not real UX).
3. **StateOfMind needs iOS 18+** in this library. Deployment target is 16.4 —
   wrap in try/catch so older iOS versions degrade gracefully.
4. **Authorization is one-shot per type.** If the user denies, iOS never re-prompts;
   the app must deep-link them to Settings. Handle this UX.
5. **Nitro Modules version pinning.** Use `npx expo install` (not bare npm) so the
   `react-native-nitro-modules` version matches Expo SDK 57 (0.37.x). The kingstinct
   package's `@react-native-healthkit/core` is exact-pinned automatically — never
   mix versions or `pod install` fails.
6. **CI builds**: `expo prebuild` runs the config plugin; the GitHub Actions
   workflow already does prebuild → pod install → xcodebuild, so no workflow
   changes needed. Just add the npm packages + plugin config and push.
7. **Privacy policy + Data Safety updates** must land BEFORE the HealthKit build
   goes to App Store review (the accounts feature already requires these updates;
   fold the HealthKit clause into the same edit).
8. **Write-permission check before UI.** Use `authorizationStatusFor(id)` to decide
   whether to show "Save to Apple Health" toggles — don't offer what isn't granted.
