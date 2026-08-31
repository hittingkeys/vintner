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

## Willamette Valley geographic setting (OSD + SoilWeb extents + OSU contrast)

Citation of record: the same NRCS OSDs, plus OSU (Skinkis & Skolas) for hillside vs floor, plus UC Davis SoilWeb series-extent cache for the colored map regions. Caption the map as **SoilWeb generalized SSURGO series extent, not a soil survey you can site from, not AVA blobs**. Pins are NRCS OSD type locations (NAD27, plotted on the WGS84 basemap, ~100 m — do not invent a NADCON shift). Do not display SoilWeb `acres` (generalized grid acres, not OSD). Do not invent wine-blog acreages. City labels come from the basemap — not soil citations. Do not label Dundee Hills, Ribbon Ridge, Eola-Amity, Yamhill-Carlton, or Laurelwood District as soil regions. Nekia stays a caption (same basalt family as Jory, shallower); do not add a Nekia region. Do not add a Woodburn polygon.

| Series | OSD | Landform (OSD wording) | Elevation | Type location (NAD27) |
| --- | --- | --- | --- | --- |
| Jory | 06/2011 | foothills adjacent to the Willamette and Umpqua Valleys; surrounding higher hills | 250–2,500 ft | Marion County, Oregon; Turner, Oregon USGS 7.5 minute quadrangle. 44°50′56″ N, 122°59′52″ W |
| Willakenzie (west) | 08/2006 | summit, shoulder, and backslope of smooth convex hills along the western margins (Spencer Formation) | 200–900 ft | Yamhill County, Oregon; Carlton, Oregon USGS 7.5 minute topographic quadrangle. 45°20′01″ N, 123°08′17″ W |
| Willakenzie (east, southern portion) | 08/2006 | eastern margins in the southern portion of the valley (Eugene and Fisher Formations) | 300–1,400 ft | same series type location (Yamhill / Carlton); do not paint the entire east side Willakenzie |
| Laurelwood | 12/2006 | hills along the northwest margin of the Willamette Valley | 200–1,600 ft | Washington County, Oregon; top of Iowa Hill; Laurelwood, Oregon USGS 7.5 minute topographic quadrangle. 45°25′46″ N, 123°00′57″ W |

Distribution (OSD):

- Jory — low foothills of Willamette **and** Umpqua Valleys, Oregon; MLRA 2; the series is extensive. Say the Umpqua when Jory is selected so learners do not think Jory is Willamette-only. Do not draw a second Umpqua map unless it stays tiny.
- Willakenzie — low hills and foothills along the margins of the Willamette Valley; MLRA 2; moderate extent.
- Laurelwood — hills along the northwest margin of the Willamette Valley, Oregon; MLRA 2; moderate extent.

Willakenzie geographically associated soils (OSD WILLAKENZIE 08/2006): Jory soils are fine textured, greater than 60 inches deep to bedrock, and occur on adjacent higher hills.

Valley floor contrast — OSU, Skinkis & Skolas, *An Inventory of Oregon's Vineyard Sites and Soils* (Oregon Vineyard Soil and Nutrition Initiative), https://ir.library.oregonstate.edu/downloads/q524jq16t

- On stable hillsides in the Willamette: examples include Bellpine, Jory, and Willakenzie.
- On less-stable hillsides, lower terraces, and valley floors in the Willamette: younger, less-weathered mollisols; examples Philomath, Woodburn, Yamhill.
- Do **not** add a fourth pit for Woodburn. Floor click: these three series are hillside soils; the floor is a different parent-material story. Do not claim “too many nutrients for quality grapes.”

OSD URLs:

- Jory — https://soilseries.sc.egov.usda.gov/OSD_Docs/J/JORY.html
- Willakenzie — https://soilseries.sc.egov.usda.gov/OSD_Docs/W/WILLAKENZIE.html
- Laurelwood — https://soilseries.sc.egov.usda.gov/OSD_Docs/L/LAURELWOOD.html

Willakenzie east/south click (south of ~44.3°N and east of ~−123.05°) is a **teaching split from OSD wording** (Eugene and Fisher vs Spencer), not a formation map.

## SoilWeb series extent (landing-lesson map)

SOURCE: UC Davis SoilWeb series-extent cache, `https://casoilresource.lawr.ucdavis.edu/series-extent-cache/json/{series}.json`
AUTH: none
SNAPSHOT: Last-Modified 2025-10-04. Vendored at build time; do not fetch SoilWeb at runtime (GitHub Pages is client-only; CORS + availability).

FeatureCollection with one Feature. `Feature.properties`: series (string, uppercase), acres (number, generalized — do not display), gridsize (deg), n (cell count). geometry: MultiPolygon, coordinates [lon, lat] WGS84.

Bbox (from the vendored files):

- Jory ~[-123.70, 43.235, -122.335, 45.74] — continues into the Umpqua
- Willakenzie ~[-123.662, 43.599, -122.634, 45.432]
- Laurelwood ~[-123.283, 45.271, -122.516, 45.707] — northwest only, matches OSD

GOTCHAS: generalized from SSURGO, not map-unit polygons you can site a vineyard from; gridsize differs by series (Jory 0.005, others 0.001). Caption that. Do not treat AVA names as soil maps.

## APIs (weather, climate, soil)

Probe one source at a time: schema, units, missing-data sentinels, one trimmed sample. Do not dump raw payloads into this file or into code comments.
