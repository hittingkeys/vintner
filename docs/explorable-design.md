# Explorable design

Implementation procedure for every explorable. Spec before code. The rubric is [`design-principles.md`](design-principles.md). Work against Part A while implementing. Verify with a table of actually-run results. After functional verification, the coordinator runs a Design critic **skill** in a fresh pass. There is no design-critic subagent in this repo. Do not self-assess from the implementation context.

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

## Rendering the graphic

Part F is the rubric for the visual display. Five principles decide most of the outcome; run their tests in the spec, not after the fact:

- **F9** — every displayed value needs its reference on screen (“compared to what?”).
- **F8** — label the series on the series; target zero round trips to a legend.
- **F4** — enough values per unit of area that the graphic carries a relationship, not four points and a caption.
- **F1** — visual magnitude proportional to the quantity; bar length starts at zero.
- **F12** — structure follows the data (phenology as interval, soil as profile), not a chart type.

Then:

- **F2 vs A1.** Current-state readouts *are* data ink. When F2 and A1 appear to conflict, A1 wins — quieter typography, not a hidden state.
- **F5** is A3’s visual mechanism: small multiples so the learner does not have to change a control and remember the previous state.
- **F13.** If the prose names a trend, range, or shape in passing, a word-sized graphic belongs in the line of text.

Before calling the graphic done, clean up with **F2** (erase non-data ink), **F3** (no chartjunk), and **F11** (units, scale, source, period of record on or adjacent to the display — the citation from viticulture-facts belongs here).

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

After functional verification, the coordinator runs a Design critic **skill** in a fresh pass against the rubric. There is no design-critic subagent in this repo. Do not self-assess from the implementation context.

- Manipulate the controls. Screenshots cannot pass A2 or A4.
- Report no Part D findings (decorative scrubbing, hover-without-payload, animation-as-transition, uncoupled dashboard, prose carrying the load, faux-precision, prompts-after-the-fact).
- Answer all four Part E questions. If deleting the prose leaves the lesson intact, the component is real; if the prose was carrying the load, it is pastiche.
- Run the Part F tests, especially F9 / F8 / F4 / F1 / F12.
