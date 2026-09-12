import React from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import GlassCard from "../components/GlassCard";
import OceanInsightCard from "../components/OceanInsightCard";
import LoadingState from "../components/LoadingState";
import Colors from "../constants/theme";
import { useTelemetry } from "../services/TelemetryContext";

function getWaterStatus(key, val) {
  const v = Number(val) || 0;
  switch (key) {
    case "temperature": {
      const pct = Math.max(0, Math.min(100, ((v - 15) / (35 - 15)) * 100));
      if (v > 30.5) return { status: "Monitoring", color: Colors.amber, pct };
      if (v >= 26 && v <= 29.5) return { status: "Optimal", color: Colors.seafoam, pct };
      return { status: "Normal", color: Colors.oceanBlue, pct };
    }
    case "salinity": {
      const pct = Math.max(0, Math.min(100, ((v - 30) / (40 - 30)) * 100));
      if (v < 32 || v > 36.5) return { status: "Monitoring", color: Colors.amber, pct };
      return { status: "Normal", color: Colors.seafoam, pct };
    }
    case "ph": {
      const pct = Math.max(0, Math.min(100, ((v - 6.5) / (9.0 - 6.5)) * 100));
      if (v < 7.7) return { status: "Monitoring", color: Colors.amber, pct };
      return { status: "Normal", color: Colors.seafoam, pct };
    }
    case "dissolved_oxygen": {
      const pct = Math.max(0, Math.min(100, ((v - 2) / (12 - 2)) * 100));
      if (v < 5.0) return { status: "Monitoring", color: Colors.amber, pct };
      return { status: "Good", color: Colors.seafoam, pct };
    }
    case "conductivity": {
      const pct = Math.max(0, Math.min(100, ((v - 40000) / (60000 - 40000)) * 100));
      return { status: "Normal", color: Colors.oceanBlue, pct };
    }
    case "turbidity": {
      const pct = Math.max(0, Math.min(100, ((v - 0) / (10 - 0)) * 100));
      if (v > 6.0) return { status: "Monitoring", color: Colors.amber, pct };
      if (v <= 3.5) return { status: "Good", color: Colors.seafoam, pct };
      return { status: "Normal", color: Colors.oceanBlue, pct };
    }
    default:
      return { status: "Normal", color: Colors.oceanBlue, pct: 50 };
  }
}

function SpaciousWaterRow({ label, value, unit, metricKey, isLast = false }) {
  const analysis = getWaterStatus(metricKey, value);

  return (
    <View style={[styles.itemContainer, !isLast && styles.itemDivider]}>
      <View style={styles.itemTopRow}>
        <Text style={styles.itemLabel}>{label}</Text>
        <View style={styles.itemValueGroup}>
          <Text style={styles.itemValue}>
            {typeof value === "number" ? value.toFixed(2) : value ?? "—"}
          </Text>
          <Text style={styles.itemUnit}>{unit}</Text>
        </View>
      </View>

      {/* Progress Track with Indicator Needle */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            { width: `${analysis.pct}%`, backgroundColor: analysis.color },
          ]}
        />
        <View
          style={[
            styles.needle,
            {
              left: `${Math.max(2, Math.min(96, analysis.pct))}%`,
              borderColor: analysis.color,
            },
          ]}
        />
      </View>

      <View style={styles.itemBottomRow}>
        <Text style={styles.statusPrefix}>
          Status:{" "}
          <Text style={[styles.statusHighlight, { color: analysis.color }]}>
            {analysis.status}
          </Text>
        </Text>
      </View>
    </View>
  );
}

