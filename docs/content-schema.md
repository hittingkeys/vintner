# Content and prompt schema

**Frozen.** Do not change these schemas without asking Matt. Types live in `src/schemas/`. This file is the human-readable contract.

Lessons live in `content/` as MDX with `LessonFrontmatter`. The landing lesson is `willamette-soils.mdx` (`#/` / `willamette-soils`). `occupied-root-zone.mdx` remains at `#/occupied-root-zone`. `same-hill.mdx` is at `#/same-hill`. `content/_scaffold.mdx` remains a non-lesson compile stub.

## Lesson MDX (`content/`)

Each future lesson is an MDX file with YAML frontmatter matching `LessonFrontmatter`.

| Field | Type | Rule |
| --- | --- | --- |
| `id` | string | Stable lesson id. |
| `title` | string | Learner-facing title. |
| `governingPart` | `"A"` \| `"B"` \| `"both"` | Maps to [design-principles](design-principles.md) Part C. |
| `misconception` | string | The belief the lesson confronts. |
| `coupledVariables` | string[] | Variables the explorable must keep coupled. |
| `citations` | `Citation[]` | Citation of record for claims in the lesson. |

`Citation` is `{ source: string; year?: number; url?: string }`. Year is required when the citation supports a legal fact.

The MDX body is the exposition. Prompts are co-located: either in the same frontmatter (`prompts`) or in a sibling data file imported next to the lesson. Same `Prompt` type either way.

## Prompt

| Field | Type | Rule |
| --- | --- | --- |
| `retrievable` | string | Exactly one retrievable thing (B2). |
| `kind` | `"prediction"` \| `"comparison"` \| `"cause"` \| `"definition"` | Majority of a lesson’s prompts must **not** be `definition` (B4). |
| `answerKey` | string | Sourced. A prompt answer is a domain claim. |
| `sources` | `Citation[]` | Citation of record. |
| `sourceYear` | number, optional | **Required** when the prompt concerns a legal fact. No year → does not ship. |

## Known-answer case (on a spec)

Used on an `ExplorableSpec` (question 5). Not invented for this scaffold.

| Field | Type | Rule |
| --- | --- | --- |
| `description` | string | What the case is testing. |
| `expected` | number | Sourced expected value. |
| `unit` | string | Unit of `expected`. |
| `tolerance` | number | Absolute tolerance around `expected`. |
| `source` | `Citation` | Citation of record for the expected value. |

## Legal fact

| Field | Type | Rule |
| --- | --- | --- |
| `claim` | string | The legal statement. |
| `publishingBody` | string | INAO, TTB, Consorzio, cahier des charges, … |
| `sourceYear` | number | Required. No year → does not ship. |
| `source` | string | Where the text was published. |

## Explorable spec

`ExplorableSpec` records answers to the five questions in [explorable-design](explorable-design.md), including `knownAnswerCases` (at least three). Specs are written before code. This scaffold defines the type only.
