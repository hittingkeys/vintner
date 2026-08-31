import { JORY, LAURELWOOD, WILLAKENZIE, type SeriesId } from "./model";
import { OSD_JORY, OSD_LAURELWOOD, OSD_WILLAKENZIE } from "./constants";
import {
  SOILWEB_SERIES_EXTENT,
  inWillametteTrough,
  seriesContaining,
} from "./series-extent";

/**
 * OSD geographic setting + OSU hillside/floor contrast.
 * Extents on the map are SoilWeb generalized SSURGO, not a survey
 * you can site from, and not AVA blobs. Do not invent acreages.
 */

export type LandformId =
  | "northwest-margin-hills"
  | "western-margin-hills"
  | "eastern-southern-margins"
  | "surrounding-foothills"
  | "valley-floor";

export type ValleySelection = LandformId | "unselected";

export interface TypeLocation {
  county: string;
  state: "Oregon";
  quadrangle: string;
  lat: { deg: number; min: number; sec: number; hemi: "N" };
  lon: { deg: number; min: number; sec: number; hemi: "W" };
  datum: "NAD27";
}

export interface LandformResult {
  landformId: LandformId;
  state: "series" | "floor";
  seriesId: SeriesId | null;
  seriesName: string | null;
  typeLocationCounty: string | null;
  typeLocation: TypeLocation | null;
  formations: readonly string[] | null;
  elevationFt: { readonly min: number; readonly max: number } | null;
  distributionIncludesWillamette: boolean;
  distributionIncludesUmpqua: boolean;
  distribution: string | null;
  parentMaterial: string;
  where: string;
  osuHillsideVsFloor: string | null;
  willakenzieAssociatedJory: string | null;
  umpquaCaption: string | null;
  pitHighlighted: SeriesId | null;
}

export const OSU_INVENTORY = {
  source:
    "Skinkis & Skolas, An Inventory of Oregon's Vineyard Sites and Soils (Oregon Vineyard Soil and Nutrition Initiative), Oregon State University",
  url: "https://ir.library.oregonstate.edu/downloads/q524jq16t",
} as const;

/** OSU inventory: hillside examples vs floor / lower-terrace contrast. */
export const OSU_HILLSIDE_VS_FLOOR =
  "On stable hillsides in the Willamette: examples include Bellpine, Jory, and Willakenzie. On less-stable hillsides, lower terraces, and valley floors: younger, less-weathered mollisols; examples Philomath, Woodburn, Yamhill.";

/** NRCS OSD WILLAKENZIE (08/2006), geographically associated soils. */
export const WILLAKENZIE_ASSOCIATED_JORY =
  "Jory soils are fine textured, greater than 60 inches deep to bedrock, and occur on adjacent higher hills.";

/** NRCS OSD JORY (06/2011): distribution includes Willamette and Umpqua. */
export const JORY_UMPQUA_CAPTION =
  "Jory also occurs in the Umpqua Valley (OSD geographic setting) — not Willamette-only. The Jory layer continues south; pan to see it.";

export const JORY_TYPE_LOCATION: TypeLocation = {
  county: "Marion",
  state: "Oregon",
  quadrangle: "Turner, Oregon USGS 7.5 minute quadrangle",
  lat: { deg: 44, min: 50, sec: 56, hemi: "N" },
  lon: { deg: 122, min: 59, sec: 52, hemi: "W" },
  datum: "NAD27",
};

export const WILLAKENZIE_TYPE_LOCATION: TypeLocation = {
  county: "Yamhill",
  state: "Oregon",
  quadrangle: "Carlton, Oregon USGS 7.5 minute topographic quadrangle",
  lat: { deg: 45, min: 20, sec: 1, hemi: "N" },
  lon: { deg: 123, min: 8, sec: 17, hemi: "W" },
  datum: "NAD27",
};

