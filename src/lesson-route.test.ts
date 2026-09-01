import { describe, expect, it } from "vitest";
import { DEFAULT_LESSON, lessonFromHash } from "./lesson-route";

describe("lessonFromHash", () => {
  it("defaults to willamette-soils", () => {
    expect(DEFAULT_LESSON).toBe("willamette-soils");
    expect(lessonFromHash("")).toBe("willamette-soils");
    expect(lessonFromHash("#/")).toBe("willamette-soils");
    expect(lessonFromHash("#/willamette-soils")).toBe("willamette-soils");
  });

  it("opens occupied-root-zone from its hash", () => {
    expect(lessonFromHash("#/occupied-root-zone")).toBe("occupied-root-zone");
    expect(lessonFromHash("#occupied-root-zone")).toBe("occupied-root-zone");
  });

  it("opens same-hill from its hash", () => {
    expect(lessonFromHash("#/same-hill")).toBe("same-hill");
    expect(lessonFromHash("#same-hill")).toBe("same-hill");
  });

  it("opens two-hundred-k from its hash and keeps soils as default", () => {
    expect(lessonFromHash("#/two-hundred-k")).toBe("two-hundred-k");
    expect(lessonFromHash("#two-hundred-k")).toBe("two-hundred-k");
    expect(DEFAULT_LESSON).toBe("willamette-soils");
  });
});
