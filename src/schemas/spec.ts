import type { KnownAnswerCase } from "./known-answer";

/**
 * Answers to the five spec questions in docs/explorable-design.md.
 * Written before code. `knownAnswerCases` must have at least three
 * sourced entries (expected, unit, tolerance, source).
 */
export interface ExplorableSpec {
  /** Q1 — What must the learner see? */
  whatMustTheLearnerSee: string;
  /** Q2 — What do they manipulate, and where? */
  whatDoTheyManipulate: string;
  /** Q3 — What is the response space? */
  whatIsTheResponseSpace: string;
  /** Q4 — What happens at the extremes? */
  whatHappensAtTheExtremes: string;
  /** Q5 — Three sourced known-answer cases. */
  knownAnswerCases: [
    KnownAnswerCase,
    KnownAnswerCase,
    KnownAnswerCase,
    ...KnownAnswerCase[],
  ];
}
