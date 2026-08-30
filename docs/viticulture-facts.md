# Viticulture facts

Governs every domain claim in this repo: model constants, chart axis ranges, seed data, default slider positions, tooltip copy, and review-prompt answers.

Assume every numeric or causal claim is wrong until sourced. Unverified claims ship as `TODO:UNVERIFIED` or not at all.

## Source hierarchy

Citation of record, in order:

1. **Peer-reviewed viticulture / soil science** — *American Journal of Enology and Viticulture*, *OENO One*, *Australian Journal of Grape and Wine Research*, *Geoderma*.
2. **University extension** — UC Davis / IVES, Cornell, OSU, WSU, Lincoln (NZ), AWRI.
3. **Soil data** — USDA NRCS Web Soil Survey / Soil Taxonomy, and national equivalents.
4. **Regulatory bodies** (for law) — INAO, Consorzio / DOC disciplinari, TTB, the appellation’s own cahier des charges.
5. **Climate data** — NOAA / NWS, PRISM, Agrimet, national meteorological services.

Trade press, MW / MS study guides, and encyclopedias are orientation only. They are never citation of record.

## Every numeric claim carries a citation

If it is not sourced, it does not ship — or it ships marked:

```
TODO:UNVERIFIED [claim] — searched: […] — needed: […]
```

Do not make unverified claims vaguer. The marker names the claim, what was searched, and what is still needed.

## Tendency vs rule

Regional generalizations are tendencies with large exceptions. Write them as tendencies, not as rules.

Not: “Burgundy is limestone.”
Instead: a sourced tendency, with the exceptions the source allows.

## Known traps

- **Minerality causation.** There is no direct soil-to-glass mineral transfer. Explain via water relations, temperature, and vigor.
- **Phylloxera / grafting is not universal.** Own-rooted vines exist; do not treat grafting as a given.
- **Winkler is California-derived.** GDD base temperature and season window are conventions, not laws of nature.
- **Brix-to-alcohol is not a constant.**
- **Old-vine is unregulated** unless a specific body defines it.
- **Vintage-quality narratives** are not a substitute for weather data.
- **Drainage ≠ water-holding ≠ rooting depth.** Three different properties.
- **Terroir is not a mechanism.** Do not use it as a causal explanation.

## Legal facts

Store `source_year` and the publishing body. If there is no year, the fact does not ship.

## Easy to miss

These are domain claims too. They need sources, or they do not ship:

- axis min / max
- seed data
- default slider positions
- prompt answers
- tooltip copy

## APIs (weather, climate, soil)

Probe one source at a time: schema, units, missing-data sentinels, one trimmed sample. Do not dump raw payloads into this file or into code comments.
