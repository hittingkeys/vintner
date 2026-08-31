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

export function seriesGridsizeDeg(id: SeriesId): number {
  return extentFeature(SERIES_EXTENTS[id]).properties.gridsize;
}
