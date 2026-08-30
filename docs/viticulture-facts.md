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

## Willamette Valley soil series (OSD typical pedons)

Citation of record: USDA NRCS Official Soil Series Descriptions. One described pit each, not every vineyard. Do not invent wine flavors, minerality, dry-farming, vine age, irrigation, PAWS, AVA personality, or Van Duzer from these names.

| Series | OSD | Depth class | Drainage | Permeability | Parent material (OSD) | Restriction in typical pedon |
| --- | --- | --- | --- | --- | --- | --- |
| Jory | 06/2011 | very deep | well drained | moderately slow | colluvium/residuum mainly basic igneous, secondarily tuffaceous/sedimentary | floor deeper than 60 in; typical pedon still clay at 100 in (Bt3 48–100) |
| Willakenzie | 08/2006 | moderately deep | well drained | moderately slow | loamy colluvium/residuum from sandstone, siltstone, tuffaceous materials (Spencer / Eugene) | typical Cr at 32 in; range to paralithic 20–40 in inclusive |
| Laurelwood | 12/2006 | very deep | well drained | moderate | silty loess-like (probably middle Pleistocene) over nonconforming clay commonly weathered from Columbia River Basalt | 2C starts at 52 in (material change, not bedrock); bedrock commonly more than 5 ft |
| Nekia | 07/2006 | moderately deep | well drained | — | same basalt family as Jory | typical R at 36 in; 20–40 in to hard bedrock. Caption only in the landing lesson. |

Jory is Oregon’s state soil (2011). Vineyards are among listed uses on the Jory OSD. Vineyards are **not** listed among typical uses on the Laurelwood OSD — say that.

Horizons (inches, typical pedon):

- Jory: Ap 0–6 silty clay loam 5YR 3/4; A 6–16; AB 16–19; Bt1 19–29 clay 2.5YR 3/4; Bt2 29–48; Bt3 48–100 dark red clay.
- Willakenzie: A 0–11 loam; Bt1 11–19; Bt2 19–32; Cr 32 in.
- Laurelwood: Ap 0–11 silt loam; BA 11–23; Bt 23–52; 2C from 52 in.

Trap: drainage ≠ water-holding ≠ rooting depth. Jory and Willakenzie are both well drained with moderately slow permeability.

Landing-lesson axis: 0–72 in (UI scale). Jory’s typical pedon continues as clay to 100 in — do not invent a floor on this scale.

## APIs (weather, climate, soil)

Probe one source at a time: schema, units, missing-data sentinels, one trimmed sample. Do not dump raw payloads into this file or into code comments.