export default function WaterQualityScreen({ noBackground = false }) {
  const { telemetry, loading, refreshing, error, refreshTelemetry } = useTelemetry();

  if (loading && !telemetry) {
    return (
      <LoadingState
        title="OCEAN INSIGHT"
        subtitle="Analyzing hydrological telemetry..."
      />
    );
  }

  if (error && !telemetry) {
    return (
      <LoadingState
        error={error}
        onRetry={refreshTelemetry}
      />
    );
  }

  const deviceId = telemetry?.device_id || "OCEAN_001";

  return (
    <ScreenContainer noBackground={noBackground}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        nestedScrollEnabled={true}
        directionalLockEnabled={true}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTelemetry}
            tintColor={Colors.oceanBlue}
            colors={[Colors.oceanBlue]}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.headerButton}>
            <Ionicons name="water-outline" size={20} color={Colors.oceanBlue} />
          </View>
          <View style={styles.headerCenter}>
            <Text style={styles.screenTitle}>Water Quality</Text>
            <Text style={styles.screenSub}>{deviceId} observation array</Text>
          </View>
          <View style={styles.headerButton}>
            <Ionicons name="filter-outline" size={19} color="#0B1E36" />
          </View>
        </View>

        {/* Section 1: Chemical & Biological Parameters */}
        <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Chemical & Biological</Text>
              <Text style={styles.cardSubtitle}>Core ecological balance parameters</Text>
            </View>
            <View style={styles.moreButton}>
              <Text style={styles.moreDots}>•••</Text>
            </View>
          </View>

          <SpaciousWaterRow
            label="Sea Surface Temperature"
            value={telemetry?.temperature}
            unit="°C"
            metricKey="temperature"
          />
          <SpaciousWaterRow
            label="Ocean Salinity (Conductivity)"
            value={telemetry?.salinity}
            unit="PSU"
            metricKey="salinity"
          />
          <SpaciousWaterRow
            label="Potential Hydrogen (pH)"
            value={telemetry?.ph}
            unit="pH"
            metricKey="ph"
          />
          <SpaciousWaterRow
            label="Dissolved Oxygen Saturation"
            value={telemetry?.dissolved_oxygen}
            unit="mg/L"
            metricKey="dissolved_oxygen"
            isLast={true}
          />
        </GlassCard>

        {/* Section 2: Physical & Optical Sensors */}
        <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Physical & Optical</Text>
              <Text style={styles.cardSubtitle}>Turbidity & electrical conductivity</Text>
            </View>
            <View style={styles.moreButton}>
              <Text style={styles.moreDots}>•••</Text>
            </View>
          </View>

          <SpaciousWaterRow
            label="Electrical Conductivity"
            value={telemetry?.conductivity}
            unit="µS/cm"
            metricKey="conductivity"
          />
          <SpaciousWaterRow
            label="Water Turbidity"
            value={telemetry?.turbidity}
            unit="NTU"
            metricKey="turbidity"
            isLast={true}
          />
        </GlassCard>

        {/* Ocean Insight Environmental Assessment */}
        <OceanInsightCard telemetry={telemetry} />

        <View style={styles.bottomDockSpacer} />
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerCenter: {
    alignItems: "center",
  },
  headerButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  screenTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0B1E36",
    letterSpacing: -0.2,
  },
  screenSub: {
    fontSize: 11,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.55)",
    marginTop: 2,
  },
  cardContainer: {
    marginHorizontal: 20,
    marginBottom: 20,
  },
  cardContent: {
    padding: 18,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 16.5,
    fontWeight: "700",
    color: "#0B1E36",
  },
  cardSubtitle: {
    fontSize: 11.5,
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
  itemContainer: {
    paddingVertical: 12,
  },
  itemDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 255, 255, 0.15)",
  },
  itemTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  itemLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0B1E36",
  },
  itemValueGroup: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 3,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0B1E36",
  },
  itemUnit: {
    fontSize: 11.5,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.45)",
  },
  track: {
    height: 5,
    backgroundColor: "rgba(11, 30, 54, 0.06)",
    borderRadius: 2.5,
    overflow: "visible",
    position: "relative",
    marginVertical: 4,
  },
  fill: {
    height: "100%",
    borderRadius: 2.5,
  },
  needle: {
    position: "absolute",
    top: -3,
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#FFFFFF",
    borderWidth: 2,
    shadowColor: "#051A30",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 2,
    elevation: 2,
  },
  itemBottomRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  statusPrefix: {
    fontSize: 11,
    color: "rgba(11, 30, 54, 0.45)",
  },
  statusHighlight: {
    fontWeight: "600",
  },
  bottomDockSpacer: {
    height: 96,
  },
});
