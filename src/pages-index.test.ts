// @vitest-environment node
/// <reference types="node" />

import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "vite";

const root = fileURLToPath(new URL("..", import.meta.url));

describe("production GitHub Pages index.html", () => {
  it("ships hashed /vintner/assets and not the Vite source entry", async () => {
    const outDir = mkdtempSync(join(tmpdir(), "vintner-pages-"));
    await build({
      root,
      mode: "production",
      build: { outDir, emptyOutDir: true },
      logLevel: "error",
    });

    const html = readFileSync(join(outDir, "index.html"), "utf8");

    expect(html).not.toContain("/src/main.tsx");
    expect(html).toMatch(/\/vintner\/assets\/[^"' ]+\.js/);
  }, 120_000);
});
