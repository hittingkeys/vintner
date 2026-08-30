export type LessonId = "willamette-soils" | "occupied-root-zone";

export const DEFAULT_LESSON: LessonId = "willamette-soils";

export function lessonFromHash(hash: string): LessonId {
  const path = hash.replace(/^#\/?/, "");
  if (path === "occupied-root-zone") return "occupied-root-zone";
  return DEFAULT_LESSON;
}
