import { describe, expect, it } from "vitest";
import {
  AEB_BUDGET_ACRES,
  LAND_USD_PER_ACRE,
  MAX_GRAPE_TONS,
  MAX_LAND_ACRES,
  NW_PINOT_USD_PER_TON,
  OLCC_WINERY_USD,
  STACK_USD,
  YEAR1_CASH_USD_PER_ACRE,
  YEAR3_YIELD_T_PER_AC,
} from "./constants";
import { formatUsd, formatYieldTons, roundUsd } from "./format";
import {
  allocateGrapeTons,
  allocateLandAcres,
  allocatePlantAcres,
  evaluateGrapes,
  evaluateLabor,
  evaluateLandPlant,
  maxPlantAcresGivenLand,
  year1PlantCostUsd,
} from "./model";
import { twoHundredKSpec } from "./spec";

function within(got: number, expected: number, tolerance: number): boolean {
  return Math.abs(got - expected) <= tolerance;
}

describe("known-answer cases (ExplorableSpec)", () => {
  const [ka1, ka2, ka3] = twoHundredKSpec.knownAnswerCases;

  it("KA1 land-only: 4 acres × $45,000 remaining $20,000 ± $1; planted possible = 0", () => {
    const got = evaluateLandPlant(4, 0);
    expect(within(got.remainingUsd, ka1.expected, ka1.tolerance)).toBe(true);
    expect(got.remainingUsd).toBe(20_000);
    expect(got.landCostUsd).toBe(180_000);
    expect(got.plantedAcres).toBe(0);
    expect(maxPlantAcresGivenLand(4)).toBe(0);
    expect(got.year1PlantPossible).toBe(false);
    expect(got.year3YieldTons).toBe(0);
    expect(got.remainingUsd).toBeLessThan(YEAR1_CASH_USD_PER_ACRE);
    expect(evaluateLandPlant(4, 1).plantedAcres).toBe(0);
  });

  it("KA2 plant-without-land: 20 × $26,587.14 = $531,742.80 ± $1; door closed", () => {
    const got = year1PlantCostUsd(AEB_BUDGET_ACRES);
    expect(within(got, ka2.expected, ka2.tolerance)).toBe(true);
    expect(got).toBeCloseTo(531_742.8, 6);
    expect(got).toBeGreaterThan(STACK_USD);
    const withoutLand = evaluateLandPlant(0, 20);
    expect(withoutLand.plantedAcres).toBe(0);
    expect(withoutLand.landAcres).toBe(0);
    expect(withoutLand.aebBudgetPlantFits).toBe(false);
    expect(withoutLand.remainingUsd).toBe(STACK_USD);
  });

  it("KA3 grapes: 80 t × $2,491 + $500 license remaining $220 ± $1; max tons = 80", () => {
    const got = evaluateGrapes(80);
    expect(within(got.remainingUsd, ka3.expected, ka3.tolerance)).toBe(true);
    expect(got.remainingUsd).toBe(220);
    expect(got.tons).toBe(80);
    expect(got.grapeCostUsd).toBe(199_280);
    expect(got.licenseUsd).toBe(500);
    expect(got.acresOwned).toBe(0);
    expect(MAX_GRAPE_TONS).toBe(80);
    expect(allocateGrapeTons(81)).toBe(80);
    expect(evaluateGrapes(81).remainingUsd).toBe(220);
    expect(got.remainingUsd).toBeGreaterThanOrEqual(0);
  });
});

describe("cash floors and coupling", () => {
  it("0 acres / 0 tons leaves the full $200k", () => {
    expect(evaluateLandPlant(0, 0).remainingUsd).toBe(STACK_USD);
    expect(evaluateGrapes(0).remainingUsd).toBe(STACK_USD);
    expect(evaluateGrapes(0).licenseUsd).toBe(0);
    expect(evaluateLabor().remainingUsd).toBe(STACK_USD);
  });

  it("max land acres is 4; a 5th acre is refused with remaining shown, not NaN", () => {
    expect(MAX_LAND_ACRES).toBe(4);
    expect(allocateLandAcres(5)).toBe(4);
    const fifth = evaluateLandPlant(5, 0);
    expect(fifth.landAcres).toBe(4);
    expect(fifth.remainingUsd).toBe(20_000);
    expect(Number.isFinite(fifth.remainingUsd)).toBe(true);
    expect(Number.isNaN(fifth.remainingUsd)).toBe(false);
  });

  it("cannot plant acres you do not own; year-1 plant is cash only", () => {
    expect(allocatePlantAcres(0, 1)).toBe(0);
    expect(allocatePlantAcres(1, 4)).toBe(1);
    const oneAcre = evaluateLandPlant(1, 1);
    expect(oneAcre.landCostUsd).toBe(LAND_USD_PER_ACRE);
    expect(oneAcre.plantCostUsd).toBe(YEAR1_CASH_USD_PER_ACRE);
    expect(oneAcre.remainingUsd).toBe(
      STACK_USD - LAND_USD_PER_ACRE - YEAR1_CASH_USD_PER_ACRE,
    );
    expect(oneAcre.year3YieldTons).toBe(YEAR3_YIELD_T_PER_AC);
  });

  it("grapes door does not buy land and refuses negative cash", () => {
    const g = evaluateGrapes(80);
    expect(g.acresOwned).toBe(0);
    expect(g.remainingUsd).toBeGreaterThanOrEqual(0);
    expect(evaluateGrapes(-3).tons).toBe(0);
    expect(evaluateGrapes(Number.NaN).tons).toBe(0);
  });

  it("labor door spends $0: runway $200k, 0 acres, 0 tons, 0 brand", () => {
    const labor = evaluateLabor();
    expect(labor.remainingUsd).toBe(200_000);
    expect(labor.acresOwned).toBe(0);
    expect(labor.plantedAcres).toBe(0);
    expect(labor.tons).toBe(0);
    expect(labor.brand).toBe(0);
  });

  it("rounds displayed cash to the nearest dollar; yield is whole tons", () => {
    expect(roundUsd(YEAR1_CASH_USD_PER_ACRE)).toBe(26_587);
    expect(formatUsd(YEAR1_CASH_USD_PER_ACRE)).toBe("$26,587");
    expect(formatUsd(20_000)).toBe("$20,000");
    expect(formatYieldTons(0)).toBe("0 t");
    expect(formatYieldTons(evaluateLandPlant(4, 0).year3YieldTons)).toBe("0 t");
    expect(formatYieldTons(evaluateLandPlant(1, 1).year3YieldTons)).toBe("2 t");
    expect(formatYieldTons(2)).not.toMatch(/\.\d{3}/);
  });

  it("license is $500 only when tons > 0 (OLCC Rev 1.01.24)", () => {
    expect(OLCC_WINERY_USD).toBe(500);
    expect(evaluateGrapes(0).licenseUsd).toBe(0);
    expect(evaluateGrapes(1).licenseUsd).toBe(500);
    expect(evaluateGrapes(1).remainingUsd).toBe(
      STACK_USD - NW_PINOT_USD_PER_TON - OLCC_WINERY_USD,
    );
  });
});
