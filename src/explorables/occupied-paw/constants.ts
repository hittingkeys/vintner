/**
 * Sourced constants only. Horizon AWC in/in and NVW Pinot ETc are not here.
 * Year-1 extractable depth is an unverified UI preset, captioned in the
 * explorable — not a published Zr.
 */

/** Exact SI definition. */
export const IN_TO_CM = 2.54;

export function inToCm(inches: number): number {
  return inches * IN_TO_CM;
}

export function cmToIn(cm: number): number {
  return cm / IN_TO_CM;
}

/** SoilWeb SSURGO PAWS, mukeys 2711396, 85310, 62429. */
export const WILLAKENZIE_PROFILE_PAWS_CM = 15;

/**
 * SoilWeb SSURGO PAWS, or637 mukeys 62713–15 (silty clay loam 2–12%).
 * Other map units 27, 31, 41 cm — do not average into a fake typical.
 */
export const JORY_DEFAULT_PAWS_CM = 25;
export const JORY_PAWS_RANGE_CM = { min: 25, max: 41 } as const;
export const JORY_OTHER_MU_PAWS_CM = [27, 31, 41] as const;

/**
 * NRCS OSD WILLAKENZIE (08/2006): Cr 20–40 in, typical pedon 32 in.
 * Caps extractable depth. Not a drainage-class difference.
 */
export const WILLAKENZIE_CR_IN = 32;
export const WILLAKENZIE_CR_RANGE_IN = { min: 20, max: 40 } as const;
export const WILLAKENZIE_CR_CM = inToCm(WILLAKENZIE_CR_IN);
export const WILLAKENZIE_CR_RANGE_CM = {
  min: inToCm(WILLAKENZIE_CR_RANGE_IN.min),
  max: inToCm(WILLAKENZIE_CR_RANGE_IN.max),
} as const;

/**
 * OSD JORY (06/2011) / SoilWeb: unrestricted >60 in.
 * PAWS column is 0–60 in. No sourced storage below 60 in.
 */
export const JORY_PAWS_REFERENCE_IN = 60;
export const JORY_PAWS_REFERENCE_CM = inToCm(JORY_PAWS_REFERENCE_IN);

/** Allen et al. 1998 FAO-56 Table 22, wine grapes. */
export const FAO56_RAW_FRACTION_P = 0.45;
export const FAO56_WINE_GRAPE_ZR_M = { min: 1.0, max: 2.0 } as const;
export const FAO56_WINE_GRAPE_ZR_CM = {
  min: FAO56_WINE_GRAPE_ZR_M.min * 100,
  max: FAO56_WINE_GRAPE_ZR_M.max * 100,
} as const;

/** Smart et al. 2006 AJEV 57:89 — established root-depth fractions, not year-1. */
export const SMART_ROOT_FRACTION_0_TO_60_CM = 0.63;
export const SMART_ROOT_FRACTION_0_TO_100_CM = 0.8;

/**
 * NOAA NCEI 1991–2020 normals, USW00094273 McMinnville, Jun–Sep.
 * 1.32 + 0.25 + 0.36 + 1.30 = 3.23 in. Typical year, not 2026.
 */
export const MCMINNVILLE_JUN_SEP_P_IN = 1.32 + 0.25 + 0.36 + 1.3;
export const MCMINNVILLE_JUN_SEP_P_CM = inToCm(MCMINNVILLE_JUN_SEP_P_IN);

/**
 * AgriMet alfalfa ETr Jun–Sep — upper envelope, not crop ET.
 * ARAO 24.02 in / FOGO 25.61 in.
 */
export const AGRIMET_ETR_ARAO_JUNSEP_IN = 24.02;
export const AGRIMET_ETR_FOGO_JUNSEP_IN = 25.61;

/**
 * AgriMet wine-grape seasonal ETc — contested (Levin: CA Kc overestimates
 * Oregon; southern OR measured ~11.4 in vs AgriMet 20.2 in — not NVW).
 * Do not use as NVW Pinot ETc.
 */
export const AGRIMET_ETC_GRAPE_IN = { a: 18.3, b: 19.6 } as const;
export const LEVIN_SOUTHERN_OR_MEASURED_IN = 11.4;
export const LEVIN_SOUTHERN_OR_AGRIMET_IN = 20.2;

/** OSD dry period after solstice — qualitative caption, not a demand number. */
export const JORY_OSD_DRY_PERIOD_D = { min: 45, max: 75 } as const;
export const WILLAKENZIE_OSD_DRY_PERIOD_D = { min: 45, max: 60 } as const;

/**
 * TODO:UNVERIFIED [year-1 extractable rooting depth]
 * searched: FAO-56 Table 22 (Zr 1.0–2.0 m is established wine grape);
 *   OSU EM 8973 (years 1–3 need water, no series, no cm);
 *   Smart et al. 2006 (established root fractions)
 * needed: measured year-1 occupied depth for NVW Pinot on Willakenzie/Jory
 *
 * Shallower than Cr (32 in) and shallower than FAO Zr min (1.0 m).
 * Not a midpoint of 1–2 m. Learner can drag (A4).
 */
export const YOUNG_PRESET_CM = 40;

export const DEPTH_AXIS_MAX_CM = FAO56_WINE_GRAPE_ZR_CM.max;
export const DEMAND_AXIS_MAX_IN = AGRIMET_ETR_FOGO_JUNSEP_IN;
export const DEMAND_AXIS_MIN_IN = 0;
