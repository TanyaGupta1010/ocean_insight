import React from "react";
import { View, StyleSheet, Platform } from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import Colors, { Radii, Shadows } from "../constants/theme";

/**
 * True Translucent iOS Liquid Glass Card Surface
 * - Native BlurView for authentic optical refraction
 * - Truly transparent material layer: rgba(255, 255, 255, 0.16)
 * - Ultra-subtle hairline glass border: rgba(255, 255, 255, 0.30)
 * - Top specular highlight sheen simulating overhead ambient refraction
 * - Soft airy diffused elevation
 */
export default function GlassCard({
  children,
  style,
  contentStyle,
  intensity = 38,
  tint = Platform.OS === "ios" ? "systemUltraThinMaterialLight" : "light",
  borderRadius = Radii.card,
  noBorder = false,
  highlight = false,
}) {
  return (
    <View
      style={[
        styles.outerContainer,
        { borderRadius },
        !noBorder && styles.glassBorder,
        highlight && styles.highlightGlow,
        style,
      ]}
    >
      <BlurView
        intensity={intensity}
        tint={tint}
        blurMethod="dimezisBlurView"
        style={[styles.blurView, { borderRadius }]}
      >
        <View
          style={[
            styles.innerSurface,
            {
              borderRadius,
              backgroundColor:
                Platform.OS === "ios"
                  ? "rgba(255, 255, 255, 0.05)"
                  : "rgba(255, 255, 255, 0.18)",
            },
            contentStyle,
          ]}
        >
          {/* Top-Left Specular Refraction Highlight */}
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
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    overflow: "hidden",
    shadowColor: "#051A30",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 14,
    elevation: 2,
    backgroundColor: "transparent",
  },
  glassBorder: {
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
  },
  highlightGlow: {
    borderColor: "rgba(56, 189, 248, 0.4)",
    ...Shadows.glassGlow,
  },
  blurView: {
    overflow: "hidden",
  },
  innerSurface: {
    position: "relative",
  },
  specularSheen: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 1.2,
  },
});
