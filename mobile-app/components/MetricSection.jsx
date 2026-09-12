import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/theme";

export default function MetricSection({
  title,
  subtitle,
  badge,
  badgeColor = Colors.oceanBlue,
  children,
}) {
  return (
    <View style={styles.container}>
      {/* Subtle Section Header */}
      {title && (
        <View style={styles.headerRow}>
          <Text style={styles.titleText}>{title}</Text>
          {badge && (
            <View style={[styles.badge, { backgroundColor: `${badgeColor}12` }]}>
              <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
            </View>
          )}
        </View>
      )}

      {/* Unified Card Surface */}
      <View style={styles.cardSurface}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  titleText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.9,
    color: Colors.textSecondary,
    textTransform: "uppercase",
  },
  badge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.4,
  },
  cardSurface: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 18,
    shadowColor: Colors.textPrimary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.02,
    shadowRadius: 10,
    elevation: 1,
  },
});
