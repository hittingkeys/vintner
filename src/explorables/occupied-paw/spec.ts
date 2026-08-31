import type { ExplorableSpec } from "../../schemas/spec";

/**
 * First learner-facing explorable.
 *
 * Brief answers (also in lesson frontmatter):
 * 1. Rubric — Part A (soil water holding / invisible subsurface; Part C).
 *    Light Part B: exactly one comparison prompt after a short passage.
 * 2. What the learner was simulating — remaining plant-available water in the
 *    occupied root zone through a typical northern Willamette dry summer,
 *    given profile storage they cannot see and rooting depth (age) they
 *    cannot see, capped by a paralithic/lithic contact (Cr).
 * 3. Misconception — dry-farming is a farming style; a vine dry-farms or
 *    does not in the abstract. Related: terroir as a list of names.
 * 4. Coupled variables — profile PAWS × occupied rooting depth (age, capped
 *    by Cr) × the same typical-year weather. Optional: deficit drip that
 *    fires when Dr > RAW (p = 0.45). Not coupled: drainage class, frost,
 *    wind, canopy, variety, full ET irrigation.
 * 5. Known-answer cases — A, B, C below. Do not invent leftover-mm from a
 *    fake ETc.
 */
export const occupiedPawSpec: ExplorableSpec = {
  whatMustTheLearnerSee:
    "Part A (soil water / invisible subsurface; Part C). Hidden state that must sit on the canvas (A1): occupied TAW, remaining occupied PAW, Dr vs RAW vs TAW, Cr on Willakenzie, and the shared typical-year demand. That confronts the misconception that dry-farming is a style/virtue you choose, or that terroir is a list of series names. A vine does not dry-farm in the abstract — fate is plant-available water in the occupied root zone. Two Part B prompts follow the explorable (which block, then why) — not a definition card.",

  whatDoTheyManipulate:
    "The soil profile is the control (A4): drag the occupied-rooting-depth boundary on each pit. Young and Established are labeled stops on that depth axis (16 in / 60 in established, Willakenzie capped at Cr). Cr is a physical cap on the Willakenzie column, not a dropdown in another panel. Year-1 extractable depth in cm is TODO:UNVERIFIED — caption the unverified young stop; do not use a fake FAO Zr 1–2 m midpoint. Shared typical-year demand lives on the response-curve axis (same weather on both blocks) because it is not a soil property — justified separation (A4). Deficit drip is a per-block toggle on the water column / RAW line (irrigate when Dr > RAW, replace only enough to keep Dr ≤ RAW). No Run/Calculate button (A2).",

  whatIsTheResponseSpace:
    "Remaining occupied PAW versus the same seasonal demand (A3): two traces (Jory, Willakenzie) labeled on the traces at demand=0 (F8), plus a drip-floor ghost and an age ghost at the other preset depth (F5) so Young ↔ Established does not overwrite. Current demand is a marker on that axis; shared demand is printed in inches and centimetres (A1). Jory occupied TAW is a sourced range 25–41 cm (default map unit 25 cm; other MUs 27, 31, 41 cm) drawn as an uncertainty band — do not collapse to a fake typical. Deficit-drip ghosts floor remaining at (1 − p) × occupied TAW. Sources on the graphic (F11). The two pits are the concrete blocks; the curves are the general relationship in the same gesture (A5).",

  whatHappensAtTheExtremes:
    "Occupied depth → 0: no reservoir, remaining 0, stall, no NaN (A6). Willakenzie roots against Cr: occupied TAW = profile PAWS 15 cm; water below Cr is not used. Jory roots past 60 in: SoilWeb PAWS is 0–60 in, so occupied TAW stays at the sourced profile PAWS (25 cm default; band 25–41) — no invented storage below 60 in. Demand → 0: remaining = occupied TAW. Demand at the alfalfa ETr envelope (ARAO 24.02 in / FOGO 25.61 in, upper envelope not crop ET): dry-farm reservoirs empty if demand exceeds occupied TAW. Deficit drip at those extremes: remaining stays at RAW floor when TAW > 0; young + drip still lives if occupied TAW > 0. Empty and full states render as true states, not clipped geometry.",

  knownAnswerCases: [
    {
      description:
        "Established Willakenzie occupying to Cr: occupied TAW equals profile PAWS.",
      expected: 15,
      unit: "cm",
      tolerance: 0.5,
      source: {
        source:
          "SoilWeb SSURGO PAWS, mukeys 2711396, 85310, 62429 (Willakenzie)",
        year: 2011,
        url: "https://casoilresource.lawr.ucdavis.edu/gmap/",
      },
    },
    {
      description:
        "Established Jory occupying unrestricted >60 in, default map unit silty clay loam 2–12% (or637 mukeys 62713–15): occupied TAW. UI must also show sourced range 25–41 cm (other MUs 27, 31, 41 cm).",
      expected: 25,
      unit: "cm",
      tolerance: 0.5,
      source: {
        source:
          "SoilWeb SSURGO PAWS, or637 mukeys 62713–15 (Jory default 25 cm; other MUs 27, 31, 41 cm; range 25–41 cm)",
        year: 2011,
        url: "https://casoilresource.lawr.ucdavis.edu/gmap/",
      },
    },
    {
      description:
        "FAO-56 wine-grape RAW fraction p: irrigation-indicated when depletion fraction of occupied TAW exceeds p.",
      expected: 0.45,
      unit: "fraction",
      tolerance: 0.02,
      source: {
        source: "Allen, Pereira, Raes, Smith. FAO Irrigation and Drainage Paper 56, Table 22",
        year: 1998,
        url: "https://www.fao.org/4/x0490e/x0490e0e.htm#depletion",
      },
    },
  ],
};

/** Brief fields that also live on LessonFrontmatter. */
export const occupiedPawLessonIntent = {
  rubric:
    "Part A (soil water holding / invisible subsurface; Part C). Light Part B: two retrieval prompts after the explorable, which-block then why (not definition).",
  whatTheLearnerWasSimulating:
    "Remaining plant-available water in the occupied root zone through a typical northern Willamette dry summer, given profile storage they cannot see and rooting depth (age) they cannot see, capped by Cr.",
  misconception:
    "Dry-farming is a farming style; a vine dry-farms or does not in the abstract. Related: terroir as a list of names.",
  coupledVariables: [
    "profile PAWS",
    "occupied rooting depth (age, capped by Cr)",
    "typical-year weather (shared)",
    "deficit drip when Dr > RAW (p = 0.45)",
  ],
  notCoupled: [
    "drainage class",
    "frost",
    "wind",
    "canopy",
    "variety heat-bill",
    "full ET irrigation",
  ],
} as const;
