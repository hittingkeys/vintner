import { describe, expect, it } from "vitest";
import {
  FAO56_RAW_FRACTION_P,
  IN_TO_CM,
  JORY_DEFAULT_PAWS_CM,
  JORY_PAWS_RANGE_CM,
  JORY_PAWS_REFERENCE_CM,
  MCMINNVILLE_JUN_SEP_P_IN,
  WILLAKENZIE_CR_CM,
  WILLAKENZIE_PROFILE_PAWS_CM,
  YOUNG_PRESET_CM,
  inToCm,
} from "./constants";
import {
  JORY_PROFILE,
  WILLAKENZIE_PROFILE,
  extractableDepthCm,
  occupiedTawCm,
  simulate,
} from "./model";
import { occupiedPawSpec } from "./spec";

function within(got: number, expected: number, tolerance: number): boolean {
  return Math.abs(got - expected) <= tolerance;
}

describe("known-answer cases (ExplorableSpec)", () => {
  const [willakenzieCase, joryCase, rawCase] = occupiedPawSpec.knownAnswerCases;

  it("A: established Willakenzie occupying to Cr → occupied TAW 15 cm ± 0.5", () => {
    const got = occupiedTawCm(WILLAKENZIE_PROFILE, WILLAKENZIE_CR_CM);
    expect(
      within(got, willakenzieCase.expected, willakenzieCase.tolerance),
    ).toBe(true);
    expect(got).toBe(WILLAKENZIE_PROFILE_PAWS_CM);
  });

  it("B: established Jory occupying unrestricted >60 in → occupied TAW 25 cm ± 0.5", () => {
    const got = occupiedTawCm(JORY_PROFILE, JORY_PAWS_REFERENCE_CM);
    expect(within(got, joryCase.expected, joryCase.tolerance)).toBe(true);
    expect(got).toBe(JORY_DEFAULT_PAWS_CM);
    const pastSixty = occupiedTawCm(JORY_PROFILE, JORY_PAWS_REFERENCE_CM + 40);
    expect(within(pastSixty, joryCase.expected, joryCase.tolerance)).toBe(true);
    expect(JORY_PAWS_RANGE_CM.min).toBe(25);
    expect(JORY_PAWS_RANGE_CM.max).toBe(41);
  });

  it("C: FAO-56 wine-grape RAW fraction p = 0.45 ± 0.02", () => {
    const taw = occupiedTawCm(JORY_PROFILE, JORY_PAWS_REFERENCE_CM);
    const result = simulate({
      series: JORY_PROFILE,
      occupiedDepthCm: JORY_PAWS_REFERENCE_CM,
      demandCm: 0,
      deficitDrip: false,
    });
    expect(within(result.rawFraction, rawCase.expected, rawCase.tolerance)).toBe(
      true,
    );
    expect(result.rawCm / taw).toBeCloseTo(FAO56_RAW_FRACTION_P, 8);
    expect(FAO56_RAW_FRACTION_P).toBe(0.45);
  });
});

describe("extractable depth / Cr cap", () => {
  it("does not use water below Willakenzie Cr", () => {
    const atCr = occupiedTawCm(WILLAKENZIE_PROFILE, WILLAKENZIE_CR_CM);
    const pastCr = occupiedTawCm(WILLAKENZIE_PROFILE, WILLAKENZIE_CR_CM + 80);
    expect(pastCr).toBe(atCr);
    expect(extractableDepthCm(WILLAKENZIE_PROFILE, WILLAKENZIE_CR_CM + 80)).toBe(
      WILLAKENZIE_CR_CM,
    );
  });

  it("does not invent Jory storage below the 0–60 in PAWS column", () => {
    const atRef = occupiedTawCm(JORY_PROFILE, JORY_PAWS_REFERENCE_CM);
    const pastRef = occupiedTawCm(JORY_PROFILE, JORY_PAWS_REFERENCE_CM + 50);
    expect(pastRef).toBe(atRef);
  });

  it("scales occupied TAW uniformly when occupied < reference (stated assumption)", () => {
    const half = occupiedTawCm(WILLAKENZIE_PROFILE, WILLAKENZIE_CR_CM / 2);
    expect(half).toBeCloseTo(WILLAKENZIE_PROFILE_PAWS_CM / 2, 8);
  });

  it("occupied depth 0 → TAW 0, stall, no NaN", () => {
    const result = simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: 0,
      demandCm: 10,
      deficitDrip: false,
    });
    expect(result.occupiedTawCm).toBe(0);
    expect(result.remainingPawCm).toBe(0);
    expect(result.stall).toBe(true);
    expect(result.lives).toBe(false);
    expect(Number.isFinite(result.ks)).toBe(true);
    expect(Number.isFinite(result.depletionFraction)).toBe(true);
  });
});

