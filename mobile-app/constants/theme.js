// ==================================================
// OCEAN INSIGHT • DESIGN SYSTEM & VISUAL BLUEPRINT
// Inspired by Premium Mobile Health & Wellness Aesthetics
// ==================================================

export const Colors = {
  // Backgrounds & Ambiance
  background: "#F4F8FA",          // Pale icy blue / off-white base
  backgroundTop: "#EEF5F7",       // Soft top ambient tint
  surface: "#FFFFFF",             // Crisp white card surface
  surfaceTranslucent: "rgba(255, 255, 255, 0.94)",
  surfaceElevated: "#FFFFFF",

  // Typography
  textPrimary: "#0B1E36",         // Deep confident navy
  textSecondary: "#64748B",       // Muted slate
  textTertiary: "#94A3B8",        // Faint subtitle & unit text
  textInverse: "#FFFFFF",

  // Brand Highlights & Accents
  oceanBlue: "#0284C7",           // Primary ocean blue
  oceanBlueDark: "#0369A1",
  oceanBlueLight: "#E0F2FE",

  aqua: "#38BDF8",                // Soft vibrant aqua
  aquaLight: "#F0FDF9",

  seafoam: "#10B981",             // Operational / health seafoam
  seafoamDark: "#059669",
  seafoamLight: "#ECFDF5",

  amber: "#F59E0B",
  amberLight: "#FEF3C7",

  coral: "#EF4444",
  coralLight: "#FEE2E2",

  // Pastel Icon Pill Backgrounds (from reference image)
  pillSky: "#EFF6FF",
  pillAqua: "#F0FDF9",
  pillMint: "#ECFDF5",
  pillPurple: "#F5F3FF",
  pillOrange: "#FFF7ED",

  // Borders & Dividers
  border: "#E8F0F5",
  borderLight: "#F1F6FA",

  // Gradients
  insightGradient: ["rgba(14, 165, 233, 0.72)", "rgba(2, 132, 199, 0.82)"],
  ambientGradient: ["#DDECF5", "#EAF3F8"],

  // True Translucent Liquid Glass Tokens (Ultra-Clear Material)
  glassSurface: "rgba(255, 255, 255, 0.06)",
  glassSurfaceElevated: "rgba(255, 255, 255, 0.10)",
  glassSurfaceActive: "rgba(255, 255, 255, 0.14)",
  glassBorder: "rgba(255, 255, 255, 0.22)",
  glassBorderSubtle: "rgba(255, 255, 255, 0.14)",
  glassHighlight: "rgba(255, 255, 255, 0.50)",
  glassGlowBlue: "rgba(2, 132, 199, 0.08)",
  glassGlowAqua: "rgba(56, 189, 248, 0.10)",

  // Floating Tab Bar
  tabDockBg: "rgba(255, 255, 255, 0.12)",
  tabDockBorder: "rgba(255, 255, 255, 0.24)",
  tabActiveCircle: "#0284C7",
  tabActiveGradient: ["rgba(2, 132, 199, 0.88)", "rgba(14, 165, 233, 0.92)"],
  tabActiveIcon: "#FFFFFF",
  tabInactiveIcon: "rgba(11, 30, 54, 0.45)",
};

export const Radii = {
  card: 24,
  pill: 36,
  tile: 24,
  circle: 9999,
};

export const Shadows = {
  card: {
    shadowColor: "#0B2A4A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.05,
    shadowRadius: 16,
    elevation: 3,
  },
  floatingDock: {
    shadowColor: "#071E3D",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 10,
  },
  button: {
    shadowColor: "#0B2A4A",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2,
  },
  glassGlow: {
    shadowColor: "#0284C7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 4,
  },
};

export default Colors;
