import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import { getLatestTelemetry, isAbortError } from "./api";

const TelemetryContext = createContext({
  telemetry: null,
  loading: true,
  refreshing: false,
  error: null,
  refreshTelemetry: () => {},
});

/**
 * Single Centralized Telemetry Provider
 * - Controls the sole 5-second polling loop for GET /latest
 * - Prevents overlapping/stacked requests with an in-flight guard
 * - Safely handles request cancellations without setting error state
 * - Provides consistent telemetry to Overview, Water Quality, and Device tabs
 */
export function TelemetryProvider({ children }) {
  const [telemetry, setTelemetry] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const isMountedRef = useRef(true);
  const isFetchingRef = useRef(false);
  const abortControllerRef = useRef(null);

  const fetchTelemetry = useCallback(async (isUserRefresh = false) => {
    // Prevent overlapping requests if a fetch is already in flight (unless explicitly triggered by user)
    if (isFetchingRef.current && !isUserRefresh) {
      return;
    }

    if (isUserRefresh) {
      setRefreshing(true);
      // Cancel previous pending request if user explicitly requested a refresh
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;
    isFetchingRef.current = true;

    try {
      const data = await getLatestTelemetry({ signal: controller.signal });
      if (!isMountedRef.current) return;

      if (data && data.device_id) {
        setTelemetry(data);
        setError(null);
      } else if (data && data.message) {
        setError(data.message);
      }
    } catch (err) {
      if (!isMountedRef.current) return;

      // Cleanly ignore intentional fetch cancellations
      if (isAbortError(err)) {
        return;
      }

      console.error("Telemetry fetch error:", err.message);

      // Only show error screen if we have zero data in memory
      setTelemetry((prev) => {
        if (!prev) {
          setError("Connecting to Ocean Insight observation stream...");
        }
        return prev;
      });
    } finally {
      if (isMountedRef.current) {
        isFetchingRef.current = false;
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  // Single centralized 5-second polling loop
  useEffect(() => {
    isMountedRef.current = true;
    fetchTelemetry();

    const interval = setInterval(() => {
      fetchTelemetry();
    }, 5000);

    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTelemetry]);

  const value = {
    telemetry,
    loading: loading && !telemetry,
    refreshing,
    error: error && !telemetry ? error : null,
    refreshTelemetry: () => fetchTelemetry(true),
  };

  return (
    <TelemetryContext.Provider value={value}>
      {children}
    </TelemetryContext.Provider>
  );
}

export function useTelemetry() {
  const context = useContext(TelemetryContext);
  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }
  return context;
}
