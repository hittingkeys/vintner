# Explorable design

Implementation procedure for every explorable. Spec before code. Work against [Part A](design-principles.md) while implementing. Verify with a table of actually-run results; audit the live interactive separately.

## Five spec questions (before code)

Answer all five in the spec. Do not start implementation until they have answers. Question 5 requires three sourced known-answer cases.

1. **What must the learner see?** What hidden system state (A1) becomes visible, and what misconception does that confront?
2. **What do they manipulate, and where?** The quantity itself, spatially (A4). Justify any control that is not on the object.
3. **What is the response space?** How are the curve / small multiples / ghost traces shown so linear vs threshold vs optimum is visible without further scrubbing (A3)? Where is the current marker?
4. **What happens at the extremes?** Both ends of every input (A6). How does the model fail honestly?
5. **What are the known-answer cases?** Three sourced cases, each with **expected** value, **unit**, **tolerance**, and **source**. These become the test table.

The spec types live in `src/schemas/spec.ts`. Do not invent numbers to fill a spec; source them or mark `TODO:UNVERIFIED`.

## While implementing (Part A)

- State lives on the canvas, not in a sidebar or a tooltip (A1).
- No commit step: no run, play, or apply button (A2).
- Response curve (or multiples / ghosts) with a marker for the current point (A3).
- Ghost traces for comparison, not a single number (A3).
- Spatial controls on the object they modify (A4).
- Exercise every extreme while building, not only at the end (A6).

Uncertainty is content: show a band, or round hard. Do not render faux-precision (Part D).

## Prompts

Author prompts in the same pass as the prose (B5). Store them with the lesson. One retrievable thing (B2). Majority must not be definition (B4).

**Bad:** “What is the Winkler Index?” (definition; a label.)

**Better:** a prediction + cause — two sites with the same GDD, different night temperature; which retains more acidity, and why? (relationship; effortful; no phrasing tell.)

## Verification table

Same table as in `AGENTS.md`. Fill it only with results that were actually run.

| Check | Result |
| --- | --- |
| BUILD | `npm run build` — pass / fail |
| TYPECHECK | `npm run typecheck` — pass / fail |
| TESTS | `npm test` — pass / fail |
| KNOWN-ANSWER CASES | each: expected / got / tolerance |
| EXTREMES | each input at min and at max on the **live** preview |

Green tests plus a broken extreme is incomplete. There is no verifier subagent. CI and the live preview are the proof.

## Design audit

A separate pass from verification. There is no design-critic subagent. A fresh pass against the rubric is the audit.

- Manipulate the controls. Screenshots cannot pass A2 or A4.
- Report no Part D findings (decorative scrubbing, hover-without-payload, animation-as-transition, uncoupled dashboard, prose carrying the load, faux-precision, prompts-after-the-fact).
- Answer the three Part E questions.
