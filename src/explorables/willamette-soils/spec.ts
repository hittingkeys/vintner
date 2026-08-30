import type { ExplorableSpec } from "../../schemas/spec";

/**
 * Beginner landing lesson. Tiny: parent material + depth to restriction.
 * No PAWS, vines, weather, age, irrigation, AVA personality, or wine flavors.
 *
 * Brief answers (also in lesson frontmatter):
 * 1. Rubric — Part A (hidden subsurface: parent material + depth to
 *    restriction; Part C soil texture / drainage). Two in-flow Part B
 *    prompts (prediction + comparison), not definition cards.
 * 2. What the learner was simulating — a wine-label list of soil names
 *    with no picture of a hole.
 * 3. Misconception — “soil type” is a tasting-note label, or that
 *    Willamette soils differ by drainage speed. Trap: drainage ≠
 *    water-holding ≠ rooting depth.
 * 4. Coupled variables — choosing a series sets parent material AND
 *    typical depth together. The only free control is a shared depth
 *    cursor across all pits.
 * 5. Known-answer cases — A, B, C below. Do not ship PAWS numbers.
 */
export const willametteSoilsSpec: ExplorableSpec = {
  whatMustTheLearnerSee:
    "Part A (hidden subsurface; Part C). Hidden state on the canvas (A1): three named typical pedons at once — what each formed from, the horizon at the shared depth, and whether that pit has hit a floor (paralithic Cr or hard bedrock) versus a material change that is not a floor (Laurelwood 2C). That confronts the misconception that series names are tasting-note labels, or that these soils differ by drainage speed. Jory and Willakenzie are both well drained with moderately slow permeability (OSD); drainage ≠ water-holding ≠ rooting depth. Two Part B prompts sit in the flow (prediction at 36 in; comparison Jory vs Laurelwood = parent material, not drainage).",

  whatDoTheyManipulate:
    "A shared depth cursor on the pits themselves (A4), 0–72 in, ruler in inches. Dragging the line asks the same depth of every described hole. Series are not sliders: choosing Jory, Willakenzie, or Laurelwood sets parent material and typical depths together. Nekia is a caption (same basalt family as Jory, moderately deep), not a fourth pit. No Run button (A2). No occupied-PAW, vine, weather, or age control.",

  whatIsTheResponseSpace:
    "Three pits as small multiples (A3): the full typical column is visible, so the Willakenzie Cr threshold versus Jory’s unrestricted clay versus Laurelwood’s 2C material change is readable without further scrubbing. The shared depth line is the current marker. Readout of what is here sits next to each pit, not in a tooltip. Willakenzie OSD range to paralithic (20–40 in) is a band around the typical Cr at 32 in — uncertainty as a band, not a fake single depth for every vineyard (Part D).",

  whatHappensAtTheExtremes:
    "Depth 0 in: surface of each typical pedon (Jory Ap, Willakenzie A, Laurelwood Ap); no floor. Depth 72 in: Willakenzie is in Cr (typical floor 32 in); Jory is still Bt3 clay (typical pedon clay to 100 in; floor deeper than 60 in); Laurelwood is in 2C (started at 52 in) and still not a bedrock floor (bedrock commonly more than 5 ft). The 72 in scale clips Jory’s described 100 in — caption that, do not invent a floor (A6).",

  knownAnswerCases: [
    {
      description:
        "Willakenzie typical pedon Cr at 32 in; OSD range to paralithic 20–40 in inclusive. At 36 in the cursor is in rock.",
      expected: 32,
      unit: "in",
      tolerance: 0,
      source: {
        source: "NRCS Official Soil Series Description, WILLAKENZIE (08/2006)",
        year: 2006,
        url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/W/WILLAKENZIE.html",
      },
    },
    {
      description:
        "Jory: depth to basalt or sediments over 60 in; typical pedon still clay at 100 in. At 60 in still soil. Floor deeper than 60 in.",
      expected: 100,
      unit: "in",
      tolerance: 0,
      source: {
        source: "NRCS Official Soil Series Description, JORY (06/2011)",
        year: 2011,
        url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/J/JORY.html",
      },
    },
    {
      description:
        "Laurelwood typical pedon nonconforming 2C starts at 52 in; bedrock commonly more than 5 ft. At 52 in material changes; at 60 in still not a bedrock floor.",
      expected: 52,
      unit: "in",
      tolerance: 0,
      source: {
        source: "NRCS Official Soil Series Description, LAURELWOOD (12/2006)",
        year: 2006,
        url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/L/LAURELWOOD.html",
      },
    },
  ],
};

/** Brief fields that also live on LessonFrontmatter. */
export const willametteSoilsLessonIntent = {
  rubric:
    "Part A (hidden subsurface: parent material + depth to restriction; Part C). Two in-flow Part B prompts: prediction (36 in floor) and comparison (Jory vs Laurelwood = parent material, not drainage). Not definition cards.",
  whatTheLearnerWasSimulating:
    "A wine-label list of soil names with no picture of a hole.",
  misconception:
    "“Soil type” is a tasting-note label, or Willamette soils differ by drainage speed. Trap: drainage ≠ water-holding ≠ rooting depth.",
  coupledVariables: [
    "parent material (set by series)",
    "typical depth to restriction (set by series)",
  ],
  freeControl: "shared depth cursor across all pits (0–72 in)",
  notInThisLesson: [
    "occupied PAW",
    "vine",
    "weather",
    "age slider",
    "irrigation",
    "dry-farming",
    "minerality",
    "wine flavors",
    "AVA personality",
    "Van Duzer",
  ],
} as const;
