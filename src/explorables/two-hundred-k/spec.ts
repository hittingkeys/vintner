import type { ExplorableSpec } from "../../schemas/spec";
import {
  AEB_BUDGET_ACRES,
  LAND_USD_PER_ACRE,
  NW_PINOT_USD_PER_TON,
  OLCC_WINERY_USD,
  STACK_USD,
  YEAR1_CASH_USD_PER_ACRE,
} from "./constants";
import { year1PlantCostUsd } from "./model";

/**
 * $200k from Portland — same cash, three incompatible doors.
 *
 * Brief answers (also in lesson frontmatter):
 * 1. Rubric — Part A (hidden capital mechanism) + light Part B.
 *    The learner cannot see the cost floors until they allocate cash.
 * 2. Head-sim — tracking whether $200k from Portland is enough to own a
 *    Willamette vineyard/winery, as if land+plant+license were one purchase.
 * 3. Misconception — $200k buys a vineyard/winery.
 * 4. Coupled — remaining cash, land acres, planted acres (cannot plant acres
 *    you do not own), grape tons, OLCC winery license when the grapes door
 *    is used. Grapes door does not buy land. Labor door spends $0.
 * 5. Known-answer cases — KA1–KA3 below.
 */
export const twoHundredKSpec: ExplorableSpec = {
  whatMustTheLearnerSee:
    "Part A (hidden capital mechanism) + light Part B. Hidden state on the canvas (A1): remaining cash, acres owned, acres planted, tons bought, and the $500 license — next to what they control (F8), not in a sidebar. Cost floors are not a shopping list; they appear as the $200k length is spent (A2). That confronts the misconception that $200k buys a Willamette vineyard/winery. One Part B prediction prompt after the graphic (not a definition card).",

  whatDoTheyManipulate:
    "The cash length itself (A4, F1, F12): three small-multiple stacks of the same $200k (F5). Door 1 — acres of land to buy and acres to plant (plant cannot exceed owned). Door 2 — tons of North Willamette Pinot noir (license auto-spends at tons > 0). Door 3 — no spend (labor/get hired). No Run/Calculate/Play button (A2). Not coupled: Portland rent, custom-crush $/ton, planted Dundee comps, frost, Van Duzer, varieties, Winkler, AVA personality, tasting-room buildout, cases from tons.",

  whatIsTheResponseSpace:
    "Three doors on one screen (F5, A3) so comparison is not in memory. Each door is a cash stack whose remaining length starts at $0 (F1). Allocating land, plant, or tons spends the bar immediately. Ghost the previous allocation when the learner moves a door (A3). Land+plant shows the $26,587/acre year-1 plant mark and the $45,000/acre land mark on the cash bar (F9), whether year-1 plant is possible, and year-3 yield = planted acres × 2.0 t/ac only if those acres were planted in year 1 (else 0). Grapes shows remaining, tons, license, and a crush-fee gap labeled unpublished (not a number). Labor shows $200k still in hand as runway; 0 acres, 0 tons, 0 brand; labor is 42% of AEB 0086 establishment cash (annotation, not a spend). Sources on the display (F11): OSU AEB 0086 (Dec 2025); OWB/UO 2025 grape prices, North Willamette Pinot noir avg; OLCC winery $500, fee schedule Rev 1.01.24. No legend (F8). No radius encodings. No Carto.",

  whatHappensAtTheExtremes:
    "0 acres / 0 tons: full $200k remains; no NaN (A6). Max land acres = floor(200000/45000) = 4; a 5th acre is refused and remaining stays $20,000. Max plant given 4 acres land and leftover $20,000 = 0 planted (leftover < $26,587.14 year-1 plant). Year-1 cash for the 20-acre AEB budget is $531,742.80, which is > $200,000, so that plant door is closed (and plant-without-land is closed because you cannot plant acres you do not own). Max tons = floor((200000−500)/2491) = 80; remaining after 80 t + $500 license = $220. The increment to 81 tons is refused. Negative cash is not allowed.",

  knownAnswerCases: [
    {
      description:
        "KA1 land-only: 4 acres × $45,000 = $180,000 remaining $20,000. Remaining < year-1 plant cost $26,587 so planted acres possible = 0.",
      expected: 20_000,
      unit: "USD remaining",
      tolerance: 1,
      source: {
        source:
          "OSU AEB 0086 Dec 2025, Jacobson, Murray Cordero, Sterns — land value assumption $45,000/acre and year-1 cash $26,587.14/acre (Table 5)",
        year: 2025,
        url: "https://appliedecon.oregonstate.edu/sites/agscid7/files/applied-economics/aeb_0086.pdf",
      },
    },
    {
      description:
        "KA2 plant-without-land: year-1 cash for 20 acres = 20 × $26,587.14 = $531,742.80 which is > $200,000 so this door is closed.",
      expected: 531_742.8,
      unit: "USD year-1 plant cash",
      tolerance: 1,
      source: {
        source:
          "OSU AEB 0086 Table 5 year-1 total cash $26,587.14/acre; 20-acre limited-mechanization Pinot noir, statewide Oregon",
        year: 2025,
        url: "https://appliedecon.oregonstate.edu/sites/agscid7/files/applied-economics/aeb_0086.pdf",
      },
    },
    {
      description:
        "KA3 grapes: 80 tons × $2,491 = $199,280; plus OLCC winery $500 = $199,780; remaining $220. 80 tons is the max that still clears $500 with remaining ≥ 0.",
      expected: 220,
      unit: "USD remaining",
      tolerance: 1,
      source: {
        source:
          "2025 Oregon Grape Pricing Report (OWB/UO IPRE, May 2026) North Willamette Pinot noir weighted average $2,491/ton; OLCC liquor license fees Rev 1.01.24 winery $500/year",
        year: 2026,
        url: "https://industry.oregonwine.org/wp-content/uploads/2025-Oregon-Grape-Pricing-Report.pdf",
      },
    },
  ],
};

