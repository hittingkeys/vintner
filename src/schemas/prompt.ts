import type { Citation } from "./citation";

/**
 * Prompt kinds. A lesson's majority must not be `definition` (principle B4).
 * Frozen — do not change without asking Matt.
 */
export type PromptKind = "prediction" | "comparison" | "cause" | "definition";

/**
 * One retrievable thing, authored in the same pass as the lesson prose.
 * Frozen — do not change without asking Matt.
 */
export interface Prompt {
  retrievable: string;
  kind: PromptKind;
  answerKey: string;
  sources: Citation[];
  /** Required when the prompt concerns a legal fact. No year → does not ship. */
  sourceYear?: number;
}