export const LAURELWOOD_TYPE_LOCATION: TypeLocation = {
  county: "Washington",
  state: "Oregon",
  quadrangle: "Laurelwood, Oregon USGS 7.5 minute topographic quadrangle",
  lat: { deg: 45, min: 25, sec: 46, hemi: "N" },
  lon: { deg: 123, min: 0, sec: 57, hemi: "W" },
  datum: "NAD27",
};

/** NRCS OSD JORY (06/2011) geographic setting. */
export const JORY_ELEVATION_FT = { min: 250, max: 2500 } as const;
export const JORY_WHERE =
  "foothills adjacent to the Willamette and Umpqua Valleys";
export const JORY_GEO_PARENT =
  "clayey colluvium and residuum derived mainly from basic igneous, secondarily tuffaceous/sedimentary";
export const JORY_DISTRIBUTION =
  "low foothills of Willamette and Umpqua Valleys, Oregon; MLRA 2; the series is extensive";

/** NRCS OSD WILLAKENZIE (08/2006) geographic setting. */
export const WILLAKENZIE_WEST_ELEVATION_FT = { min: 200, max: 900 } as const;
export const WILLAKENZIE_EAST_ELEVATION_FT = { min: 300, max: 1400 } as const;
export const WILLAKENZIE_WEST_FORMATIONS = ["Spencer"] as const;
export const WILLAKENZIE_EAST_FORMATIONS = ["Eugene", "Fisher"] as const;
export const WILLAKENZIE_WHERE =
  "summit, shoulder, and backslope of smooth convex hills along the margins of the Willamette Valley";
export const WILLAKENZIE_DISTRIBUTION =
  "low hills and foothills along the margins of the Willamette Valley; MLRA 2; moderate extent";

/** NRCS OSD LAURELWOOD (12/2006) geographic setting. */
export const LAURELWOOD_ELEVATION_FT = { min: 200, max: 1600 } as const;
export const LAURELWOOD_WHERE =
  "hills along the northwest margin of the Willamette Valley, Oregon";
export const LAURELWOOD_DISTRIBUTION =
  "hills along the northwest margin of the Willamette Valley, Oregon; MLRA 2; moderate extent";

export const MAP_ATTRIBUTION_CAPTION =
  "Basemap: Esri World Topo. Attribution is on the map.";

export const EXTENT_UNCERTAINTY =
  `Colored regions: SoilWeb generalized SSURGO series extent (UC Davis), snapshot ${SOILWEB_SERIES_EXTENT.lastModified}, not a soil survey you can site from, not AVA blobs. Grid size differs by series (Jory 0.005°, Willakenzie and Laurelwood 0.001°). Generalized from SSURGO — not map-unit polygons you can site a vineyard from.`;

export const PIN_DATUM_CAPTION =
  "Pins: NRCS OSD type locations, NAD27, plotted on WGS84 basemap (~100 m).";

export const WILLAKENZIE_SPLIT_CAPTION =
  "Willakenzie clicks south of 44.3°N and east of −123.05° use a teaching split from OSD wording (Eugene and Fisher vs Spencer), not a formation map.";

/** Teaching split from OSD wording — not a formation map. */
export const WILLAKENZIE_EAST_SOUTH = {
  southOfLat: 44.3,
  eastOfLon: -123.05,
} as const;

export const OSD_GEOGRAPHY_CAPTION = MAP_ATTRIBUTION_CAPTION;
export const BELT_UNCERTAINTY = EXTENT_UNCERTAINTY;

/**
 * Schematic frame for placing OSD type-location pins on a N–S trough.
 * Not a sourced valley outline and not a survey grid.
 */
export const SCHEMATIC = {
  width: 300,
  height: 440,
  lonWest: 123.28,
  lonEast: 122.72,
  latNorth: 45.58,
  latSouth: 43.98,
  xMin: 40,
  xMax: 260,
  yMin: 24,
  yMax: 410,
} as const;

export function dmsToDecimal(deg: number, min: number, sec: number): number {
  return deg + min / 60 + sec / 3600;
}

