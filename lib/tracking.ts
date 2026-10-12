import { requestTrackingPermissionsAsync } from 'expo-tracking-transparency';

/**
 * App Tracking Transparency.
 *
 * The ATT prompt fires on first launch per Apple's requirement.
 * The app has no ads and no third-party tracking SDKs — the IDFA
 * is not used for cross-app tracking.
 */
const TRACKING_ENABLED = true;

export async function maybeRequestTracking(): Promise<boolean> {
  if (!TRACKING_ENABLED) return false;
  try {
    const { status } = await requestTrackingPermissionsAsync();
    return status === 'granted';
  } catch {
    return false;
  }
}
