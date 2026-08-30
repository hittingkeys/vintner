# Vintner explorables

Learner-facing viticulture explorable explanations. Client-only React + Vite + TypeScript, MDX lessons, D3 for visualization.

There are no lessons or explorables yet. This is the scaffold: app shell, frozen content/prompt schemas, and the operating docs.

Agents: start at [`AGENTS.md`](AGENTS.md). Design standard: [`docs/design-principles.md`](docs/design-principles.md). Domain claims: [`docs/viticulture-facts.md`](docs/viticulture-facts.md). Implementation procedure: [`docs/explorable-design.md`](docs/explorable-design.md). Schemas: [`docs/content-schema.md`](docs/content-schema.md).

## Install and run

Requires Node 22+.

```bash
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173`). You should see the title **Vintner explorables** and a placeholder line. Nothing interactive yet.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Typecheck, then production build to `dist/` |
| `npm run typecheck` | `tsc -b` |
| `npm test` | Vitest once (jsdom) |
| `npm run preview` | Serve the production build |

## What this repo is not

No backend, no database, no server routes. Do not invent domain numbers, citations, axis ranges, or default slider values — [`docs/viticulture-facts.md`](docs/viticulture-facts.md) governs those, and none exist yet.
