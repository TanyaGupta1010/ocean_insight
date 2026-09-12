import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import GlassCard from "./GlassCard";
import Colors from "../constants/theme";
import { formatFriendlyDateTime } from "../services/api";

export default function LiveStatusCard({
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
          toValue: 1.5,
          duration: 1300,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1300,
          useNativeDriver: true,
        }),
      ])
    );
    breathing.start();
    return () => breathing.stop();
  }, [pulseAnim]);

  return (
    <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
      {/* Top Header: Title + Minimal Glass Action Button */}
      <View style={styles.topHeader}>
        <View>
          <Text style={styles.title}>Live Ocean Status</Text>
          <Text style={styles.subtitle}>Continuous environmental monitoring link</Text>
        </View>

        <View style={styles.moreButton}>
          <Text style={styles.moreDots}>•••</Text>
        </View>
      </View>

      {/* Main Status Row */}
      <View style={styles.statusRow}>
        {/* Refined Translucent Operational Badge */}
        <View style={styles.badgeWrapper}>
          <View style={styles.dotContainer}>
            <Animated.View
              style={[
                styles.pulseRing,
                { transform: [{ scale: pulseAnim }] },
              ]}
            />
            <View style={styles.dot} />
          </View>
          <Text style={styles.badgeText}>
            {isOperational ? "System Operational" : "Degraded Telemetry"}
          </Text>
        </View>

        {/* Minimalist Device Chip */}
        <View style={styles.devicePill}>
          <Ionicons name="hardware-chip-outline" size={12} color="rgba(11, 30, 54, 0.65)" />
          <Text style={styles.deviceText}>{deviceId}</Text>
        </View>
      </View>

      {/* Footer Info */}
      <View style={styles.footerRow}>
        <Text style={styles.footerText}>
          {isRefreshing
            ? "Synchronizing telemetry packets..."
            : timestamp
            ? `Last updated ${formatFriendlyDateTime(timestamp)}`
            : "Telemetry uplink active"}
        </Text>
        <View style={styles.cadencePill}>
          <Ionicons name="flash-outline" size={11} color={Colors.oceanBlue} />
          <Text style={styles.cadenceText}>5s interval</Text>
        </View>
      </View>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardContent: {
    padding: 18,
  },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  title: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#0B1E36",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.55)",
    marginTop: 2,
  },
  moreButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.14)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreDots: {
    fontSize: 12,
    color: "rgba(11, 30, 54, 0.55)",
    letterSpacing: 1,
    fontWeight: "700",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  badgeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.24)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
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
    backgroundColor: "rgba(16, 185, 129, 0.28)",
  },
  dot: {
    width: 5.5,
    height: 5.5,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#047857",
    letterSpacing: 0.1,
  },
  devicePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.30)",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  deviceText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#0B1E36",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  footerText: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.45)",
  },
  cadencePill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 3,
    backgroundColor: "rgba(2, 132, 199, 0.10)",
    borderWidth: 1,
    borderColor: "rgba(2, 132, 199, 0.18)",
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 6,
  },
  cadenceText: {
    fontSize: 10.5,
    fontWeight: "600",
    color: Colors.oceanBlue,
  },
});
