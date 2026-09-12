import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Circle } from "react-native-svg";
import Colors from "../constants/theme";

export default function RadarAccuracy({ accuracy = 4.0, showLabel = true }) {
  const num = Number(accuracy) || 4.0;

  const getAccuracyStatus = (m) => {
    if (m <= 4.0) return { label: "High Precision", color: Colors.seafoam };
    if (m <= 8.0) return { label: "Standard Fix", color: Colors.oceanBlue };
    return { label: "Degraded Fix", color: Colors.amber };
  };

  const status = getAccuracyStatus(num);

  return (
    <View style={styles.container}>
      <View style={styles.graphicRow}>
        <Svg width="18" height="18" viewBox="0 0 18 18">
          <Circle cx="9" cy="9" r="8" stroke={Colors.borderStrong} strokeWidth="1" fill="none" />
          <Circle cx="9" cy="9" r="4.5" stroke={Colors.borderStrong} strokeWidth="1" fill="none" />
          <Circle cx="9" cy="9" r="2" fill={status.color} />
        </Svg>
        <Text style={styles.valueText}>{num.toFixed(2)} m</Text>
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
    alignItems: "center",
    gap: 8,
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
