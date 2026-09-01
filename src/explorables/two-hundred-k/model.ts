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

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function landCostUsd(landAcres: number): number {
  return landAcres * LAND_USD_PER_ACRE;
}

export function year1PlantCostUsd(plantedAcres: number): number {
  return plantedAcres * YEAR1_CASH_USD_PER_ACRE;
}

export function grapeCostUsd(tons: number): number {
  return tons * NW_PINOT_USD_PER_TON;
}

export function licenseUsd(tons: number): number {
  return tons > 0 ? OLCC_WINERY_USD : 0;
}

/** Refuse a non-finite or negative increment; clip at the cash floor. */
export function allocateLandAcres(requested: number): number {
  if (!Number.isFinite(requested) || requested < 0) return 0;
  return Math.min(MAX_LAND_ACRES, Math.floor(requested));
}

export function maxPlantAcresGivenLand(landAcres: number): number {
  const owned = allocateLandAcres(landAcres);
  const leftover = STACK_USD - landCostUsd(owned);
  if (leftover + 1e-9 < YEAR1_CASH_USD_PER_ACRE) return 0;
  const byCash = Math.floor((leftover + 1e-9) / YEAR1_CASH_USD_PER_ACRE);
  return Math.max(0, Math.min(owned, byCash));
}

export function allocatePlantAcres(
  landAcres: number,
  requested: number,
): number {
  if (!Number.isFinite(requested) || requested < 0) return 0;
  return Math.min(maxPlantAcresGivenLand(landAcres), Math.floor(requested));
}

export function allocateGrapeTons(requested: number): number {
  if (!Number.isFinite(requested) || requested < 0) return 0;
  return Math.min(MAX_GRAPE_TONS, Math.floor(requested));
}

export interface LandPlantState {
  landAcres: number;
  plantedAcres: number;
  landCostUsd: number;
  plantCostUsd: number;
  remainingUsd: number;
  year1PlantPossible: boolean;
  year3YieldTons: number;
  aebBudgetPlantCostUsd: number;
  aebBudgetPlantFits: boolean;
}

/**
 * Land+plant door. Remaining = stack − land − year-1 plant.
 * Year-1 plant is cash only; it does not buy the land.
 * Cannot plant acres you do not own. Negative cash is refused.
 */
export function evaluateLandPlant(
  landAcres: number,
  plantedAcres: number,
): LandPlantState {
  const land = allocateLandAcres(landAcres);
  const plant = allocatePlantAcres(land, plantedAcres);
  const landCost = landCostUsd(land);
  const plantCost = year1PlantCostUsd(plant);
  const remaining = STACK_USD - landCost - plantCost;
  const aebBudgetPlantCost = year1PlantCostUsd(AEB_BUDGET_ACRES);
  return {
    landAcres: land,
    plantedAcres: plant,
    landCostUsd: landCost,
    plantCostUsd: plantCost,
    remainingUsd: remaining,
    year1PlantPossible: maxPlantAcresGivenLand(land) > 0,
    year3YieldTons: plant * YEAR3_YIELD_T_PER_AC,
    aebBudgetPlantCostUsd: aebBudgetPlantCost,
    aebBudgetPlantFits: aebBudgetPlantCost <= STACK_USD,
  };
}

export interface GrapesState {
  tons: number;
  grapeCostUsd: number;
  licenseUsd: number;
  remainingUsd: number;
  acresOwned: number;
  /** Custom-crush $/ton is unpublished. Never a number. */
  crushFeeUnpublished: true;
}

/**
 * Grapes+custom-crush door. Remaining = stack − tons × price − license.
 * License auto-spends when tons > 0. This door does not buy land.
 * Remaining after grapes+license stays ≥ 0; extra tons are refused.
 */
export function evaluateGrapes(tons: number): GrapesState {
  const t = allocateGrapeTons(tons);
  const grapes = grapeCostUsd(t);
  const license = licenseUsd(t);
  return {
    tons: t,
    grapeCostUsd: grapes,
    licenseUsd: license,
    remainingUsd: STACK_USD - grapes - license,
    acresOwned: 0,
    crushFeeUnpublished: true,
  };
}

export interface LaborState {
  remainingUsd: number;
  acresOwned: number;
  plantedAcres: number;
  tons: number;
  brand: number;
}

/** Labor / get hired. Spends $0 of the stack; cash remains runway. */
export function evaluateLabor(): LaborState {
  return {
    remainingUsd: STACK_USD,
    acresOwned: 0,
    plantedAcres: 0,
    tons: 0,
    brand: 0,
  };
}

/** Map a remaining-cash length (from $0) onto land acres; refuse a 5th acre. */
export function landAcresFromRemainingUsd(remainingUsd: number): number {
  const remaining = clamp(remainingUsd, 0, STACK_USD);
  const spend = STACK_USD - remaining;
  return allocateLandAcres(Math.round(spend / LAND_USD_PER_ACRE));
}

/** Map leftover dollars after land onto planted acres (clip by owned + cash). */
export function plantAcresFromPlantSpendUsd(
  landAcres: number,
  plantSpendUsd: number,
): number {
  const spend = Math.max(0, plantSpendUsd);
  return allocatePlantAcres(
    landAcres,
    Math.round(spend / YEAR1_CASH_USD_PER_ACRE),
  );
}

/**
 * Map remaining cash onto grape tons, reserving the $500 license whenever
 * tons would be > 0. Refuse the increment that would go negative.
 */
export function grapeTonsFromRemainingUsd(remainingUsd: number): number {
  const remaining = clamp(remainingUsd, 0, STACK_USD);
  const spend = STACK_USD - remaining;
  if (spend < OLCC_WINERY_USD + NW_PINOT_USD_PER_TON) return 0;
  return allocateGrapeTons(
    Math.round((spend - OLCC_WINERY_USD) / NW_PINOT_USD_PER_TON),
  );
}
