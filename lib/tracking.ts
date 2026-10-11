import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * App Tracking Transparency.
 *
 * This app has NO ads and NO third-party tracking SDKs, so tracking is never
 * requested in v1. This helper exists so the ATT prompt can only ever fire
 * behind an explicit product decision:
 *
 *   const granted = await maybeRequestTracking();
 *
 * TRACKING_ENABLED stays false unless a future feature genuinely needs the
 * IDFA (e.g. an ad network). NSUserTrackingUsageDescription is present in the
 * Info.plist as required by Apple whenever the API is linked.
 */
const TRACKING_ENABLED = false;

export async function maybeRequestTracking(): Promise<boolean> {
  if (!TRACKING_ENABLED) return false;
  try {
    const { status } = await requestTrackingPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
