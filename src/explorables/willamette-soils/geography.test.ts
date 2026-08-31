import { describe, expect, it } from "vitest";
import {
  JORY_TYPE_LOCATION,
  LAURELWOOD_TYPE_LOCATION,
  OSU_HILLSIDE_VS_FLOOR,
  WILLAKENZIE_ASSOCIATED_JORY,
  WILLAKENZIE_EAST_ELEVATION_FT,
  WILLAKENZIE_EAST_FORMATIONS,
  WILLAKENZIE_TYPE_LOCATION,
  WILLAKENZIE_WEST_ELEVATION_FT,
  WILLAKENZIE_WEST_FORMATIONS,
  dmsToDecimal,
  landformAtLonLat,
  landformForPin,
  selectLandform,
  typeLocationLonLat,
  typeLocationXY,
  willakenzieLandformAt,
} from "./geography";
import {
  JORY_EXTENT,
  LAURELWOOD_EXTENT,
  WILLAKENZIE_EXTENT,
  extentBbox,
  lonLatInBbox,
  pointInSeriesExtent,
} from "./series-extent";
import { willametteSoilsSpec } from "./spec";

describe("selectLandform (OSD geographic setting)", () => {
  it("northwest margin hills yields Laurelwood; type location county Washington", () => {
    const got = selectLandform("northwest-margin-hills");
    expect(got.seriesId).toBe("laurelwood");
    expect(got.seriesName).toBe("Laurelwood");
    expect(got.pitHighlighted).toBe("laurelwood");
    expect(got.state).toBe("series");
    expect(got.typeLocationCounty).toBe("Washington");
    expect(got.typeLocation?.county).toBe("Washington");
  });

  it("western-margin hills yields Willakenzie; formation Spencer; elev 200–900 ft", () => {
    const got = selectLandform("western-margin-hills");
    expect(got.seriesId).toBe("willakenzie");
    expect(got.pitHighlighted).toBe("willakenzie");
    expect(got.formations).toEqual(["Spencer"]);
    expect(got.formations).toEqual([...WILLAKENZIE_WEST_FORMATIONS]);
    expect(got.elevationFt).toEqual({ min: 200, max: 900 });
    expect(got.elevationFt).toEqual(WILLAKENZIE_WEST_ELEVATION_FT);
  });

  it("eastern margins, southern portion yields Willakenzie; Eugene and Fisher; 300–1400 ft", () => {
    const got = selectLandform("eastern-southern-margins");
    expect(got.seriesId).toBe("willakenzie");
    expect(got.pitHighlighted).toBe("willakenzie");
    expect(got.formations).toEqual(["Eugene", "Fisher"]);
    expect(got.formations).toEqual([...WILLAKENZIE_EAST_FORMATIONS]);
    expect(got.elevationFt).toEqual({ min: 300, max: 1400 });
    expect(got.elevationFt).toEqual(WILLAKENZIE_EAST_ELEVATION_FT);
  });

  it("surrounding foothills yields Jory; Willamette AND Umpqua; Marion County", () => {
    const got = selectLandform("surrounding-foothills");
    expect(got.seriesId).toBe("jory");
    expect(got.pitHighlighted).toBe("jory");
    expect(got.distributionIncludesWillamette).toBe(true);
    expect(got.distributionIncludesUmpqua).toBe(true);
    expect(got.distribution).toMatch(/Willamette/i);
    expect(got.distribution).toMatch(/Umpqua/i);
    expect(got.typeLocationCounty).toBe("Marion");
    expect(got.umpquaCaption).toMatch(/Umpqua/i);
  });

  it("valley floor yields none of the three series; OSU hillside vs floor contrast", () => {
    const got = selectLandform("valley-floor");
    expect(got.state).toBe("floor");
    expect(got.seriesId).toBeNull();
    expect(got.seriesName).toBeNull();
    expect(got.pitHighlighted).toBeNull();
    expect(got.osuHillsideVsFloor).toBe(OSU_HILLSIDE_VS_FLOOR);
    expect(got.osuHillsideVsFloor).toMatch(/stable hillsides/i);
    expect(got.osuHillsideVsFloor).toMatch(/valley floors/i);
    expect(got.osuHillsideVsFloor).toMatch(/Woodburn/i);
    expect(got.osuHillsideVsFloor).not.toMatch(/too many nutrients/i);
  });

  it("Willakenzie geographically-associated: Jory on adjacent higher hills", () => {
    const west = selectLandform("western-margin-hills");
    const east = selectLandform("eastern-southern-margins");
    expect(west.willakenzieAssociatedJory).toBe(WILLAKENZIE_ASSOCIATED_JORY);
    expect(west.willakenzieAssociatedJory).toMatch(/Jory/i);
    expect(west.willakenzieAssociatedJory).toMatch(/adjacent higher hills/i);
    expect(east.willakenzieAssociatedJory).toMatch(/adjacent higher hills/i);
  });
});

