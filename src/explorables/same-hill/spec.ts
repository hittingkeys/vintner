import type { ExplorableSpec } from "../../schemas/spec";
import {
  FROST_CLASS,
  JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT,
  PENNER_ASH_FROST_HOURS_PCT,
  RLC_POCKET_THRESHOLD,
  SLOPE_BAND,
  SOLAR_CLASS,
} from "./constants";

/**
 * Beginner lesson: same hill, sun vs frost as two geometries.
 *
 * Brief answers (also in lesson frontmatter):
 * 1. Rubric — Part A (A1–A6) plus Part F on the graphic (F1, F2, F4, F5,
 *    F8, F9, F11, F12) and Part E question 4 (compared to what?). One
 *    in-flow Part B prompt (prediction/cause, not a definition card)
 *    after the board.
 * 2. What the learner was simulating — that “south-facing” is one knob that
 *    also means frost-safe.
 * 3. Misconception — south-facing = the warm, frost-safe site. Facing ranks
 *    solar receipt; frost hours concentrate in topographic lows.
 * 4. Coupled — pin position on the hill sets facing, slope band, solar class,
 *    and frost class together. Solar is a function of aspect; frost is a
 *    function of relative lowness / concavity, not aspect.
 * 5. Known-answer cases — below. Ordinal solar classes; frost pocket vs
 *    drained; 81% is a sourced logger caption, not a modeled percentage.
 */
export const sameHillSpec: ExplorableSpec = {
  whatMustTheLearnerSee:
    "Part A (A1–A6) and Part F. Hidden state on the canvas (A1, F2), not a tooltip: current facing (16-wind), slope band (<1% / 5–15% / steeper), solar class (ordinal), and frost class (pocket vs drained) — labeled in the data region (F8), quieter in a one-line readout, not a legend. Comparison is on screen unaided (F9, E4): solar class vs the full aspect ring (highest SSE–SSW against less N/NW/NE); frost class vs the hill profile pocket. That confronts the misconception that south-facing is the same knob as frost-safe. One Part B cause prompt sits after the board (not a definition card).",

  whatDoTheyManipulate:
    "The pin on the hill itself (A4): drag it on the plan view. Radius and bearing are the same quantity — position on the schematic — not a sidebar of climate layers. No Run/Calculate/Play button (A2). Not coupled: occupied PAW, vine, weather year, Van Duzer, Winkler/GDD, variety, AVA, minerality, irrigation, wine style, Carto tiles, soils Leaflet map.",

  whatIsTheResponseSpace:
    "The form is a hill plus aspect ring (F12), not a chart-library bar or pie. Two geometries carry the space (A3, F4, F5): (1) an equal-thickness sun-rank ring — ordinal class by aspect, tick at current facing; a lone “highest” label is a fail (F9); (2) a hill profile where cold air fills the concave/floor up to the RLC = 0.4 contour. Ring thickness/pin radius do not encode class (F1). Ghost pin is a supplement, not the only comparison (F5). Sources on the canvas (F11): Jones Umpqua GIS; 10° south vs a flat site up to 25% more insolation (not south vs north); Penner-Ash 2014 RLC < 0.4 = 81% of frost hours; EM 8973 frost pockets via air drainage. 81% is a sourced caption, not 81.00. No legend component (F8).",

  whatHappensAtTheExtremes:
    "Pin at ridge/summit: drained (high relative elevation); facing may be ridge / unranked; no NaN (A6). Pin at floor/trough: frost class = pocket at any facing, including south. Pin full north, mid-slope: solar class less; frost still drained. Pin SSE–SSW, mid-slope: solar highest; frost drained. Slope band <1% on the apron (Jones poor cold-air drainage) and steeper than 15% on the inner trough wall. The pocket fill is not clipped off the profile. A south-face pin in the trough does not un-frost the trough.",

  knownAnswerCases: [
    {
      description:
        "SSE–SSW + mid-slope (5–15%): highest solar class (ordinal code 2). Jones et al., Geoscience Canada 31:167–178 (2004) aspect ranking.",
      expected: SOLAR_CLASS.highest,
      unit: "solar-class (0 less, 1 more, 2 highest)",
      tolerance: 0,
      source: {
        source:
          "Jones, Snead, Nelson. Geology and Wine 8. Modeling Viticultural Landscapes: A GIS Analysis of the Terroir Potential in the Umpqua Valley of Oregon. Geoscience Canada 31:167–178",
        year: 2004,
        url: "https://journals.lib.unb.ca/index.php/GC/article/view/2779",
      },
    },
    {
      description:
        "SSE–SSW + mid-slope (5–15%): frost class = drained / not pocket. Jones 2004 preferred slopes 5–15%.",
      expected: FROST_CLASS.drained,
      unit: "frost-class (0 drained, 1 pocket)",
      tolerance: 0,
      source: {
        source:
          "Jones, Snead, Nelson. Geoscience Canada 31:167–178 — slopes 5–15% preferred; <1% poor cold-air drainage",
        year: 2004,
        url: "https://journals.lib.unb.ca/index.php/GC/article/view/2779",
      },
    },
    {
      description:
        "N or NW or NE + same mid-slope band: lower solar class than SSE–SSW (ordinal 0). Jones & Duff cool-climate text (Olympic Peninsula report): northwest, north, and northeast tending sites delayed phenology, lower sunlight and heat receipt.",
      expected: SOLAR_CLASS.less,
      unit: "solar-class (0 less, 1 more, 2 highest)",
      tolerance: 0,
      source: {
        source:
          "Jones, G.V. and Duff, A.A. The Climate and Landscape Potential for Wine Production in the North Olympic Peninsula Region of Washington",
        year: 2007,
        url: "http://olympiccellars.com/wp-content/uploads/2014/11/grapestudypt1.pdf",
      },
    },
    {
      description:
        "Topographic low / floor / RLC-like concave, any facing: frost class = pocket. Penner-Ash & Pogue 2014: no air-temperature–aspect correlation; RLC < 0.4 accounted for 81% of frost hours.",
      expected: FROST_CLASS.pocket,
      unit: "frost-class (0 drained, 1 pocket)",
      tolerance: 0,
      source: {
        source:
          "Penner-Ash, C. and Pogue, K.R. Geomorphic controls on air temperature variation in the northern Willamette Valley American Viticultural Area. GSA Abstracts with Programs 46(6):464",
        year: 2014,
        url: "https://gsa.confex.com/gsa/2014AM/webprogram/Paper244618.html",
      },
    },
    {
      description:
        "When the pin is in the low, display 81% of frost hours as a sourced caption (not a modeled 81.00). Penner-Ash & Pogue 2014: RLC < 0.4 accounted for 81% of frost hours.",
      expected: PENNER_ASH_FROST_HOURS_PCT,
      unit: "% of study frost hours (caption)",
      tolerance: 0,
      source: {
        source:
          "Penner-Ash, C. and Pogue, K.R. GSA Abstracts with Programs 46(6):464 — RLC < 0.4 accounted for 81% of frost hours (24 loggers / 12 northern WV vineyards)",
        year: 2014,
        url: "https://gsa.confex.com/gsa/2014AM/webprogram/Paper244618.html",
      },
    },
    {
      description:
        "Slope <1% (flat apron): poor cold-air drainage band. Jones 2004.",
      expected: SLOPE_BAND.flat,
      unit: "slope-band (0 <1%, 1 1–5%, 2 5–15%, 3 steeper)",
      tolerance: 0,
      source: {
        source:
          "Jones, Snead, Nelson. Geoscience Canada 31:167–178 — slopes categorized from <1% (flat, poor cold-air drainage) to >30% not viable; 5–15% preferred",
        year: 2004,
        url: "https://journals.lib.unb.ca/index.php/GC/article/view/2779",
      },
    },
    {
      description:
        "Optional caption: 10° south vs a FLAT site ↔ up to 25% more insolation. Jones & Duff. Must not appear as south vs north.",
      expected: JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT,
      unit: "% more insolation than a flat site (caption)",
      tolerance: 0,
      source: {
        source:
          "Jones, G.V. and Duff, A.A. The Climate and Landscape Potential for Wine Production in the North Olympic Peninsula Region of Washington — a 10 degree south-facing slope can receive as much as 25% more insolation than a flat site",
        year: 2007,
        url: "http://olympiccellars.com/wp-content/uploads/2014/11/grapestudypt1.pdf",
      },
    },
    {
      description:
        "Penner-Ash relative-lowness coefficient pocket threshold used as the schematic frost contour (not a Willamette DEM RLC).",
      expected: RLC_POCKET_THRESHOLD,
      unit: "RLC (dimensionless)",
      tolerance: 0,
      source: {
        source:
          "Penner-Ash, C. and Pogue, K.R. GSA Abstracts with Programs 46(6):464 — sites with RLC of less than 0.4",
        year: 2014,
        url: "https://gsa.confex.com/gsa/2014AM/webprogram/Paper244618.html",
      },
    },
  ],
};

