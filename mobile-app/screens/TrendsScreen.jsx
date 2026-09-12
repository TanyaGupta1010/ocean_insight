import React, { useState, useEffect, useCallback, useRef } from "react";
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
import ChartCard from "../components/ChartCard";
import OceanInsightCard from "../components/OceanInsightCard";
import LoadingState from "../components/LoadingState";
import Colors from "../constants/theme";
import { getTelemetryHistory, isAbortError } from "../services/api";

export default function TrendsScreen({ noBackground = false }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const abortControllerRef = useRef(null);

  const fetchHistory = useCallback(async (isUserRefresh = false) => {
    if (isUserRefresh) {
      setRefreshing(true);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const data = await getTelemetryHistory({ signal: controller.signal });
      if (!isMountedRef.current) return;

      if (Array.isArray(data) && data.length > 0) {
        const sliceData = data.slice(-30);
        setHistory(sliceData);
        setError(null);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      if (isAbortError(err)) {
        return;
      }

      console.error("Trends fetch error:", err.message);
      if (history.length === 0) {
        setError("Unable to retrieve sensor archives. Connecting to stream...");
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [history.length]);

  useEffect(() => {
    isMountedRef.current = true;
    fetchHistory();

    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchHistory]);

  if (loading && history.length === 0) {
    return (
      <LoadingState
        title="OCEAN INSIGHT"
        subtitle="Retrieving time-series telemetry archives..."
      />
    );
  }

  if (error && history.length === 0) {
    return (
      <LoadingState
        error={error}
        onRetry={() => {
          setLoading(true);
          setError(null);
          fetchHistory(true);
        }}
      />
    );
  }

  const tempSeries = history.map((item) => ({
    timestamp: item.timestamp,
    value: item.temperature,
  }));

  const salinitySeries = history.map((item) => ({
    timestamp: item.timestamp,
    value: item.salinity,
  }));

  const phSeries = history.map((item) => ({
    timestamp: item.timestamp,
    value: item.ph,
  }));

  const doSeries = history.map((item) => ({
    timestamp: item.timestamp,
    value: item.dissolved_oxygen,
  }));

  const latestData = history.length > 0 ? history[history.length - 1] : null;

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
            onRefresh={() => fetchHistory(true)}
            tintColor={Colors.oceanBlue}
            colors={[Colors.oceanBlue]}
          />
        }
      >
        {/* Top Header */}
        <View style={styles.topBar}>
          <View style={styles.headerButton}>
            <Ionicons name="analytics-outline" size={20} color={Colors.oceanBlue} />
          </View>
          <View style={styles.headerTitleCenter}>
            <Text style={styles.screenTitle}>Ocean Trends</Text>
            <Text style={styles.screenSub}>Continuous 30-sample observation</Text>
          </View>
          <View style={styles.headerButton}>
            <Ionicons name="time-outline" size={19} color="#0B1E36" />
          </View>
        </View>

        {/* Chart 1: Temperature */}
        <ChartCard
          title="Sea Surface Temperature"
          unit="°C"
          data={tempSeries}
          lineColor={Colors.oceanBlue}
          subtext="In-situ thermal probe trajectory"
        />

        {/* Chart 2: Salinity */}
        <ChartCard
          title="Ocean Salinity"
          unit="PSU"
          data={salinitySeries}
          lineColor={Colors.aqua}
          subtext="Conductive salinity profile"
        />

        {/* Chart 3: pH Level */}
        <ChartCard
          title="pH Ocean Chemistry"
          unit="pH"
          data={phSeries}
          lineColor="#8B5CF6"
          subtext="Hydrogen ion equilibrium"
        />

        {/* Chart 4: Dissolved Oxygen */}
        <ChartCard
          title="Dissolved Oxygen Saturation"
          unit="mg/L"
          data={doSeries}
          lineColor={Colors.seafoam}
          subtext="Photosynthetic and atmospheric diffusion"
        />

        {/* Insight interpretation */}
        {latestData ? <OceanInsightCard telemetry={latestData} /> : null}

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
  bottomDockSpacer: {
    height: 96,
  },
});