describe("type-location pins (OSD lat/lon, NAD27)", () => {
  it("converts OSD DMS to decimal degrees", () => {
    expect(dmsToDecimal(44, 50, 56)).toBeCloseTo(44.848889, 5);
    expect(dmsToDecimal(45, 20, 1)).toBeCloseTo(45.333611, 5);
    expect(dmsToDecimal(45, 25, 46)).toBeCloseTo(45.429444, 5);
    expect(dmsToDecimal(122, 59, 52)).toBeCloseTo(122.997778, 5);
    expect(dmsToDecimal(123, 8, 17)).toBeCloseTo(123.138056, 5);
    expect(dmsToDecimal(123, 0, 57)).toBeCloseTo(123.015833, 5);
  });

  it("pins are the only point-accurate features: N–S and W–E order matches OSD", () => {
    const jory = typeLocationXY(JORY_TYPE_LOCATION);
    const will = typeLocationXY(WILLAKENZIE_TYPE_LOCATION);
    const laurel = typeLocationXY(LAURELWOOD_TYPE_LOCATION);
    expect(laurel.y).toBeLessThan(will.y);
    expect(will.y).toBeLessThan(jory.y);
    expect(will.x).toBeLessThan(laurel.x);
    expect(will.x).toBeLessThan(jory.x);
  });

  it("each type-location pin selects that series' landform", () => {
    expect(landformForPin("jory")).toBe("surrounding-foothills");
    expect(landformForPin("willakenzie")).toBe("western-margin-hills");
    expect(landformForPin("laurelwood")).toBe("northwest-margin-hills");
  });

  it("OSD pin decimal degrees match DMS (signed west-negative lon)", () => {
    const jory = typeLocationLonLat(JORY_TYPE_LOCATION);
    const will = typeLocationLonLat(WILLAKENZIE_TYPE_LOCATION);
    const laurel = typeLocationLonLat(LAURELWOOD_TYPE_LOCATION);
    expect(jory.lat).toBeCloseTo(44.848889, 5);
    expect(jory.lon).toBeCloseTo(-122.997778, 5);
    expect(will.lat).toBeCloseTo(45.333611, 5);
    expect(will.lon).toBeCloseTo(-123.138056, 5);
    expect(laurel.lat).toBeCloseTo(45.429444, 5);
    expect(laurel.lon).toBeCloseTo(-123.015833, 5);
  });

  it("each pin lon/lat falls inside the corresponding vendor GeoJSON bbox", () => {
    const jory = typeLocationLonLat(JORY_TYPE_LOCATION);
    const will = typeLocationLonLat(WILLAKENZIE_TYPE_LOCATION);
    const laurel = typeLocationLonLat(LAURELWOOD_TYPE_LOCATION);
    expect(lonLatInBbox(jory.lon, jory.lat, extentBbox(JORY_EXTENT))).toBe(true);
    expect(lonLatInBbox(will.lon, will.lat, extentBbox(WILLAKENZIE_EXTENT))).toBe(
      true,
    );
    expect(
      lonLatInBbox(laurel.lon, laurel.lat, extentBbox(LAURELWOOD_EXTENT)),
    ).toBe(true);
  });
});

describe("Willakenzie east/south click heuristic (OSD wording, not a formation map)", () => {
  it("Eugene-area (−123.0, 44.05) maps to eastern-southern-margins", () => {
    expect(willakenzieLandformAt(-123.0, 44.05)).toBe("eastern-southern-margins");
  });

  it("Carlton-area (−123.138, 45.334) maps to western-margin-hills", () => {
    expect(willakenzieLandformAt(-123.138, 45.334)).toBe("western-margin-hills");
    expect(landformAtLonLat(-123.138, 45.334)).toBe("western-margin-hills");
  });
});

describe("valley floor is outside the three vendored extents", () => {
  it("downtown Salem (−123.035, 44.942) is not inside any of the three polygons", () => {
    expect(pointInSeriesExtent(-123.035, 44.942, JORY_EXTENT)).toBe(false);
    expect(pointInSeriesExtent(-123.035, 44.942, WILLAKENZIE_EXTENT)).toBe(false);
    expect(pointInSeriesExtent(-123.035, 44.942, LAURELWOOD_EXTENT)).toBe(false);
    expect(landformAtLonLat(-123.035, 44.942)).toBe("valley-floor");
  });
});

describe("spec known-answer elevations (OSD geographic setting)", () => {
  it("Spencer western-margin elevations 200 and 900 ft", () => {
    const westMin = willametteSoilsSpec.knownAnswerCases.find(
      (c) => c.unit === "ft" && c.expected === 200 && /Spencer/i.test(c.description),
    );
    const westMax = willametteSoilsSpec.knownAnswerCases.find(
      (c) => c.unit === "ft" && c.expected === 900,
    );
    expect(westMin?.tolerance).toBe(0);
    expect(westMax?.tolerance).toBe(0);
    expect(WILLAKENZIE_WEST_ELEVATION_FT.min).toBe(200);
    expect(WILLAKENZIE_WEST_ELEVATION_FT.max).toBe(900);
  });

  it("Eugene/Fisher eastern-margin elevations 300 and 1400 ft", () => {
    const eastMin = willametteSoilsSpec.knownAnswerCases.find(
      (c) => c.unit === "ft" && c.expected === 300,
    );
    const eastMax = willametteSoilsSpec.knownAnswerCases.find(
      (c) => c.unit === "ft" && c.expected === 1400,
    );
    expect(eastMin?.description).toMatch(/Eugene and Fisher/i);
    expect(eastMax?.expected).toBe(1400);
    expect(WILLAKENZIE_EAST_ELEVATION_FT.min).toBe(300);
    expect(WILLAKENZIE_EAST_ELEVATION_FT.max).toBe(1400);
  });
});
