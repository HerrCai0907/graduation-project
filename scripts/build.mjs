#!/usr/bin/env node
"use strict";

import { build, context } from "esbuild";

const buildOptions = {
  entryPoints: ["src/index.ts"],
  bundle: true,
  outfile: "dist/index.cjs",
  tsconfig: "tsconfig.json",
  format: "cjs",
  platform: "node",
  minify: process.argv.includes("--minify"),
  sourcemap: process.argv.includes("--sourcemap"),
  sourcesContent: process.argv.includes("--sources-content"),
  logLevel: "info",
};

if (process.argv.includes("--watch")) {
  const ctx = await context(buildOptions);
  await ctx.watch();
} else {
  build(buildOptions);
}