describe("ordering: any shared positive net demand", () => {
  /**
   * Demand values are test fixtures for the bucket inequality, not NVW
   * Pinot ETc (TODO:UNVERIFIED). McMinnville Jun–Sep P is recorded only
   * as the weather fixture the spec named.
   */
  const sharedDemandsCm = [1, 8, 12, 20, 40];

  it("records the McMinnville weather fixture (not an ETc)", () => {
    expect(MCMINNVILLE_JUN_SEP_P_IN).toBeCloseTo(3.23, 8);
    expect(IN_TO_CM).toBe(2.54);
  });

  it("established Jory dry-farm remaining > established Willakenzie; least depleted of dry-farm cases", () => {
    const youngDepth = YOUNG_PRESET_CM;
    expect(youngDepth).toBeLessThan(WILLAKENZIE_CR_CM);

    for (const demandCm of sharedDemandsCm) {
      if (demandCm <= 0) continue;
      const joryEst = simulate({
        series: JORY_PROFILE,
        occupiedDepthCm: JORY_PAWS_REFERENCE_CM,
        demandCm,
        deficitDrip: false,
      });
      const willEst = simulate({
        series: WILLAKENZIE_PROFILE,
        occupiedDepthCm: WILLAKENZIE_CR_CM,
        demandCm,
        deficitDrip: false,
      });
      const willYoung = simulate({
        series: WILLAKENZIE_PROFILE,
        occupiedDepthCm: youngDepth,
        demandCm,
        deficitDrip: false,
      });

      expect(joryEst.occupiedTawCm).toBeGreaterThan(willEst.occupiedTawCm);
      expect(joryEst.remainingPawCm).toBeGreaterThanOrEqual(
        willEst.remainingPawCm,
      );
      expect(joryEst.remainingPawCm).toBeGreaterThanOrEqual(
        willYoung.remainingPawCm,
      );

      if (demandCm < joryEst.occupiedTawCm) {
        expect(joryEst.remainingPawCm).toBeGreaterThan(willEst.remainingPawCm);
        expect(joryEst.lives).toBe(true);
      }

      // Case C: irrigation-indicated iff Dr > RAW (remaining still in the
      // readily-available fraction). "Remaining > RAW" is not that test.
      expect(joryEst.irrigationIndicated).toBe(
        joryEst.depletionCm > joryEst.rawCm,
      );
      if (joryEst.remainingPawCm > joryEst.occupiedTawCm - joryEst.rawCm) {
        expect(joryEst.irrigationIndicated).toBe(false);
      }
    }
  });

  it("young Willakenzie dry-farm: shallower than Cr, no water below Cr, harder stall than established Jory", () => {
    const youngDepth = YOUNG_PRESET_CM;
    expect(extractableDepthCm(WILLAKENZIE_PROFILE, youngDepth)).toBeLessThan(
      WILLAKENZIE_CR_CM,
    );
    expect(
      extractableDepthCm(WILLAKENZIE_PROFILE, WILLAKENZIE_CR_CM + 20),
    ).toBe(WILLAKENZIE_CR_CM);

    const youngTaw = occupiedTawCm(WILLAKENZIE_PROFILE, youngDepth);
    const joryTaw = occupiedTawCm(JORY_PROFILE, JORY_PAWS_REFERENCE_CM);
    const demandCm = (youngTaw + joryTaw) / 2;

    const willYoung = simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: youngDepth,
      demandCm,
      deficitDrip: false,
    });
    const joryEst = simulate({
      series: JORY_PROFILE,
      occupiedDepthCm: JORY_PAWS_REFERENCE_CM,
      demandCm,
      deficitDrip: false,
    });

    expect(willYoung.stall || willYoung.ks < joryEst.ks).toBe(true);
    expect(willYoung.depletionFraction).toBeGreaterThan(
      joryEst.depletionFraction,
    );
  });

  it("same young Willakenzie with deficit drip lives; stall off; remaining > 0", () => {
    const youngDepth = YOUNG_PRESET_CM;
    const youngTaw = occupiedTawCm(WILLAKENZIE_PROFILE, youngDepth);
    const demandCm = youngTaw + 10;

    const dry = simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: youngDepth,
      demandCm,
      deficitDrip: false,
    });
    const drip = simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: youngDepth,
      demandCm,
      deficitDrip: true,
    });

    expect(dry.stall).toBe(true);
    expect(drip.lives).toBe(true);
    expect(drip.stall).toBe(false);
    expect(drip.remainingPawCm).toBeGreaterThan(0);
    expect(drip.depletionCm).toBeLessThanOrEqual(drip.rawCm + 1e-9);
  });
});

describe("irrigation indication vs RAW", () => {
  it("indicates irrigation only when depletion fraction exceeds p", () => {
    const taw = occupiedTawCm(WILLAKENZIE_PROFILE, WILLAKENZIE_CR_CM);
    const below = simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: WILLAKENZIE_CR_CM,
      demandCm: 0.4 * taw,
      deficitDrip: false,
    });
    const above = simulate({
      series: WILLAKENZIE_PROFILE,
      occupiedDepthCm: WILLAKENZIE_CR_CM,
      demandCm: 0.5 * taw,
      deficitDrip: false,
    });
    expect(below.irrigationIndicated).toBe(false);
    expect(above.irrigationIndicated).toBe(true);
  });
});

describe("inch/cm conversion", () => {
  it("uses the exact 2.54 cm/in definition", () => {
    expect(inToCm(60)).toBeCloseTo(152.4, 8);
    expect(inToCm(32)).toBeCloseTo(81.28, 8);
  });
});
