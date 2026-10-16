import { defineConfig } from "oxlint";
import antiSlop from "ultracite/oxlint/anti-slop";
import core from "ultracite/oxlint/core";
import vitest from "ultracite/oxlint/vitest";

export default defineConfig({
  env: core.env,
  extends: [core, vitest, antiSlop],
  ignorePatterns: core.ignorePatterns,
  options: { typeAware: true },
  overrides: [
    {
      // Plugin regexes are esbuild `filter`s, which run on Go's RE2. esbuild
      // forwards JS flags as an inline `(?u)` group that RE2 rejects.
      files: ["src/**"],
      rules: { "require-unicode-regexp": "off" },
    },
  ],
});
