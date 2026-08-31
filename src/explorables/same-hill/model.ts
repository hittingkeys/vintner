import {
  COMPASS_16,
  FROST_CLASS,
  FIXTURE_R,
  HILL_R_MAX_M,
  PENNER_ASH_FROST_HOURS_PCT,
  RADIAL_PROFILE,
  RLC_POCKET_THRESHOLD,
  SLOPE_BAND,
  SLOPE_FLAT_MAX_PCT,
  SLOPE_PREFERRED_MAX_PCT,
  SLOPE_PREFERRED_MIN_PCT,
  SOLAR_CLASS,
  SOLAR_HIGHEST_BEARING,
  type Compass16,
  type FrostClassCode,
  type SlopeBandCode,
  type SolarClassCode,
} from "./constants";

export interface PinPosition {
  /** Metres from summit. */
  rM: number;
  /** Degrees from north, clockwise. */
  bearingDeg: number;
}

export interface SiteState {
  rM: number;
  bearingDeg: number;
  xM: number;
  yM: number;
  zM: number;
  slopePct: number;
  /** Downhill compass bearing, or null at a peak with no downhill. */
  aspectDeg: number | null;
  facing: Compass16 | "ridge";
  slopeBand: SlopeBandCode;
  slopeBandLabel: string;
  solarClass: SolarClassCode | null;
  solarClassLabel: string;
  frostClass: FrostClassCode;
  frostClassLabel: string;
  rlc: number;
  /** 81 when in the pocket (sourced caption), else null — not a modeled percentage. */
  frostHoursCaptionPct: number | null;
  /** 25 when on ~10° south vs the Jones & Duff caption case, else null. */
  southVsFlatInsolationCaptionPct: number | null;
}

export const PROFILE_Z_MAX = Math.max(...RADIAL_PROFILE.map((p) => p.z));
export const PROFILE_Z_MIN = Math.min(...RADIAL_PROFILE.map((p) => p.z));

/** Elevation of RLC = 0.4 on this schematic (Penner-Ash threshold, analog). */
export const RLC_POCKET_Z_M =
  PROFILE_Z_MIN + RLC_POCKET_THRESHOLD * (PROFILE_Z_MAX - PROFILE_Z_MIN);

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function wrapBearingDeg(deg: number): number {
  const x = deg % 360;
  return x < 0 ? x + 360 : x;
}

export function polarToXY(rM: number, bearingDeg: number): { xM: number; yM: number } {
  const rad = (bearingDeg * Math.PI) / 180;
  return {
    xM: rM * Math.sin(rad),
    yM: rM * Math.cos(rad),
  };
}

export function xyToPolar(xM: number, yM: number): PinPosition {
  const rM = Math.hypot(xM, yM);
  if (rM < 1e-9) return { rM: 0, bearingDeg: 0 };
  const bearingDeg = wrapBearingDeg((Math.atan2(xM, yM) * 180) / Math.PI);
  return { rM, bearingDeg };
}

function profileSegment(rM: number): {
  r0: number;
  z0: number;
  r1: number;
  z1: number;
} {
  const pts = RADIAL_PROFILE;
  if (rM <= pts[0].r) {
    return { r0: pts[0].r, z0: pts[0].z, r1: pts[1].r, z1: pts[1].z };
  }
  for (let i = 0; i < pts.length - 1; i++) {
    if (rM <= pts[i + 1].r) {
      return {
        r0: pts[i].r,
        z0: pts[i].z,
        r1: pts[i + 1].r,
        z1: pts[i + 1].z,
      };
    }
  }
  const n = pts.length;
  return {
    r0: pts[n - 2].r,
    z0: pts[n - 2].z,
    r1: pts[n - 1].r,
    z1: pts[n - 1].z,
  };
}

