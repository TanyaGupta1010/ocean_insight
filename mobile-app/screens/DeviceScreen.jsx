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
import Svg, { Circle } from "react-native-svg";
import ScreenContainer from "../components/ScreenContainer";
import GlassCard from "../components/GlassCard";
import OceanInsightCard from "../components/OceanInsightCard";
import LoadingState from "../components/LoadingState";
import Colors, { Radii } from "../constants/theme";
import { formatFriendlyDateTime } from "../services/api";
import { useTelemetry } from "../services/TelemetryContext";

export default function DeviceScreen({ noBackground = false }) {
  const { telemetry, loading, refreshing, error, refreshTelemetry } = useTelemetry();

  if (loading && !telemetry) {
    return (
      <LoadingState
        title="OCEAN INSIGHT"
        subtitle="Interrogating buoy avionics & telemetry..."
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
  const latitude = telemetry?.latitude ? Number(telemetry.latitude).toFixed(6) : "28.450643";
  const longitude = telemetry?.longitude ? Number(telemetry.longitude).toFixed(6) : "77.583798";
  const accuracy = Number(telemetry?.gps_accuracy ?? 4.0);
  const battery = Number(telemetry?.battery ?? 92.4);
  const signal = Number(telemetry?.signal_strength ?? 88.0);
  const timestamp = telemetry?.timestamp;

  const batteryBarWidth = Math.max(8, Math.min(100, battery));

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
        {/* Top Bar Header */}
        <View style={styles.topBar}>
          <View style={styles.headerButton}>
            <Ionicons name="hardware-chip-outline" size={20} color={Colors.oceanBlue} />
          </View>
          <View style={styles.headerTitleCenter}>
            <Text style={styles.screenTitle}>Device Health</Text>
            <Text style={styles.screenSub}>{deviceId} monitoring status</Text>
          </View>
          <View style={styles.headerButton}>
            <Ionicons name="pulse-outline" size={19} color="#0B1E36" />
          </View>
        </View>

        {/* ================================================== */}
        {/* 1. BATTERY HEALTH (GlassCard Surface) */}
        {/* ================================================== */}
        <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Battery Health</Text>
              <Text style={styles.cardSubtitle}>Solar-buffered energy reserve</Text>
            </View>
            <View style={styles.moreButton}>
              <Text style={styles.moreDots}>•••</Text>
            </View>
          </View>

          <View style={styles.heroMetricRow}>
            <Text style={styles.heroValue}>{battery.toFixed(1)}%</Text>
            <View style={styles.statusPill}>
              <View style={styles.greenDot} />
              <Text style={styles.statusPillText}>Healthy Operating Capacity</Text>
            </View>
          </View>

          <View style={styles.barTrack}>
            <View
              style={[
                styles.barFill,
                {
                  width: `${batteryBarWidth}%`,
                  backgroundColor: battery > 20 ? Colors.seafoam : Colors.coral,
                },
              ]}
            />
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Voltage Bus</Text>
              <Text style={styles.statValue}>12.4 V</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Current Draw</Text>
              <Text style={styles.statValue}>420 mA</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Solar Inflow</Text>
              <Text style={styles.statValue}>+1.8 A</Text>
            </View>
          </View>
        </GlassCard>

        {/* ================================================== */}
        {/* 2. SATELLITE & TELEMETRY UPLINK */}
        {/* ================================================== */}
        <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>Satellite Uplink</Text>
              <Text style={styles.cardSubtitle}>Iridium LEO transceiver array</Text>
            </View>
            <View style={styles.moreButton}>
              <Text style={styles.moreDots}>•••</Text>
            </View>
          </View>

          <View style={styles.signalDisplayRow}>
            <View style={styles.circularProgressContainer}>
              <Svg width="72" height="72" viewBox="0 0 72 72">
                <Circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke="rgba(11, 30, 54, 0.08)"
                  strokeWidth="5"
                  fill="none"
                />
                <Circle
                  cx="36"
                  cy="36"
                  r="30"
                  stroke={Colors.oceanBlue}
                  strokeWidth="5"
                  strokeDasharray={`${(signal / 100) * 188.5} 188.5`}
                  strokeLinecap="round"
                  fill="none"
                  transform="rotate(-90 36 36)"
                />
              </Svg>
              <View style={styles.circleInner}>
                <Ionicons name="radio-outline" size={20} color={Colors.oceanBlue} />
              </View>
            </View>

            <View style={styles.signalDetails}>
              <Text style={styles.signalStrengthNumber}>{signal.toFixed(0)}%</Text>
              <Text style={styles.signalLabel}>Link Quality: Excellent</Text>
              <Text style={styles.signalSub}>Burst transmit every 5.0 seconds</Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Constellation</Text>
              <Text style={styles.statValue}>Iridium LEO</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Signal Margin</Text>
              <Text style={styles.statValue}>+24 dBm</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Packet Drops</Text>
              <Text style={styles.statValue}>0.0%</Text>
            </View>
          </View>
        </GlassCard>

        {/* ================================================== */}
        {/* 3. GPS POSITION & GEO-FENCE */}
        {/* ================================================== */}
        <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>GPS Location</Text>
              <Text style={styles.cardSubtitle}>Multi-GNSS mooring coordinates</Text>
            </View>
            <View style={styles.moreButton}>
              <Text style={styles.moreDots}>•••</Text>
            </View>
          </View>

          <View style={styles.coordsBox}>
            <View style={styles.coordRow}>
              <Text style={styles.coordLabel}>Latitude</Text>
              <Text style={styles.coordValue}>{latitude}° N</Text>
            </View>
            <View style={styles.coordDivider} />
            <View style={styles.coordRow}>
              <Text style={styles.coordLabel}>Longitude</Text>
              <Text style={styles.coordValue}>{longitude}° E</Text>
            </View>
          </View>

          <View style={styles.statGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Accuracy</Text>
              <Text style={styles.statValue}>±{accuracy.toFixed(1)} m</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Geo-Fence</Text>
              <Text style={[styles.statValue, { color: Colors.seafoam }]}>Locked</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statLabel}>Fix Type</Text>
              <Text style={styles.statValue}>3D DGPS</Text>
            </View>
          </View>
        </GlassCard>

        {/* ================================================== */}
        {/* 4. HARDWARE SPECIFICATIONS */}
        {/* ================================================== */}
        <GlassCard style={styles.cardContainer} contentStyle={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>System Diagnostics</Text>
              <Text style={styles.cardSubtitle}>Station hardware identifiers</Text>
            </View>
            <View style={styles.moreButton}>
              <Text style={styles.moreDots}>•••</Text>
            </View>
          </View>

          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Station ID</Text>
            <Text style={styles.specValue}>{deviceId}</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Firmware Version</Text>
            <Text style={styles.specValue}>v3.4.1-rc2</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Operating Mode</Text>
            <Text style={styles.specValue}>Autonomous Hydrological</Text>
          </View>
          <View style={styles.specDivider} />
          <View style={styles.specRow}>
            <Text style={styles.specLabel}>Last Telemetry Ping</Text>
            <Text style={styles.specValue}>
              {timestamp ? formatFriendlyDateTime(timestamp) : "Synchronizing..."}
            </Text>
          </View>
        </GlassCard>

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
  headerTitleCenter: {
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
  heroMetricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  heroValue: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0B1E36",
  },
  statusPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "rgba(16, 185, 129, 0.12)",
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.22)",
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: Radii.pill,
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.seafoam,
  },
  statusPillText: {
    fontSize: 11.5,
    fontWeight: "600",
    color: "#065F46",
  },
  barTrack: {
    height: 7,
    backgroundColor: "rgba(11, 30, 54, 0.06)",
    borderRadius: 3.5,
    overflow: "hidden",
    marginBottom: 16,
  },
  barFill: {
    height: "100%",
    borderRadius: 3.5,
  },
  statGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 255, 255, 0.15)",
    paddingTop: 12,
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statLabel: {
    fontSize: 11,
    color: "rgba(11, 30, 54, 0.45)",
    marginBottom: 3,
  },
  statValue: {
    fontSize: 13.5,
    fontWeight: "700",
    color: "#0B1E36",
  },
  signalDisplayRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    marginBottom: 16,
  },
  circularProgressContainer: {
    position: "relative",
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  circleInner: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  signalDetails: {
    flex: 1,
  },
  signalStrengthNumber: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0B1E36",
  },
  signalLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.oceanBlue,
    marginTop: 1,
  },
  signalSub: {
    fontSize: 11,
    color: "rgba(11, 30, 54, 0.45)",
    marginTop: 2,
  },
  coordsBox: {
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.22)",
    padding: 12,
    marginBottom: 16,
  },
  coordRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
  },
  coordDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    marginVertical: 4,
  },
  coordLabel: {
    fontSize: 12,
    color: "rgba(11, 30, 54, 0.55)",
  },
  coordValue: {
    fontSize: 13,
    fontWeight: "700",
    color: "#0B1E36",
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 7,
  },
  specDivider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.12)",
  },
  specLabel: {
    fontSize: 12,
    color: "rgba(11, 30, 54, 0.55)",
  },
  specValue: {
    fontSize: 12.5,
    fontWeight: "600",
    color: "#0B1E36",
  },
  bottomDockSpacer: {
    height: 96,
  },
});
