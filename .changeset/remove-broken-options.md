---
"esbuild-coffeescript": major
---

### Remove the `ast` and `filename` options

`ast: true` made CoffeeScript return an AST object, which esbuild rejects with `"contents" must be a string`. A plugin-level `filename` replaced every file's path, so all errors and source maps pointed at one file. The plugin now always passes each file's own path.

### Report correct error line numbers

esbuild's `location.line` is 1-based; CoffeeScript's is 0-based. Syntax errors were reported one line too early.

### Cache compiled output across rebuilds

The plugin reuses compiled output for unchanged files within a build context. In a 301-file project, `context.rebuild()` dropped from ~2.4s to ~25ms.

### Ship CoffeeScript types

`@types/coffeescript` is now a dependency, so `transpile` is typed as Babel `TransformOptions` instead of `Record<string, unknown>`.
