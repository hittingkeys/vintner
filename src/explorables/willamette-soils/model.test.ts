import { describe, expect, it } from "vitest";
import {
  JORY_FLOOR_DEEPER_THAN_IN,
  JORY_TYPICAL_CLAY_TO_IN,
  LAURELWOOD_2C_START_IN,
  LAURELWOOD_BEDROCK_COMMONLY_MORE_THAN_IN,
  NEKIA_BEDROCK_RANGE_IN,
  NEKIA_R_TYPICAL_IN,
  WILLAKENZIE_CR_RANGE_IN,
  WILLAKENZIE_CR_TYPICAL_IN,
} from "./constants";
import { willametteSoilsSpec } from "./spec";
import {
  JORY,
  LAURELWOOD,
  PITS,
  WILLAKENZIE,
  hasHitFloor,
  horizonAt,
  isInWillakenzieCrRange,
  materialChangedAt,
  readoutAt,
} from "./model";

describe("known-answer cases (OSD typical pedons)", () => {
  it("Willakenzie typical Cr at 32 in; range 20–40 inclusive; at 36 in in rock", () => {
    const { expected, tolerance, unit } = willametteSoilsSpec.knownAnswerCases[0];
    expect(unit).toBe("in");
    expect(WILLAKENZIE_CR_TYPICAL_IN).toBe(expected);
    expect(Math.abs(WILLAKENZIE_CR_TYPICAL_IN - expected)).toBeLessThanOrEqual(
      tolerance,
    );
    expect(horizonAt(WILLAKENZIE, 32).name).toBe("Cr");
    expect(horizonAt(WILLAKENZIE, 31).name).toBe("Bt2");
    expect(isInWillakenzieCrRange(20)).toBe(true);
    expect(isInWillakenzieCrRange(40)).toBe(true);
    expect(isInWillakenzieCrRange(19)).toBe(false);
    expect(isInWillakenzieCrRange(41)).toBe(false);
    expect(WILLAKENZIE_CR_RANGE_IN).toEqual({ min: 20, max: 40 });
    expect(hasHitFloor(WILLAKENZIE, 36)).toBe(true);
    expect(readoutAt(WILLAKENZIE, 36).hitFloor).toBe(true);
    expect(readoutAt(WILLAKENZIE, 36).horizonName).toBe("Cr");
  });

  it("Jory typical pedon still clay at 100 in; at 60 in still soil; floor deeper than 60", () => {
    const { expected, tolerance, unit } = willametteSoilsSpec.knownAnswerCases[1];
    expect(unit).toBe("in");
    expect(JORY_TYPICAL_CLAY_TO_IN).toBe(expected);
    expect(Math.abs(JORY_TYPICAL_CLAY_TO_IN - expected)).toBeLessThanOrEqual(
      tolerance,
    );
    expect(horizonAt(JORY, 60).name).toBe("Bt3");
    expect(horizonAt(JORY, 60).texture).toBe("dark red clay");
    expect(hasHitFloor(JORY, 60)).toBe(false);
    expect(hasHitFloor(JORY, 72)).toBe(false);
    expect(JORY_FLOOR_DEEPER_THAN_IN).toBe(60);
    expect(JORY_TYPICAL_CLAY_TO_IN).toBeGreaterThan(JORY_FLOOR_DEEPER_THAN_IN);
    expect(readoutAt(JORY, 60).hitFloor).toBe(false);
    expect(readoutAt(JORY, 60).floorLabel).toMatch(/still soil/i);
  });

  it("Laurelwood 2C starts at 52 in typical; at 60 in still not bedrock floor", () => {
    const { expected, tolerance, unit } = willametteSoilsSpec.knownAnswerCases[2];
    expect(unit).toBe("in");
    expect(LAURELWOOD_2C_START_IN).toBe(expected);
    expect(Math.abs(LAURELWOOD_2C_START_IN - expected)).toBeLessThanOrEqual(
      tolerance,
    );
    expect(horizonAt(LAURELWOOD, 51).name).toBe("Bt");
    expect(horizonAt(LAURELWOOD, 52).name).toBe("2C");
    expect(materialChangedAt(LAURELWOOD, 52)).toBe(true);
    expect(hasHitFloor(LAURELWOOD, 52)).toBe(false);
    expect(hasHitFloor(LAURELWOOD, 60)).toBe(false);
    expect(LAURELWOOD_BEDROCK_COMMONLY_MORE_THAN_IN).toBe(60);
    expect(readoutAt(LAURELWOOD, 52).materialChanged).toBe(true);
    expect(readoutAt(LAURELWOOD, 60).hitFloor).toBe(false);
    expect(readoutAt(LAURELWOOD, 60).floorLabel).toMatch(/not a bedrock floor/i);
  });
});

describe("drainage and permeability (OSD)", () => {
  it("Jory, Willakenzie, and Nekia caption are well drained", () => {
    expect(JORY.drainage).toBe("well drained");
    expect(WILLAKENZIE.drainage).toBe("well drained");
    expect(LAURELWOOD.drainage).toBe("well drained");
  });

  it("Jory and Willakenzie moderately slow; Laurelwood moderate", () => {
    expect(JORY.permeability).toBe("moderately slow");
    expect(WILLAKENZIE.permeability).toBe("moderately slow");
    expect(LAURELWOOD.permeability).toBe("moderate");
  });
});

describe("Nekia caption constants (not a fourth pit)", () => {
  it("typical R at 36 in; bedrock 20–40 in; not among the three pits", () => {
    expect(NEKIA_R_TYPICAL_IN).toBe(36);
    expect(NEKIA_BEDROCK_RANGE_IN).toEqual({ min: 20, max: 40 });
    expect(PITS.map((p) => p.id)).toEqual(["jory", "willakenzie", "laurelwood"]);
    expect(PITS).toHaveLength(3);
  });
});

describe("Laurelwood typical uses", () => {
  it("does not list vineyards among typical uses", () => {
    expect(LAURELWOOD.vineyardsAmongTypicalUses).toBe(false);
    expect(JORY.vineyardsAmongTypicalUses).toBe(true);
  });
});