/** Brief fields that also live on LessonFrontmatter. */
export const sameHillLessonIntent = {
  rubric:
    "Part A (A1–A6) and Part F (F1 equal-thickness ring, F2 quiet readout, F4 ring+profile carry the space, F5 comparison without memory, F8 labels in the data, F9 compared-to-what on screen, F11 sources on canvas, F12 hill+ring not a pie). Part E4: the graphic answers compared to what? unaided. One in-flow Part B cause prompt after the board. Anti-pastiche (Part D): no legend, no dashboard of extra climate layers, no hover-only state, no faux-precision GDD.",
  whatTheLearnerWasSimulating:
    "That south-facing is the same knob as frost-safe — one ranking that decides both solar receipt and frost hours.",
  misconception:
    "South-facing is the warm, frost-safe site. Facing ranks solar receipt; frost hours concentrate in topographic lows (air drainage), including on a south face if that face sits in a pocket.",
  coupledVariables: [
    "pin position on the hill (facing + slope + relative lowness)",
    "solar class (from aspect, ordinal)",
    "frost class (from relative lowness / concavity, not aspect)",
  ],
  notInThisLesson: [
    "occupied PAW",
    "vine",
    "weather year",
    "Van Duzer / gap wind",
    "Winkler/GDD engine",
    "grape varieties",
    "AVA blobs",
    "minerality",
    "irrigation",
    "wine style",
    "Carto tiles",
    "soils Leaflet map",
    "mapped acres",
  ],
} as const;
