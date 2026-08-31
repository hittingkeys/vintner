import { describe, expect, it } from "vitest";
import type { ExplorableSpec } from "../../schemas/spec";
import type { LessonFrontmatter } from "../../schemas/content";
import { frontmatter } from "../../../content/occupied-root-zone.mdx";
import { occupiedPawLessonIntent, occupiedPawSpec } from "./spec";

describe("occupied-paw ExplorableSpec", () => {
  it("satisfies the frozen ExplorableSpec shape with three sourced cases", () => {
    const spec: ExplorableSpec = occupiedPawSpec;
    expect(spec.knownAnswerCases).toHaveLength(3);
    expect(spec.knownAnswerCases[0]?.expected).toBe(15);
    expect(spec.knownAnswerCases[1]?.expected).toBe(25);
    expect(spec.knownAnswerCases[2]?.expected).toBe(0.45);
    expect(spec.whatMustTheLearnerSee.length).toBeGreaterThan(40);
  });

  it("records the brief answers that also live on lesson frontmatter", () => {
    expect(occupiedPawLessonIntent.rubric).toMatch(/Part A/);
    expect(occupiedPawLessonIntent.whatTheLearnerWasSimulating).toMatch(
      /occupied root zone/i,
    );
    expect(occupiedPawLessonIntent.misconception).toMatch(/dry-farm/i);
    expect(occupiedPawLessonIntent.coupledVariables).toContain("profile PAWS");
  });
});

describe("occupied-root-zone lesson frontmatter", () => {
  it("matches LessonFrontmatter and carries the split retrieval prompts", () => {
    const lesson = frontmatter as unknown as LessonFrontmatter;
    expect(lesson.id).toBe("occupied-root-zone");
    expect(lesson.governingPart).toMatch(/^(A|B|both)$/);
    expect(lesson.misconception).toMatch(/dry-farm/i);
    expect(lesson.coupledVariables.length).toBeGreaterThanOrEqual(3);
    expect(lesson.citations.length).toBeGreaterThan(5);
    expect(lesson.prompts).toHaveLength(2);
    expect(lesson.prompts?.[0]?.kind).toBe("comparison");
    expect(lesson.prompts?.[1]?.kind).toBe("cause");
    expect(lesson.prompts?.every((p) => p.kind !== "definition")).toBe(true);
    expect(lesson.prompts?.[0]?.answerKey).toMatch(/15 cm/);
    expect(lesson.prompts?.[1]?.answerKey).toMatch(/paralithic|Cr/i);
  });
});
