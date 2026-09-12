import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Colors from "../constants/theme";

export default function SignalIndicator({ signal = 85.0, showLabel = true }) {
  const num = Math.max(0, Math.min(100, Number(signal) || 0));
  const activeBars = num >= 75 ? 4 : num >= 50 ? 3 : num >= 25 ? 2 : num > 0 ? 1 : 0;

  const getSignalStatus = (val) => {
    if (val >= 75) return { label: "Strong Signal", color: Colors.seafoam };
    if (val >= 50) return { label: "Good Signal", color: Colors.oceanBlue };
    if (val >= 25) return { label: "Moderate", color: Colors.amber };
    return { label: "Weak Signal", color: Colors.coral };
  };

  const status = getSignalStatus(num);
  const barHeights = [5, 9, 13, 17];

  return (
    <View style={styles.container}>
      <View style={styles.graphicRow}>
        <View style={styles.bars}>
          {barHeights.map((h, i) => (
            <View
              key={i}
              style={[
                styles.bar,
                {
                  height: h,
                  backgroundColor: i < activeBars ? status.color : Colors.border,
                },
              ]}
            />
          ))}
        </View>
        <Text style={styles.valueText}>{num.toFixed(1)}%</Text>
      </View>

      {showLabel && (
        <Text style={[styles.labelText, { color: status.color }]}>
          {status.label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-end",
  },
  graphicRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
  },
  bars: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 2.5,
    height: 18,
    paddingBottom: 1,
  },
  bar: {
    width: 3.5,
    borderRadius: 1.75,
  },
  valueText: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.textPrimary,
    letterSpacing: -0.2,
  },
  labelText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.2,
    marginTop: 2,
  },
});
