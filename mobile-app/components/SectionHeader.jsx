import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Colors from "../constants/theme";

export default function SectionHeader({
  title,
  subtitle,
  icon,
  badge,
  badgeColor = Colors.oceanBlue,
}) {
  return (
    <View style={styles.headerRow}>
      <View style={styles.leftGroup}>
        {icon && (
          <View style={[styles.iconBox, { backgroundColor: `${badgeColor}15` }]}>
            <Ionicons name={icon} size={15} color={badgeColor} />
          </View>
        )}
        <View>
          <Text style={styles.titleText}>{title}</Text>
          {subtitle && <Text style={styles.subtitleText}>{subtitle}</Text>}
        </View>
      </View>

      {badge && (
        <View style={[styles.badge, { backgroundColor: `${badgeColor}12` }]}>
          <Text style={[styles.badgeText, { color: badgeColor }]}>{badge}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.backgroundAlt,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  leftGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  iconBox: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  titleText: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 0.8,
    color: Colors.textPrimary,
    textTransform: "uppercase",
  },
  subtitleText: {
    fontSize: 10,
    fontWeight: "500",
    color: Colors.textSecondary,
    marginTop: 1,
  },
  badge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
  },
});
