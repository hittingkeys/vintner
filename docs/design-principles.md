# Design principles

This file is the rubric for every user-facing component. [`explorable-design.md`](explorable-design.md) is the implementation procedure.

Cite a principle by its **id and its test** (A2, B3, D — faux-precision, F1, …). Do not cite designers by name in prompts, specs, or code comments.

Build against Part A while implementing an explorable. After functional verification, the coordinator runs a Design critic **skill** in a fresh pass against this rubric (Parts D, E, and F). The design critic is a skill the coordinator runs after verification, not a repo subagent. Do not spawn a `design-critic` subagent — none exists here.

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

Answer all four:

1. What did the learner have to simulate in their head that they can now see?
2. If you delete the prose, does the interactive still teach it?
3. What will they still know in six months, and what mechanism ensures that?
4. Does the graphic answer “compared to what?” without further interaction? A component that can't answer (4) is showing a value rather than a relationship; Part F is next.

## Part F — Principles for the visual display itself

Same convention as elsewhere: cite the principle ID and run its test. Do not invoke the name of the person these derive from — that produces the visual signature (thin rules, muted palette, serif labels) without the reasoning, which is exactly the pastiche failure Part D describes.

### F1. Graphical integrity — the representation is proportional to the quantity

The visual magnitude of an element must be proportional to the number it represents. Encoding a one-dimensional quantity as area or volume inflates the perceived change. Bar length starts at zero. Truncated axes on a length-encoded chart misstate the data.

**Test:** Divide the size of the visual effect by the size of the data effect. If the ratio is not close to 1, the graphic is lying. For any truncated axis, state in the spec why truncation is honest here — for line-encoded trend data it usually is; for bars it is not.

### F2. Erase non-data ink

Take each visual element and remove it. If no information is lost, it stays removed. Frames, backgrounds, redundant tick marks, heavy gridlines, borders around every panel, and duplicate axis labels are the usual candidates.

**Test:** Delete the element. Reread the graphic. Did an answerable question become unanswerable? If not, leave it deleted.

**Note the interaction with A1.** Current-state readouts, annotations, and the values driving a model *are data ink*. Minimalism does not license hiding state. When F2 and A1 appear to conflict, A1 wins — but the resolution is usually that the readout should be typographically quieter, not absent.

### F3. No chartjunk

No 3D extrusion on 2D data. No gradients or drop shadows that encode nothing. No decorative illustration inside the data region. No heavy grids that compete with the data. No moiré from dense hatching or saturated adjacent fills.

**Test:** For every non-data visual property — depth, texture, shadow, gradient, saturation — name the variable it encodes. Anything that can't name one is removed.

### F4. Maximize data density

The number of values displayed per unit of screen area should be high. Learners handle far more density than product convention assumes; four data points and a large caption wastes visual bandwidth.

**Test:** Count the data values. Divide by area. A graphic carrying under roughly twenty values in a full-width region needs a reason.

**Note for novices.** Solve undifferentiated density with F7 layering, not by removing data.

### F5. Small multiples

Repeated small panels with identical axes, varying only in the data. **Test:** Does the component ask the learner to change a control and remember the previous state to compare? If so, it should probably be small multiples, or small multiples plus the control. This is the mechanism for A3.

### F6. Both micro and macro readings

A shape at a glance, specific values on inspection.

**Test:** Squint or shrink to a third. Pattern still legible? Then retrieve a specific value to the spec’s precision.

### F7. Layering and separation

Hierarchy via weight, value, and size, not boxes and saturated color-coding. **Test:** Convert to greyscale. Is hierarchy still legible and is the data still the most prominent thing?

### F8. Label directly; no legends

Series name on the series. Annotate in the data region.

**Test:** Count round trips between the data region and anywhere else to answer the central question. Target is zero.

### F9. Answer “compared to what?”

Every displayed value needs its reference on screen.

**Test:** Point at any number and ask “is that a lot?” If the graphic can't answer, the comparison is missing. A3 and F9 are the same requirement from different directions.

### F10. Don't flatten multivariate relationships

Coupled variables belong in one graphic (shared axis or brushing).

**Test:** Two coupled variables in two panels with no shared axis or brushing → coupling is invisible.

### F11. Put the documentation on the graphic

Units, scale, source, measurement convention, period of record on or adjacent to the display — not a footnote, hover, or methods page.

**Test:** Screenshot the graphic alone. Can a knowledgeable stranger determine what is measured, in what units, over what period, from what source? The citation from viticulture-facts belongs here.

### F12. Structure follows the data, not a chart type

Phenology is an interval on a timeline. Soil is a vertical profile. Ripening is several curves diverging at different rates. None of those is a bar chart.

**Test:** Would this form be identifiable as *this* subject with labels removed?

### F13. Word-sized graphics belong in the prose

Inline, high-resolution graphics at the size of a line of text for quantities the prose mentions in passing.

**Test:** Does the prose name a trend, range, or shape that a word-sized graphic could show? Then it should show it.
