# Changelog

## 4.0.0

### Major Changes

- [#41](https://github.com/johnie/esbuild-coffeescript/pull/41) [`8dbc7fc`](https://github.com/johnie/esbuild-coffeescript/commit/8dbc7fcdb0a326ffbe5cc678f5838f2015dc9dff) Thanks [@johnie](https://github.com/johnie)! - ### Remove the `ast` and `filename` options

  `ast: true` made CoffeeScript return an AST object, which esbuild rejects with `"contents" must be a string`. A plugin-level `filename` replaced every file's path, so all errors and source maps pointed at one file. The plugin now always passes each file's own path.

  ### Report correct error line numbers

  esbuild's `location.line` is 1-based; CoffeeScript's is 0-based. Syntax errors were reported one line too early.

  ### Cache compiled output across rebuilds

  The plugin reuses compiled output for unchanged files within a build context. In a 301-file project, `context.rebuild()` dropped from ~2.4s to ~25ms.

  ### Ship CoffeeScript types

  `@types/coffeescript` is now a dependency, so `transpile` is typed as Babel `TransformOptions` instead of `Record<string, unknown>`.

## 3.1.0

### Minor Changes

- [#39](https://github.com/johnie/esbuild-coffeescript/pull/39) [`e6f9c65`](https://github.com/johnie/esbuild-coffeescript/commit/e6f9c65112f0bb061f4c0da4991bdc1e5a444fdf) Thanks [@johnie](https://github.com/johnie)! - ### Auto-detect literate CoffeeScript from file extension

  `.litcoffee` files are now compiled automatically without needing to pass `literate: true`. The option is still respected when explicitly set.

  ### Fix `inlineMap` option

  The `inlineMap` option was incorrectly remapped to CoffeeScript's `sourceMap` option, which returns an object instead of a string and breaks esbuild. It now correctly passes `inlineMap` through to the CoffeeScript compiler, producing an inline base64-encoded source map comment in the output.

  ### Fix error `lineText` for multi-line files

  Error messages now correctly report the specific line where the error occurred, instead of passing the entire source file as `lineText`.

  ### Safer error handling

  The catch clause now validates that the error has CoffeeScript's `location` property before attempting to convert it. Unexpected errors are re-thrown instead of being silently swallowed.

  ### Export `Options` type

  The `Options` interface is now exported, allowing consumers to type-check their plugin configuration.

### Patch Changes

- [#36](https://github.com/johnie/esbuild-coffeescript/pull/36) [`8522362`](https://github.com/johnie/esbuild-coffeescript/commit/852236270d9237a370be03c9c9cad94780b4ebad) Thanks [@johnie](https://github.com/johnie)! - docs: update README with enhanced installation instructions

- [#37](https://github.com/johnie/esbuild-coffeescript/pull/37) [`30652d8`](https://github.com/johnie/esbuild-coffeescript/commit/30652d80584db5e14c26b28c0670e0db31adbabd) Thanks [@mattmenefee](https://github.com/mattmenefee)! - Widen esbuild peer dependency from ^0.25.9 to >=0.25.9

## v2.2.0

- Updated dependencies

```
coffeescript              ^2.6.1  →   ^2.7.0
esbuild                 ^0.14.14  →  ^0.17.7
eslint                    ^8.8.0  →  ^8.34.0
eslint-config-prettier    ^8.3.0  →   ^8.6.0
jest                     ^27.4.7  →  ^29.4.2
```

## v2.0.0

- Updated dependencies

```
coffeescript            ^2.5.1  →    ^2.6.1
esbuild               ^0.11.16  →  ^0.14.14
eslint                 ^7.25.0  →    ^8.8.0
eslint-config-airbnb   ^18.2.1  →   ^19.0.4
jest                   ^26.6.3  →   ^27.4.7
```

## v1.0.0

- Initial version
