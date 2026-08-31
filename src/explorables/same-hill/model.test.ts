import { describe, expect, it } from "vitest";
import {
  FROST_CLASS,
  JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT,
  JONES_DUFF_SOUTH_VS_FLAT_SLOPE_PCT,
  PENNER_ASH_FROST_HOURS_PCT,
  RLC_POCKET_THRESHOLD,
  SLOPE_BAND,
  SOLAR_CLASS,
} from "./constants";
import {
  FIXTURES,
  RLC_POCKET_Z_M,
  evaluateSite,
  frostPocketInnerRM,
  heightAtRadius,
  rlcAtHeight,
  solarClassAt,
} from "./model";
import { sameHillSpec } from "./spec";

function within(got: number, expected: number, tolerance: number): boolean {
  return Math.abs(got - expected) <= tolerance;
}

describe("known-answer cases (ExplorableSpec)", () => {
  const cases = sameHillSpec.knownAnswerCases;

  it("1. SSE–SSW + mid-slope: highest solar class; frost drained", () => {
    const sse = FIXTURES.sseMidSlope();
    const ssw = FIXTURES.sswMidSlope();
    const south = FIXTURES.southMidSlope();
    const solarCase = cases[0];
    const frostCase = cases[1];

    for (const site of [sse, ssw, south]) {
      expect(site.solarClass).toBe(SOLAR_CLASS.highest);
      expect(
        within(site.solarClass ?? -1, solarCase.expected, solarCase.tolerance),
      ).toBe(true);
      expect(site.frostClass).toBe(FROST_CLASS.drained);
      expect(
        within(site.frostClass, frostCase.expected, frostCase.tolerance),
      ).toBe(true);
      expect(site.slopeBand).toBe(SLOPE_BAND.preferred);
      expect(site.slopeBandLabel).toBe("5–15%");
      expect(Number.isFinite(site.zM)).toBe(true);
      expect(Number.isFinite(site.slopePct)).toBe(true);
    }
  });

  it("2. N or NW or NE + same mid-slope: lower solar class; frost still drained", () => {
    const north = FIXTURES.northMidSlope();
    const nw = FIXTURES.nwMidSlope();
    const ne = FIXTURES.neMidSlope();
    const south = FIXTURES.southMidSlope();
    const lessCase = cases[2];

    for (const site of [north, nw, ne]) {
      expect(site.solarClass).toBe(SOLAR_CLASS.less);
      expect(
        within(site.solarClass ?? -1, lessCase.expected, lessCase.tolerance),
      ).toBe(true);
      expect(site.solarClass).toBeLessThan(south.solarClass ?? 99);
      expect(site.frostClass).toBe(FROST_CLASS.drained);
      expect(site.slopeBand).toBe(SLOPE_BAND.preferred);
    }
  });

  it("3. topographic low, any facing: frost pocket; 81 caption ±0", () => {
    const pocketCase = cases[3];
    const hoursCase = cases[4];
    const sites = [
      FIXTURES.southTrough(),
      FIXTURES.northTrough(),
      FIXTURES.eastTrough(),
      FIXTURES.westTrough(),
    ];
    for (const site of sites) {
      expect(site.frostClass).toBe(FROST_CLASS.pocket);
      expect(
        within(site.frostClass, pocketCase.expected, pocketCase.tolerance),
      ).toBe(true);
      expect(site.frostHoursCaptionPct).toBe(PENNER_ASH_FROST_HOURS_PCT);
      expect(
        within(
          site.frostHoursCaptionPct ?? -1,
          hoursCase.expected,
          hoursCase.tolerance,
        ),
      ).toBe(true);
      expect(site.rlc).toBeLessThan(RLC_POCKET_THRESHOLD);
    }
    // A south-facing pin in the trough is still a pocket (does not un-frost).
    expect(FIXTURES.southTrough().facing).toMatch(/S/);
    expect(FIXTURES.southTrough().frostClass).toBe(FROST_CLASS.pocket);
  });

  it("4. slope <1% (flat apron): exact band", () => {
    const site = FIXTURES.flatApron();
    const bandCase = cases[5];
    expect(site.slopeBand).toBe(SLOPE_BAND.flat);
    expect(site.slopeBandLabel).toBe("<1%");
    expect(within(site.slopeBand, bandCase.expected, bandCase.tolerance)).toBe(
      true,
    );
    expect(site.slopePct).toBeLessThan(1);
  });

  it("5. 10° south vs flat caption is 25%, not south vs north", () => {
    const site = FIXTURES.tenDegreeSouth();
    const captionCase = cases[6];
    expect(site.southVsFlatInsolationCaptionPct).toBe(
      JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT,
    );
    expect(
      within(
        site.southVsFlatInsolationCaptionPct ?? -1,
        captionCase.expected,
        captionCase.tolerance,
      ),
    ).toBe(true);
    expect(site.slopePct).toBeCloseTo(JONES_DUFF_SOUTH_VS_FLAT_SLOPE_PCT, 0);
    expect(site.facing).toMatch(/^S/);
    // Caption is a constant about south vs flat — never a south-vs-north ratio.
    expect(JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT).toBe(25);
  });
});

