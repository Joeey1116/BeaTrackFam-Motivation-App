# Hustle & Heart Motivation

Daily motivational quotes in your language, on your tracks. A standalone app —
made by the same developer as BeaTrackFam, but **not** a BeaTrackFam product:
no BeaTrackFam branding, logos, store links, or product mentions anywhere.

- **Official name:** Hustle & Heart Motivation (25 chars — fits both stores' 30-char limits)
- **In-app shorthand:** Hustle & Heart
- **Version:** 1.0.0 (build 1)
- **Stack:** Expo SDK 57 · Expo Router · TypeScript · Supabase (free tier)
- **Bundle IDs:** iOS `com.beatrackfaminc.motivation` · Android `com.beatrackfaminc.motivation`

## Features (v1)

| Feature | How it works |
|---|---|
| Quote of the day | Full-screen typography card, deterministic per date |
| 7 content tracks | General Motivation, Gratitude, Faith–Christianity, Faith–Judaism, Loyalty, Hustle, Resilience — picked at onboarding, changeable in Settings |
| 3 languages | English, Hebrew (RTL), Spanish — device locale detected, picker in onboarding + Settings |
| 380 quotes | 260 EN (40/track) · 80 HE (Judaism + Motivation) · 40 ES (Motivation); other combos fall back to English with a note |
| Favorites | Heart quotes, saved on-device (no login) |
| Share | Exports the quote card as a PNG (Instagram Stories, messages) |
| Daily 8:00 AM notification | 14-day pre-scheduled local notifications with real quote content; deep-links to today's quote |
| Live Activity | Quote of the day on Lock Screen + Dynamic Island (iOS 16.2+, via `expo-widgets`) |
| Streak | Consecutive days opened |
| Gratitude journal | Daily one-line entry, saved on-device |
| Liquid Glass | iOS 26 glass UI with graceful fallback elsewhere |

## Setup

```bash
npm install
```

Environment (create `.env` locally or set in EAS / GitHub secrets — never commit):

```
EXPO_PUBLIC_SUPABASE_URL=https://dqrtrzzakdjgvradhfeq.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon public key>
```

The app runs fully offline on the bundled quote seed when Supabase isn't configured.

## Database

Same Supabase project as the loyalty app (free tier). This app only touches the
`quotes` table — it never modifies the loyalty tables.

1. Supabase dashboard → SQL Editor → run `supabase/schema.sql`
2. Then run `supabase/seed.sql` (380 quotes, idempotent upsert)

## Scripts

| Command | What it does |
|---|---|
| `npm start` | Expo dev server |
| `npx tsc --noEmit` | Type check |
| `npx expo prebuild -p ios` | Generate the native iOS project (verifies config plugins incl. the widget extension) |

## Builds

GitHub Actions (manual dispatch only — never auto-runs, never spends minutes on its own):

- `.github/workflows/ios-build.yml` → IPA → optional TestFlight upload.
  Needs repo secrets: `ASC_API_KEY_ID`, `ASC_API_KEY_P8`, `ASC_API_ISSUER_ID`, `APPLE_TEAM_ID`,
  and the App Store Connect app record for `com.beatrackfaminc.motivation`.
- `.github/workflows/android-build.yml` → AAB → optional Play production upload.
  Needs repo secrets: `ANDROID_KEYSTORE_BASE64`, `ANDROID_KEYSTORE_PASSWORD`,
  `ANDROID_KEY_ALIAS`, `ANDROID_KEY_PASSWORD`, `PLAY_SERVICE_ACCOUNT_JSON`,
  and the Play Console app record for `com.beatrackfaminc.motivation`
  (this app needs its OWN keystore — do not reuse another app's).

**Build-number discipline:** every store-bound build bumps `ios.buildNumber` /
`android.versionCode` by exactly +1. Never reuse a build number.

## Compliance

See [docs/COMPLIANCE.md](docs/COMPLIANCE.md) for the Apple/Google checklist
(Liquid Glass, ATT, privacy manifest, Live Activities, target API levels,
16 KB page size, Data Safety).

## Repo

Public repo (unlimited Actions minutes): `Joeey1116/BeaTrackFam-Motivation-App`