export function formatDms(part: {
  deg: number;
  min: number;
  sec: number;
  hemi: "N" | "W";
}): string {
  return `${part.deg}°${String(part.min).padStart(2, "0")}′${String(part.sec).padStart(2, "0")}″ ${part.hemi}`;
}

export function projectPin(
  latN: number,
  lonW: number,
): { x: number; y: number } {
  const x =
    SCHEMATIC.xMin +
    ((SCHEMATIC.lonWest - lonW) / (SCHEMATIC.lonWest - SCHEMATIC.lonEast)) *
      (SCHEMATIC.xMax - SCHEMATIC.xMin);
  const y =
    SCHEMATIC.yMin +
    ((SCHEMATIC.latNorth - latN) / (SCHEMATIC.latNorth - SCHEMATIC.latSouth)) *
      (SCHEMATIC.yMax - SCHEMATIC.yMin);
  return { x, y };
}

export function typeLocationXY(loc: TypeLocation): { x: number; y: number } {
  return projectPin(
    dmsToDecimal(loc.lat.deg, loc.lat.min, loc.lat.sec),
    dmsToDecimal(loc.lon.deg, loc.lon.min, loc.lon.sec),
  );
}

/** WGS84-plottable decimal degrees. Lon is signed west-negative. */
export function typeLocationLonLat(loc: TypeLocation): {
  lat: number;
  lon: number;
} {
  return {
    lat: dmsToDecimal(loc.lat.deg, loc.lat.min, loc.lat.sec),
    lon: -dmsToDecimal(loc.lon.deg, loc.lon.min, loc.lon.sec),
  };
}

/**
 * Teaching convenience from OSD wording, not a formation map.
 * Southern portion of the eastern valley → Eugene/Fisher; otherwise Spencer.
 */
export function willakenzieLandformAt(
  lon: number,
  lat: number,
): "eastern-southern-margins" | "western-margin-hills" {
  if (
    lat < WILLAKENZIE_EAST_SOUTH.southOfLat &&
    lon > WILLAKENZIE_EAST_SOUTH.eastOfLon
  ) {
    return "eastern-southern-margins";
  }
  return "western-margin-hills";
}

/**
 * Map click → landform. Hit-test smallest/topmost extent first
 * (Laurelwood, Willakenzie, Jory). Trough with no hit → valley floor.
 */
export function landformAtLonLat(lon: number, lat: number): LandformId | null {
  const hits = seriesContaining(lon, lat);
  const top = hits[0];
  if (top === "laurelwood") return "northwest-margin-hills";
  if (top === "willakenzie") return willakenzieLandformAt(lon, lat);
  if (top === "jory") return "surrounding-foothills";
  if (inWillametteTrough(lon, lat)) return "valley-floor";
  return null;
}

export function landformForPin(
  seriesId: SeriesId,
): Exclude<LandformId, "valley-floor"> {
  if (seriesId === "jory") return "surrounding-foothills";
  if (seriesId === "willakenzie") return "western-margin-hills";
  return "northwest-margin-hills";
}

function seriesFields(seriesId: SeriesId): {
  seriesId: SeriesId;
  seriesName: string;
  pitHighlighted: SeriesId;
  typeLocation: TypeLocation;
  typeLocationCounty: string;
  parentMaterial: string;
} {
  if (seriesId === "jory") {
    return {
      seriesId,
      seriesName: JORY.name,
      pitHighlighted: "jory",
      typeLocation: JORY_TYPE_LOCATION,
      typeLocationCounty: JORY_TYPE_LOCATION.county,
      parentMaterial: JORY_GEO_PARENT,
    };
  }
  if (seriesId === "willakenzie") {
    return {
      seriesId,
      seriesName: WILLAKENZIE.name,
      pitHighlighted: "willakenzie",
      typeLocation: WILLAKENZIE_TYPE_LOCATION,
      typeLocationCounty: WILLAKENZIE_TYPE_LOCATION.county,
      parentMaterial: WILLAKENZIE.parentMaterial,
    };
  }
  return {
    seriesId,
    seriesName: LAURELWOOD.name,
    pitHighlighted: "laurelwood",
    typeLocation: LAURELWOOD_TYPE_LOCATION,
    typeLocationCounty: LAURELWOOD_TYPE_LOCATION.county,
    parentMaterial: LAURELWOOD.parentMaterial,
  };
}

