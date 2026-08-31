import { describe, expect, it } from "vitest";
import type { ExplorableSpec } from "../../schemas/spec";
import type { LessonFrontmatter } from "../../schemas/content";
import { frontmatter } from "../../../content/same-hill.mdx";
import { sameHillLessonIntent, sameHillSpec } from "./spec";
import {
  JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT,
  PENNER_ASH_FROST_HOURS_PCT,
  SOLAR_CLASS,
} from "./constants";

describe("same-hill ExplorableSpec", () => {
  it("satisfies the frozen ExplorableSpec shape with sourced cases", () => {
    const spec: ExplorableSpec = sameHillSpec;
    expect(spec.knownAnswerCases.length).toBeGreaterThanOrEqual(3);
    expect(spec.knownAnswerCases[0]?.expected).toBe(SOLAR_CLASS.highest);
    expect(spec.knownAnswerCases[0]?.tolerance).toBe(0);
    expect(spec.knownAnswerCases[4]?.expected).toBe(PENNER_ASH_FROST_HOURS_PCT);
    expect(spec.knownAnswerCases[6]?.expected).toBe(
      JONES_DUFF_SOUTH_VS_FLAT_INSOLATION_PCT,
    );
    expect(spec.whatMustTheLearnerSee).toMatch(/A1/);
    expect(spec.whatDoTheyManipulate).toMatch(/A4/);
    expect(spec.whatIsTheResponseSpace).toMatch(/A3/);
    expect(spec.whatIsTheResponseSpace).toMatch(/F8/);
    expect(spec.whatIsTheResponseSpace).toMatch(/F9/);
    expect(sameHillLessonIntent.rubric).toMatch(/F11/);
    expect(spec.whatHappensAtTheExtremes).toMatch(/A6/);
  });

  it("records the brief answers that also live on lesson frontmatter", () => {
    expect(sameHillLessonIntent.rubric).toMatch(/Part A/);
    expect(sameHillLessonIntent.whatTheLearnerWasSimulating).toMatch(
      /south-facing/i,
    );
    expect(sameHillLessonIntent.misconception).toMatch(/frost/i);
    expect(sameHillLessonIntent.coupledVariables.length).toBe(3);
    expect(sameHillLessonIntent.notInThisLesson).toContain("occupied PAW");
  });
});

describe("same-hill lesson frontmatter", () => {
  it("matches LessonFrontmatter and carries one non-definition prompt", () => {
    const lesson = frontmatter as unknown as LessonFrontmatter;
    expect(lesson.id).toBe("same-hill");
    expect(lesson.governingPart).toMatch(/^(A|B|both)$/);
    expect(lesson.misconception).toMatch(/south-facing/i);
    expect(lesson.coupledVariables.length).toBeGreaterThanOrEqual(3);
    expect(lesson.citations.length).toBeGreaterThan(3);
    expect(lesson.prompts).toHaveLength(1);
    expect(lesson.prompts?.[0]?.kind).toMatch(/^(prediction|cause)$/);
    expect(lesson.prompts?.[0]?.kind).not.toBe("definition");
    expect(lesson.prompts?.[0]?.answerKey).toMatch(/trough|air drainage|RLC/i);
    expect(lesson.prompts?.[0]?.sources.length).toBeGreaterThan(0);
  });
});
