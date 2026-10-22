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
  liquidGlass =
    Platform.OS === 'ios' &&
    typeof mod.isLiquidGlassAvailable === 'function' &&
    mod.isLiquidGlassAvailable();
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
 * Floating Liquid Glass capsule tab bar (build 20).
 *
 * Why not the old full-width bar: builds 18–19 rendered real glass
 * (GlassView / blur) stretched edge-to-edge across the bottom, over
 * uniformly black content — on device it read as a flat dark slab
 * ("no Liquid Glass still", build 19 field report). The look the user
 * pointed to in Fam Rewards is the iOS 26 FLOATING CAPSULE: a pill
 * hovering over the content with a bright glass edge, a soft shadow,
 * and a light selection pill inside. This reproduces that capsule on
 * the classic JS Tabs (NativeTabs stays banned — iOS 26 SIGABRT,
 * see app/(tabs)/_layout.tsx): real GlassView material where the OS
 * offers it, a real BlurView frost everywhere else, themed by the
 * selected theme's palette.
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
            <GlassView
              glassEffectStyle="regular"
              tintColor={withAlpha(palette.background, 0.22)}
              style={StyleSheet.absoluteFill}
            />
          ) : (
            <>
              <BlurView
                intensity={85}
                tint="dark"
                style={[
                  StyleSheet.absoluteFill,
                  { backgroundColor: withAlpha(palette.surface, 0.55) },
                ]}
              />
              {/* Light sheen across the top of the glass */}
              <LinearGradient
                colors={[
                  'rgba(255,255,255,0.16)',
                  'rgba(255,255,255,0.03)',
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
                    {options.tabBarIcon?.({ focused, color, size: 21 })}
                    <Text
                      style={[
                        styles.label,
                        { color: focused ? palette.background : palette.tabInactive },
                      ]}
                      numberOfLines={1}
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 14,
    right: 14,
  },
  shadowWrap: {
    borderRadius: 34,
    shadowColor: '#000000',
    shadowOpacity: 0.5,
    shadowRadius: 18,
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
    borderColor: 'rgba(255,255,255,0.26)',
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
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
    paddingHorizontal: 10,
    borderRadius: 999,
    minWidth: 58,
  },
  label: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
});
