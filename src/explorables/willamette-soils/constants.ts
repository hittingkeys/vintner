/**
 * USDA NRCS Official Soil Series Descriptions. One described pit each,
 * not every vineyard. No PAWS numbers in this lesson.
 */

export const DEPTH_MIN_IN = 0;
export const DEPTH_MAX_IN = 72;

/** Surface of the described pits. Not a sourced “typical observation depth.” */
export const DEFAULT_DEPTH_IN = 0;

/** NRCS OSD WILLAKENZIE (08/2006): typical pedon Cr at 32 in. */
export const WILLAKENZIE_CR_TYPICAL_IN = 32;

/** OSD range to paralithic contact, inclusive. */
export const WILLAKENZIE_CR_RANGE_IN = { min: 20, max: 40 } as const;

/**
 * NRCS OSD JORY (06/2011): depth to basalt or sediments over 60 in;
 * typical pedon Bt3 dark red clay 48–100 in.
 */
export const JORY_FLOOR_DEEPER_THAN_IN = 60;
export const JORY_TYPICAL_CLAY_TO_IN = 100;

/** NRCS OSD LAURELWOOD (12/2006): nonconforming 2C starts at 52 in. */
export const LAURELWOOD_2C_START_IN = 52;

/** OSD: bedrock commonly more than 5 ft. Not a floor at 60 in on this scale. */
export const LAURELWOOD_BEDROCK_COMMONLY_MORE_THAN_FT = 5;
export const LAURELWOOD_BEDROCK_COMMONLY_MORE_THAN_IN =
  LAURELWOOD_BEDROCK_COMMONLY_MORE_THAN_FT * 12;

/**
 * NRCS OSD NEKIA (07/2006): caption only, not a fourth pit.
 * Moderately deep, same basalt family as Jory, 20–40 in to hard bedrock,
 * typical R at 36 in.
 */
export const NEKIA_R_TYPICAL_IN = 36;
export const NEKIA_BEDROCK_RANGE_IN = { min: 20, max: 40 } as const;

export const OSD_JORY = {
  source: "NRCS Official Soil Series Description, JORY",
  monthYear: "06/2011",
  year: 2011,
  url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/J/JORY.html",
} as const;

export const OSD_WILLAKENZIE = {
  source: "NRCS Official Soil Series Description, WILLAKENZIE",
  monthYear: "08/2006",
  year: 2006,
  url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/W/WILLAKENZIE.html",
} as const;

export const OSD_LAURELWOOD = {
  source: "NRCS Official Soil Series Description, LAURELWOOD",
  monthYear: "12/2006",
  year: 2006,
  url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/L/LAURELWOOD.html",
} as const;

export const OSD_NEKIA = {
  source: "NRCS Official Soil Series Description, NEKIA",
  monthYear: "07/2006",
  year: 2006,
  url: "https://soilseries.sc.egov.usda.gov/OSD_Docs/N/NEKIA.html",
} as const;
