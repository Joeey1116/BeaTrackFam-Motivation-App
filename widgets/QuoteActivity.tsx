import { Text, VStack } from '@expo/ui/swift-ui';
import { font, foregroundStyle, padding } from '@expo/ui/swift-ui/modifiers';
import { createLiveActivity, type LiveActivityEnvironment } from 'expo-widgets';

/**
 * Quote of the Day Live Activity (Lock Screen banner + Dynamic Island).
 *
 * This file runs in the widget extension's isolated runtime:
 * - starts with the 'widget' directive
 * - no hooks, no async, no imports of app modules, no module-scope references
 * - only @expo/ui/swift-ui components
 * All data arrives via props from lib/liveActivity.ts.
 */
type QuoteActivityProps = {
  quote: string;
  category: string;
  /** Localized "Quote of the day" — computed by lib/liveActivity.ts. */
  label?: string;
  /** Localized "Daily Quote" for the compact trailing view. */
  compact?: string;
};

const QuoteActivityView = (props: QuoteActivityProps, environment: LiveActivityEnvironment) => {
  'widget';

  const quoteColor = environment.isLuminanceReduced ? '#CCCCCC' : '#FFFFFF';

  return {
    banner: (
      <VStack modifiers={[padding({ all: 14 })]}>
        <Text modifiers={[font({ size: 11, weight: 'bold' }), foregroundStyle('#999999')]}>
          {props.category.toUpperCase()} — {(props.label ?? 'Quote of the day').toUpperCase()}
        </Text>
        <Text modifiers={[font({ size: 15, weight: 'semibold' }), foregroundStyle(quoteColor)]}>
          {props.quote}
        </Text>
      </VStack>
    ),
    compactLeading: <Text modifiers={[font({ weight: 'bold' }), foregroundStyle('#FFFFFF')]}>❝</Text>,
    compactTrailing: (
      <Text modifiers={[font({ size: 12, weight: 'medium' }), foregroundStyle('#FFFFFF')]}>
        {props.compact ?? 'Daily Quote'}
      </Text>
    ),
    minimal: <Text modifiers={[foregroundStyle('#FFFFFF')]}>❝</Text>,
    expandedBottom: (
      <VStack modifiers={[padding({ all: 14 })]}>
        <Text modifiers={[font({ size: 11, weight: 'bold' }), foregroundStyle('#999999')]}>
          {props.category.toUpperCase()}
        </Text>
        <Text modifiers={[font({ size: 16, weight: 'semibold' }), foregroundStyle(quoteColor)]}>
          {props.quote}
        </Text>
      </VStack>
    ),
  };
};

export default createLiveActivity('QuoteActivity', QuoteActivityView);
