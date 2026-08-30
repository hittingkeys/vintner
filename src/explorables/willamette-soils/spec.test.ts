import { describe, expect, it } from "vitest";
import type { ExplorableSpec } from "../../schemas/spec";
import type { LessonFrontmatter } from "../../schemas/content";
import { frontmatter } from "../../../content/willamette-soils.mdx";
import { willametteSoilsLessonIntent, willametteSoilsSpec } from "./spec";

describe("willamette-soils ExplorableSpec", () => {
  it("satisfies the frozen ExplorableSpec shape with three sourced cases", () => {
    const spec: ExplorableSpec = willametteSoilsSpec;
    expect(spec.knownAnswerCases).toHaveLength(3);
    expect(spec.knownAnswerCases[0]?.expected).toBe(32);
    expect(spec.knownAnswerCases[0]?.tolerance).toBe(0);
    expect(spec.knownAnswerCases[1]?.expected).toBe(100);
    expect(spec.knownAnswerCases[2]?.expected).toBe(52);
    expect(spec.whatMustTheLearnerSee).toMatch(/parent material/i);
    expect(spec.whatDoTheyManipulate).toMatch(/shared depth/i);
  });

  it("records the brief answers that also live on lesson frontmatter", () => {
    expect(willametteSoilsLessonIntent.rubric).toMatch(/Part A/);
    expect(willametteSoilsLessonIntent.whatTheLearnerWasSimulating).toMatch(
      /wine-label/i,
    );
    expect(willametteSoilsLessonIntent.misconception).toMatch(/drainage/i);
    expect(willametteSoilsLessonIntent.coupledVariables.length).toBe(2);
  });
});

describe("willamette-soils lesson frontmatter", () => {
  it("matches LessonFrontmatter and carries two non-definition prompts", () => {
    const lesson = frontmatter as unknown as LessonFrontmatter;
    expect(lesson.id).toBe("willamette-soils");
    expect(lesson.governingPart).toBe("both");
    expect(lesson.misconception).toMatch(/tasting-note|drainage/i);
    expect(lesson.coupledVariables).toEqual(
      expect.arrayContaining([
        expect.stringMatching(/parent material/i),
        expect.stringMatching(/depth/i),
      ]),
    );
    expect(lesson.prompts).toHaveLength(2);
    expect(lesson.prompts?.[0]?.kind).toBe("prediction");
    expect(lesson.prompts?.[1]?.kind).toBe("comparison");
    expect(lesson.prompts?.every((p) => p.kind !== "definition")).toBe(true);
    expect(lesson.prompts?.[0]?.answerKey).toMatch(/willakenzie/i);
    expect(lesson.prompts?.[1]?.answerKey).toMatch(/parent material/i);
    expect(lesson.citations.some((c) => /OSD|Official Soil Series/i.test(c.source))).toBe(
      true,
    );
  });
});
