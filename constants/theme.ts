// ─── Design tokens ──────────────────────────────────────────────────────────
//  Light, editorial, warm-cream palette.
//  All components import Colors / Typography / Spacing / Radii / Shadows.
// ────────────────────────────────────────────────────────────────────────────

export const Colors = {
  // Backgrounds
  bg: "#F7F3EC",                         // cream background
  bgSurface: "#FFFFFF",                  // white surface (cards, sheets)
  bgElevated: "#F0EBE1",                 // raised containers, thumbnails
  bgOverlay: "rgba(0,0,0,0.5)",          // modal/drawer backdrop

  // Text
  textPrimary: "#1A2010",                // heading (dark olive-green)
  textSecondary: "#4A5538",              // body
  textMuted: "#8A9478",                  // muted / inactive
  textInverse: "#F7F3EC",               // cream — text on dark (olive) backgrounds

  // Primary action colour — olive
  accent: "#3B4A28",                     // olive: buttons, FAB, CTAs
  accentDim: "rgba(166,124,0,0.08)",     // gold-tinted dim (selected-state bg)

  // Decorative gold — tabs, stars, founding badge, stamp pips
  accentGold: "#A67C00",
  accentGoldBg: "rgba(166,124,0,0.08)",
  accentGoldBorder: "rgba(166,124,0,0.2)",

  // Olive family
  olive: "#3B4A28",
  oliveMid: "#6B7A50",
  oliveLight: "#A8B490",

  // Cream family
  creamDeep: "#E8E0D0",                  // empty star / muted fills

  // Semantic
  success: "#4ADE80",
  warning: "#FB923C",
  error: "#F87171",

  // Borders
  border: "rgba(60,45,20,0.14)",         // borderStrong — used on cards, inputs
  borderSubtle: "rgba(60,45,20,0.08)",   // very subtle border
  borderFocus: "#A67C00",               // focus ring

  // Map
  mapMarker: "#A67C00",
  mapMarkerBorder: "#F7F3EC",
  mapCluster: "#A67C00",
} as const;

export const Typography = {
  fontSans: "DMSans_400Regular",
  fontSansMedium: "DMSans_500Medium",
  fontDisplay: "PlayfairDisplay_400Regular",
  fontDisplayItalic: "PlayfairDisplay_400Regular_Italic",
  fontDisplayMedium: "PlayfairDisplay_500Medium",
  sizes: {
    xs: 11,
    sm: 13,
    base: 15,
    md: 17,
    lg: 20,
    xl: 24,
    "2xl": 30,
    "3xl": 38,
  },
  weights: {
    regular: "400" as const,
    medium: "500" as const,
    semibold: "600" as const,
    bold: "700" as const,
  },
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 18,    // screen edge padding (rule 21)
  lg: 20,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
} as const;

export const Radii = {
  sm: 8,      // back button
  md: 12,     // buttons, inputs, chips
  lg: 16,     // cards, sheets
  pill: 100,
} as const;

export const Shadows = {
  card: {
    shadowColor: "rgba(60,45,20,0.12)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
} as const;

// City default map centres
export const MapDefaults = {
  dubai: {
    latitude: 25.1972,
    longitude: 55.2744,
    latitudeDelta: 0.18,
    longitudeDelta: 0.18,
  },
  abu_dhabi: {
    latitude: 24.4539,
    longitude: 54.3773,
    latitudeDelta: 0.14,
    longitudeDelta: 0.14,
  },
} as const;

// ─── Canonical theme object (rules spec) ────────────────────────────────────
export const theme = {
  colors: {
    background: "#F7F3EC",
    surface: "#FFFFFF",
    raised: "#F0EBE1",
    creamDeep: "#E8E0D0",
    border: "rgba(60,45,20,0.08)",
    borderStrong: "rgba(60,45,20,0.14)",
    accentGold: "#A67C00",
    accentGoldBg: "rgba(166,124,0,0.08)",
    accentGoldBorder: "rgba(166,124,0,0.2)",
    olive: "#3B4A28",
    oliveMid: "#6B7A50",
    oliveLight: "#A8B490",
    heading: "#1A2010",
    body: "#4A5538",
    muted: "#8A9478",
  },
  typography: {
    displayFont: "Georgia",
    uiFont: "System",
    sizeDisplay: 22,
    sizeLarge: 17,
    sizeMedium: 14,
    sizeSmall: 11,
    sizeMicro: 9,
    weightRegular: "400",
    weightMedium: "500",
    trackingWide: 0.12,
    trackingNormal: 0.02,
    trackingTight: -0.02,
  },
  spacing: {
    screenPadding: 18,
    cardPadding: 14,
    cardRadius: 16,
    pillRadius: 100,
    sectionGap: 20,
    elementGap: 8,
  },
  borderRadius: {
    card: 16,
    pill: 100,
    button: 12,
    badge: 100,
    stamp: 13,
    avatar: 999,
  },
} as const;
