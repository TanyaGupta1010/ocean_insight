import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Animated,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors, { Radii, Shadows } from "../constants/theme";

/**
 * FloatingActionButton & Contextual Liquid Glass Menu
 * Features:
 * - Intentional, purposeful positioning floating above bottom dock
 * - Idle breathing & halo glow animation
 * - Native spring interaction: scale down on press, smooth spring back
 * - 90-degree icon rotation animation on menu open/close
 * - Translucent Liquid Glass contextual menu (BlurView, thin border, soft shadow)
 * - Actions: Refresh Telemetry, View Device, Notification Settings
 * - Tap outside or tap button to dismiss
 */
export default function FloatingActionButton({
  onRefresh,
  onNavigateToDevice,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState(null);

  const menuAnim = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const idlePulse = useRef(new Animated.Value(0)).current;

  // Idle breathing pulse (3.2s cycle)
  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(idlePulse, {
          toValue: 1,
          duration: 1600,
          useNativeDriver: true,
        }),
        Animated.timing(idlePulse, {
          toValue: 0,
          duration: 1600,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [idlePulse]);

  const haloScale = idlePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.24],
  });

  const haloOpacity = idlePulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.15, 0.45],
  });

  const openMenu = () => {
    setIsOpen(true);
    Animated.parallel([
      Animated.spring(menuAnim, {
        toValue: 1,
        friction: 7,
        tension: 110,
        useNativeDriver: true,
      }),
      Animated.spring(iconRotate, {
        toValue: 1,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closeMenu = () => {
    Animated.parallel([
      Animated.timing(menuAnim, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.spring(iconRotate, {
        toValue: 0,
        friction: 6,
        tension: 120,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsOpen(false);
    });
  };

  const toggleMenu = () => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  };

  const handlePressIn = () => {
    Animated.spring(buttonScale, {
      toValue: 0.90,
      friction: 6,
      tension: 200,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(buttonScale, {
      toValue: 1,
      friction: 5,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  const handleRefreshPress = () => {
    if (onRefresh) {
      onRefresh();
    }
    setFeedbackText("Telemetry Synchronized");
    setTimeout(() => {
      setFeedbackText(null);
      closeMenu();
    }, 450);
  };

  const handleViewDevicePress = () => {
    closeMenu();
    setTimeout(() => {
      if (onNavigateToDevice) {
        onNavigateToDevice();
      }
    }, 150);
  };

  const handleNotificationPress = () => {
    setFeedbackText("Push Alerts Active (±5%)");
    setTimeout(() => {
      setFeedbackText(null);
      closeMenu();
    }, 700);
  };

  // Menu animations
  const menuScale = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.86, 1],
  });

  const menuTranslateY = menuAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });

  const rotate = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "90deg"],
  });

  return (
    <>
      {/* Tap Outside Backdrop to Dismiss */}
      {isOpen && (
        <Pressable
          style={styles.backdrop}
          onPress={closeMenu}
          accessibilityLabel="Dismiss menu"
        />
      )}

      {/* Floating Action Button & Menu Container */}
      <View style={styles.fabWrapper} pointerEvents="box-none">
        {/* Floating Liquid Glass Action Menu */}
        {isOpen && (
          <Animated.View
            style={[
              styles.menuContainer,
              {
                opacity: menuAnim,
                transform: [{ scale: menuScale }, { translateY: menuTranslateY }],
              },
            ]}
          >
            <View style={styles.menuShadowWrap}>
              <BlurView
                intensity={Platform.OS === "ios" ? 65 : 40}
                tint={Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light"}
                blurMethod="dimezisBlurView"
                style={styles.menuBlur}
              >
                <View style={styles.menuSurface}>
                  {/* Top Specular Sheen */}
                  <LinearGradient
                    colors={[
                      "rgba(255, 255, 255, 0.70)",
                      "rgba(255, 255, 255, 0.20)",
                      "rgba(255, 255, 255, 0)",
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.menuSheen}
                    pointerEvents="none"
                  />

                  {/* Header info / feedback message */}
                  <View style={styles.menuHeader}>
                    <Text style={styles.menuHeaderTitle}>
                      {feedbackText ? feedbackText : "Observation Actions"}
                    </Text>
                  </View>

                  {/* Action 1: Refresh Telemetry */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleRefreshPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.itemIconContainer, styles.blueBadge]}>
                      <Ionicons name="refresh-outline" size={17} color={Colors.oceanBlue} />
                    </View>
                    <View style={styles.itemTextWrapper}>
                      <Text style={styles.itemTitle}>Refresh Telemetry</Text>
                      <Text style={styles.itemSubtitle}>Query live buoy stream</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color="rgba(11, 30, 54, 0.35)" />
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  {/* Action 2: View Device */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleViewDevicePress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.itemIconContainer, styles.cyanBadge]}>
                      <Ionicons name="hardware-chip-outline" size={17} color="#06B6D4" />
                    </View>
                    <View style={styles.itemTextWrapper}>
                      <Text style={styles.itemTitle}>View Device</Text>
                      <Text style={styles.itemSubtitle}>Avionics, battery & GPS</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color="rgba(11, 30, 54, 0.35)" />
                  </TouchableOpacity>

                  <View style={styles.menuDivider} />

                  {/* Action 3: Notification Settings */}
                  <TouchableOpacity
                    style={styles.menuItem}
                    onPress={handleNotificationPress}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.itemIconContainer, styles.greenBadge]}>
                      <Ionicons name="notifications-outline" size={17} color={Colors.seafoam} />
                    </View>
                    <View style={styles.itemTextWrapper}>
                      <Text style={styles.itemTitle}>Notification Settings</Text>
                      <Text style={styles.itemSubtitle}>Buoy alert thresholds</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={15} color="rgba(11, 30, 54, 0.35)" />
                  </TouchableOpacity>
                </View>
              </BlurView>
            </View>
          </Animated.View>
        )}

        {/* The Floating Blue Circular Action Button */}
        <Animated.View
          style={[
            styles.fabButtonContainer,
            { transform: [{ scale: buttonScale }] },
          ]}
        >
          {/* Subtle Breathing Halo Ring (Active when idle) */}
          {!isOpen && (
            <Animated.View
              style={[
                styles.haloRing,
                {
                  transform: [{ scale: haloScale }],
                  opacity: haloOpacity,
                },
              ]}
              pointerEvents="none"
            />
          )}

          <TouchableOpacity
            style={styles.fabPressable}
            onPress={toggleMenu}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            activeOpacity={0.9}
            accessibilityRole="button"
            accessibilityLabel="Observation Actions"
          >
            <LinearGradient
              colors={["#0284C7", "#0EA5E9"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.fabGradient}
            >
              {/* Hairline Specular Top Highlight */}
              <View style={styles.fabTopSheen} />

              {/* Smoothly Rotating Icon */}
              <Animated.View style={{ transform: [{ rotate }] }}>
                <Ionicons
                  name={isOpen ? "close" : "options-outline"}
                  size={21}
                  color="#FFFFFF"
                />
              </Animated.View>
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 15,
    backgroundColor: "rgba(11, 30, 54, 0.08)",
  },
  fabWrapper: {
    position: "absolute",
    bottom: 96,
    right: 20,
    zIndex: 20,
    alignItems: "flex-end",
  },
  menuContainer: {
    position: "absolute",
    bottom: 58,
    right: 0,
    width: 246,
    zIndex: 22,
  },
  menuShadowWrap: {
    borderRadius: 20,
    shadowColor: "#051A30",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 8,
    backgroundColor: "transparent",
  },
  menuBlur: {
    borderRadius: 20,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.45)",
  },
  menuSurface: {
    backgroundColor:
      Platform.OS === "ios"
        ? "rgba(255, 255, 255, 0.70)"
        : "rgba(255, 255, 255, 0.90)",
    paddingVertical: 10,
    paddingHorizontal: 12,
    position: "relative",
  },
  menuSheen: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    height: 1.2,
  },
  menuHeader: {
    paddingVertical: 4,
    paddingHorizontal: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(11, 30, 54, 0.06)",
  },
  menuHeaderTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    color: Colors.oceanBlueDark,
    textTransform: "uppercase",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 6,
    borderRadius: 12,
  },
  itemIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    borderWidth: 1,
  },
  blueBadge: {
    backgroundColor: "rgba(2, 132, 199, 0.12)",
    borderColor: "rgba(2, 132, 199, 0.25)",
  },
  cyanBadge: {
    backgroundColor: "rgba(6, 182, 212, 0.12)",
    borderColor: "rgba(6, 182, 212, 0.25)",
  },
  greenBadge: {
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderColor: "rgba(16, 185, 129, 0.25)",
  },
  itemTextWrapper: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 13.5,
    fontWeight: "600",
    color: "#0B1E36",
  },
  itemSubtitle: {
    fontSize: 10.5,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.50)",
    marginTop: 1,
  },
  menuDivider: {
    height: 1,
    backgroundColor: "rgba(11, 30, 54, 0.05)",
    marginVertical: 2,
    marginHorizontal: 4,
  },
  fabButtonContainer: {
    position: "relative",
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  haloRing: {
    position: "absolute",
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(2, 132, 199, 0.40)",
  },
  fabPressable: {
    width: 48,
    height: 48,
    borderRadius: 24,
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 6,
  },
  fabGradient: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.40)",
    overflow: "hidden",
    position: "relative",
  },
  fabTopSheen: {
    position: "absolute",
    top: 0,
    left: 6,
    right: 6,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.60)",
  },
});
