import React from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Defs, LinearGradient, Stop, Line, Circle } from "react-native-svg";
import GlassCard from "./GlassCard";
import Colors, { Radii } from "../constants/theme";
import { formatShortTime } from "../services/api";

const screenWidth = Dimensions.get("window").width;
const CHART_WIDTH = screenWidth - 80;
const CHART_HEIGHT = 120;

function buildSmoothPath(points) {
  if (points.length < 2) return "";
  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i !== points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
  }
  return path;
}

export default function ChartCard({
  title,
  unit = "",
  data = [],
  lineColor = Colors.oceanBlue,
  subtext = null,
}) {
  if (!data || data.length === 0) {
    return (
      <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.emptyText}>Accumulating historical samples...</Text>
      </GlassCard>
    );
  }

  const values = data.map((d) => Number(d.value)).filter((v) => !isNaN(v));
  const minVal = values.length > 0 ? Math.min(...values) : 0;
  const maxVal = values.length > 0 ? Math.max(...values) : 1;
  const avgVal = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;

  const range = maxVal - minVal || 1;
  const yMin = minVal - range * 0.14;
  const yMax = maxVal + range * 0.14;
  const ySpan = yMax - yMin;

  const points = data.map((d, i) => {
    const x = (i / Math.max(1, data.length - 1)) * CHART_WIDTH;
    const y = CHART_HEIGHT - ((Number(d.value) - yMin) / ySpan) * (CHART_HEIGHT - 20) - 10;
    return { x, y: isNaN(y) ? CHART_HEIGHT / 2 : y };
  });

  const linePath = buildSmoothPath(points);
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${CHART_HEIGHT} L ${points[0].x} ${CHART_HEIGHT} Z`;
  const latestVal = values.length > 0 ? values[values.length - 1] : 0;
  const gradId = `grad-${title.replace(/\s+/g, "-")}`;

  return (
    <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
      {/* Top Header: Title + Subtitle + Action Button */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtext}>{subtext || "Live sensor trajectory"}</Text>
        </View>

        <View style={styles.moreButton}>
          <Text style={styles.moreDots}>•••</Text>
        </View>
      </View>

      {/* Large Current Value */}
      <View style={styles.valueRow}>
        <Text style={styles.valueNumber}>{latestVal.toFixed(2)}</Text>
        <Text style={styles.valueUnit}>{unit}</Text>
      </View>

      {/* SVG Line Graph on Frosted Translucent Canvas */}
      <View style={styles.chartContainer}>
        <Svg width={CHART_WIDTH} height={CHART_HEIGHT}>
          <Defs>
            <LinearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor={lineColor} stopOpacity="0.28" />
              <Stop offset="100%" stopColor={lineColor} stopOpacity="0.0" />
            </LinearGradient>
          </Defs>

          <Line
            x1="0"
            y1={CHART_HEIGHT * 0.3}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT * 0.3}
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1"
            strokeDasharray="4, 4"
          />
          <Line
            x1="0"
            y1={CHART_HEIGHT * 0.7}
            x2={CHART_WIDTH}
            y2={CHART_HEIGHT * 0.7}
            stroke="rgba(255, 255, 255, 0.35)"
            strokeWidth="1"
            strokeDasharray="4, 4"
          />

          <Path d={areaPath} fill={`url(#${gradId})`} />
          <Path
            d={linePath}
            stroke={lineColor}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />

          {points.length > 0 && (
            <>
              <Circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="6"
                fill={`${lineColor}33`}
              />
              <Circle
                cx={points[points.length - 1].x}
                cy={points[points.length - 1].y}
                r="3.5"
                fill={lineColor}
              />
            </>
          )}
        </Svg>
      </View>

      {/* Footer: Time Window + Min/Avg/Max */}
      <View style={styles.footerRow}>
        <View style={styles.timeGroup}>
          <Text style={styles.timeLabel}>
            {data.length > 0 ? formatShortTime(data[0].timestamp) : "Earlier"}
          </Text>
          <Text style={styles.timeDot}>•</Text>
          <Text style={styles.timeLabel}>
            {data.length > 0 ? formatShortTime(data[data.length - 1].timestamp) : "Now"}
          </Text>
        </View>

        <View style={styles.statsGroup}>
          <Text style={styles.statText}>
            Min <Text style={styles.statBold}>{minVal.toFixed(1)}</Text>
          </Text>
          <Text style={styles.statText}>
            Avg <Text style={styles.statBold}>{avgVal.toFixed(1)}</Text>
          </Text>
          <Text style={styles.statText}>
            Max <Text style={styles.statBold}>{maxVal.toFixed(1)}</Text>
          </Text>
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
  emptyText: {
    fontSize: 12,
    color: "rgba(11, 30, 54, 0.45)",
    marginTop: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#0B1E36",
  },
  subtext: {
    fontSize: 11.5,
    color: "rgba(11, 30, 54, 0.55)",
    marginTop: 2,
    fontWeight: "500",
  },
  moreButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.20)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.35)",
    alignItems: "center",
    justifyContent: "center",
  },
  moreDots: {
    fontSize: 12,
    color: "rgba(11, 30, 54, 0.6)",
    letterSpacing: 1,
    fontWeight: "700",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },
  valueNumber: {
    fontSize: 25,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: "#0B1E36",
  },
  valueUnit: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.5)",
    marginLeft: 4,
  },
  chartContainer: {
    height: CHART_HEIGHT,
    alignItems: "center",
    justifyContent: "center",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.22)",
  },
  timeGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  timeLabel: {
    fontSize: 10.5,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.45)",
  },
  timeDot: {
    fontSize: 10,
    color: "rgba(11, 30, 54, 0.35)",
  },
  statsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  statText: {
    fontSize: 10.5,
    color: "rgba(11, 30, 54, 0.45)",
  },
  statBold: {
    fontWeight: "600",
    color: "#0B1E36",
  },
});