/** Brief fields that also live on LessonFrontmatter. */
export const twoHundredKLessonIntent = {
  rubric:
    "Part A (hidden capital mechanism) + light Part B. The learner cannot see the cost floors until they allocate cash. One prediction prompt after the graphic.",
  whatTheLearnerWasSimulating:
    "Whether $200k from Portland is enough to own a Willamette vineyard/winery, as if land+plant+license were one purchase.",
  misconception: "$200k buys a vineyard/winery.",
  coupledVariables: [
    "remaining cash",
    "land acres",
    "planted acres (cannot exceed owned; year-1 plant is cash only)",
    "grape tons",
    "OLCC winery license when the grapes door is used",
  ],
  notInThisLesson: [
    "Portland rent",
    "custom-crush $/ton (unpublished)",
    "planted Dundee comps",
    "frost",
    "Van Duzer",
    "varieties",
    "Winkler",
    "AVA personality",
    "tasting-room buildout",
    "tons-to-cases",
    "full winery P&L",
  ],
} as const;

/** Spec arithmetic fixtures — same constants the model uses. */
export const twoHundredKKnownAnswerFixtures = {
  ka1LandAcres: 4,
  ka1LandCostUsd: 4 * LAND_USD_PER_ACRE,
  ka1RemainingUsd: STACK_USD - 4 * LAND_USD_PER_ACRE,
  ka2PlantAcres: AEB_BUDGET_ACRES,
  ka2Year1CashUsd: year1PlantCostUsd(AEB_BUDGET_ACRES),
  ka3Tons: 80,
  ka3GrapeCostUsd: 80 * NW_PINOT_USD_PER_TON,
  ka3LicenseUsd: OLCC_WINERY_USD,
  ka3RemainingUsd:
    STACK_USD - 80 * NW_PINOT_USD_PER_TON - OLCC_WINERY_USD,
  year1CashUsdPerAcre: YEAR1_CASH_USD_PER_ACRE,
} as const;
