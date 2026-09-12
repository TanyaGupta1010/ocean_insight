import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated, TouchableOpacity } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import LiquidBackground from "./LiquidBackground";
import GlassCard from "./GlassCard";
import Colors, { Shadows } from "../constants/theme";

export default function LoadingState({
  title = "OCEAN INSIGHT",
  subtitle = "Connecting to live observation stream...",
  error = null,
  onRetry = null,
}) {
  const pulseAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (error) return;

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.45,
            duration: 1600,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0,
            duration: 1600,
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.5,
            duration: 0,
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 0,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim, opacityAnim, error]);

  return (
    <View style={styles.container}>
      <LiquidBackground />

      {error ? (
        <GlassCard style={styles.errorCard} contentStyle={styles.errorContent}>
          <View style={styles.errorIconCircle}>
            <Ionicons name="cloud-offline-outline" size={32} color={Colors.coral} />
          </View>
          <Text style={styles.errorTitle}>Connection Interrupted</Text>
          <Text style={styles.errorText}>{error}</Text>
          {onRetry && (
            <TouchableOpacity style={styles.retryBtn} onPress={onRetry} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>Retry Connection</Text>
            </TouchableOpacity>
          )}
        </GlassCard>
      ) : (
        <GlassCard style={styles.loadingCard} contentStyle={styles.loadingContent}>
          {/* Liquid Sonar Ring */}
          <View style={styles.sonarWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                  opacity: opacityAnim,
                },
              ]}
            />
            <View style={styles.centerDot}>
              <Svg width="20" height="20" viewBox="0 0 20 20">
                <Circle cx="10" cy="10" r="4" fill={Colors.oceanBlue} />
              </Svg>
            </View>
          </View>

          <Text style={styles.brandTitle}>{title}</Text>
          <Text style={styles.loadingText}>{subtitle}</Text>
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  loadingCard: {
    maxWidth: 320,
    width: "100%",
  },
  loadingContent: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 24,
  },
  sonarWrapper: {
    width: 64,
    height: 64,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: Colors.oceanBlue,
  },
  centerDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(2, 132, 199, 0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: Colors.textPrimary,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    textAlign: "center",
  },
  errorCard: {
    maxWidth: 320,
    width: "100%",
  },
  errorContent: {
    alignItems: "center",
    padding: 24,
  },
  errorIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "rgba(239, 68, 68, 0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 18,
    marginBottom: 16,
  },
  retryBtn: {
    backgroundColor: Colors.oceanBlue,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    ...Shadows.button,
  },
  retryBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: Colors.textInverse,
  },
});
