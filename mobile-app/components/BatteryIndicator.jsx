import React from "react";
import { View, Text, StyleSheet } from "react-native";
import Svg, { Rect, Path } from "react-native-svg";
import Colors from "../constants/theme";

export function getBatteryClassification(level) {
  const num = Number(level) || 0;
  if (num >= 85) {
    return {
      label: "Battery Healthy",
      color: Colors.seafoam,
      bgColor: Colors.seafoamLight,
    };
  } else if (num >= 70) {
    return {
      label: "Power Optimal",
      color: Colors.oceanBlue,
      bgColor: Colors.oceanBlueLight,
    };
  } else if (num >= 45) {
    return {
      label: "Normal Power",
      color: Colors.textSecondary,
      bgColor: Colors.backgroundAlt,
    };
  } else if (num >= 20) {
    return {
      label: "Low Power",
      color: Colors.amber,
      bgColor: Colors.amberLight,
    };
  } else {
    return {
      label: "Critical Reserve",
      color: Colors.coral,
      bgColor: Colors.coralLight,
    };
  }
}

export default function BatteryIndicator({ level = 92.4, showLabel = true, isCompact = false }) {
  const numericLevel = Math.max(0, Math.min(100, Number(level) || 0));
  const classification = getBatteryClassification(numericLevel);

  const w = 28;
  const h = 14;
  const maxFill = w - 4;
  const fillWidth = Math.max(2, (numericLevel / 100) * maxFill);

  return (
    <View style={styles.container}>
      <View style={styles.graphicRow}>
        {/* Minimal SVG Battery Shell */}
        <Svg width={w + 3} height={h} viewBox={`0 0 ${w + 3} ${h}`}>
          <Rect
            x="0.75"
            y="0.75"
            width={w}
            height={h - 1.5}
            rx="3"
            stroke={Colors.textTertiary}
            strokeWidth="1.2"
            fill="transparent"
          />
          <Path
            d={`M ${w + 1} 4.5 L ${w + 2.5} 4.5 Q ${w + 3} 4.5 ${w + 3} 5.5 L ${w + 3} ${h - 5.5} Q ${w + 3} ${h - 4.5} ${w + 1} ${h - 4.5} Z`}
            fill={Colors.textTertiary}
          />
          <Rect
            x="2"
            y="2"
            width={fillWidth}
            height={h - 4}
            rx="1.5"
            fill={classification.color}
          />
        </Svg>

        {/* Value */}
        <Text style={styles.valueText}>{numericLevel.toFixed(1)}%</Text>
      </View>

      {showLabel && !isCompact && (
        <Text style={[styles.labelText, { color: classification.color }]}>
          {classification.label}
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
