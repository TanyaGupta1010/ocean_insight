import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import Colors from "../constants/theme";

export default function MetricRow({
  label,
  value,
  unit,
  subtext,
  isHero = false,
  status = null,
  statusColor = Colors.seafoam,
  customComponent = null,
  isLast = false,
}) {
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // Soft subtle transition when value updates
  useEffect(() => {
    if (value !== undefined && value !== null) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.6,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [value, fadeAnim]);

  // Hero Mode (Primary Temperature display)
  if (isHero) {
    return (
      <View style={[styles.heroContainer, !isLast && styles.rowDivider]}>
        <View style={styles.heroTop}>
          <Text style={styles.heroLabel}>{label}</Text>
          {status && (
            <View style={[styles.statusBadge, { backgroundColor: `${statusColor}14` }]}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={[styles.statusText, { color: statusColor }]}>{status}</Text>
            </View>
          )}
        </View>

        <Animated.View style={[styles.heroValueGroup, { opacity: fadeAnim }]}>
          <Text style={styles.heroValue}>
            {typeof value === "number" ? value.toFixed(2) : value ?? "—"}
          </Text>
          {unit ? <Text style={styles.heroUnit}>{unit}</Text> : null}
        </Animated.View>

        {subtext ? <Text style={styles.heroSubtext}>{subtext}</Text> : null}
      </View>
    );
  }

  // Standard Connected Row
  return (
    <View style={[styles.standardRow, !isLast && styles.rowDivider]}>
      <View style={styles.leftCol}>
        <Text style={styles.standardLabel}>{label}</Text>
        {subtext ? <Text style={styles.standardSubtext}>{subtext}</Text> : null}
      </View>

      <View style={styles.rightCol}>
        {customComponent ? (
          customComponent
        ) : (
          <Animated.View style={[styles.standardValueGroup, { opacity: fadeAnim }]}>
            <Text style={styles.standardValue}>
              {typeof value === "number" ? value.toFixed(2) : value ?? "—"}
            </Text>
            {unit ? <Text style={styles.standardUnit}>{unit}</Text> : null}
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Hero Mode Styles
  heroContainer: {
    paddingVertical: 18,
  },
  heroTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  heroLabel: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  statusDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  heroValueGroup: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  heroValue: {
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: -1,
    color: Colors.textPrimary,
  },
  heroUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 4,
  },
  heroSubtext: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 4,
    fontWeight: "500",
  },

  // Standard Row Styles
  standardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 15,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  leftCol: {
    flex: 1,
    paddingRight: 12,
  },
  standardLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.textPrimary,
  },
  standardSubtext: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 2,
    fontWeight: "500",
  },
  rightCol: {
    alignItems: "flex-end",
  },
  standardValueGroup: {
    flexDirection: "row",
    alignItems: "baseline",
  },
  standardValue: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.3,
    color: Colors.textPrimary,
  },
  standardUnit: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginLeft: 3,
  },
});