describe("frost is not aspect (A6)", () => {
  it("north-facing mid-slope is still drained", () => {
    const site = FIXTURES.northMidSlope();
    expect(site.frostClass).toBe(FROST_CLASS.drained);
    expect(site.solarClass).toBe(SOLAR_CLASS.less);
  });

  it("south-facing trough is still a pocket", () => {
    const site = FIXTURES.southTrough();
    expect(site.frostClass).toBe(FROST_CLASS.pocket);
    expect(site.solarClass).toBe(SOLAR_CLASS.highest);
  });
});

describe("extremes: no NaN, pocket remains visible", () => {
  it("ridge/summit is drained and finite", () => {
    for (const site of [FIXTURES.ridge(), FIXTURES.summit()]) {
      expect(Number.isFinite(site.zM)).toBe(true);
      expect(Number.isFinite(site.slopePct)).toBe(true);
      expect(Number.isFinite(site.rlc)).toBe(true);
      expect(site.frostClass).toBe(FROST_CLASS.drained);
      expect(site.rlc).toBeGreaterThanOrEqual(RLC_POCKET_THRESHOLD);
    }
  });

  it("floor is pocket; RLC contour sits above the trough so the pool is not clipped", () => {
    const floor = FIXTURES.southTrough();
    expect(floor.frostClass).toBe(FROST_CLASS.pocket);
    expect(RLC_POCKET_Z_M).toBeGreaterThan(floor.zM);
    expect(RLC_POCKET_Z_M).toBeLessThan(heightAtRadius(36));
  });

  it("frost-pocket inner radius matches rlc < 0.4 through the apron", () => {
    const inner = frostPocketInnerRM();
    expect(inner).toBeGreaterThan(55);
    expect(inner).toBeLessThan(66);
    expect(rlcAtHeight(heightAtRadius(inner))).toBeLessThan(RLC_POCKET_THRESHOLD);
    expect(evaluateSite(inner - 2, 180).frostClass).toBe(FROST_CLASS.drained);
    expect(FIXTURES.flatApron().frostClass).toBe(FROST_CLASS.pocket);
    expect(evaluateSite(130, 180).frostClass).toBe(FROST_CLASS.pocket);
  });

  it("full north and SSE–SSW pins are finite", () => {
    const n = evaluateSite(36, 0);
    const sse = evaluateSite(36, 157.5);
    expect(n.solarClass).toBe(SOLAR_CLASS.less);
    expect(sse.solarClass).toBe(SOLAR_CLASS.highest);
    expect(Number.isNaN(n.slopePct)).toBe(false);
    expect(Number.isNaN(sse.slopePct)).toBe(false);
  });

  it("steeper than 15% exists on the inner trough wall", () => {
    const steep = evaluateSite(64, 180);
    expect(steep.slopeBand).toBe(SLOPE_BAND.steep);
    expect(steep.slopePct).toBeGreaterThan(15);
  });
});

describe("solar ranking is ordinal, not a cosine engine", () => {
  it("does not assign a numeric insolation to north vs south faces", () => {
    const n = solarClassAt(0);
    const s = solarClassAt(180);
    expect(s.code).toBe(SOLAR_CLASS.highest);
    expect(n.code).toBe(SOLAR_CLASS.less);
    expect(typeof s.code).toBe("number");
    expect(s.code).toBeLessThanOrEqual(2);
  });
});
