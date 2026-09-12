// ==================================================
// OCEAN INSIGHT • CENTRALIZED API SERVICE
// Production Deployed Backend on Render
// ==================================================

export const API_BASE_URL = "https://ocean-insight.onrender.com";

const DEFAULT_TIMEOUT_MS = 12000; // Buffer for Render free-tier latency

/**
 * Checks whether an error represents an intentional request cancellation/abort.
 * Handles AbortError, FetchRequestCanceledException, and React Native fetch polyfill cancellations.
 */
export function isAbortError(err) {
  if (!err) return false;
  if (err.isCanceled || err.name === "AbortError" || err.name === "CanceledError") {
    return true;
  }
  const name = String(err.name || "").toLowerCase();
  const message = String(err.message || "").toLowerCase();

  return (
    name.includes("cancel") ||
    name.includes("abort") ||
    message.includes("canceled") ||
    message.includes("cancelled") ||
    message.includes("aborted") ||
    message.includes("request has been canceled")
  );
}

/**
 * Robust fetch wrapper with timeout, external signal integration,
 * and safe request cancellation handling.
 */
async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController();
  let timedOut = false;

  const timeoutMs = options.timeout || DEFAULT_TIMEOUT_MS;
  const timeoutId = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  // Link external signal if supplied
  if (options.signal) {
    if (options.signal.aborted) {
      clearTimeout(timeoutId);
      controller.abort();
    } else {
      options.signal.addEventListener("abort", () => {
        clearTimeout(timeoutId);
        controller.abort();
      });
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (err) {
    clearTimeout(timeoutId);

    if (isAbortError(err)) {
      if (timedOut) {
        throw new Error("Request timed out. The satellite observation server may be waking up.");
      }
      const cancelErr = new Error("Fetch request has been canceled");
      cancelErr.name = "AbortError";
      cancelErr.isCanceled = true;
      throw cancelErr;
    }

    throw err;
  }
}

// In-flight request deduplication guard for /latest
let inFlightLatestPromise = null;

/**
 * Fetch the latest real-time telemetry packet
 * Endpoint: GET /latest
 * Deduplicates overlapping requests automatically
 */
export async function getLatestTelemetry(options = {}) {
  if (inFlightLatestPromise && !options.signal) {
    return inFlightLatestPromise;
  }

  const req = fetchWithTimeout(`${API_BASE_URL}/latest`, options).finally(() => {
    if (inFlightLatestPromise === req) {
      inFlightLatestPromise = null;
    }
  });

  if (!options.signal) {
    inFlightLatestPromise = req;
  }

  return req;
}

// In-flight request deduplication guard for /history
let inFlightHistoryPromise = null;

/**
 * Fetch historical telemetry records for trends & charts
 * Endpoint: GET /history
 */
export async function getTelemetryHistory(options = {}) {
  if (inFlightHistoryPromise && !options.signal) {
    return inFlightHistoryPromise;
  }

  const req = fetchWithTimeout(`${API_BASE_URL}/history`, options)
    .then((data) => (Array.isArray(data) ? data : []))
    .finally(() => {
      if (inFlightHistoryPromise === req) {
        inFlightHistoryPromise = null;
      }
    });

  if (!options.signal) {
    inFlightHistoryPromise = req;
  }

  return req;
}

/**
 * Fetch all telemetry records
 * Endpoint: GET /telemetry
 */
export async function getAllTelemetry(options = {}) {
  const data = await fetchWithTimeout(`${API_BASE_URL}/telemetry`, options);
  return Array.isArray(data) ? data : [];
}

/**
 * Check backend service health
 * Endpoint: GET /
 */
export async function checkBackendHealth(options = {}) {
  try {
    const res = await fetchWithTimeout(`${API_BASE_URL}/`, options);
    return res && res.status === "online";
  } catch {
    return false;
  }
}

/**
 * Robust UTC-to-Local timestamp parser and formatter
 * Handles timestamps with or without explicit 'Z' or offset
 * Output format: Sep 12, 2026 • 1:47 PM
 */
export function parseTelemetryDate(timestamp) {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;

  let str = String(timestamp).trim().replace(" ", "T");

  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(str)) {
    str = `${str}Z`;
  }

  const date = new Date(str);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

export function formatFriendlyDateTime(timestamp) {
  const date = parseTelemetryDate(timestamp);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  return `${datePart} • ${timePart}`;
}

export function formatShortTime(timestamp) {
  const date = parseTelemetryDate(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}
