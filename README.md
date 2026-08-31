# Vintner explorables

Learner-facing viticulture explorable explanations. Client-only React + Vite + TypeScript, MDX lessons, D3 for visualization.

The landing lesson is `content/willamette-soils.mdx`: OSD valley-position schematic plus three typical Willamette pedons (Jory, Willakenzie, Laurelwood) — landform, parent material, and depth to a floor. Spec: `src/explorables/willamette-soils/spec.ts`. Occupied root zone remains at `#/occupied-root-zone`.

Agents: start at [`AGENTS.md`](AGENTS.md). Design standard: [`docs/design-principles.md`](docs/design-principles.md). Domain claims: [`docs/viticulture-facts.md`](docs/viticulture-facts.md). Implementation procedure: [`docs/explorable-design.md`](docs/explorable-design.md). Schemas: [`docs/content-schema.md`](docs/content-schema.md).

Live: [hittingkeys.github.io/vintner](https://hittingkeys.github.io/vintner/). Production `base` is `/vintner/`. Push to `main` deploys via `.github/workflows/pages.yml` (GitHub Actions Pages source).

## Install and run

Requires Node 22+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). You should see **Vintner explorables** and the Willamette soils landing lesson.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run typecheck` | `tsc -b` |
| `npm test` | Vitest once (jsdom) |
| `npm run preview` | Serve the production build |

## What this repo is not

No backend, no database, no server routes. Do not invent domain numbers, citations, axis ranges, or default slider values — [`docs/viticulture-facts.md`](docs/viticulture-facts.md) governs those.
