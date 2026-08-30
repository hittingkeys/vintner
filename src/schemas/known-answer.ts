import type { Citation } from "./citation";

/**
 * A sourced known-answer case on an explorable spec (question 5).
 * Do not invent `expected`, `unit`, or `tolerance`.
 */
export interface KnownAnswerCase {
  description: string;
  expected: number;
  unit: string;
  /** Absolute tolerance around `expected`. */
  tolerance: number;
  source: Citation;
}
