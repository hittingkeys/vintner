import {
  FAO56_RAW_FRACTION_P,
  JORY_DEFAULT_PAWS_CM,
  JORY_PAWS_REFERENCE_CM,
  WILLAKENZIE_CR_CM,
  WILLAKENZIE_PROFILE_PAWS_CM,
} from "./constants";

export type SeriesId = "jory" | "willakenzie";

export interface SeriesProfile {
  id: SeriesId;
  name: string;
  profilePawsCm: number;
  /** Depth the profile PAWS number refers to (Cr, or 60 in for Jory). */
  pawsReferenceCm: number;
  hasParalithicContact: boolean;
}

export const JORY_PROFILE: SeriesProfile = {
  id: "jory",
  name: "Jory",
  profilePawsCm: JORY_DEFAULT_PAWS_CM,
  pawsReferenceCm: JORY_PAWS_REFERENCE_CM,
  hasParalithicContact: false,
};

export const WILLAKENZIE_PROFILE: SeriesProfile = {
  id: "willakenzie",
  name: "Willakenzie",
  profilePawsCm: WILLAKENZIE_PROFILE_PAWS_CM,
  pawsReferenceCm: WILLAKENZIE_CR_CM,
  hasParalithicContact: true,
};

export const SERIES: Record<SeriesId, SeriesProfile> = {
  jory: JORY_PROFILE,
  willakenzie: WILLAKENZIE_PROFILE,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Depth that can hold extractable water.
 * Willakenzie: cannot use water below Cr.
 * Jory: SoilWeb PAWS is 0–60 in; no sourced storage below that.
 *
 * Uniform AWC scaling (PAWS × occupied/reference) is a stated model
 * assumption, not a sourced horizon AWC. Horizon AWC in/in is
 * TODO:UNVERIFIED.
 */
export function extractableDepthCm(
  series: SeriesProfile,
  occupiedDepthCm: number,
): number {
  return clamp(occupiedDepthCm, 0, series.pawsReferenceCm);
}

export function occupiedTawCm(
  series: SeriesProfile,
  occupiedDepthCm: number,
  profilePawsCm: number = series.profilePawsCm,
): number {
  const z = extractableDepthCm(series, occupiedDepthCm);
  if (series.pawsReferenceCm <= 0) return 0;
  return profilePawsCm * (z / series.pawsReferenceCm);
}

export function rawCm(occupiedTaw: number, p: number = FAO56_RAW_FRACTION_P): number {
  return p * occupiedTaw;
}

export interface SimulateInput {
  series: SeriesProfile;
  occupiedDepthCm: number;
  /** Seasonal withdrawal from the occupied reservoir. Not NVW Pinot ETc. */
  demandCm: number;
  deficitDrip: boolean;
  /** Override default-MU PAWS (Jory band edges). */
  profilePawsCm?: number;
  p?: number;
}

export interface SimulateResult {
  extractableDepthCm: number;
  occupiedTawCm: number;
  rawCm: number;
  demandCm: number;
  /** Depletion Dr. */
  depletionCm: number;
  remainingPawCm: number;
  depletionFraction: number;
  rawFraction: number;
  irrigationIndicated: boolean;
  stall: boolean;
  lives: boolean;
  /** FAO-56 Ks: 1 when Dr ≤ RAW; 0 when Dr → TAW. */
  ks: number;
}

/**
 * Seasonal bucket: start full, withdraw demand from occupied TAW.
 * Deficit drip: when Dr would exceed RAW, replace only enough to keep
 * Dr ≤ RAW — not 100% ETc, not AgriMet 18–20 in.
 */
export function simulate(input: SimulateInput): SimulateResult {
  const p = input.p ?? FAO56_RAW_FRACTION_P;
  const taw = occupiedTawCm(
    input.series,
    input.occupiedDepthCm,
    input.profilePawsCm,
  );
  const readily = rawCm(taw, p);
  const demand = Math.max(0, input.demandCm);
  const z = extractableDepthCm(input.series, input.occupiedDepthCm);

  let depletion: number;
  if (input.deficitDrip && taw > 0 && demand > readily) {
    depletion = readily;
  } else {
    depletion = Math.min(demand, taw);
  }

  const remaining = taw - depletion;
  const depletionFraction = taw <= 0 ? 1 : depletion / taw;
  const stall = taw <= 0 || remaining <= 0;
  const lives = remaining > 0;
  const irrigationIndicated = taw > 0 && depletion > readily;

  let ks: number;
  if (taw <= 0) {
    ks = 0;
  } else if (depletion <= readily) {
    ks = 1;
  } else if (taw <= readily) {
    ks = 0;
  } else {
    ks = (taw - depletion) / (taw - readily);
  }

  return {
    extractableDepthCm: z,
    occupiedTawCm: taw,
    rawCm: readily,
    demandCm: demand,
    depletionCm: depletion,
    remainingPawCm: remaining,
    depletionFraction,
    rawFraction: p,
    irrigationIndicated,
    stall,
    lives,
    ks: clamp(ks, 0, 1),
  };
}

export function remainingAcrossDemand(
  series: SeriesProfile,
  occupiedDepthCm: number,
  demandCm: number,
  deficitDrip: boolean,
  profilePawsCm?: number,
): number {
  return simulate({
    series,
    occupiedDepthCm,
    demandCm,
    deficitDrip,
    profilePawsCm,
  }).remainingPawCm;
}