export function heightAtRadius(rM: number): number {
  const r = clamp(rM, 0, HILL_R_MAX_M);
  const { r0, z0, r1, z1 } = profileSegment(r);
  if (r1 === r0) return z0;
  const t = (r - r0) / (r1 - r0);
  return z0 + t * (z1 - z0);
}

/** Signed dz/dr on the active segment (metres per metre). */
export function dzdrAtRadius(rM: number): number {
  const { r0, z0, r1, z1 } = profileSegment(rM);
  return (z1 - z0) / (r1 - r0);
}

export function slopePercentAtRadius(rM: number): number {
  return 100 * Math.abs(dzdrAtRadius(rM));
}

export function rlcAtHeight(zM: number): number {
  const span = PROFILE_Z_MAX - PROFILE_Z_MIN;
  if (span <= 0) return 0;
  return clamp((zM - PROFILE_Z_MIN) / span, 0, 1);
}

export function slopeBandAt(slopePct: number): {
  code: SlopeBandCode;
  label: string;
} {
  if (slopePct < SLOPE_FLAT_MAX_PCT) {
    return { code: SLOPE_BAND.flat, label: "<1%" };
  }
  if (slopePct < SLOPE_PREFERRED_MIN_PCT) {
    return { code: SLOPE_BAND.between, label: "1–5%" };
  }
  if (slopePct <= SLOPE_PREFERRED_MAX_PCT) {
    return { code: SLOPE_BAND.preferred, label: "5–15%" };
  }
  return { code: SLOPE_BAND.steep, label: "steeper than 15%" };
}

/**
 * 16-wind label. 0° = N. SSE–SSW is the Jones highest sector.
 */
export function compass16(bearingDeg: number): Compass16 {
  const deg = wrapBearingDeg(bearingDeg);
  const idx = Math.round(deg / 22.5) % 16;
  return COMPASS_16[idx];
}

/**
 * Downhill aspect. On a radial hill, if height falls with r, facing is
 * outward (the pin's bearing). If height rises with r (outer wall of the
 * trough), facing is inward.
 */
export function aspectDegAt(rM: number, bearingDeg: number): number | null {
  if (rM < 1e-6) return null;
  const dz = dzdrAtRadius(rM);
  if (Math.abs(dz) < 1e-9) return null;
  if (dz < 0) return wrapBearingDeg(bearingDeg);
  return wrapBearingDeg(bearingDeg + 180);
}

/**
 * Jones 2004: SSE–SSW highest. Jones & Duff cool-climate text:
 * N/NW/NE = less light/heat, delayed phenology; SE/S/SW/W = more.
 * S is in the highest sector, so it is highest not merely "more".
 * Ordinal only — not W/m².
 */
export function solarClassAt(aspectDeg: number | null): {
  code: SolarClassCode | null;
  label: string;
} {
  if (aspectDeg === null) {
    return { code: null, label: "unranked (no downhill facing)" };
  }
  const deg = wrapBearingDeg(aspectDeg);
  const { fromDeg, toDeg } = SOLAR_HIGHEST_BEARING;
  if (deg >= fromDeg && deg <= toDeg) {
    return { code: SOLAR_CLASS.highest, label: "highest (SSE–SSW)" };
  }
  const eight = Math.round(deg / 45) % 8;
  // 0=N, 1=NE, 7=NW
  if (eight === 0 || eight === 1 || eight === 7) {
    return { code: SOLAR_CLASS.less, label: "less (N/NW/NE)" };
  }
  return { code: SOLAR_CLASS.more, label: "more (SE/SW/W/E)" };
}

export function frostClassAt(rlc: number): {
  code: FrostClassCode;
  label: string;
} {
  if (rlc < RLC_POCKET_THRESHOLD) {
    return { code: FROST_CLASS.pocket, label: "pocket" };
  }
  return { code: FROST_CLASS.drained, label: "drained" };
}

