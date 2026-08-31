/**
 * Vendored SoilWeb series-extent cache (Last-Modified 2025-10-04).
 * FeatureCollection with one MultiPolygon Feature per file.
 * Do not display properties.acres (generalized grid acres, not OSD).
 */
import type { SeriesId } from "./model";
import joryRaw from "./data/jory.json";
import laurelwoodRaw from "./data/laurelwood.json";
import willakenzieRaw from "./data/willakenzie.json";

export const SOILWEB_SERIES_EXTENT = {
  source:
    "UC Davis SoilWeb series-extent cache (generalized SSURGO / soilDB seriesExtent)",
  year: 2025,
  lastModified: "2025-10-04",
  urlPattern:
    "https://casoilresource.lawr.ucdavis.edu/series-extent-cache/json/{series}.json",
  joryUrl:
    "https://casoilresource.lawr.ucdavis.edu/series-extent-cache/json/jory.json",
  willakenzieUrl:
    "https://casoilresource.lawr.ucdavis.edu/series-extent-cache/json/willakenzie.json",
  laurelwoodUrl:
    "https://casoilresource.lawr.ucdavis.edu/series-extent-cache/json/laurelwood.json",
} as const;

export interface SeriesExtentProperties {
  series: string;
  acres: number;
  gridsize: number;
  n: number;
}

export interface SeriesExtentFeature {
  type: "Feature";
  properties: SeriesExtentProperties;
  geometry: {
    type: "MultiPolygon";
    coordinates: number[][][][];
  };
}

export interface SeriesExtentCollection {
  type: "FeatureCollection";
  features: SeriesExtentFeature[];
}

export interface LonLatBbox {
  west: number;
  south: number;
  east: number;
  north: number;
}

/** Portland–Eugene Willamette view. Not all of Oregon. */
export const WILLAMETTE_VIEW: LonLatBbox = {
  west: -123.55,
  south: 44.0,
  east: -122.45,
  north: 45.65,
};

const HIT_ORDER = ["laurelwood", "willakenzie", "jory"] as const;

function asCollection(raw: unknown, expectedSeries: string): SeriesExtentCollection {
  const data = raw as SeriesExtentCollection;
  if (data.type !== "FeatureCollection" || data.features.length !== 1) {
    throw new Error(`unexpected series-extent schema for ${expectedSeries}`);
  }
  const feature = data.features[0];
  if (
    !feature ||
    feature.type !== "Feature" ||
    feature.geometry.type !== "MultiPolygon" ||
    feature.properties.series !== expectedSeries
  ) {
    throw new Error(`unexpected series-extent feature for ${expectedSeries}`);
  }
  return data;
}

export const JORY_EXTENT = asCollection(joryRaw, "JORY");
export const WILLAKENZIE_EXTENT = asCollection(willakenzieRaw, "WILLAKENZIE");
export const LAURELWOOD_EXTENT = asCollection(laurelwoodRaw, "LAURELWOOD");

export const SERIES_EXTENTS: Record<SeriesId, SeriesExtentCollection> = {
  jory: JORY_EXTENT,
  willakenzie: WILLAKENZIE_EXTENT,
  laurelwood: LAURELWOOD_EXTENT,
};

export function extentFeature(
  collection: SeriesExtentCollection,
): SeriesExtentFeature {
  const feature = collection.features[0];
  if (!feature) throw new Error("series-extent collection has no feature");
  return feature;
}

export function extentBbox(collection: SeriesExtentCollection): LonLatBbox {
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const polygon of extentFeature(collection).geometry.coordinates) {
    for (const ring of polygon) {
      for (const pair of ring) {
        const lon = pair[0];
        const lat = pair[1];
        if (lon == null || lat == null) continue;
        west = Math.min(west, lon);
        east = Math.max(east, lon);
        south = Math.min(south, lat);
        north = Math.max(north, lat);
      }
    }
  }
  return { west, south, east, north };
}

export function lonLatInBbox(
  lon: number,
  lat: number,
  bbox: LonLatBbox,
): boolean {
  return lon >= bbox.west && lon <= bbox.east && lat >= bbox.south && lat <= bbox.north;
}

export function inWillametteTrough(lon: number, lat: number): boolean {
  return lonLatInBbox(lon, lat, WILLAMETTE_VIEW);
}

function pointInRing(lon: number, lat: number, ring: number[][]): boolean {
  let inside = false;
  const n = ring.length;
  if (n < 3) return false;
  let j = n - 1;
  for (let i = 0; i < n; i += 1) {
    const xi = ring[i]?.[0];
    const yi = ring[i]?.[1];
    const xj = ring[j]?.[0];
    const yj = ring[j]?.[1];
    if (xi == null || yi == null || xj == null || yj == null) {
      j = i;
      continue;
    }
    const intersects =
      yi > lat !== yj > lat &&
      lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
    if (intersects) inside = !inside;
    j = i;
  }
  return inside;
}

