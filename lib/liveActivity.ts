import { Platform } from 'react-native';
import { BRAND } from './brand';
import type { Quote } from './quotes';

/**
 * Quote-of-the-day Live Activity (Dynamic Island + Lock Screen).
 *
 * Started fresh each day the app is opened: any stale instance is ended and a
 * new one starts with today's quote. Tapping the activity deep-links into the
 * app's quote screen. iOS 16.2+ only; silently no-ops elsewhere (Android,
 * older iOS, simulators without ActivityKit).
 *
 * NOTE: QuoteActivity is required lazily (not statically imported) because
 * widgets/QuoteActivity.tsx pulls in @expo/ui/swift-ui, a native-only module
 * whose top-level evaluation crashes the Expo web bundle. The require() below
 * only runs on iOS, so web never evaluates it.
 */
export async function refreshQuoteLiveActivity(quote: Quote): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const QuoteActivity = require('../widgets/QuoteActivity').default;
    const category = quote.tracks[0] ?? 'motivation';
    const instances = QuoteActivity.getInstances();
    for (const instance of instances) {
      await instance.end('immediate', { quote: quote.text, category });
    }
    QuoteActivity.start(
      { quote: quote.text, category },
      `${BRAND.SCHEME}://quote/today`,
    );
  } catch {
    // ActivityKit unavailable — non-fatal, the app works fine without it.
  }
}