function nearTenDegreeSouth(slopePct: number, aspectDeg: number | null): boolean {
  if (aspectDeg === null) return false;
  const deg = wrapBearingDeg(aspectDeg);
  const southish = deg >= SOLAR_HIGHEST_BEARING.fromDeg && deg <= SOLAR_HIGHEST_BEARING.toDeg;
  if (!southish) return false;
  return slopePct > SLOPE_PREFERRED_MAX_PCT && slopePct < 22;
}

export function evaluateSite(rM: number, bearingDeg: number): SiteState {
  const r = clamp(rM, 0, HILL_R_MAX_M);
  const bearing = wrapBearingDeg(bearingDeg);
  const { xM, yM } = polarToXY(r, bearing);
  const zM = heightAtRadius(r);
  const slopePct = slopePercentAtRadius(r);
  const aspectDeg = aspectDegAt(r, bearing);
  const facing: Compass16 | "ridge" = aspectDeg === null ? "ridge" : compass16(aspectDeg);
  const slope = slopeBandAt(slopePct);
  const solar = solarClassAt(aspectDeg);
  const rlc = rlcAtHeight(zM);
  const frost = frostClassAt(rlc);
  const inPocket = frost.code === FROST_CLASS.pocket;

  return {
    rM: r,
    bearingDeg: bearing,
    xM,
    yM,
    zM,
    slopePct,
    aspectDeg,
    facing,
    slopeBand: slope.code,
    slopeBandLabel: slope.label,
    solarClass: solar.code,
    solarClassLabel: solar.label,
    frostClass: frost.code,
    frostClassLabel: frost.label,
    rlc,
    frostHoursCaptionPct: inPocket ? PENNER_ASH_FROST_HOURS_PCT : null,
    southVsFlatInsolationCaptionPct: nearTenDegreeSouth(slopePct, aspectDeg)
      ? 25
      : null,
  };
}

export function evaluateXY(xM: number, yM: number): SiteState {
  const { rM, bearingDeg } = xyToPolar(xM, yM);
  return evaluateSite(rM, bearingDeg);
}

/** Inner radius where rlc first drops below 0.4 (pocket through the apron). */
export function frostPocketInnerRM(): number {
  const n = 400;
  for (let i = 0; i <= n; i++) {
    const rM = (i / n) * HILL_R_MAX_M;
    if (rlcAtHeight(heightAtRadius(rM)) < RLC_POCKET_THRESHOLD) return rM;
  }
  return HILL_R_MAX_M;
}

export function profileHeights(sampleCount = 80): { rM: number; zM: number }[] {
  const n = Math.max(2, sampleCount);
  return Array.from({ length: n }, (_, i) => {
    const rM = (i / (n - 1)) * HILL_R_MAX_M;
    return { rM, zM: heightAtRadius(rM) };
  });
}

/** Fixtures for known-answer and extreme tests. */
export const FIXTURES = {
  sseMidSlope: () => evaluateSite(FIXTURE_R.midSlope, 168.75),
  southMidSlope: () => evaluateSite(FIXTURE_R.midSlope, 180),
  sswMidSlope: () => evaluateSite(FIXTURE_R.midSlope, 191.25),
  northMidSlope: () => evaluateSite(FIXTURE_R.midSlope, 0),
  nwMidSlope: () => evaluateSite(FIXTURE_R.midSlope, 315),
  neMidSlope: () => evaluateSite(FIXTURE_R.midSlope, 45),
  southTrough: () => evaluateSite(FIXTURE_R.trough, 180),
  northTrough: () => evaluateSite(FIXTURE_R.trough, 0),
  eastTrough: () => evaluateSite(FIXTURE_R.trough, 90),
  westTrough: () => evaluateSite(FIXTURE_R.trough, 270),
  flatApron: () => evaluateSite(FIXTURE_R.flatApron, 180),
  ridge: () => evaluateSite(FIXTURE_R.ridge, 180),
  summit: () => evaluateSite(0, 0),
  tenDegreeSouth: () => evaluateSite(FIXTURE_R.tenDegreeSouth, 180),
} as const;
