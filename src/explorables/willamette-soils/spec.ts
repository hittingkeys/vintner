import type { ExplorableSpec } from "../../schemas/spec";

/**
 * Beginner landing lesson: valley position + three typical pedons.
 * Same three named soils sit on different landforms because that is
 * where their parent materials are. Not “everywhere Pinot is planted.”
 * Not AVA personality. Not wine style.
 *
 * Brief answers (also in lesson frontmatter):
 * 1. Rubric — Part A spatial (show the space) + keep the existing Part A
 *    pits. One in-flow Part B prompt (prediction/cause, not a
 *    definition card), plus the existing 36 in / Jory-vs-Laurelwood prompts.
 * 2. Head simulation — a list of soil names (or AVA names) with no picture
 *    of where in the valley they sit.
 * 3. Misconception — these series occur everywhere in the Willamette, or
 *    Dundee=Jory / Ribbon Ridge=Willakenzie as the map. Trap: do not draw
 *    AVA blobs. Related pit trap: drainage ≠ water-holding ≠ rooting depth.
 * 4. Coupled — clicking a SoilWeb series extent or an OSD type-location pin
 *    selects the matching series/pit. Series still sets parent material +
 *    typical depth together. Floor click (trough, none of the three hit)
 *    is the contrast: not these three.
 * 5. Known-answer cases — pit depths A–C and OSD elevation cases below.
 *    Caption the map as SoilWeb generalized SSURGO extent + OSD pins, not
 *    a soil survey you can site from.
 */
export const willametteSoilsSpec: ExplorableSpec = {
  whatMustTheLearnerSee:
    "Part A spatial (show the space) plus the existing Part A pits. Hidden state on the canvas (A1): a real geographic map of the Willamette Valley (initial view Portland–Eugene, not all of Oregon) with three SoilWeb generalized SSURGO series extents (Jory, including the Umpqua tail in the GeoJSON; Willakenzie along the margins; Laurelwood northwest only) and OSD type-location pins — together with three named typical pedons (parent material, horizon at the shared depth, floor vs Laurelwood 2C). Clicking the trough where none of the three hit is the valley-floor contrast. That confronts the misconception that series names are a tasting-note list with no geography, that these series occur everywhere in the Willamette, or that Dundee=Jory / Ribbon Ridge=Willakenzie is the map. Trap: colored regions are generalized series extent, not map-unit polygons you can site a vineyard from, and not AVA blobs. Landform and formation prompts (B2) sit after “Where the names sit” and before the sentence that names Spencer / western margins (B3); the 36 in and Jory-vs-Laurelwood prompts sit immediately after the explorable (B1).",

  whatDoTheyManipulate:
    "The map itself (A4): pan/zoom, click a colored series extent, or click an OSD type-location pin. Choosing an extent or pin selects the matching series and highlights that pit. Willakenzie clicks south of 44.3°N and east of −123.05° use a teaching split from OSD wording (Eugene/Fisher vs Spencer), not a formation map. Floor click (Willamette trough, none of the three extents) is the contrast: not these three. The shared depth cursor on the pits (0–72 in) is the SVG depth line (A4); the range input is visually hidden for AT. Nekia stays a caption (same basalt family as Jory, moderately deep), not a fourth pit and not a region. No Run button (A2). No occupied-PAW, vine, weather, age, Winkler, frost, Van Duzer, rot, minerality, irrigation, or AVA-as-personality control.",

  whatIsTheResponseSpace:
    "The map is the space (A3): all three series extents remain visible with nothing selected, so Jory vs Willakenzie vs Laurelwood vs the uncolored trough is readable without further clicking. Type-location pins (OSD lat/lon, NAD27 plotted on the WGS84 basemap, ~100 m) are the only point-accurate features. The current marker is the selected extent or pin; readout of where / parent material / type location county sits on the canvas next to the map, not in a tooltip. Three pits remain small multiples of the typical column. Caption on the canvas: basemap Esri World Topo (attribution); colored regions are SoilWeb generalized SSURGO series extent (UC Davis), not a soil survey you can site from, not AVA blobs; pins are NRCS OSD type locations. Grid size differs by series (Jory 0.005°, others 0.001°). Uncertainty on the canvas, not a hover (Part D).",

  whatHappensAtTheExtremes:
    "Nothing selected: all three extents still show in the Willamette view; no pit is highlighted. Zoom out far enough and Jory’s Umpqua tail is still in the Jory layer. Valley-floor click: distinct floor state — none of the three series; no pit highlighted as if it were Jory; OSU hillside vs floor contrast (younger mollisols on lower terraces and floors). Jory selected: Umpqua caption is visible so learners do not think Jory is Willamette-only. Missing tiles / offline: polygons and pins remain (GeoJSON is local); blank tiles are acceptable. Depth 0 in: surface of each typical pedon; no floor. Depth 72 in: Willakenzie in Cr; Jory still Bt3 clay; Laurelwood in 2C, not bedrock. The 72 in scale clips Jory’s described 100 in — caption that, do not invent a floor (A6).",

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
    "series extent / type-location pin (selects matching series/pit)",
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