export function pointInMultiPolygon(
  lon: number,
  lat: number,
  coordinates: number[][][][],
): boolean {
  for (const polygon of coordinates) {
    const outer = polygon[0];
    if (!outer || !pointInRing(lon, lat, outer)) continue;
    let inHole = false;
    for (let i = 1; i < polygon.length; i += 1) {
      const hole = polygon[i];
      if (hole && pointInRing(lon, lat, hole)) {
        inHole = true;
        break;
      }
    }
    if (!inHole) return true;
  }
  return false;
}

export function pointInSeriesExtent(
  lon: number,
  lat: number,
  collection: SeriesExtentCollection,
): boolean {
  return pointInMultiPolygon(
    lon,
    lat,
    extentFeature(collection).geometry.coordinates,
  );
}

/** Smallest / topmost first: Laurelwood, then Willakenzie, then Jory. */
export function seriesContaining(lon: number, lat: number): SeriesId[] {
  const hits: SeriesId[] = [];
  for (const id of HIT_ORDER) {
    if (pointInSeriesExtent(lon, lat, SERIES_EXTENTS[id])) hits.push(id);
  }
  return hits;
}

/** F8: series name on major extent blobs. Not a new GeoJSON layer. */
export interface ExtentLabelSite {
  seriesId: SeriesId;
  lon: number;
  lat: number;
  southOfInitialView: boolean;
}

function ringAreaAbs(ring: number[][]): number {
  let a = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[j]?.[0];
    const yi = ring[j]?.[1];
    const xj = ring[i]?.[0];
    const yj = ring[i]?.[1];
    if (xi == null || yi == null || xj == null || yj == null) continue;
    a += xi * yj - xj * yi;
  }
  return Math.abs(a / 2);
}

function ringCentroid(ring: number[][]): { lon: number; lat: number } {
  let a = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const x0 = ring[j]?.[0];
    const y0 = ring[j]?.[1];
    const x1 = ring[i]?.[0];
    const y1 = ring[i]?.[1];
    if (x0 == null || y0 == null || x1 == null || y1 == null) continue;
    const f = x0 * y1 - x1 * y0;
    a += f;
    cx += (x0 + x1) * f;
    cy += (y0 + y1) * f;
  }
  a *= 0.5;
  if (Math.abs(a) < 1e-18) {
    let sx = 0;
    let sy = 0;
    let n = 0;
    for (const p of ring) {
      if (p[0] == null || p[1] == null) continue;
      sx += p[0];
      sy += p[1];
      n += 1;
    }
    return { lon: n ? sx / n : 0, lat: n ? sy / n : 0 };
  }
  return { lon: cx / (6 * a), lat: cy / (6 * a) };
}

function labelPointOnRing(ring: number[][]): { lon: number; lat: number } {
  const c = ringCentroid(ring);
  if (pointInRing(c.lon, c.lat, ring)) return c;
  let west = Infinity;
  let south = Infinity;
  let east = -Infinity;
  let north = -Infinity;
  for (const p of ring) {
    if (p[0] == null || p[1] == null) continue;
    west = Math.min(west, p[0]);
    east = Math.max(east, p[0]);
    south = Math.min(south, p[1]);
    north = Math.max(north, p[1]);
  }
  const mid = { lon: (west + east) / 2, lat: (south + north) / 2 };
  if (pointInRing(mid.lon, mid.lat, ring)) return mid;
  return { lon: ring[0]?.[0] ?? c.lon, lat: ring[0]?.[1] ?? c.lat };
}

const LABEL_AREA_FRAC = 0.12;
const LABEL_MAX_PER_SERIES = 6;

/**
 * Repeat the series name on major MultiPolygon blobs, including Jory
 * south of the Portland–Eugene initial view. Computed from the vendored
 * extent coordinates — not an extra GeoJSON overlay.
 */
export function extentLabelSites(seriesId: SeriesId): ExtentLabelSite[] {
  const polygons = extentFeature(SERIES_EXTENTS[seriesId]).geometry.coordinates;
  const blobs = polygons
    .map((polygon) => {
      const outer = polygon[0];
      if (!outer || outer.length < 3) return null;
      const area = ringAreaAbs(outer);
      const pt = labelPointOnRing(outer);
      return { area, lon: pt.lon, lat: pt.lat };
    })
    .filter((b): b is { area: number; lon: number; lat: number } => b != null)
    .sort((a, b) => b.area - a.area);

  const maxArea = blobs[0]?.area ?? 0;
  const cutoff = maxArea * LABEL_AREA_FRAC;
  const picked: { area: number; lon: number; lat: number }[] = [];
  for (const blob of blobs) {
    if (picked.length >= LABEL_MAX_PER_SERIES) break;
    if (blob.area >= cutoff) picked.push(blob);
  }
  if (seriesId === "jory") {
    const south = blobs.find((b) => b.lat < WILLAMETTE_VIEW.south);
    if (
      south &&
      !picked.some((p) => p.lon === south.lon && p.lat === south.lat)
    ) {
      picked.push(south);
    }
  }
  return picked.map((b) => ({
    seriesId,
    lon: b.lon,
    lat: b.lat,
    southOfInitialView: b.lat < WILLAMETTE_VIEW.south,
  }));
}

export function seriesGridsizeDeg(id: SeriesId): number {
  return extentFeature(SERIES_EXTENTS[id]).properties.gridsize;
}
