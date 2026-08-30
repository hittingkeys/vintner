# Design principles

The rubric for every user-facing component. Cite a principle by its id and its test. Build against Part A while implementing an explorable; audit the live interactive against Parts D and E before calling the work done.

## Part A — invisible-state content

Use Part A for quantities the learner cannot see directly: soil water, heat accumulation, ripening curves, canopy light.

### A1 — Show the data the model is acting on

The current system state must be visible on the canvas.

**Test:** Cover the interactive and describe current system state. If you cannot, state is hidden.

### A2 — No run button

Manipulation and response are simultaneous. There is no commit, play, or confirm step.

**Test:** Input-to-response under one perceptible frame. No confirmation action.

### A3 — Show the space, not a point

A response curve, small multiples, or ghost traces — not a single number.

**Test:** Can the learner see linear vs threshold vs optimum without further scrubbing?

### A4 — Direct manipulation of the quantity itself

Drag the soil horizon; do not type a depth.

**Test:** Controls spatially separated from the object they modify must be justified.

### A5 — Both rungs of the ladder, connected

This vintage / this pit **and** the general relationship, joined by interaction, not by page navigation.

### A6 — Failure and edge states are part of the model

Vine death, waterlogging, a vintage that never ripens.

**Test:** Push every input to both extremes. Degrade gracefully and tell the truth.

## Part B — memory-bound content

Use Part B for facts that must be retrieved: appellation law, variety synonyms, rootstock facts, hierarchies, tasting vocabulary.

### B1 — Retrieval follows exposition immediately

About 200 words maximum without a prompt.

### B2 — One retrievable thing per prompt

### B3 — Tractable and effortful

No grammatical or phrasing tells that give the answer away.

### B4 — Relationships, not just labels

Over half definition cards is too many.

### B5 — Prompts authored in the same pass

Stored with the content, scheduled. Not a quiz bolted on after the lesson is written.

## Part C — domain mapping

| Domain | Part |
| --- | --- |
| Soil water / texture / drainage | A |
| GDD / heat / phenology | A |
| Vine water stress / berry development | A |
| Canopy / light | A |
| Sugar / acid / phenolic ripening | A |
| Yield-to-vigor | A |
| Appellation law / permitted varieties | B |
| Variety synonyms / parentage | B |
| Rootstock facts, then a selector | B then A |
| Soil nomenclature | B |
| Tasting vocabulary | B |
| Classification hierarchies | B |

Use both if the material is genuinely both. If it is neither, it probably does not belong.

## Part D — anti-pastiche

These are failures even when the interactive looks finished:

- Decorative scrubbing (motion without a model).
- Hover-to-highlight with no payload.
- Animation as transition, not as data.
- A dashboard of uncoupled charts.
- Explanatory text carrying the load the interactive should carry.
- Faux-precision: agronomy uncertain to ±30%, rendered to three decimals.
- Prompts written after the fact.

## Part E — overall test

Answer all three:

1. What did the learner have to simulate in their head that they can now see?
2. If you delete the prose, does the interactive still teach it?
3. What will they still know in six months, and what mechanism ensures that?
