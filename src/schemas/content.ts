import type { Citation } from "./citation";
import type { Prompt } from "./prompt";

/** Maps to docs/design-principles.md Part C. */
export type GoverningPart = "A" | "B" | "both";

/**
 * YAML frontmatter on a lesson MDX file in content/.
 * Frozen — do not change without asking Matt.
 */
export interface LessonFrontmatter {
  id: string;
  title: string;
  governingPart: GoverningPart;
  misconception: string;
  coupledVariables: string[];
  citations: Citation[];
  /** Prompts may live here or in a sibling data file. Same Prompt type either way. */
  prompts?: Prompt[];
}

export interface Lesson {
  frontmatter: LessonFrontmatter;
  prompts: Prompt[];
}
