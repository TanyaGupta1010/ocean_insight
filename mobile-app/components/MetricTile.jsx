import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Pressable,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Colors, { Radii } from "../constants/theme";

/**
 * Premium iOS Translucent Liquid Glass Metric Tile
 * - True material transparency showing background through the surface
 * - 38px circular glass icon container with subtle category tint
 * - Refined iOS typography: quieter labels, prominent numerals, secondary units
 * - Spring touch feedback & subtle live update glow
 */
export default function MetricTile({
  labelLine1,
  labelLine2,
  value,
  unit,
  icon = "water-outline",
  iconColor = Colors.oceanBlue,
}) {
  const pressScale = useRef(new Animated.Value(1)).current;
  const updateFade = useRef(new Animated.Value(1)).current;
  const updateTranslateY = useRef(new Animated.Value(0)).current;
  const glowPulse = useRef(new Animated.Value(0)).current;
  const prevValueRef = useRef(value);

  // Subtle pulse on live telemetry update
  useEffect(() => {
    if (value !== undefined && value !== null && prevValueRef.current !== value) {
      prevValueRef.current = value;

      Animated.parallel([
        Animated.sequence([
          Animated.timing(updateTranslateY, {
            toValue: -2,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(updateTranslateY, {
            toValue: 0,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(updateFade, {
            toValue: 0.6,
            duration: 160,
            useNativeDriver: true,
          }),
          Animated.timing(updateFade, {
            toValue: 1,
            duration: 320,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(glowPulse, {
            toValue: 1,
            duration: 220,
            useNativeDriver: true,
          }),
          Animated.timing(glowPulse, {
            toValue: 0,
            duration: 450,
            useNativeDriver: true,
          }),
        ]),
      ]).start();
    }
  }, [value, updateFade, updateTranslateY, glowPulse]);

  const handlePressIn = () => {
    Animated.spring(pressScale, {
      toValue: 0.965,
      friction: 8,
      tension: 240,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressScale, {
      toValue: 1,
      friction: 6,
      tension: 140,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.tileOuter,
        {
          transform: [{ scale: pressScale }],
        },
      ]}
    >
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressableContainer}
      >
        <BlurView
          intensity={Platform.OS === "ios" ? 38 : 30}
          tint={Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light"}
          blurMethod="dimezisBlurView"
          style={styles.blurContainer}
        >
          <View style={styles.tileContent}>
            {/* Top Specular Hairline Sheen */}
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0.50)",
                "rgba(255, 255, 255, 0.10)",
                "rgba(255, 255, 255, 0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0.8, y: 0 }}
              style={styles.specularSheen}
              pointerEvents="none"
            />

            {/* Top Row: Quieter Labels + Circular Glass Icon Surface */}
            <View style={styles.topRow}>
              <View style={styles.labelWrapper}>
                <Text style={styles.label}>{labelLine1}</Text>
                {labelLine2 ? <Text style={styles.label}>{labelLine2}</Text> : null}
              </View>

              {/* Minimalist Glass Icon Container */}
              <View style={styles.glassIconContainer}>
                <Ionicons name={icon} size={18} color={iconColor} />
              </View>
            </View>

            {/* Bottom Row: Large Numeric Value + Quiet Unit */}
            <Animated.View
              style={[
                styles.valueRow,
                {
                  opacity: updateFade,
                  transform: [{ translateY: updateTranslateY }],
                },
              ]}
            >
              {/* Soft Aqua Live Aura */}
              <Animated.View
                style={[
                  styles.glowAura,
                  {
                    opacity: glowPulse,
                  },
                ]}
                pointerEvents="none"
              />

              <Text style={styles.value}>
                {typeof value === "number" ? value.toFixed(2) : value ?? "—"}
              </Text>
              {unit ? <Text style={styles.unit}>{unit}</Text> : null}
            </Animated.View>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tileOuter: {
    flex: 1,
    borderRadius: Radii.tile,
    shadowColor: "#051A30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    backgroundColor: "transparent",
  },
  pressableContainer: {
    flex: 1,
    borderRadius: Radii.tile,
  },
  blurContainer: {
    flex: 1,
    borderRadius: Radii.tile,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  tileContent: {
    flex: 1,
    backgroundColor:
      Platform.OS === "ios"
        ? "rgba(255, 255, 255, 0.05)"
        : "rgba(255, 255, 255, 0.18)",
    padding: 16,
    justifyContent: "space-between",
    minHeight: 116,
    position: "relative",
  },
  specularSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.2,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  labelWrapper: {
    flex: 1,
    paddingRight: 6,
  },
  label: {
    fontSize: 12.5,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.65)",
    lineHeight: 16,
    letterSpacing: 0.1,
  },
  glassIconContainer: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.24)",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    position: "relative",
  },
  glowAura: {
    position: "absolute",
    left: -6,
    top: -4,
    right: -6,
    bottom: -4,
    borderRadius: 8,
    backgroundColor: "rgba(56, 189, 248, 0.20)",
  },
  value: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#0B1E36",
  },
  unit: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.45)",
    marginLeft: 3,
  },
});
