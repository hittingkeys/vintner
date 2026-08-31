import type { ExplorableSpec } from "../../schemas/spec";

/**
 * Beginner landing lesson: valley position + three typical pedons.
 * Same three named soils sit on different landforms because that is
 * where their parent materials are. Not “everywhere Pinot is planted.”
 * Not AVA personality. Not wine style.
 *
 * Brief answers (also in lesson frontmatter):
 * 1. Rubric — Part A spatial (show the space) + keep the existing Part A
 *    pits. One new in-flow Part B prompt (prediction/cause, not a
 *    definition card), plus the existing 36 in / Jory-vs-Laurelwood prompts.
 * 2. Head simulation — a list of soil names (or AVA names) with no picture
 *    of where in the valley they sit.
 * 3. Misconception — these series occur everywhere in the Willamette, or
 *    Dundee=Jory / Ribbon Ridge=Willakenzie as the map. Trap: do not draw
 *    fake soil-survey polygons or AVA blobs. Related pit trap: drainage ≠
 *    water-holding ≠ rooting depth.
 * 4. Coupled — choosing a landform belt (or type-location pin) selects the
 *    matching series/pit. Series still sets parent material + typical depth
 *    together. Floor click is the contrast: not these three.
 * 5. Known-answer cases — pit depths A–C and OSD elevation cases below.
 *    Caption the map as OSD geographic setting, not a soil survey.
 */
export const willametteSoilsSpec: ExplorableSpec = {
  whatMustTheLearnerSee:
    "Part A spatial (show the space) plus the existing Part A pits. Hidden state on the canvas (A1): a N–S schematic of the Willamette trough — surrounding foothills (Jory, including that the series is also in the Umpqua), western-margin hills (Willakenzie on Spencer), a smaller eastern/southern-margin mark (Willakenzie on Eugene and Fisher), northwest-margin hills (Laurelwood only), and a clickable valley floor that is not these three — together with three named typical pedons (parent material, horizon at the shared depth, floor vs Laurelwood 2C). That confronts the misconception that series names are a tasting-note list with no geography, that these series occur everywhere in the Willamette, or that Dundee=Jory / Ribbon Ridge=Willakenzie is the map. Trap: belts are OSD wording, not survey polygons or AVA blobs. One new Part B prompt (prediction/cause: Willakenzie landform + Spencer) sits immediately after the map passage; the existing 36 in and Jory-vs-Laurelwood prompts remain.",

  whatDoTheyManipulate:
    "A landform belt or type-location pin on the schematic (A4). Choosing a belt or pin selects the matching series and highlights that pit. Series still sets parent material and typical depth together. Floor click is the contrast: not these three. The shared depth cursor on the pits (0–72 in) still asks the same depth of every described hole. Nekia stays a caption (same basalt family as Jory, moderately deep), not a fourth pit and not a region. No Run button (A2). No occupied-PAW, vine, weather, age, Winkler, frost, Van Duzer, rot, minerality, irrigation, or AVA-as-personality control.",

  whatIsTheResponseSpace:
    "The schematic is the space (A3): all three belts remain visible with nothing selected, so Jory-surrounding vs Willakenzie-margin vs Laurelwood-northwest vs floor is readable without further clicking. Type-location pins (OSD lat/lon, NAD27) are the only point-accurate features. The current marker is the selected belt or pin; readout of where / parent material / type location county sits on the canvas next to the map, not in a tooltip. Three pits remain small multiples of the typical column. Caption: OSD geographic setting, not a soil survey. Uncertainty on the canvas: belts follow OSD wording — not survey polygons (Part D).",

  whatHappensAtTheExtremes:
    "Nothing selected: all three belts still show; no pit is highlighted. Valley-floor click: distinct floor state — none of the three series; no pit highlighted as if it were Jory; OSU hillside vs floor contrast (younger mollisols on lower terraces and floors). Jory selected: Umpqua caption is visible so learners do not think Jory is Willamette-only; do not draw a second Umpqua map. Depth 0 in: surface of each typical pedon; no floor. Depth 72 in: Willakenzie in Cr; Jory still Bt3 clay; Laurelwood in 2C, not bedrock. The 72 in scale clips Jory’s described 100 in — caption that, do not invent a floor (A6).",

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
    {
      description:
        "Willakenzie on western margins (Spencer Formation): elevation 200 feet (OSD geographic setting, not a soil survey).",
      expected: 200,
      unit: "ft",
      tolerance: 0,
      source: {
        source: "NRCS Official Soil Series Description, WILLAKENZIE (08/2006)",
        year: 2006,
        url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/W/WILLAKENZIE.html",
      },
    },
    {
      description:
        "Willakenzie on western margins (Spencer Formation): elevation 900 feet (OSD geographic setting, not a soil survey).",
      expected: 900,
      unit: "ft",
      tolerance: 0,
      source: {
        source: "NRCS Official Soil Series Description, WILLAKENZIE (08/2006)",
        year: 2006,
        url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/W/WILLAKENZIE.html",
      },
    },
    {
      description:
        "Willakenzie on eastern margins, southern portion (Eugene and Fisher Formations): elevation 300 feet (OSD geographic setting, not a soil survey).",
      expected: 300,
      unit: "ft",
      tolerance: 0,
      source: {
        source: "NRCS Official Soil Series Description, WILLAKENZIE (08/2006)",
        year: 2006,
        url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/W/WILLAKENZIE.html",
      },
    },
    {
      description:
        "Willakenzie on eastern margins, southern portion (Eugene and Fisher Formations): elevation 1,400 feet (OSD geographic setting, not a soil survey).",
      expected: 1400,
      unit: "ft",
      tolerance: 0,
      source: {
        source: "NRCS Official Soil Series Description, WILLAKENZIE (08/2006)",
        year: 2006,
        url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/W/WILLAKENZIE.html",
      },
    },
  ],
};

/** Brief fields that also live on LessonFrontmatter. */
export const willametteSoilsLessonIntent = {
  rubric:
    "Part A spatial (show the space) + keep the existing Part A pits. One new in-flow Part B prompt (prediction/cause: Willakenzie landform + Spencer Formation), not a definition card. Existing 36 in prediction and Jory-vs-Laurelwood comparison remain.",
  whatTheLearnerWasSimulating:
    "A list of soil names (or AVA names) with no picture of where in the valley they sit.",
  misconception:
    "These series occur everywhere in the Willamette, or Dundee=Jory / Ribbon Ridge=Willakenzie as the map. Trap: do not draw fake soil-survey polygons or AVA blobs. Related: “soil type” is a tasting-note label, or Willamette soils differ by drainage speed. Drainage ≠ water-holding ≠ rooting depth.",
  coupledVariables: [
    "landform belt / type-location pin (selects matching series/pit)",
    "parent material (set by series)",
    "typical depth to restriction (set by series)",
  ],
  freeControl: "shared depth cursor across all pits (0–72 in)",
  floorContrast: "valley-floor click is not these three hillside series",
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
    "Winkler",
    "frost",
    "grape varieties",
    "mapped acreages",
  ],
} as const;
