import React, { useEffect, useRef } from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Animated,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Radii } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

const DOCK_WIDTH = 296;
const DOCK_PADDING_H = 6;
const TAB_COUNT = 4;
const SLOT_WIDTH = (DOCK_WIDTH - DOCK_PADDING_H * 2) / TAB_COUNT; // ~71px
const PILL_WIDTH = 58;
const PILL_OFFSET_BASE = DOCK_PADDING_H + (SLOT_WIDTH - PILL_WIDTH) / 2; // 12.5px

const TABS = [
  { key: "index", label: "Overview", activeIcon: "compass", inactiveIcon: "compass-outline" },
  { key: "water-quality", label: "Water", activeIcon: "flask", inactiveIcon: "flask-outline" },
  { key: "trends", label: "Trends", activeIcon: "analytics", inactiveIcon: "analytics-outline" },
  { key: "device", label: "Device", activeIcon: "hardware-chip", inactiveIcon: "hardware-chip-outline" },
];

/**
 * Floating Liquid Glass Tab Bar
 * - Supports continuous swipe-gesture-driven translation via scrollX Animated.Value
 * - Supports tap-to-tab navigation with fluid spring sliding physics
 * - Real-time active pill translation & liquid stretch morphing
 * - Continuous icon crossfade between crisp white and blue-slate
 * - Ultra-clear BlurView material surface
 */
