import {
  JORY_FLOOR_DEEPER_THAN_IN,
  JORY_TYPICAL_CLAY_TO_IN,
  LAURELWOOD_2C_START_IN,
  WILLAKENZIE_CR_RANGE_IN,
  WILLAKENZIE_CR_TYPICAL_IN,
} from "./constants";

export type SeriesId = "jory" | "willakenzie" | "laurelwood";

export type HorizonKind = "soil" | "paralithic" | "nonconforming";

export type DrainageClass = "well drained";

export type PermeabilityClass = "moderately slow" | "moderate";

export interface Horizon {
  name: string;
  topIn: number;
  /** Exclusive end. Last horizon may extend past the 72 in scale. */
  bottomIn: number;
  texture?: string;
  color?: string;
  kind: HorizonKind;
}

export interface SoilSeries {
  id: SeriesId;
  name: string;
  parentMaterial: string;
  drainage: DrainageClass;
  permeability: PermeabilityClass;
  depthClass: "very deep" | "moderately deep";
  horizons: Horizon[];
  vineyardsAmongTypicalUses: boolean;
}

export const JORY: SoilSeries = {
  id: "jory",
  name: "Jory",
  parentMaterial:
    "colluvium and residuum mainly from basic igneous rock, secondarily tuffaceous or sedimentary rock",
  drainage: "well drained",
  permeability: "moderately slow",
  depthClass: "very deep",
  vineyardsAmongTypicalUses: true,
  horizons: [
    {
      name: "Ap",
      topIn: 0,
      bottomIn: 6,
      texture: "silty clay loam",
      color: "5YR 3/4",
      kind: "soil",
    },
    { name: "A", topIn: 6, bottomIn: 16, kind: "soil" },
    { name: "AB", topIn: 16, bottomIn: 19, kind: "soil" },
    {
      name: "Bt1",
      topIn: 19,
      bottomIn: 29,
      texture: "clay",
      color: "2.5YR 3/4",
      kind: "soil",
    },
    { name: "Bt2", topIn: 29, bottomIn: 48, kind: "soil" },
    {
      name: "Bt3",
      topIn: 48,
      bottomIn: JORY_TYPICAL_CLAY_TO_IN,
      texture: "dark red clay",
      kind: "soil",
    },
  ],
};

export const WILLAKENZIE: SoilSeries = {
  id: "willakenzie",
  name: "Willakenzie",
  parentMaterial:
    "loamy colluvium and residuum from sandstone, siltstone, and tuffaceous materials (Spencer / Eugene formations)",
  drainage: "well drained",
  permeability: "moderately slow",
  depthClass: "moderately deep",
  vineyardsAmongTypicalUses: false,
  horizons: [
    { name: "A", topIn: 0, bottomIn: 11, texture: "loam", kind: "soil" },
    { name: "Bt1", topIn: 11, bottomIn: 19, kind: "soil" },
    { name: "Bt2", topIn: 19, bottomIn: WILLAKENZIE_CR_TYPICAL_IN, kind: "soil" },
    {
      name: "Cr",
      topIn: WILLAKENZIE_CR_TYPICAL_IN,
      bottomIn: 200,
      kind: "paralithic",
    },
  ],
};

export const LAURELWOOD: SoilSeries = {
  id: "laurelwood",
  name: "Laurelwood",
  parentMaterial:
    "silty loess-like material (probably middle Pleistocene) over nonconforming clay commonly weathered from Columbia River Basalt",
  drainage: "well drained",
  permeability: "moderate",
  depthClass: "very deep",
  vineyardsAmongTypicalUses: false,
  horizons: [
    {
      name: "Ap",
      topIn: 0,
      bottomIn: 11,
      texture: "silt loam",
      kind: "soil",
    },
    { name: "BA", topIn: 11, bottomIn: 23, kind: "soil" },
    { name: "Bt", topIn: 23, bottomIn: LAURELWOOD_2C_START_IN, kind: "soil" },
    {
      name: "2C",
      topIn: LAURELWOOD_2C_START_IN,
      bottomIn: 200,
      texture: "nonconforming clay",
      kind: "nonconforming",
    },
  ],
};

export const PITS: readonly SoilSeries[] = [JORY, WILLAKENZIE, LAURELWOOD];

export function clampDepthIn(depthIn: number): number {
  return Math.min(72, Math.max(0, depthIn));
}

export function horizonAt(series: SoilSeries, depthIn: number): Horizon {
  const z = Math.max(0, depthIn);
  for (const h of series.horizons) {
    if (z >= h.topIn && z < h.bottomIn) return h;
  }
  return series.horizons[series.horizons.length - 1]!;
}

/** Paralithic Cr or hard bedrock. Laurelwood 2C is not a floor. */
export function hasHitFloor(series: SoilSeries, depthIn: number): boolean {
  return horizonAt(series, depthIn).kind === "paralithic";
}

export function isInWillakenzieCrRange(depthIn: number): boolean {
  return (
    depthIn >= WILLAKENZIE_CR_RANGE_IN.min &&
    depthIn <= WILLAKENZIE_CR_RANGE_IN.max
  );
}

export function materialChangedAt(series: SoilSeries, depthIn: number): boolean {
  return horizonAt(series, depthIn).kind === "nonconforming";
}

export interface HereReadout {
  seriesId: SeriesId;
  seriesName: string;
  depthIn: number;
  horizonName: string;
  texture?: string;
  color?: string;
  parentMaterial: string;
  hitFloor: boolean;
  materialChanged: boolean;
  floorLabel: string;
}

export function readoutAt(series: SoilSeries, depthIn: number): HereReadout {
  const horizon = horizonAt(series, depthIn);
  const hitFloor = hasHitFloor(series, depthIn);
  const materialChanged = materialChangedAt(series, depthIn);

  let floorLabel: string;
  if (hitFloor) {
    floorLabel = "In rock — this typical pedon has hit a floor.";
  } else if (materialChanged) {
    floorLabel =
      "Material changed (2C). Not a bedrock floor — bedrock commonly more than 5 ft.";
  } else if (series.id === "jory") {
    floorLabel = `Still soil. Floor deeper than ${JORY_FLOOR_DEEPER_THAN_IN} in (typical pedon still clay at ${JORY_TYPICAL_CLAY_TO_IN} in).`;
  } else {
    floorLabel = "Still soil — no floor at this depth in this typical pedon.";
  }

  return {
    seriesId: series.id,
    seriesName: series.name,
    depthIn,
    horizonName: horizon.name,
    texture: horizon.texture,
    color: horizon.color,
    parentMaterial: series.parentMaterial,
    hitFloor,
    materialChanged,
    floorLabel,
  };
}
