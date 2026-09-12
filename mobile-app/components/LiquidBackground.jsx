import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Dimensions, Animated } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

/**
 * Subtle Ambient Ocean Atmosphere Background
 * Designed to provide refined, quiet depth behind transparent liquid glass:
 * - Base: Soft, pale icy blue / off-white (#EEF5F8 -> #F7FAFC -> #EAF2F5)
 * - Layer 1: Very subtle pale cyan ambient field (Top-Left)
 * - Layer 2: Quiet sky-blue ambient field (Top-Right)
 * - Layer 3: Ultra-subtle seafoam ambient glow (Mid-Left)
 * - Layer 4: Faint oceanic mist field (Mid-Right)
 * - Layer 5: Discreet maritime floor wash (Behind floating dock)
 * - Layer 6: Extremely delicate light reflection shimmer
 */
export default function LiquidBackground() {
  const orb1Anim = useRef(new Animated.Value(0)).current;
  const orb2Anim = useRef(new Animated.Value(0)).current;
  const orb3Anim = useRef(new Animated.Value(0)).current;
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Orb 1: Gentle breathing & floating (10s cycle)
    const anim1 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb1Anim, {
          toValue: 1,
          duration: 5000,
          useNativeDriver: true,
        }),
        Animated.timing(orb1Anim, {
          toValue: 0,
          duration: 5000,
          useNativeDriver: true,
        }),
      ])
    );

    // Orb 2: Counter-phase vertical float (12s cycle)
    const anim2 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb2Anim, {
          toValue: 1,
          duration: 6500,
          useNativeDriver: true,
        }),
        Animated.timing(orb2Anim, {
          toValue: 0,
          duration: 6500,
          useNativeDriver: true,
        }),
      ])
    );

    // Orb 3: Slow diagonal drift (14s cycle)
    const anim3 = Animated.loop(
      Animated.sequence([
        Animated.timing(orb3Anim, {
          toValue: 1,
          duration: 7000,
          useNativeDriver: true,
        }),
        Animated.timing(orb3Anim, {
          toValue: 0,
          duration: 7000,
          useNativeDriver: true,
        }),
      ])
    );

    // Gentle light sheen drift (18s cycle)
    const animShimmer = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 9000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 9000,
          useNativeDriver: true,
        }),
      ])
    );

    anim1.start();
    anim2.start();
    anim3.start();
    animShimmer.start();

    return () => {
      anim1.stop();
      anim2.stop();
      anim3.stop();
      animShimmer.stop();
    };
  }, [orb1Anim, orb2Anim, orb3Anim, shimmerAnim]);

  // Interpolations
  const orb1TranslateX = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });
  const orb1TranslateY = orb1Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -16],
  });
  const orb1Scale = orb1Anim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.06, 1],
  });

  const orb2TranslateX = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });
  const orb2TranslateY = orb2Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 20],
  });

  const orb3TranslateX = orb3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 14],
  });
  const orb3TranslateY = orb3Anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const shimmerTranslateX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-SCREEN_WIDTH * 0.35, SCREEN_WIDTH * 0.35],
  });
  const shimmerOpacity = shimmerAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.015, 0.045, 0.015],
  });

  return (
    <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
      {/* Base: Soft, pale icy blue / off-white (#EEF5F8 -> #F7FAFC -> #EAF2F5) */}
      <LinearGradient
        colors={["#EEF5F8", "#F7FAFC", "#F0F6F8", "#EAF2F5"]}
        locations={[0, 0.32, 0.68, 1]}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Layer 1: Subtle Pale Cyan Ambient Field (Top-Left) */}
      <Animated.View
        style={[
          styles.ambientField,
          styles.field1,
          {
            transform: [
              { translateX: orb1TranslateX },
              { translateY: orb1TranslateY },
              { scale: orb1Scale },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(6, 182, 212, 0.12)",
            "rgba(56, 189, 248, 0.06)",
            "rgba(14, 165, 233, 0.02)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0.3, y: 0.3 }}
          end={{ x: 0.95, y: 0.95 }}
          style={styles.fieldGradient}
        />
      </Animated.View>

      {/* Layer 2: Quiet Sky-Blue Ambient Field (Top-Right) */}
      <Animated.View
        style={[
          styles.ambientField,
          styles.field2,
          {
            transform: [
              { translateX: orb2TranslateX },
              { translateY: orb2TranslateY },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(2, 132, 199, 0.10)",
            "rgba(14, 165, 233, 0.05)",
            "rgba(56, 189, 248, 0.015)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0.6, y: 0.4 }}
          end={{ x: 0.1, y: 1 }}
          style={styles.fieldGradient}
        />
      </Animated.View>

      {/* Layer 3: Ultra-Subtle Seafoam Ambient Glow (Mid-Left) */}
      <Animated.View
        style={[
          styles.ambientField,
          styles.field3,
          {
            transform: [
              { translateX: orb3TranslateX },
              { translateY: orb3TranslateY },
            ],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(16, 185, 129, 0.09)",
            "rgba(52, 211, 153, 0.045)",
            "rgba(167, 243, 208, 0.012)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0.35, y: 0.35 }}
          end={{ x: 0.95, y: 0.95 }}
          style={styles.fieldGradient}
        />
      </Animated.View>

      {/* Layer 4: Faint Oceanic Mist Field (Mid-Right) */}
      <View style={[styles.ambientField, styles.fieldTeal]}>
        <LinearGradient
          colors={[
            "rgba(3, 105, 161, 0.08)",
            "rgba(14, 165, 233, 0.04)",
            "rgba(56, 189, 248, 0.01)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0.4, y: 0.4 }}
          end={{ x: 0.95, y: 0.95 }}
          style={styles.fieldGradient}
        />
      </View>

      {/* Layer 5: Discreet Maritime Floor Wash (Behind Floating Dock) */}
      <View style={[styles.ambientField, styles.field4]}>
        <LinearGradient
          colors={[
            "rgba(15, 76, 129, 0.09)",
            "rgba(2, 132, 199, 0.045)",
            "rgba(56, 189, 248, 0.01)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.fieldGradient}
        />
      </View>

      {/* Layer 6: Delicate Liquid Light Reflection Shimmer */}
      <Animated.View
        style={[
          styles.lightReflectionBar,
          {
            opacity: shimmerOpacity,
            transform: [{ translateX: shimmerTranslateX }, { rotate: "-22deg" }],
          },
        ]}
      >
        <LinearGradient
          colors={[
            "rgba(255, 255, 255, 0)",
            "rgba(255, 255, 255, 0.35)",
            "rgba(255, 255, 255, 0)",
          ]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.shimmerGradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  ambientField: {
    position: "absolute",
    borderRadius: 9999,
    overflow: "hidden",
  },
  fieldGradient: {
    flex: 1,
    borderRadius: 9999,
  },
  field1: {
    top: 30,
    left: -SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 1.35,
    height: SCREEN_WIDTH * 1.35,
  },
  field2: {
    top: 20,
    right: -SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 1.35,
    height: SCREEN_WIDTH * 1.35,
  },
  field3: {
    top: SCREEN_HEIGHT * 0.28,
    left: -SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_WIDTH * 1.3,
  },
  fieldTeal: {
    top: SCREEN_HEIGHT * 0.32,
    right: -SCREEN_WIDTH * 0.35,
    width: SCREEN_WIDTH * 1.3,
    height: SCREEN_WIDTH * 1.3,
  },
  field4: {
    bottom: -50,
    left: -SCREEN_WIDTH * 0.25,
    width: SCREEN_WIDTH * 1.5,
    height: SCREEN_HEIGHT * 0.35,
  },
  lightReflectionBar: {
    position: "absolute",
    top: -100,
    left: -SCREEN_WIDTH * 0.5,
    width: SCREEN_WIDTH * 2,
    height: SCREEN_HEIGHT * 1.3,
    pointerEvents: "none",
  },
  shimmerGradient: {
    width: "100%",
    height: "100%",
  },
});
