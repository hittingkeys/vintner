/**
 * Sourced establishment / grape-price / license constants.
 * Do not invent planted Dundee comps, custom-crush $/ton, or Portland rent.
 */

/** Liquid business capital in this lesson. Not a Portland living budget. */
export const STACK_USD = 200_000;

/**
 * OSU AEB 0086 (Dec 2025), Jacobson, Murray Cordero, Sterns:
 * 20-acre limited-mechanization Pinot noir, statewide Oregon
 * (not Willamette-specific). Land-value assumption is a budget
 * opportunity-cost, not a planted-comps survey.
 */
export const LAND_USD_PER_ACRE = 45_000;

/**
 * AEB 0086 Table 5: year-1 total cash $26,587.14/acre.
 * Display rounds to the nearest dollar ($26,587).
 */
export const YEAR1_CASH_USD_PER_ACRE = 26_587.14;

/** AEB 0086 budget size used for the closed land+plant door. */
export const AEB_BUDGET_ACRES = 20;

/**
 * AEB 0086: year-3 commercial yield starts 2.0 t/ac in that budget;
 * no crop years 1–2. Display whole tons, not three-decimal yields.
 */
export const YEAR3_YIELD_T_PER_AC = 2.0;

/**
 * AEB 0086: cumulative cash through year 5 still −$33,660/acre.
 * Caption only — not part of the remaining-cash equation.
 */
export const AEB_Y5_CUMULATIVE_CASH_USD_PER_ACRE = -33_660;

/**
 * AEB 0086: labor is 42% of first-five-year cash costs.
 * Annotation on the labor door, not a spend from this stack.
 */
export const LABOR_SHARE_OF_ESTABLISHMENT_CASH = 0.42;

/**
 * 2025 Oregon Grape Pricing Report (OWB/UO IPRE, May 2026):
 * North Willamette Pinot noir weighted average $2,491/ton.
 * Third-party sales only.
 */
export const NW_PINOT_USD_PER_TON = 2_491;

/**
 * OLCC liquor license fees Rev 1.01.24: winery $500/year.
 * Auto-spent when the grapes door buys tons > 0.
 */
export const OLCC_WINERY_USD = 500;

export const MAX_LAND_ACRES = Math.floor(STACK_USD / LAND_USD_PER_ACRE);
export const MAX_GRAPE_TONS = Math.floor(
  (STACK_USD - OLCC_WINERY_USD) / NW_PINOT_USD_PER_TON,
);