export function selectLandform(landformId: LandformId): LandformResult {
  if (landformId === "valley-floor") {
    return {
      landformId,
      state: "floor",
      seriesId: null,
      seriesName: null,
      typeLocationCounty: null,
      typeLocation: null,
      formations: null,
      elevationFt: null,
      distributionIncludesWillamette: false,
      distributionIncludesUmpqua: false,
      distribution: null,
      parentMaterial:
        "a different parent-material story — not these three hillside series",
      where: "valley floor (and lower terraces)",
      osuHillsideVsFloor: OSU_HILLSIDE_VS_FLOOR,
      willakenzieAssociatedJory: null,
      umpquaCaption: null,
      pitHighlighted: null,
    };
  }

  if (landformId === "surrounding-foothills") {
    const s = seriesFields("jory");
    return {
      landformId,
      state: "series",
      ...s,
      formations: null,
      elevationFt: JORY_ELEVATION_FT,
      distributionIncludesWillamette: true,
      distributionIncludesUmpqua: true,
      distribution: JORY_DISTRIBUTION,
      where: JORY_WHERE,
      osuHillsideVsFloor: null,
      willakenzieAssociatedJory: null,
      umpquaCaption: JORY_UMPQUA_CAPTION,
    };
  }

  if (landformId === "western-margin-hills") {
    const s = seriesFields("willakenzie");
    return {
      landformId,
      state: "series",
      ...s,
      formations: WILLAKENZIE_WEST_FORMATIONS,
      elevationFt: WILLAKENZIE_WEST_ELEVATION_FT,
      distributionIncludesWillamette: true,
      distributionIncludesUmpqua: false,
      distribution: WILLAKENZIE_DISTRIBUTION,
      where: `${WILLAKENZIE_WHERE} — western margins, Spencer Formation`,
      osuHillsideVsFloor: null,
      willakenzieAssociatedJory: WILLAKENZIE_ASSOCIATED_JORY,
      umpquaCaption: null,
    };
  }

  if (landformId === "eastern-southern-margins") {
    const s = seriesFields("willakenzie");
    return {
      landformId,
      state: "series",
      ...s,
      formations: WILLAKENZIE_EAST_FORMATIONS,
      elevationFt: WILLAKENZIE_EAST_ELEVATION_FT,
      distributionIncludesWillamette: true,
      distributionIncludesUmpqua: false,
      distribution: WILLAKENZIE_DISTRIBUTION,
      where: `${WILLAKENZIE_WHERE} — eastern margins, southern portion, Eugene and Fisher Formations`,
      osuHillsideVsFloor: null,
      willakenzieAssociatedJory: WILLAKENZIE_ASSOCIATED_JORY,
      umpquaCaption: null,
    };
  }

  const s = seriesFields("laurelwood");
  return {
    landformId,
    state: "series",
    ...s,
    formations: null,
    elevationFt: LAURELWOOD_ELEVATION_FT,
    distributionIncludesWillamette: true,
    distributionIncludesUmpqua: false,
    distribution: LAURELWOOD_DISTRIBUTION,
    where: LAURELWOOD_WHERE,
    osuHillsideVsFloor: null,
    willakenzieAssociatedJory: null,
    umpquaCaption: null,
  };
}

export const TYPE_LOCATION_PINS = [
  { seriesId: "jory" as const, location: JORY_TYPE_LOCATION, osd: OSD_JORY },
  {
    seriesId: "willakenzie" as const,
    location: WILLAKENZIE_TYPE_LOCATION,
    osd: OSD_WILLAKENZIE,
  },
  {
    seriesId: "laurelwood" as const,
    location: LAURELWOOD_TYPE_LOCATION,
    osd: OSD_LAURELWOOD,
  },
] as const;
