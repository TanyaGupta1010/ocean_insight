import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Colors from "../constants/theme";
import { formatFriendlyDateTime } from "../services/api";

export default function Header({
  title = "OCEAN INSIGHT",
  subtitle = "Real-time Environmental Intelligence",
  timestamp = null,
  isLive = true,
  isRefreshing = false,
}) {
  // Subtle breathing pulse for the live dot
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 1200,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [pulseAnim]);

  return (
    <View style={styles.header}>
      {/* Centered Brand Title */}
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>

      {/* Minimal Live Status Row */}
      {isLive && (
        <View style={styles.statusRow}>
          <View style={styles.dotWrapper}>
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.liveDot} />
          </View>
          <Text style={styles.liveLabel}>LIVE</Text>
          <Text style={styles.separator}>•</Text>
          <Text style={styles.timeLabel}>
            {isRefreshing
              ? "Updating..."
              : timestamp
              ? `Updated ${formatFriendlyDateTime(timestamp)}`
              : "Stream active"}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: "center",
    paddingTop: 10,
    paddingBottom: 14,
    paddingHorizontal: 20,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    letterSpacing: 1.2,
    color: Colors.textPrimary,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.textSecondary,
    letterSpacing: 0.2,
    marginTop: 2,
    marginBottom: 8,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.backgroundAlt,
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  dotWrapper: {
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.seafoamGlow,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.seafoam,
  },
  liveLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Colors.seafoamDark,
  },
  separator: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  timeLabel: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
});