export default function FloatingTabBar({
  scrollX,
  currentIndex = 0,
  onTabPress,
  state,
  navigation,
}) {
  const insets = useSafeAreaInsets();
  const fallbackAnim = useRef(new Animated.Value(0)).current;

  // If used inside Expo Router Tabs directly without Pager
  const activeIndex = state ? state.index : currentIndex;

  useEffect(() => {
    if (!scrollX) {
      Animated.spring(fallbackAnim, {
        toValue: activeIndex,
        friction: 8,
        tension: 95,
        useNativeDriver: true,
      }).start();
    }
  }, [activeIndex, fallbackAnim, scrollX]);

  // Translate X: Continuous interpolation from scrollX (or fallbackAnim)
  const translateX = scrollX
    ? scrollX.interpolate({
        inputRange: [0, SCREEN_WIDTH, SCREEN_WIDTH * 2, SCREEN_WIDTH * 3],
        outputRange: [
          PILL_OFFSET_BASE + 0 * SLOT_WIDTH,
          PILL_OFFSET_BASE + 1 * SLOT_WIDTH,
          PILL_OFFSET_BASE + 2 * SLOT_WIDTH,
          PILL_OFFSET_BASE + 3 * SLOT_WIDTH,
        ],
        extrapolate: "clamp",
      })
    : fallbackAnim.interpolate({
        inputRange: [0, 1, 2, 3],
        outputRange: [
          PILL_OFFSET_BASE + 0 * SLOT_WIDTH,
          PILL_OFFSET_BASE + 1 * SLOT_WIDTH,
          PILL_OFFSET_BASE + 2 * SLOT_WIDTH,
          PILL_OFFSET_BASE + 3 * SLOT_WIDTH,
        ],
      });

  // Fluid stretch morph during transit
  const scaleX = scrollX
    ? scrollX.interpolate({
        inputRange: [
          0,
          SCREEN_WIDTH * 0.5,
          SCREEN_WIDTH * 1.0,
          SCREEN_WIDTH * 1.5,
          SCREEN_WIDTH * 2.0,
          SCREEN_WIDTH * 2.5,
          SCREEN_WIDTH * 3.0,
        ],
        outputRange: [1, 1.14, 1, 1.14, 1, 1.14, 1],
        extrapolate: "clamp",
      })
    : fallbackAnim.interpolate({
        inputRange: [0, 0.5, 1, 1.5, 2, 2.5, 3],
        outputRange: [1, 1.14, 1, 1.14, 1, 1.14, 1],
        extrapolate: "clamp",
      });

  const handlePress = (index, routeKey, routeName) => {
    if (onTabPress) {
      onTabPress(index);
    } else if (navigation && state) {
      const isFocused = state.index === index;
      const event = navigation.emit({
        type: "tabPress",
        target: routeKey,
        canPreventDefault: true,
      });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(routeName);
      }
    }
  };

  return (
    <View
      style={[
        styles.floatingContainer,
        { bottom: Math.max(20, insets.bottom + 8) },
      ]}
      pointerEvents="box-none"
    >
      <View style={styles.dockShadowWrap}>
        <BlurView
          intensity={Platform.OS === "ios" ? 45 : 30}
          tint={Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light"}
          blurMethod="dimezisBlurView"
          style={styles.blurContainer}
        >
          <View style={styles.dockSurface}>
            {/* Top Specular Liquid Hairline */}
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.60)",
                "rgba(255, 255, 255, 0.15)",
                "rgba(255, 255, 255, 0.60)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.dockSheen}
              pointerEvents="none"
            />

            {/* Sliding Liquid Glass Active Pill */}
            <Animated.View
              style={[
                styles.slidingActivePill,
                {
                  transform: [{ translateX }, { scaleX }],
                },
              ]}
              pointerEvents="none"
            >
              <LinearGradient
                colors={["rgba(2, 132, 199, 0.88)", "rgba(14, 165, 233, 0.92)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.pillGradient}
              >
                {/* Top specular highlight on pill */}
                <View style={styles.pillTopSheen} />
              </LinearGradient>
            </Animated.View>

            {/* Tab Touch Slots */}
            {TABS.map((tab, index) => {
              // Interpolated icon crossfading when scrollX is available
              let activeOpacity = 0;
              let inactiveOpacity = 1;

              if (scrollX) {
                activeOpacity = scrollX.interpolate({
                  inputRange: [
                    (index - 0.6) * SCREEN_WIDTH,
                    index * SCREEN_WIDTH,
                    (index + 0.6) * SCREEN_WIDTH,
                  ],
                  outputRange: [0, 1, 0],
                  extrapolate: "clamp",
                });
                inactiveOpacity = scrollX.interpolate({
                  inputRange: [
                    (index - 0.6) * SCREEN_WIDTH,
                    index * SCREEN_WIDTH,
                    (index + 0.6) * SCREEN_WIDTH,
                  ],
                  outputRange: [1, 0, 1],
                  extrapolate: "clamp",
                });
              } else {
                const isSelected = activeIndex === index;
                activeOpacity = isSelected ? 1 : 0;
                inactiveOpacity = isSelected ? 0 : 1;
              }

              const routeKey = state?.routes?.[index]?.key || tab.key;
              const routeName = state?.routes?.[index]?.name || tab.key;

              return (
                <TouchableOpacity
                  key={tab.key}
                  onPress={() => handlePress(index, routeKey, routeName)}
                  activeOpacity={0.7}
                  style={styles.tabSlot}
                  accessibilityRole="tab"
                  accessibilityLabel={tab.label}
                  accessibilityState={{ selected: activeIndex === index }}
                >
                  {/* Inactive Icon (Slate) */}
                  <Animated.View
                    style={[
                      styles.iconWrap,
                      { opacity: inactiveOpacity },
                    ]}
                    pointerEvents="none"
                  >
                    <Ionicons
                      name={tab.inactiveIcon}
                      size={21}
                      color="rgba(11, 30, 54, 0.45)"
                    />
                  </Animated.View>

                  {/* Active Icon (White) */}
                  <Animated.View
                    style={[
                      styles.iconWrap,
                      { opacity: activeOpacity },
                    ]}
                    pointerEvents="none"
                  >
                    <Ionicons
                      name={tab.activeIcon}
                      size={21}
                      color="#FFFFFF"
                    />
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        </BlurView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  floatingContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  dockShadowWrap: {
    borderRadius: Radii.pill,
    shadowColor: "#051A30",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.07,
    shadowRadius: 20,
    elevation: 6,
    backgroundColor: "transparent",
  },
  blurContainer: {
    borderRadius: Radii.pill,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  dockSurface: {
    flexDirection: "row",
    alignItems: "center",
    width: DOCK_WIDTH,
    height: 58,
    paddingHorizontal: DOCK_PADDING_H,
    backgroundColor:
      Platform.OS === "ios"
        ? "rgba(255, 255, 255, 0.10)"
        : "rgba(255, 255, 255, 0.25)",
    position: "relative",
  },
  dockSheen: {
    position: "absolute",
    top: 0,
    left: 18,
    right: 18,
    height: 1.2,
  },
  slidingActivePill: {
    position: "absolute",
    left: 0,
    width: PILL_WIDTH,
    height: 44,
    borderRadius: 22,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  pillGradient: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.30)",
    overflow: "hidden",
    position: "relative",
  },
  pillTopSheen: {
    position: "absolute",
    top: 0,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.55)",
  },
  tabSlot: {
    width: SLOT_WIDTH,
    height: 52,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
    position: "relative",
  },
  iconWrap: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
});
