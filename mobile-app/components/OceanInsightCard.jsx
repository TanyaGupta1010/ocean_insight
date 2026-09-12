import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, Dimensions, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";
import { Radii } from "../constants/theme";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const CARD_WIDTH = SCREEN_WIDTH - 40;

export default function OceanInsightCard({ telemetry }) {
  const sheenAnim = useRef(new Animated.Value(0)).current;

  // Calm liquid light reflection (7.5s cycle)
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(sheenAnim, {
          toValue: 1,
          duration: 7500,
          useNativeDriver: true,
        }),
        Animated.delay(1000),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [sheenAnim]);

  const sheenTranslateX = sheenAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-CARD_WIDTH * 0.8, CARD_WIDTH * 1.4],
  });

  // Dynamic environmental interpretation
  const temp = telemetry?.temperature ?? 27.5;
  const salinity = telemetry?.salinity ?? 34.5;
  const ph = telemetry?.ph ?? 8.0;
  const doVal = telemetry?.dissolved_oxygen ?? 7.2;

  let message =
    "Water conditions are stable and within optimal biological operating thresholds. Surface conductivity and salinity remain balanced.";

  if (temp > 30.0) {
    message = `Elevated surface thermal layer observed at ${temp.toFixed(1)}°C. Salinity (${salinity.toFixed(1)} PSU) and dissolved oxygen (${doVal.toFixed(1)} mg/L) remain within healthy ranges.`;
  } else if (ph < 7.8) {
    message = `Slight chemical buffer variation detected (pH ${ph.toFixed(2)}). Hydrological conditions are monitored continuously by station OCEAN_001.`;
  } else if (doVal >= 6.8) {
    message = `High photosynthetic oxygen saturation (${doVal.toFixed(1)} mg/L) with optimal open-ocean salinity (${salinity.toFixed(1)} PSU). Marine habitat equilibrium is nominal.`;
  }

  return (
    <View style={styles.cardWrapper}>
      <BlurView
        intensity={Platform.OS === "ios" ? 45 : 30}
        tint="light"
        blurMethod="dimezisBlurView"
        style={styles.blurContainer}
      >
        <LinearGradient
          colors={["rgba(14, 165, 233, 0.76)", "rgba(2, 132, 199, 0.84)", "rgba(3, 105, 161, 0.90)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cardGradient}
        >
          {/* Top Specular Liquid Hairline */}
          <LinearGradient
            colors={[
              "rgba(255, 255, 255, 0.75)",
              "rgba(255, 255, 255, 0.25)",
              "rgba(255, 255, 255, 0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0.8, y: 0 }}
            style={styles.topSheen}
            pointerEvents="none"
          />

          {/* Faint Underwater Wave Texture */}
          <View style={styles.waveSvgContainer} pointerEvents="none">
            <Svg width={CARD_WIDTH} height="120" viewBox="0 0 320 120">
              <Path
                d="M0 60 C 60 40, 120 80, 180 50 C 240 20, 280 70, 320 40 L 320 120 L 0 120 Z"
                fill="rgba(255, 255, 255, 0.08)"
              />
              <Path
                d="M0 80 C 80 65, 160 95, 240 75 C 280 65, 300 85, 320 70 L 320 120 L 0 120 Z"
                fill="rgba(255, 255, 255, 0.05)"
              />
            </Svg>
          </View>

          {/* Slow Moving Liquid Light Reflection */}
          <Animated.View
            style={[
              styles.sheenBar,
              {
                transform: [{ translateX: sheenTranslateX }, { rotate: "25deg" }],
              },
            ]}
            pointerEvents="none"
          >
            <LinearGradient
              colors={[
                "rgba(255, 255, 255, 0)",
                "rgba(255, 255, 255, 0.22)",
                "rgba(255, 255, 255, 0)",
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.sheenGradient}
            />
          </Animated.View>

          {/* Card Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <View style={styles.sparkleCircle}>
                <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              </View>
              <Text style={styles.title}>Ocean Insight</Text>
            </View>
            <View style={styles.liveBadge}>
              <View style={styles.livePulseDot} />
              <Text style={styles.liveBadgeText}>AI Analysis</Text>
            </View>
          </View>

          {/* Card Body */}
          <Text style={styles.bodyText}>{message}</Text>
        </LinearGradient>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  cardWrapper: {
    marginHorizontal: 20,
    marginBottom: 24,
    borderRadius: Radii.card,
    overflow: "hidden",
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: "transparent",
  },
  blurContainer: {
    borderRadius: Radii.card,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
  },
  cardGradient: {
    padding: 18,
    position: "relative",
    overflow: "hidden",
  },
  topSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.2,
  },
  waveSvgContainer: {
    position: "absolute",
    right: 0,
    bottom: 0,
    left: 0,
    height: 120,
    overflow: "hidden",
  },
  sheenBar: {
    position: "absolute",
    top: -50,
    bottom: -50,
    width: 60,
  },
  sheenGradient: {
    width: "100%",
    height: "100%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
    zIndex: 2,
  },
  titleGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sparkleCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.30)",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 15.5,
    fontWeight: "700",
    color: "#FFFFFF",
    letterSpacing: 0.1,
  },
  liveBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    paddingVertical: 3.5,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.28)",
  },
  livePulseDot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: "#A7F3D0",
  },
  liveBadgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#FFFFFF",
    letterSpacing: 0.2,
  },
  bodyText: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(255, 255, 255, 0.95)",
    lineHeight: 20,
    letterSpacing: 0.1,
    zIndex: 2,
  },
});
