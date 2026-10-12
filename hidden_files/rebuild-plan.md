# Hustle & Heart — Full Rebuild Plan
Started: Oct 12, 2026 ~2:00 AM EDT (Joey greenlit)

## Vision
A mental-health HOME, not just a quote app. Inspired by the "Motivation" app's
experience + Calm + Apple Health, rebuilt in BeaTrackFam black/white/gray.
Never a copy — same category best-practices, original execution.

## Business model
- Freemium. Core app 100% free forever. Premium = opt-in extras.
- Price: $2.99/month or $19.99/year. 14-day free trial (OPT-IN ONLY, never auto-enrolled).
- Onboarding premium screen has X/close → stay on free plan. Settings shows current plan.

### FREE (core — fully usable)
- Daily quote, all faith/topic tracks (Christianity, Judaism, General, Gratitude, Loyalty, Hustle, Resilience)
- Browse, favorites, gratitude journal, streaks, EN/HE/ES, 2–3 basic themes, share
- Mood check-ins, vent space, breathing exercises (core count)
- Free calming music tracks (with 1–2 ads per session)
- Morning intention + evening gratitude pairing

### PREMIUM ($2.99/mo, $19.99/yr, 14-day trial)
- Live Activities (lock-screen quotes)
- Full theme collection + custom backgrounds
- Exclusive quote packs (seasonal/faith e.g. High Holidays, Loyalty)
- Home + lock-screen widgets
- Custom reminder times (smart defaults free)
- Own music library import, no ads
- (Phase 2: Apple Watch, Siri Shortcuts)

## Feature list

### 1. Rich onboarding (free, skippable, X always visible)
Multi-step questionnaire inspired by the Motivation app:
1. Faith/belief track picker (Christianity, Judaism, General Motivation, Gratitude, Loyalty, Hustle, Resilience)
2. Goals (what do you want? — calm, confidence, focus, happiness...)
3. Language (EN/HE/ES — Hebrew RTL)
4. Reminder preferences (morning quote time)
5. Premium screen (X to skip → free plan)
6. Notification permission
7. Live Activities permission prompt (iOS)

### 2. Immersive quote experience (Today tab)
- Full-screen quote over moody background imagery (BeaTrackFam-styled, not copied)
- Heart (favorite) + share buttons
- "New quote" action
- Streak flame + daily progress (e.g. hearts 0/5)
- Theme-aware

### 3. Mental-health home
- **Mood check-in**: Apple Health-style "How are you feeling?" slider
  (Very Unpleasant → Very Pleasant) + emotion word picker + history/trends
- **Vent space**: free-write, no structure, for getting feelings out
  (separate from gratitude journal)
- **Breathe**: guided breathing exercises (box breathing, 4-7-8) for stress/anxiety
- **Morning/Evening ritual**: morning intention + quote; evening gratitude reflection

### 4. Music
- Built-in calming tracks (free, 1–2 ads per session for free users)
- Premium: import own library, zero ads
- Background audio support

### 5. Apple Health integration (iOS)
- Write Mindful Minutes on breathing exercise completion
- Write mood/state-of-mind (iOS 17+ HealthKit)
- (Read sleep optionally for personalization — phase 2)
- Requires NSHealthShareUsageDescription + NSHealthUpdateUsageDescription

### 6. Accounts (OPTIONAL — app works fully without)
- Sign in with Apple + Sign in with Google ("Keep your data safe")
- Syncs: favorites, journal entries, settings, streaks, language
- Supabase backend (separate project from Rewards)
- NOTE: Data Safety + privacy policy must be updated (currently "no data collected")

### 7. Settings (inspiration-app structure, BeaTrackFam look)
- PREMIUM: Manage subscription / current plan indicator
- ABOUT YOU: Name, Beliefs
- MAKE IT YOURS: Content preferences, Muted content, Language (→ iOS Settings),
  Sound, Themes
- ACCOUNT: Sign in
- SUPPORT US: Share Hustle & Heart, Leave a review
- FOLLOW US: Instagram, TikTok, Facebook (@beatrackfam)
- HELP: FAQs, Contact
- OTHER: Privacy Policy, Terms

### 8. Platform features
- NativeTabs (DONE — build 4, iOS Liquid Glass)
- Live Activities (premium)
- Widgets (premium)
- Share-as-image quote cards (free — marketing loop)
- Local notifications (free, smart defaults)

## Technical notes
- Expo SDK 57, expo-router/unstable-native-tabs
- HealthKit: library TBD (research in progress → healthkit-integration.md)
- Competitor research: competitor-notes.md (round 1 done, round 2 in progress)
- Subscriptions: StoreKit 2 (iOS) + Google Play Billing (Android) — RevenueCat
  recommended (check free tier). App Store Connect + Play Console setup = Joey.
- Ads for free music: expo-ads-admob or similar (check policy compliance)
- Supabase: new project for Hustle & Heart (auth + sync)

## Build order
1. Onboarding + quote experience + themes (core UI)
2. Mood + vent + breathe (mental-health home)
3. Music (free tracks + ads)
4. Settings rebuild
5. Accounts + Supabase sync
6. Freemium/subscriptions
7. Live Activities + widgets
8. HealthKit integration
9. Typecheck, build, TestFlight

## Store compliance checklist (before submission)
- [ ] Data Safety updated (accounts = data collected now)
- [ ] Privacy policy updated (account data, health data)
- [ ] Subscription terms in App Store Connect + Play Console (Joey)
- [ ] 14-day trial configured (Joey, in store dashboards)
- [ ] HealthKit privacy policy requirements met
- [ ] Ad disclosure for free music tier
