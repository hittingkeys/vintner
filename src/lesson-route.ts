export type LessonId = "willamette-soils" | "occupied-root-zone" | "same-hill";

export const DEFAULT_LESSON: LessonId = "willamette-soils";

export function lessonFromHash(hash: string): LessonId {
  const path = hash.replace(/^#\/?/, "");
  if (path === "occupied-root-zone") return "occupied-root-zone";
  if (path === "same-hill") return "same-hill";
  return DEFAULT_LESSON;
}
