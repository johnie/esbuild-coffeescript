---
"esbuild-coffeescript": minor
---

### Auto-detect literate CoffeeScript from file extension

`.litcoffee` files are now compiled automatically without needing to pass `literate: true`. The option is still respected when explicitly set.

### Fix `inlineMap` option

The `inlineMap` option was incorrectly remapped to CoffeeScript's `sourceMap` option, which returns an object instead of a string and breaks esbuild. It now correctly passes `inlineMap` through to the CoffeeScript compiler, producing an inline base64-encoded source map comment in the output.

### Fix error `lineText` for multi-line files

Error messages now correctly report the specific line where the error occurred, instead of passing the entire source file as `lineText`.

### Safer error handling

The catch clause now validates that the error has CoffeeScript's `location` property before attempting to convert it. Unexpected errors are re-thrown instead of being silently swallowed.

### Export `Options` type

The `Options` interface is now exported, allowing consumers to type-check their plugin configuration.
