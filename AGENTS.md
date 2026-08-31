# Vintner explorables — operating manual

This is a Cursor / Grok Bot repo. Work from this file, not from Claude Code workflows.

## Stack

Client-only React + Vite + TypeScript so explorables stay instantaneous — no round trip between a slider and the model. MDX so prose, prompts, and citations live with the lesson. D3 so data is geometry, not a chart widget.

There is no backend, no database, and no server route. Educational content lives in `content/` as MDX. D3 draws explorable geometry (not a chart widget).

## Design standard

[`docs/design-principles.md`](docs/design-principles.md) is the design standard. Every user-facing component is built against it.

Cite the **principle and its test** (A2, B3, D — faux-precision, …). Do not cite designers by name in prompts, specs, or code comments.

## Domain claims

[`docs/viticulture-facts.md`](docs/viticulture-facts.md) governs every domain claim: model constants, chart axis ranges, seed data, default slider positions, tooltip copy, and review-prompt answers.

Assume every numeric or causal claim is wrong until sourced. Unverified claims ship as `TODO:UNVERIFIED` or not at all.

## Implementation procedure

[`docs/explorable-design.md`](docs/explorable-design.md) is the implementation procedure: spec before code, known-answer cases with tolerances, live-preview extremes.

## Definition of done (a component)

No verifier subagent and no design-critic subagent exist in this repo. CI and the live preview are the proof. After functional verification, the coordinator runs a Design critic **skill** in a fresh pass against the rubric. Do not spawn a `design-critic` subagent.

1. **Spec written.** Answer the five questions in [`docs/explorable-design.md`](docs/explorable-design.md), including three sourced known-answer cases with expected values **and** a stated tolerance. The spec includes Part F tests.
2. **Implemented.**
3. **Verification table complete.** Report only results that were actually run. Green tests plus a broken extreme is incomplete.

   | Check | How |
   | --- | --- |
   | BUILD | `npm run build` |
   | TYPECHECK | `npm run typecheck` |
   | TESTS | `npm test` |
   | KNOWN-ANSWER CASES | each case: expected / got / tolerance |
   | EXTREMES | each input at min and at max on the **live** preview |

4. **Design audit of the live interactive.** After verification, the coordinator runs the Design critic skill. There is no design-critic subagent and no verifier subagent. Manipulate the controls. Screenshots cannot pass A2 or A4. Report no Part D / Part E / Part F findings.

Never report a result that was not actually run. Screenshots cannot pass A2 or A4.

## Frozen without asking Matt

Do not change these without asking the repo owner (Matt):

- the content schema (`src/schemas/content.ts`, documented in `docs/content-schema.md`)
- the prompt schema (`src/schemas/prompt.ts`, same doc)
- model equations, once verified

## Weather, climate, and soil APIs

Probe **one source at a time**: schema, units, missing-data sentinels, one trimmed sample. Do not dump raw payloads into docs or code comments.
