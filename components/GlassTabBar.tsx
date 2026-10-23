import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../lib/themeContext';
import { withAlpha } from '../lib/themes';

let GlassView: any = null;
let liquidGlass = false;
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const mod = require('expo-glass-effect');
  GlassView = mod.GlassView;
  // BOTH package gates (build 21): isLiquidGlassAvailable says the app/OS
  // allow the Liquid Glass design; isGlassEffectAPIAvailable says the
  // UIGlassEffect class itself responds at runtime — the expo docs require
  // checking it before rendering GlassView, and build 20 checked only the
  // first. Either failing → the BlurView fallback below renders instead of
  // an empty effect view.
  liquidGlass =
    Platform.OS === 'ios' &&
    typeof mod.isLiquidGlassAvailable === 'function' &&
    mod.isLiquidGlassAvailable() &&
    typeof mod.isGlassEffectAPIAvailable === 'function' &&
    mod.isGlassEffectAPIAvailable();
} catch {
  liquidGlass = false;
}

// Structural subset of @react-navigation/bottom-tabs' BottomTabBarProps —
// all the custom bar needs, without depending on its exported types.
interface TabBarPropsLike {
  state: {
    index: number;
    routes: { key: string; name: string; params?: object }[];
  };
  descriptors: {
    [key: string]: {
      options: {
        title?: string;
        tabBarIcon?: (props: {
          focused: boolean;
          color: string;
          size: number;
        }) => React.ReactNode;
        tabBarAccessibilityLabel?: string;
        tabBarButtonTestID?: string;
      };
    };
  };
  navigation: {
    emit: (event: {
      type: string;
      target: string;
      canPreventDefault?: boolean;
      data?: object;
    }) => { defaultPrevented: boolean };
    navigate: (name: string, params?: object) => void;
  };
}

/**
 * Floating Liquid Glass capsule tab bar (builds 20–21).
 *
 * Why not the old full-width bar: builds 18–19 rendered glass stretched
 * edge-to-edge over uniformly black content — on device it read as a flat
 * dark slab. The look the user pointed to in Fam Rewards is the iOS 26
 * FLOATING CAPSULE (there rendered by NativeTabs' system material —
 * banned here, iOS 26 SIGABRT, see app/(tabs)/_layout.tsx).
 *
 * Build 21 diagnosis (device recording + pixel sampling of build 20):
 * the real GlassView branch WAS rendering (Xcode 26 CI build, iOS 26,
 * UIDesignRequiresCompatibility=false), but it still read as an opaque
 * dark-gray slab because (a) glassEffectStyle 'regular' is UIKit's
 * legibility-first material — heavy built-in tint, close to opaque in a
 * dark color scheme; (b) build 20 darkened it further with a black tint;
 * (c) Motivation's tab screens are smooth dark gradients whose content
 * ends above the bar, so the material had almost nothing varied behind
 * it to refract. Rewards reads as glass because the system bar uses the
 * transparent floating-control treatment over dense bright cards.
 *
 * Build 21 changes, both branches:
 *  - Glass: style 'clear' (the transparent style Apple uses for floating
 *    controls), NO dark tint — at most a whisper of theme surface — plus
 *    a soft top sheen so the specular edge reads on dark scenes.
 *  - Fallback: real iOS ultra-thin material blur, and the old 0.55-opaque
 *    surface overlay (which alone made it near-opaque) cut to 0.16.
 *  - Labels: capsule widened, per-item padding/min-width shrunk, labels
 *    may shrink-to-fit — "Companion" must never truncate to "Compan…".
 */
export function GlassTabBar({ state, descriptors, navigation }: TabBarPropsLike) {
  const insets = useSafeAreaInsets();
  const { palette } = useTheme();
  const bottom = insets.bottom > 0 ? Math.round(insets.bottom * 0.55) : 14;

  return (
    <View style={[styles.outer, { bottom }]} pointerEvents="box-none">
      <View style={styles.shadowWrap}>
        <View style={styles.capsule}>
          {liquidGlass && GlassView ? (
            <>
              <GlassView
                glassEffectStyle="clear"
                style={StyleSheet.absoluteFill}
              />
              {/* Whisper of the theme over the glass — cohesion without
                  the dark tint that flattened build 20. */}
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: withAlpha(palette.surface, 0.1) },
                ]}
              />
              {/* Soft specular sheen across the top edge */}
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.13)',
                  'rgba(255,255,255,0.02)',
                  'transparent',
                ]}
                locations={[0, 0.45, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </>
          ) : (
            <>
              <BlurView
                intensity={100}
                tint={
                  Platform.OS === 'ios'
                    ? 'systemUltraThinMaterialDark'
                    : 'dark'
                }
                style={StyleSheet.absoluteFill}
              />
              {/* Theme tint — kept translucent (build 20's 0.55 overlay on
                  top of a dark blur is what made the fallback read as an
                  opaque slab). */}
              <View
                pointerEvents="none"
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: withAlpha(palette.surface, 0.16) },
                ]}
              />
              {/* Specular sheen across the top of the glass */}
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.24)',
                  'rgba(255,255,255,0.05)',
                  'transparent',
                ]}
                locations={[0, 0.5, 1]}
                style={StyleSheet.absoluteFill}
                pointerEvents="none"
              />
            </>
          )}
          <View style={styles.row}>
            {state.routes.map((route, index) => {
              const { options } = descriptors[route.key];
              const focused = state.index === index;
              const color = focused ? palette.background : palette.tabInactive;
              const onPress = () => {
                const event = navigation.emit({
                  type: 'tabPress',
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              };
              const onLongPress = () => {
                navigation.emit({ type: 'tabLongPress', target: route.key });
              };
              return (
                <Pressable
                  key={route.key}
                  onPress={onPress}
                  onLongPress={onLongPress}
                  accessibilityRole="tab"
                  accessibilityState={{ selected: focused }}
                  accessibilityLabel={options.tabBarAccessibilityLabel}
                  testID={options.tabBarButtonTestID}
                  style={styles.item}
                >
                  <View
                    style={[
                      styles.itemInner,
                      focused && {
                        backgroundColor: palette.tabActive,
                        shadowColor: '#000',
                        shadowOpacity: 0.25,
                        shadowRadius: 6,
                        shadowOffset: { width: 0, height: 2 },
                      },
                    ]}
                  >
                    {options.tabBarIcon?.({ focused, color, size: 20 })}
                    <Text
                      style={[
                        styles.label,
                        { color: focused ? palette.background : palette.tabInactive },
                      ]}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      minimumFontScale={0.8}
                    >
                      {options.title ?? route.name}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
        {/* Crisp glass rim, above the material, below nothing interactive */}
        <View pointerEvents="none" style={styles.rim} />
        {/* Bright specular line along the top edge — the highlight real
            glass throws where the surface curves toward the light. Inset
            horizontally so it follows the capsule's corner curve. */}
        <View pointerEvents="none" style={styles.topSpecular} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 10,
    right: 10,
  },
  shadowWrap: {
    borderRadius: 34,
    shadowColor: '#000000',
    shadowOpacity: 0.45,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  capsule: {
    height: 66,
    borderRadius: 34,
    overflow: 'hidden',
  },
  rim: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 34,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  topSpecular: {
    position: 'absolute',
    top: 0,
    left: 26,
    right: 26,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemInner: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 7,
    paddingHorizontal: 5,
    borderRadius: 999,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
