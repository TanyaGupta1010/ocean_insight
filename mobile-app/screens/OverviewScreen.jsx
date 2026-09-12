import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../components/ScreenContainer";
import MetricTile from "../components/MetricTile";
import LiveStatusCard from "../components/LiveStatusCard";
import OceanInsightCard from "../components/OceanInsightCard";
import FloatingActionButton from "../components/FloatingActionButton";
import LoadingState from "../components/LoadingState";
import Colors from "../constants/theme";
import { useTelemetry } from "../services/TelemetryContext";

export default function OverviewScreen({ noBackground = false, onNavigateToDevice }) {
  const { telemetry, loading, refreshing, error, refreshTelemetry } = useTelemetry();

  // Staggered iOS entry animation values
  const heroAnim = useRef(new Animated.Value(0)).current;
  const gridAnim = useRef(new Animated.Value(0)).current;
  const statusAnim = useRef(new Animated.Value(0)).current;
  const insightAnim = useRef(new Animated.Value(0)).current;
  const animatedOnceRef = useRef(false);

  // Staggered sequence when telemetry arrives
  useEffect(() => {
    if (telemetry && !animatedOnceRef.current) {
      animatedOnceRef.current = true;
      Animated.stagger(90, [
        Animated.timing(heroAnim, {
          toValue: 1,
          duration: 340,
          useNativeDriver: true,
        }),
        Animated.timing(gridAnim, {
          toValue: 1,
          duration: 360,
          useNativeDriver: true,
        }),
        Animated.timing(statusAnim, {
          toValue: 1,
          duration: 380,
          useNativeDriver: true,
        }),
        Animated.timing(insightAnim, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (telemetry && animatedOnceRef.current) {
      heroAnim.setValue(1);
      gridAnim.setValue(1);
      statusAnim.setValue(1);
      insightAnim.setValue(1);
    }
  }, [telemetry, heroAnim, gridAnim, statusAnim, insightAnim]);

  if (loading && !telemetry) {
    return (
      <LoadingState
        title="OCEAN INSIGHT"
        subtitle="Connecting to live observation stream..."
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

  const timestamp = telemetry?.timestamp;
  const deviceId = telemetry?.device_id || "OCEAN_001";

  // Stagger interpolations
  const heroTranslate = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [12, 0],
  });
  const gridTranslate = gridAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [16, 0],
  });
  const statusTranslate = statusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });
  const insightScale = insightAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.98, 1],
  });

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
        {/* ================================================== */}
        {/* 1. TOP HEADER (Refined Minimalist Glass Controls) */}
        {/* ================================================== */}
        <View style={styles.topHeader}>
          <View style={styles.profileRow}>
            <View style={styles.avatarGlass}>
              <Ionicons name="compass-outline" size={18} color={Colors.oceanBlue} />
            </View>
            <View>
              <Text style={styles.greetingSub}>OCEAN INSIGHT</Text>
              <Text style={styles.greetingTitle}>Ocean Monitoring</Text>
            </View>
          </View>

          {/* Refined Glass Action Button */}
          <TouchableOpacity style={styles.settingsGlass} activeOpacity={0.75}>
            <Ionicons name="notifications-outline" size={17} color="#0B1E36" />
            <View style={styles.settingsBadge} />
          </TouchableOpacity>
        </View>

        {/* ================================================== */}
        {/* 2. HERO TITLE (Refined Typography Hierarchy) */}
        {/* ================================================== */}
        <Animated.View
          style={[
            styles.heroTitleContainer,
            {
              opacity: heroAnim,
              transform: [{ translateY: heroTranslate }],
            },
          ]}
        >
          <Text style={styles.heroMainTitle}>Observation Deck</Text>
          <Text style={styles.heroSubtitle}>
            Autonomous Marine Buoy • {deviceId}
          </Text>
        </Animated.View>

        {/* ================================================== */}
        {/* 3. FOUR CORE METRIC TILES (2x2 Grid) */}
        {/* ================================================== */}
        <Animated.View
          style={[
            styles.gridContainer,
            {
              opacity: gridAnim,
              transform: [{ translateY: gridTranslate }],
            },
          ]}
        >
          {/* Row 1: Sea Temperature & Ocean Salinity */}
          <View style={styles.gridRow}>
            <MetricTile
              labelLine1="Sea"
              labelLine2="Temperature"
              value={telemetry?.temperature}
              unit="°C"
              icon="thermometer-outline"
              iconColor="#0284C7"
            />
            <View style={styles.columnSpacer} />
            <MetricTile
              labelLine1="Ocean"
              labelLine2="Salinity"
              value={telemetry?.salinity}
              unit="PSU"
              icon="water-outline"
              iconColor="#0EA5E9"
            />
          </View>

          {/* Row 2: pH Level & Dissolved Oxygen */}
          <View style={[styles.gridRow, styles.rowSpacer]}>
            <MetricTile
              labelLine1="pH"
              labelLine2="Level"
              value={telemetry?.ph}
              unit="pH"
              icon="flask-outline"
              iconColor="#10B981"
            />
            <View style={styles.columnSpacer} />
            <MetricTile
              labelLine1="Dissolved"
              labelLine2="Oxygen"
              value={telemetry?.dissolved_oxygen}
              unit="mg/L"
              icon="pulse-outline"
              iconColor="#06B6D4"
            />
          </View>
        </Animated.View>

        {/* ================================================== */}
        {/* 4. LIVE OCEAN STATUS CARD */}
        {/* ================================================== */}
        <Animated.View
          style={{
            opacity: statusAnim,
            transform: [{ translateY: statusTranslate }],
          }}
        >
          <LiveStatusCard
            deviceId={deviceId}
            isOperational={true}
            timestamp={timestamp}
            isRefreshing={refreshing}
          />
        </Animated.View>

        {/* ================================================== */}
        {/* 5. OCEAN INSIGHT CARD */}
        {/* ================================================== */}
        <Animated.View
          style={{
            opacity: insightAnim,
            transform: [{ scale: insightScale }],
          }}
        >
          <OceanInsightCard telemetry={telemetry} />
        </Animated.View>

        {/* Generous bottom dock spacer */}
        <View style={styles.bottomDockSpacer} />
      </ScrollView>

      {/* Floating Action Button & Contextual Glass Menu */}
      <FloatingActionButton
        onRefresh={refreshTelemetry}
        onNavigateToDevice={onNavigateToDevice}
      />
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
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarGlass: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
  },
  greetingSub: {
    fontSize: 9.5,
    fontWeight: "700",
    letterSpacing: 1,
    color: Colors.oceanBlueDark,
  },
  greetingTitle: {
    fontSize: 15.5,
    fontWeight: "600",
    color: "#0B1E36",
  },
  settingsGlass: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255, 255, 255, 0.16)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.25)",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  settingsBadge: {
    position: "absolute",
    top: 9,
    right: 10,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10B981",
  },
  heroTitleContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  heroMainTitle: {
    fontSize: 27,
    fontWeight: "800",
    color: "#0B1E36",
    letterSpacing: -0.6,
  },
  heroSubtitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "rgba(11, 30, 54, 0.55)",
    marginTop: 3,
  },
  gridContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  gridRow: {
    flexDirection: "row",
  },
  columnSpacer: {
    width: 14,
  },
  rowSpacer: {
    marginTop: 14,
  },
  bottomDockSpacer: {
    height: 96,
  },
});
