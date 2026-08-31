import { describe, expect, it } from "vitest";
import type { ExplorableSpec } from "../../schemas/spec";
import type { LessonFrontmatter } from "../../schemas/content";
import { frontmatter } from "../../../content/willamette-soils.mdx";
import { willametteSoilsLessonIntent, willametteSoilsSpec } from "./spec";

describe("willamette-soils ExplorableSpec", () => {
  it("satisfies the frozen ExplorableSpec shape with three sourced cases", () => {
    const spec: ExplorableSpec = willametteSoilsSpec;
    expect(spec.knownAnswerCases.length).toBeGreaterThanOrEqual(3);
    expect(spec.knownAnswerCases[0]?.expected).toBe(32);
    expect(spec.knownAnswerCases[0]?.tolerance).toBe(0);
    expect(spec.knownAnswerCases[1]?.expected).toBe(100);
    expect(spec.knownAnswerCases[2]?.expected).toBe(52);
    expect(spec.whatMustTheLearnerSee).toMatch(/parent material/i);
    expect(spec.whatDoTheyManipulate).toMatch(/shared depth/i);
  });

  it("records the brief answers that also live on lesson frontmatter", () => {
    expect(willametteSoilsLessonIntent.rubric).toMatch(/Part A spatial/i);
    expect(willametteSoilsLessonIntent.whatTheLearnerWasSimulating).toMatch(
      /where in the valley/i,
    );
    expect(willametteSoilsLessonIntent.misconception).toMatch(
      /everywhere in the Willamette/i,
    );
    expect(willametteSoilsLessonIntent.coupledVariables.length).toBe(3);
    expect(willametteSoilsSpec.whatIsTheResponseSpace).toMatch(
      /OSD geographic setting/i,
    );
    expect(willametteSoilsSpec.knownAnswerCases.length).toBeGreaterThanOrEqual(7);
  });
});

describe("willamette-soils lesson frontmatter", () => {
  it("matches LessonFrontmatter and carries three non-definition prompts", () => {
    const lesson = frontmatter as unknown as LessonFrontmatter;
    expect(lesson.id).toBe("willamette-soils");
    expect(lesson.governingPart).toBe("both");
    expect(lesson.misconception).toMatch(/everywhere in the Willamette/i);
    expect(lesson.coupledVariables).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/landform|pin/i),
        expect.stringMatching(/parent material/i),
        expect.stringMatching(/depth/i),
      ]),
    );
    expect(lesson.prompts).toHaveLength(3);
    expect(lesson.prompts?.[0]?.kind).toBe("prediction");
    expect(lesson.prompts?.[1]?.kind).toBe("prediction");
    expect(lesson.prompts?.[2]?.kind).toBe("comparison");
    expect(lesson.prompts?.every((p) => p.kind !== "definition")).toBe(true);
    expect(lesson.prompts?.[0]?.answerKey).toMatch(/western-margin hills/i);
    expect(lesson.prompts?.[0]?.answerKey).toMatch(/Spencer/i);
    expect(lesson.prompts?.[1]?.answerKey).toMatch(/willakenzie/i);
    expect(lesson.prompts?.[2]?.answerKey).toMatch(/parent material/i);
    expect(lesson.citations.some((c) => /OSD|Official Soil Series/i.test(c.source))).toBe(
      true,
    );
    expect(lesson.citations.some((c) => /Skinkis/i.test(c.source))).toBe(true);
  });
});
