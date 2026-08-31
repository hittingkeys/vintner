import { describe, expect, it } from "vitest";
import {
  JORY_EXTENT,
  LAURELWOOD_EXTENT,
  SOILWEB_SERIES_EXTENT,
  WILLAKENZIE_EXTENT,
  WILLAMETTE_VIEW,
  extentBbox,
  extentFeature,
  inWillametteTrough,
  seriesGridsizeDeg,
} from "./series-extent";

describe("SoilWeb series-extent vendor files", () => {
  it("each file is one MultiPolygon feature with the expected series and gridsize", () => {
    const jory = extentFeature(JORY_EXTENT);
    const will = extentFeature(WILLAKENZIE_EXTENT);
    const laurel = extentFeature(LAURELWOOD_EXTENT);
    expect(jory.properties.series).toBe("JORY");
    expect(will.properties.series).toBe("WILLAKENZIE");
    expect(laurel.properties.series).toBe("LAURELWOOD");
    expect(jory.geometry.type).toBe("MultiPolygon");
    expect(seriesGridsizeDeg("jory")).toBe(0.005);
    expect(seriesGridsizeDeg("willakenzie")).toBe(0.001);
    expect(seriesGridsizeDeg("laurelwood")).toBe(0.001);
    expect(SOILWEB_SERIES_EXTENT.lastModified).toBe("2025-10-04");
    expect(SOILWEB_SERIES_EXTENT.urlPattern).toMatch(/\{series\}\.json$/);
  });

  it("bboxes match the SoilWeb snapshot (tolerance 0.01 deg)", () => {
    const jory = extentBbox(JORY_EXTENT);
    const will = extentBbox(WILLAKENZIE_EXTENT);
    const laurel = extentBbox(LAURELWOOD_EXTENT);
    expect(jory.west).toBeCloseTo(-123.7, 2);
    expect(jory.south).toBeCloseTo(43.235, 2);
    expect(jory.east).toBeCloseTo(-122.335, 2);
    expect(jory.north).toBeCloseTo(45.74, 2);
    expect(will.west).toBeCloseTo(-123.662, 2);
    expect(will.south).toBeCloseTo(43.599, 2);
    expect(will.east).toBeCloseTo(-122.634, 2);
    expect(will.north).toBeCloseTo(45.432, 2);
    expect(laurel.west).toBeCloseTo(-123.283, 2);
    expect(laurel.south).toBeCloseTo(45.271, 2);
    expect(laurel.east).toBeCloseTo(-122.516, 2);
    expect(laurel.north).toBeCloseTo(45.707, 2);
  });

  it("Willamette view is Portland–Eugene, not all of Oregon", () => {
    expect(WILLAMETTE_VIEW.west).toBe(-123.55);
    expect(WILLAMETTE_VIEW.east).toBe(-122.45);
    expect(WILLAMETTE_VIEW.south).toBe(44.0);
    expect(WILLAMETTE_VIEW.north).toBe(45.65);
    expect(inWillametteTrough(-123.035, 44.942)).toBe(true);
    expect(inWillametteTrough(-120.5, 43.8)).toBe(false);
  });
});
