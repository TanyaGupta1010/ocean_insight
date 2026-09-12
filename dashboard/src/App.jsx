import { useEffect, useRef, useState } from "react";
import {
  Activity,
  AlertCircle,
  CheckCircle2,
  Compass,
  Cpu,
  Database,
  Droplets,
  MapPin,
  Navigation,
  Radio,
  RefreshCw,
  ShieldCheck,
  Signal,
  Sparkles,
  Thermometer,
  Waves,
} from "lucide-react";
import {
  Area,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import axios from "axios";
import "./App.css";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_URL = `${API_BASE_URL.replace(/\/+$/, "")}/telemetry`;

// Robust UTC-to-Local timestamp parser
const parseTelemetryDate = (timestamp) => {
  if (!timestamp) return new Date();
  if (timestamp instanceof Date) return timestamp;
  let str = String(timestamp).trim();
  str = str.replace(" ", "T");
  // If backend provided ISO without timezone (e.g. 2026-09-12T07:58:09.123456), treat as UTC
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(str)) {
    str = `${str}Z`;
  }
  const d = new Date(str);
  return Number.isNaN(d.getTime()) ? new Date() : d;
};

const formatLocalTime = (timestamp) => {
  const date = parseTelemetryDate(timestamp);
  return date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatLocalDateTime = (timestamp) => {
  const date = parseTelemetryDate(timestamp);
  return date.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

const formatValue = (value, decimals = 2) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toFixed(decimals) : "--";
};

// Battery Health & Power Profile thresholds:
// 90-100% -> Excellent / BATTERY HEALTHY
// 75-89%  -> Optimal / POWER OPTIMAL
// 50-74%  -> Normal / NORMAL POWER MODE
// 25-49%  -> Low / LOW POWER MODE
// <25%    -> Critical / CRITICAL RESERVE
const getBatteryStatus = (pct) => {
  if (pct >= 90) {
    return {
      statusText: "Excellent",
      modeLabel: "BATTERY HEALTHY",
      tone: "optimal",
      detail: "Full operating capacity • Solar trickle balance active",
    };
  }
  if (pct >= 75) {
    return {
      statusText: "Optimal",
      modeLabel: "POWER OPTIMAL",
      tone: "optimal",
      detail: "Healthy operating reserve • Nominal discharge rate",
    };
  }
  if (pct >= 50) {
    return {
      statusText: "Normal",
      modeLabel: "NORMAL POWER MODE",
      tone: "normal",
      detail: "Adequate reserve • Standard telemetry power profile",
    };
  }
  if (pct >= 25) {
    return {
      statusText: "Low",
      modeLabel: "LOW POWER MODE",
      tone: "low",
      detail: "Conserving auxiliary sensors • Recharge recommended",
    };
  }
  return {
    statusText: "Critical",
    modeLabel: "CRITICAL RESERVE",
    tone: "critical",
    detail: "Emergency beacon mode • Critical power threshold",
  };
};

// Custom Frosted Glass Tooltip for Recharts
function OceanChartTooltip({ active, payload, label, unit, title }) {
  if (active && payload && payload.length) {
    return (
      <div className="ocean-custom-tooltip">
        <p className="tooltip-time">{label}</p>
        {payload.map((entry, idx) => (
          <div className="tooltip-row" key={idx}>
            <span
              className="tooltip-label"
              style={{ color: entry.color || "#0284c7" }}
            >
              {entry.name || title}
            </span>
            <span className="tooltip-value">
              {formatValue(entry.value)} {entry.unit || unit}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

// Chart tile component with sleek ocean styling
function OceanChartTile({ chart, data }) {
  const isMultiSeries = Boolean(chart.series);
  const lines = chart.series || [{ key: chart.key, color: chart.color, name: chart.title }];

  return (
    <article className={`ocean-chart-tile ${chart.fullWidth ? "chart-tile--full-width" : ""}`}>
      <div className="chart-tile-header">
        <div className="chart-tile-title-group">
          <span className="chart-tile-kicker">LAST 30 READINGS</span>
          <h3 className="chart-tile-heading">{chart.title}</h3>
        </div>
        <span className="chart-tile-live-badge">
          <Waves size={12} />
          {chart.unit}
        </span>
      </div>

      <div className="chart-canvas-container">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, left: -20, bottom: 4 }}>
            <defs>
              <linearGradient id={`oceanGlow-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chart.color} stopOpacity={0.24} />
                <stop offset="100%" stopColor={chart.color} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(14, 116, 144, 0.12)"
              strokeDasharray="3 6"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              minTickGap={28}
            />

            <YAxis
              tick={{ fill: "#64748b", fontSize: 10, fontFamily: "JetBrains Mono" }}
              tickLine={false}
              axisLine={false}
              width={38}
              domain={["auto", "auto"]}
            />

            <Tooltip
              content={
                <OceanChartTooltip
                  unit={chart.unit}
                  title={chart.title}
                />
              }
            />

            {!isMultiSeries && (
              <Area
                type="monotone"
                dataKey={chart.key}
                stroke="none"
                fill={`url(#oceanGlow-${chart.key})`}
                isAnimationActive={false}
              />
            )}

            {lines.map((line) => (
              <Line
                key={line.key}
                type="monotone"
                dataKey={line.key}
                name={line.name}
                stroke={line.color}
                strokeWidth={2.4}
                dot={false}
                activeDot={{
                  r: 4.5,
                  fill: line.color,
                  stroke: "#ffffff",
                  strokeWidth: 2,
                }}
                isAnimationActive={false}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </article>
  );
}

export default function App() {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastFetched, setLastFetched] = useState(null);
  const [updateTick, setUpdateTick] = useState(0);

  const rippleContainerRef = useRef(null);

  // Setup interactive water cursor effect (trails on move, ripples on click)
  useEffect(() => {
    let animFrameId = 0;
    let lastTrailTime = 0;

    const spawnRipple = (x, y, type = "trail") => {
      const container = rippleContainerRef.current;
      if (!container) return;

      const ripple = document.createElement("span");
      ripple.className = `water-ripple water-ripple--${type}`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      container.appendChild(ripple);
      ripple.addEventListener(
        "animationend",
        () => {
          ripple.remove();
        },
        { once: true }
      );
    };

    const handlePointerMove = (e) => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      animFrameId = requestAnimationFrame(() => {
        if (e.timeStamp - lastTrailTime > 75) {
          spawnRipple(e.clientX, e.clientY, "trail");
          lastTrailTime = e.timeStamp;
        }
      });
    };

    const handleClick = (e) => {
      spawnRipple(e.clientX, e.clientY, "click");
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    window.addEventListener("click", handleClick, { passive: true });

    return () => {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("click", handleClick);
    };
  }, []);

  // Real-time telemetry fetching with 5s auto-refresh
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await axios.get(API_URL, { timeout: 8000 });
        const data = Array.isArray(response.data) ? response.data : [];
        const sorted = [...data].sort(
          (a, b) => parseTelemetryDate(a.timestamp) - parseTelemetryDate(b.timestamp)
        );
        setTelemetry(sorted);
        setError("");
        setLastFetched(new Date());
        setUpdateTick((prev) => prev + 1);
      } catch (err) {
        console.error("Telemetry fetch error:", err);
        setError("Telemetry service unreachable. Please ensure the backend server is running.");
      } finally {
        setLoading(false);
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(interval);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="ocean-platform-shell">
        <div className="ambient-background-layer">
          <div className="ambient-glow ambient-glow--sky" />
          <div className="ambient-glow ambient-glow--aqua" />
        </div>
        <div className="ocean-state-screen">
          <div className="state-glyph-box state-glyph-box--spin">
            <RefreshCw size={28} />
          </div>
          <span className="section-eyebrow">OCEAN INSIGHT • SYSTEM INITIALIZATION</span>
          <h2>Synchronizing Live Telemetry</h2>
          <p>Establishing encrypted satellite link with observation buoy OCEAN_001...</p>
        </div>
      </div>
    );
  }

  // Error state when no previous data exists
  if (error && telemetry.length === 0) {
    return (
      <div className="ocean-platform-shell">
        <div className="ambient-background-layer">
          <div className="ambient-glow ambient-glow--sky" />
        </div>
        <div className="ocean-state-screen">
          <div className="state-glyph-box" style={{ color: "#ef4444" }}>
            <AlertCircle size={28} />
          </div>
          <span className="section-eyebrow">COMMUNICATION INTERRUPTED</span>
          <h2>Telemetry Link Offline</h2>
          <p>{error}</p>
          <button className="ocean-retry-btn" onClick={() => window.location.reload()}>
            Re-establish Satellite Link
          </button>
        </div>
      </div>
    );
  }

  // Waiting for first reading
  if (telemetry.length === 0) {
    return (
      <div className="ocean-platform-shell">
        <div className="ambient-background-layer">
          <div className="ambient-glow ambient-glow--aqua" />
        </div>
        <div className="ocean-state-screen">
          <div className="state-glyph-box">
            <Database size={28} />
          </div>
          <span className="section-eyebrow">STATION READY • AWAITING TRANSMISSION</span>
          <h2>No Telemetry Packets Yet</h2>
          <p>The observation instrument is online and waiting for its first sensor reading.</p>
        </div>
      </div>
    );
  }

  const latest = telemetry[telemetry.length - 1];
  const deviceId = latest.device_id || "OCEAN_001";
  const hasError = Boolean(error);

  // Format 30 latest readings for charts
  const chartData = telemetry.slice(-30).map((item) => ({
    time: formatLocalTime(item.timestamp),
    timestamp: item.timestamp,
    temperature: Number(item.temperature),
    salinity: Number(item.salinity),
    ph: Number(item.ph),
    dissolved_oxygen: Number(item.dissolved_oxygen),
    battery: Number(item.battery),
    signal_strength: Number(item.signal_strength),
  }));

  // Chart definitions with ocean-inspired tones
  const chartDefinitions = [
    {
      key: "temperature",
      title: "Temperature Trend",
      color: "#0284c7",
      unit: "°C",
    },
    {
      key: "salinity",
      title: "Salinity Trend",
      color: "#0ea5e9",
      unit: "PSU",
    },
    {
      key: "ph",
      title: "pH Level Trend",
      color: "#0891b2",
      unit: "pH",
    },
    {
      key: "dissolved_oxygen",
      title: "Dissolved Oxygen Trend",
      color: "#059669",
      unit: "mg/L",
    },
    {
      key: "combined",
      title: "Platform Power & Link Integrity",
      color: "#10b981",
      unit: "%",
      fullWidth: true,
      series: [
        { key: "battery", color: "#10b981", name: "Battery Charge" },
        { key: "signal_strength", color: "#0284c7", name: "Signal Quality" },
      ],
    },
  ];

  // Battery status helper
  const batteryPct = Math.min(100, Math.max(0, Number(latest.battery) || 0));
  const batteryStatus = getBatteryStatus(batteryPct);

  // Signal bars count (1-5)
  const signalPct = Math.min(100, Math.max(0, Number(latest.signal_strength) || 0));
  const activeSignalBars = Math.max(1, Math.min(5, Math.ceil(signalPct / 20)));

  return (
    <div className="ocean-platform-shell">
      {/* Interactive Water Ripple Overlay */}
      <div className="water-ripple-container" ref={rippleContainerRef} />

      {/* Living Atmospheric Animated Background */}
      <div className="ambient-background-layer">
        <div className="ambient-glow ambient-glow--sky" />
        <div className="ambient-glow ambient-glow--aqua" />
        <div className="ambient-glow ambient-glow--seafoam" />
        <div className="ambient-glow ambient-glow--center" />

        {/* Floating Ambient Micro-Bubbles */}
        <div className="ambient-bubbles">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              className="ambient-bubble"
              style={{
                left: `${(i * 7.2) % 96}%`,
                width: `${4 + (i % 5) * 2}px`,
                height: `${4 + (i % 5) * 2}px`,
                animationDelay: `${-(i * 2.3)}s`,
                animationDuration: `${18 + (i % 7) * 3}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Main Centered Container */}
      <div className="ocean-container">
        {/* =================================================================
            1. HERO SECTION (EVERYTHING CENTERED, HUGE BOLD OCEAN INSIGHT)
            ================================================================= */}
        <header className="ocean-hero">
          <div className="hero-emblem-wrapper">
            <div className="hero-emblem">
              <Waves size={26} strokeWidth={2.2} />
              <span className="emblem-pulse-ring" />
            </div>
          </div>

          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" />
            MARINE ENVIRONMENTAL INTELLIGENCE
          </div>

          <h1 className="hero-title">
            <span>OCEAN INSIGHT</span>
          </h1>

          <p className="hero-subtitle">
            Real-Time Ocean Intelligence &amp; Environmental Monitoring
          </p>

          {/* =================================================================
              2. LIVE STATUS (ONE ELEGANT HORIZONTAL INFORMATION STRIP)
              ================================================================= */}
          <div className="live-status-ribbon">
            <div className="live-stream-badge">
              <span className="live-pulse-dot" />
              LIVE DATA STREAM
            </div>

            <span className="status-ribbon-divider" />

            <div className="status-item">
              <span>Device:</span>
              <span className="device-id-code">{deviceId}</span>
            </div>

            <span className="status-ribbon-divider" />

            <div className="status-item system-status-badge">
              <CheckCircle2 size={14} />
              <span>{hasError ? "Link Degraded (Retrying)" : "SYSTEM OPERATIONAL"}</span>
            </div>

            <span className="status-ribbon-divider" />

            <div className="status-item cadence-badge">
              <RefreshCw size={11} className="cadence-icon" />
              <span>5s CADENCE</span>
            </div>
          </div>
        </header>

        {/* Gentle Wave Divider */}
        <div className="ambient-wave-divider">
          <svg viewBox="0 0 1200 120" preserveAspectRatio="none">
            <path
              d="M0,0 C150,90 350,-40 500,45 C650,130 900,10 1200,45 L1200,120 L0,120 Z"
              fill="rgba(56, 189, 248, 0.12)"
            />
            <path
              d="M0,20 C200,110 400,-20 600,60 C800,140 1000,30 1200,60 L1200,120 L0,120 Z"
              fill="rgba(16, 185, 129, 0.08)"
            />
          </svg>
        </div>

        {/* =================================================================
            3. DEPLOYMENT / LOCATION (HORIZONTAL DATA RIBBON - NOT A CARD)
            ================================================================= */}
        <section className="deployment-ribbon-wrapper">
          <div className="deployment-ribbon">
            <div className="deployment-ribbon__section">
              <div className="deployment-badge-icon">
                <Navigation size={18} strokeWidth={2} />
              </div>
              <div className="deployment-meta-block">
                <span className="deployment-kicker">ACTIVE DEPLOYMENT</span>
                <strong>{deviceId}</strong>
              </div>
            </div>

            <div className="deployment-cell">
              <span className="deployment-cell__label">Latitude</span>
              <span className="deployment-cell__value">
                {formatValue(latest.latitude, 6)}° N
              </span>
            </div>

            <div className="deployment-cell">
              <span className="deployment-cell__label">Longitude</span>
              <span className="deployment-cell__value">
                {formatValue(latest.longitude, 6)}° E
              </span>
            </div>

            <div className="deployment-cell">
              <span className="deployment-cell__label">GPS Accuracy</span>
              <span className="deployment-cell__value">
                ± {formatValue(latest.gps_accuracy, 2)} m
              </span>
            </div>

            <div className="deployment-cell">
              <span className="deployment-cell__label">Last Updated (Local)</span>
              <span className="deployment-cell__value deployment-cell__value--time">
                {formatLocalDateTime(latest.timestamp)}
              </span>
            </div>

            <div className="deployment-status-tag">
              <span className="deployment-status-dot" />
              <span>{hasError ? "Link Reconnecting" : "System Operational"}</span>
            </div>
          </div>
        </section>

        {/* =================================================================
            4. METRIC PRESENTATION: SCULPTED INTEGRATED DATA BANDS
            (NO 9 REPETITIVE CARDS!)
            ================================================================= */}
        <div className="data-band-container">
          {/* -------------------------------------------------------------
              SECTION 1: WATER CONDITIONS (Temperature, Salinity, pH)
              ------------------------------------------------------------- */}
          <section className="integrated-data-band" style={{ "--band-accent-1": "#0284c7", "--band-accent-2": "#38bdf8" }}>
            <div className="band-header-strip">
              <div className="band-header-info">
                <div className="band-header-icon">
                  <Thermometer size={18} />
                </div>
                <div className="band-header-titles">
                  <h3>WATER CONDITIONS</h3>
                  <span>Physical thermodynamic readings at the surface layer</span>
                </div>
              </div>
              <span className="band-status-indicator">
                <Sparkles size={12} /> Live Physical Profiling
              </span>
            </div>

            <div className="band-metrics-row">
              {/* Metric 1: Temperature */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">Water Temperature</span>
                  <span className="band-metric-tag">Surface Layer</span>
                </div>
                <div className="band-metric-value-wrapper">
                  <span
                    key={`temp-${updateTick}`}
                    className="band-metric-value value-updating"
                  >
                    {formatValue(latest.temperature, 2)}
                  </span>
                  <span className="band-metric-unit-symbol">°C</span>
                </div>
                <div className="band-metric-footer">
                  <div className="band-visual-spectrum">
                    <div
                      className="band-spectrum-fill"
                      style={{
                        width: `${Math.min(100, Math.max(10, ((Number(latest.temperature) - 15) / 25) * 100))}%`,
                        background: "linear-gradient(90deg, #38bdf8, #0284c7)",
                      }}
                    />
                  </div>
                  <p className="band-metric-description">
                    Normal tropical surface range • Sensor calibrated
                  </p>
                </div>
              </div>

              {/* Metric 2: Salinity */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">Salinity Concentration</span>
                  <span className="band-metric-tag">Practical Scale</span>
                </div>
                <div className="band-metric-value-wrapper">
                  <span
                    key={`sal-${updateTick}`}
                    className="band-metric-value value-updating"
                  >
                    {formatValue(latest.salinity, 2)}
                  </span>
                  <span className="band-metric-unit-symbol">PSU</span>
                </div>
                <div className="band-metric-footer">
                  <div className="band-visual-spectrum">
                    <div
                      className="band-spectrum-fill"
                      style={{
                        width: `${Math.min(100, Math.max(10, (Number(latest.salinity) / 45) * 100))}%`,
                        background: "linear-gradient(90deg, #0ea5e9, #06b6d4)",
                      }}
                    />
                  </div>
                  <p className="band-metric-description">
                    Dissolved oceanic salts equilibrium • Stable density
                  </p>
                </div>
              </div>

              {/* Metric 3: pH Level */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">pH Level</span>
                  <span className="band-metric-tag">Acidity / Alkalinity</span>
                </div>
                <div className="band-metric-value-wrapper">
                  <span
                    key={`ph-${updateTick}`}
                    className="band-metric-value value-updating"
                  >
                    {formatValue(latest.ph, 2)}
                  </span>
                  <span className="band-metric-unit-symbol">pH</span>
                </div>
                <div className="band-metric-footer">
                  <div className="band-visual-spectrum">
                    <div
                      className="band-spectrum-fill"
                      style={{
                        width: `${Math.min(100, Math.max(10, ((Number(latest.ph) - 6) / 4) * 100))}%`,
                        background: "linear-gradient(90deg, #06b6d4, #10b981)",
                      }}
                    />
                  </div>
                  <p className="band-metric-description">
                    Slightly alkaline • Optimum marine biological buffering
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* -------------------------------------------------------------
              SECTION 2: WATER QUALITY (Dissolved Oxygen, Conductivity, Turbidity)
              ------------------------------------------------------------- */}
          <section className="integrated-data-band" style={{ "--band-accent-1": "#10b981", "--band-accent-2": "#06b6d4" }}>
            <div className="band-header-strip">
              <div className="band-header-info">
                <div className="band-header-icon" style={{ background: "rgba(209, 250, 229, 0.75)", color: "#059669" }}>
                  <Droplets size={18} />
                </div>
                <div className="band-header-titles">
                  <h3>WATER QUALITY &amp; CLARITY</h3>
                  <span>Biochemical and optical indicators for aquatic habitat health</span>
                </div>
              </div>
              <span className="band-status-indicator">
                <ShieldCheck size={12} /> Ecological Grade: Optimal
              </span>
            </div>

            <div className="band-metrics-row">
              {/* Metric 4: Dissolved Oxygen */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">Dissolved Oxygen</span>
                  <span className="band-metric-tag">O₂ Saturation</span>
                </div>
                <div className="band-metric-value-wrapper">
                  <span
                    key={`do-${updateTick}`}
                    className="band-metric-value value-updating"
                  >
                    {formatValue(latest.dissolved_oxygen, 2)}
                  </span>
                  <span className="band-metric-unit-symbol">mg/L</span>
                </div>
                <div className="band-metric-footer">
                  <div className="band-visual-spectrum">
                    <div
                      className="band-spectrum-fill"
                      style={{
                        width: `${Math.min(100, Math.max(10, (Number(latest.dissolved_oxygen) / 12) * 100))}%`,
                        background: "linear-gradient(90deg, #34d399, #10b981)",
                      }}
                    />
                  </div>
                  <p className="band-metric-description">
                    Healthy aerobic condition for marine organisms
                  </p>
                </div>
              </div>

              {/* Metric 5: Conductivity */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">Conductivity</span>
                  <span className="band-metric-tag">Ion Mobility</span>
                </div>
                <div className="band-metric-value-wrapper">
                  <span
                    key={`cond-${updateTick}`}
                    className="band-metric-value value-updating"
                  >
                    {formatValue(latest.conductivity, 1)}
                  </span>
                  <span className="band-metric-unit-symbol">µS/cm</span>
                </div>
                <div className="band-metric-footer">
                  <div className="band-visual-spectrum">
                    <div
                      className="band-spectrum-fill"
                      style={{
                        width: `${Math.min(100, Math.max(10, (Number(latest.conductivity) / 60000) * 100))}%`,
                        background: "linear-gradient(90deg, #0284c7, #0ea5e9)",
                      }}
                    />
                  </div>
                  <p className="band-metric-description">
                    Electrical conductance of dissolved mineral ions
                  </p>
                </div>
              </div>

              {/* Metric 6: Turbidity */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">Turbidity</span>
                  <span className="band-metric-tag">Optical Clarity</span>
                </div>
                <div className="band-metric-value-wrapper">
                  <span
                    key={`turb-${updateTick}`}
                    className="band-metric-value value-updating"
                  >
                    {formatValue(latest.turbidity, 2)}
                  </span>
                  <span className="band-metric-unit-symbol">NTU</span>
                </div>
                <div className="band-metric-footer">
                  <div className="band-visual-spectrum">
                    <div
                      className="band-spectrum-fill"
                      style={{
                        width: `${Math.min(100, Math.max(10, (Number(latest.turbidity) / 8) * 100))}%`,
                        background: "linear-gradient(90deg, #10b981, #06b6d4)",
                      }}
                    />
                  </div>
                  <p className="band-metric-description">
                    High clarity index • Low suspended particulate matter
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* -------------------------------------------------------------
              SECTION 3: DEVICE HEALTH & CONNECTIVITY (Interactive Visuals)
              ------------------------------------------------------------- */}
          <section className="integrated-data-band" style={{ "--band-accent-1": "#0ea5e9", "--band-accent-2": "#10b981" }}>
            <div className="band-header-strip">
              <div className="band-header-info">
                <div className="band-header-icon">
                  <Cpu size={18} />
                </div>
                <div className="band-header-titles">
                  <h3>DEVICE HEALTH &amp; TELEMETRY LINK</h3>
                  <span>Hardware integrity, power storage, and positioning lock</span>
                </div>
              </div>
              <span className="band-status-indicator">
                <Radio size={12} /> Autonomous Float System
              </span>
            </div>

            <div className="band-metrics-row">
              {/* Metric 7: Battery with Custom Animated Battery Cell */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">Power Storage</span>
                  <span className={`band-metric-tag band-metric-tag--${batteryStatus.tone}`}>
                    {batteryStatus.modeLabel}
                  </span>
                </div>

                <div className="battery-instrument">
                  <div className="battery-cell-shell">
                    <div
                      className={`battery-cell-fill battery-cell-fill--${batteryStatus.tone}`}
                      style={{ width: `${batteryPct}%` }}
                    />
                  </div>
                  <div className="band-metric-value-wrapper" style={{ margin: 0 }}>
                    <span
                      key={`bat-${updateTick}`}
                      className="band-metric-value value-updating"
                    >
                      {formatValue(latest.battery, 1)}
                    </span>
                    <span className="band-metric-unit-symbol">%</span>
                  </div>
                </div>

                <div className="band-metric-footer">
                  <p className="band-metric-description">
                    {batteryStatus.detail}
                  </p>
                </div>
              </div>

              {/* Metric 8: Signal Strength with 5 Animated Signal Bars */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">Signal Strength</span>
                  <span className="band-metric-tag">Cellular / Sat</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className="signal-instrument">
                    {[1, 2, 3, 4, 5].map((bar) => (
                      <span
                        key={bar}
                        className={`signal-bar ${bar <= activeSignalBars ? "signal-bar--active" : ""}`}
                      />
                    ))}
                  </div>

                  <div className="band-metric-value-wrapper" style={{ margin: 0 }}>
                    <span
                      key={`sig-${updateTick}`}
                      className="band-metric-value value-updating"
                    >
                      {formatValue(latest.signal_strength, 1)}
                    </span>
                    <span className="band-metric-unit-symbol">%</span>
                  </div>
                </div>

                <div className="band-metric-footer">
                  <p className="band-metric-description">
                    Telemetry uplink operational • Low packet jitter
                  </p>
                </div>
              </div>

              {/* Metric 9: GPS Accuracy with Concentric Radar Reticle */}
              <div className="band-metric-unit">
                <div className="band-metric-header">
                  <span className="band-metric-label">GPS Precision</span>
                  <span className="band-metric-tag">GNSS Constellation</span>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                  <div className="radar-instrument">
                    <div className="radar-circle" />
                    <div className="radar-circle radar-circle--inner" />
                    <div className="radar-crosshair-v" />
                    <div className="radar-crosshair-h" />
                    <div className="radar-sweep-blip" />
                    <div className="radar-sweep-ring" />
                  </div>

                  <div className="band-metric-value-wrapper" style={{ margin: 0 }}>
                    <span
                      key={`gps-${updateTick}`}
                      className="band-metric-value value-updating"
                    >
                      ±{formatValue(latest.gps_accuracy, 2)}
                    </span>
                    <span className="band-metric-unit-symbol">m</span>
                  </div>
                </div>

                <div className="band-metric-footer">
                  <p className="band-metric-description">
                    Multi-band satellite fix • High precision drift calculation
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* =================================================================
            5. CHARTS SECTION (CONTINUOUS OBSERVATION)
            ================================================================= */}
        <section className="charts-section-wrapper">
          <div className="ocean-section-header">
            <span className="section-eyebrow">CONTINUOUS OBSERVATION</span>
            <h2 className="section-heading-title">Live Ocean Trends</h2>
            <p className="section-heading-description">
              Real-time sensor readings from the active observation device. Continuous 5-second streaming data buffer.
            </p>
          </div>

          <div className="charts-grid-layout">
            {chartDefinitions.map((chart) => (
              <OceanChartTile key={chart.key} chart={chart} data={chartData} />
            ))}
          </div>
        </section>

        {/* =================================================================
            6. DEPLOYMENT SITE & LIVE DIAGNOSTICS STREAM
            ================================================================= */}
        <section className="scientific-details-grid">
          {/* Bennett University Deployment Station */}
          <article className="scientific-panel">
            <div className="scientific-panel-header">
              <div className="scientific-panel-title">
                <MapPin size={18} color="#0284c7" />
                <h3>Bennett University Deployment Site</h3>
              </div>
              <span className="band-status-indicator">
                <Compass size={12} /> Active Geofence
              </span>
            </div>

            <div className="radar-map-display">
              <div className="radar-grid-bg" />
              <div className="radar-target-node">
                <div className="radar-pin-pulse">
                  <MapPin size={15} />
                  <span className="radar-pin-ring" />
                </div>
                <span className="radar-badge-text">
                  BENNETT UNIVERSITY • {deviceId}
                </span>
              </div>
              <div className="radar-coords-bar">
                <span>LAT: {formatValue(latest.latitude, 6)}° N</span>
                <span>LNG: {formatValue(latest.longitude, 6)}° E</span>
                <span>PRECISION: ±{formatValue(latest.gps_accuracy, 2)}m</span>
              </div>
            </div>
          </article>

          {/* Real-time System Diagnostics Stream */}
          <article className="scientific-panel">
            <div className="scientific-panel-header">
              <div className="scientific-panel-title">
                <Activity size={18} color="#059669" />
                <h3>Live Activity &amp; Diagnostics Feed</h3>
              </div>
              <span className="band-status-indicator">
                <Database size={12} /> {telemetry.length} Packets
              </span>
            </div>

            <div className="diagnostics-feed">
              <div className="diagnostic-item">
                <div className="diagnostic-left">
                  <div className="diagnostic-icon diagnostic-icon--green">
                    <CheckCircle2 size={14} />
                  </div>
                  <div className="diagnostic-text">
                    <span className="diagnostic-title">Sensor Stream Active</span>
                    <span className="diagnostic-desc">
                      Receiving synchronized telemetry packet every 5 seconds
                    </span>
                  </div>
                </div>
                <span className="diagnostic-time">LIVE</span>
              </div>

              <div className="diagnostic-item">
                <div className="diagnostic-left">
                  <div className="diagnostic-icon diagnostic-icon--blue">
                    <Database size={14} />
                  </div>
                  <div className="diagnostic-text">
                    <span className="diagnostic-title">Database Storage Confirmed</span>
                    <span className="diagnostic-desc">
                      SQLite persistence verified for {deviceId}
                    </span>
                  </div>
                </div>
                <span className="diagnostic-time">SYNCED</span>
              </div>

              <div className="diagnostic-item">
                <div className="diagnostic-left">
                  <div className="diagnostic-icon diagnostic-icon--cyan">
                    <Signal size={14} />
                  </div>
                  <div className="diagnostic-text">
                    <span className="diagnostic-title">Network Link Optimal</span>
                    <span className="diagnostic-desc">
                      Uplink signal quality rated at {formatValue(latest.signal_strength, 0)}%
                    </span>
                  </div>
                </div>
                <span className="diagnostic-time">NOMINAL</span>
              </div>
            </div>
          </article>
        </section>
      </div>

      {/* =================================================================
          7. SIGNATURE OCEAN MASCOT ("AeroFloat Alpha")
          ================================================================= */}
      <aside className="ocean-mascot-pod" aria-label="Ocean Insight autonomous observation float">
        <div className="mascot-tooltip">
          <div className="mascot-tooltip-header">
            <span>AEROFLOAT ALPHA</span>
            <span style={{ color: "#10b981", fontSize: "10px" }}>● ONLINE</span>
          </div>
          <p className="mascot-tooltip-body">
            Autonomous buoyancy glider. Tracking surface currents &amp; environmental profiles at Bennett University.
          </p>
        </div>

        <div className="mascot-sensor-drone">
          <Waves size={24} strokeWidth={2} />
          <span className="mascot-sonar-pulse" />
          <span className="mascot-micro-bubble mascot-micro-bubble--1" />
          <span className="mascot-micro-bubble mascot-micro-bubble--2" />
        </div>
      </aside>

      {/* =================================================================
          8. PLATFORM FOOTER
          ================================================================= */}
      <footer className="ocean-platform-footer">
        <div className="ocean-container">
          <div className="footer-content-wrap">
            <span className="footer-title">OCEAN INSIGHT</span>
            <p className="footer-credits">
              Real-Time Ocean Intelligence &amp; Environmental Monitoring Platform • Bennett University
            </p>
            <span className="footer-meta">
              Autonomous Station {deviceId} • Telemetry Pipeline Active • Last Polled:{" "}
              {lastFetched ? formatLocalTime(lastFetched) : formatLocalTime(new Date())}
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
