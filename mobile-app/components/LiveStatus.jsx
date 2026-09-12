import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/theme";
import { formatFriendlyDateTime } from "../services/api";

export default function LiveStatus({
  deviceId = "OCEAN_001",
  isOperational = true,
  timestamp,
  isRefreshing = false,
}) {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const breathing = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.4,
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
    <View style={styles.container}>
      <View style={styles.left}>
        <View style={styles.dotContainer}>
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: pulseAnim }] },
            ]}
          />
          <View style={styles.dot} />
        </View>
        <Text style={styles.liveText}>LIVE</Text>
        <Text style={styles.dotSeparator}>•</Text>
        <Text style={styles.deviceText}>{deviceId}</Text>
      </View>

      <View style={styles.right}>
        {timestamp && (
          <Text style={styles.timeText}>
            {isRefreshing ? "Updating..." : formatFriendlyDateTime(timestamp)}
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dotContainer: {
    width: 10,
    height: 10,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  pulseRing: {
    position: "absolute",
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.seafoamGlow,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.seafoam,
  },
  liveText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.6,
    color: Colors.seafoamDark,
  },
  dotSeparator: {
    fontSize: 10,
    color: Colors.textTertiary,
  },
  deviceText: {
    fontSize: 11,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    fontSize: 11,
    fontWeight: "500",
    color: Colors.textTertiary,
  },
});
