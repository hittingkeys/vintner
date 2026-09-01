import { describe, expect, it } from "vitest";
import type { ExplorableSpec } from "../../schemas/spec";
import type { LessonFrontmatter } from "../../schemas/content";
import { frontmatter } from "../../../content/two-hundred-k.mdx";
import { twoHundredKLessonIntent, twoHundredKSpec } from "./spec";

describe("two-hundred-k ExplorableSpec", () => {
  it("satisfies the frozen ExplorableSpec shape with three sourced cases", () => {
    const spec: ExplorableSpec = twoHundredKSpec;
    expect(spec.knownAnswerCases).toHaveLength(3);
    expect(spec.knownAnswerCases[0]?.expected).toBe(20_000);
    expect(spec.knownAnswerCases[1]?.expected).toBe(531_742.8);
    expect(spec.knownAnswerCases[2]?.expected).toBe(220);
    expect(spec.knownAnswerCases[0]?.tolerance).toBe(1);
    expect(spec.knownAnswerCases[1]?.tolerance).toBe(1);
    expect(spec.knownAnswerCases[2]?.tolerance).toBe(1);
    expect(spec.whatMustTheLearnerSee.length).toBeGreaterThan(40);
  });

  it("records the brief answers that also live on lesson frontmatter", () => {
    expect(twoHundredKLessonIntent.rubric).toMatch(/Part A/);
    expect(twoHundredKLessonIntent.whatTheLearnerWasSimulating).toMatch(
      /\$200k from Portland/i,
    );
    expect(twoHundredKLessonIntent.misconception).toMatch(/\$200k buys/);
    expect(twoHundredKLessonIntent.coupledVariables).toContain("remaining cash");
  });
});

describe("two-hundred-k lesson frontmatter", () => {
  it("matches LessonFrontmatter and carries one non-definition prompt", () => {
    const lesson = frontmatter as unknown as LessonFrontmatter;
    expect(lesson.id).toBe("two-hundred-k");
    expect(lesson.title).toMatch(/\$200k from Portland/);
    expect(lesson.governingPart).toMatch(/^(A|B|both)$/);
    expect(lesson.misconception).toMatch(/\$200k buys/);
    expect(lesson.coupledVariables.length).toBeGreaterThanOrEqual(3);
    expect(lesson.citations.length).toBeGreaterThan(2);
    expect(lesson.prompts).toHaveLength(1);
    expect(lesson.prompts?.[0]?.kind).toBe("prediction");
    expect(lesson.prompts?.[0]?.kind).not.toBe("definition");
    expect(lesson.prompts?.[0]?.answerKey).toMatch(/\$20,000/);
    expect(lesson.prompts?.[0]?.answerKey).toMatch(/\$26,587/);
  });
});
