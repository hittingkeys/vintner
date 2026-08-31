/**
 * Sourced constants for the same-hill schematic.
 * Solar classes are ordinal (Jones GIS ranking), not W/m² or Willamette GDD.
 * Frost class is relative lowness / concavity, not aspect.
 */

/** Compass: 0 = north, 90 = east, clockwise. */
export const BEARING_NORTH_DEG = 0;
export const BEARING_NE_DEG = 45;
export const BEARING_EAST_DEG = 90;
export const BEARING_SE_DEG = 135;
export const BEARING_SSE_DEG = 157.5;
export const BEARING_SOUTH_DEG = 180;
export const BEARING_SSW_DEG = 202.5;
export const BEARING_SW_DEG = 225;
export const BEARING_WEST_DEG = 270;
export const BEARING_NW_DEG = 315;

/**
 * Jones et al. 2004: aspect categorized into five classes; SSE–SSW
 * given the highest ranking (Umpqua GIS; methodology reused in the Rogue).
 * Implemented as the 45° south sector (SSE through SSW).
 */
export const SOLAR_HIGHEST_BEARING = {
  fromDeg: BEARING_SSE_DEG,
  toDeg: BEARING_SSW_DEG,
} as const;

/** Jones 2004: <1% slope is basically flat with poor cold-air drainage. */
export const SLOPE_FLAT_MAX_PCT = 1;

/** Jones 2004: 5–15% preferred for vineyard slopes. */
export const SLOPE_PREFERRED_MIN_PCT = 5;
export const SLOPE_PREFERRED_MAX_PCT = 15;

/**
 * Jones & Duff, Olympic Peninsula report: a 10° south-facing slope can
 * receive as much as 25% more insolation than a FLAT site — not south vs north.
 * 10° = arctan(0.1763) ≈ 17.6% grade.
 */
export const JONES_DUFF_SOUTH_VS_FLAT_DEGREES = 10;
export const JONES_DUFF_SOUTH_VS_FLAT_SLOPE_PCT = 100 * Math.tan(
  (JONES_DUFF_SOUTH_VS_FLAT_DEGREES * Math.PI) / 180,
);
export const JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT = 25;

/**
 * Penner-Ash & Pogue 2014 GSA Abstr. 46(6):464.
 * RLC < 0.4 accounted for 81% of frost hours (24 loggers / 12 northern WV vineyards).
 * Display 81 as a sourced caption, not a modeled 81.00.
 */
export const RLC_POCKET_THRESHOLD = 0.4;
export const PENNER_ASH_FROST_HOURS_PCT = 81;
export const PENNER_ASH_LOGGER_COUNT = 24;
export const PENNER_ASH_VINEYARD_COUNT = 12;

/** Ordinal solar class codes for known-answer cases (not energy units). */
export const SOLAR_CLASS = {
  less: 0,
  more: 1,
  highest: 2,
} as const;

export type SolarClassCode = (typeof SOLAR_CLASS)[keyof typeof SOLAR_CLASS];

/** Frost class codes. Pocket vs drained — not a temperature. */
export const FROST_CLASS = {
  drained: 0,
  pocket: 1,
} as const;

export type FrostClassCode = (typeof FROST_CLASS)[keyof typeof FROST_CLASS];

/**
 * Slope bands shown on the canvas.
 * 1–5% is a Jones-table gap between <1% and the 5–15% preferred band —
 * displayed honestly, not collapsed into 5–15%.
 */
export const SLOPE_BAND = {
  flat: 0,
  between: 1,
  preferred: 2,
  steep: 3,
} as const;

export type SlopeBandCode = (typeof SLOPE_BAND)[keyof typeof SLOPE_BAND];

/**
 * Schematic radial profile (r, z) in metres. Isolated hill with a concave
 * trough (floor) then a <1% apron. Not a Willamette DEM.
 *
 * Slope % = 100 × |Δz/Δr| on each segment. Tuned so:
 * - mid-slope segments are 5–15%
 * - a south-face segment is ~10° (17.6%) for the Jones & Duff caption
 * - trough z is the profile minimum (RLC = 0)
 * - outer apron is <1%
 */
export const RADIAL_PROFILE = [
  { r: 0, z: 16.0 },
  { r: 8, z: 15.72 },
  { r: 20, z: 14.2 },
  { r: 36, z: 12.2 },
  { r: 48, z: 10.7 },
  { r: 56, z: 9.3 },
  { r: 64, z: 7.8 },
  { r: 74, z: 4.2 },
  { r: 84, z: 3.1 },
  { r: 94, z: 3.2 },
  { r: 110, z: 3.28 },
  { r: 130, z: 3.35 },
] as const;

export const HILL_R_MAX_M = RADIAL_PROFILE[RADIAL_PROFILE.length - 1].r;

/** Default pin: south mid-slope (5–15%), highest solar, drained. */
export const DEFAULT_PIN_R_M = 36;
export const DEFAULT_PIN_BEARING_DEG = BEARING_SOUTH_DEG;

/** Known-answer fixture radii (metres on the schematic). */
export const FIXTURE_R = {
  ridge: 2,
  midSlope: 36,
  tenDegreeSouth: 56,
  trough: 84,
  flatApron: 110,
} as const;

export const COMPASS_16 = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW",
] as const;

export type Compass16 = (typeof COMPASS_16)[number];
