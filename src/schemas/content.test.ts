import { describe, expect, it } from "vitest";
import type { LessonFrontmatter } from "./content";
import type { Prompt } from "./prompt";

describe("content schema (frozen shape)", () => {
  it("accepts a well-formed lesson frontmatter object", () => {
    const lesson: LessonFrontmatter = {
      id: "scaffold-shape-check",
      title: "Shape check",
      governingPart: "both",
      misconception: "Not a domain claim.",
      coupledVariables: ["placeholder-a", "placeholder-b"],
      citations: [{ source: "Not a citation of record." }],
    };

    expect(lesson.governingPart).toMatch(/^(A|B|both)$/);
    expect(lesson.coupledVariables).toHaveLength(2);
  });

  it("accepts a well-formed non-definition prompt", () => {
    const prompt: Prompt = {
      retrievable: "placeholder relationship",
      kind: "prediction",
      answerKey: "Not a domain answer.",
      sources: [{ source: "Not a citation of record." }],
    };

    expect(prompt.kind).not.toBe("definition");
  });
});
