# Contributing to esbuild-coffeescript

Thanks for your interest in contributing! This guide will help you get started.

## Getting Started

1. [Fork the repository](https://github.com/johnie/esbuild-coffeescript/fork) and clone your fork:

   ```bash
   git clone https://github.com/<your-username>/esbuild-coffeescript.git
   cd esbuild-coffeescript
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

   This also sets up [Lefthook](https://github.com/evilmartians/lefthook) git hooks via the `prepare` script.

3. Make sure everything works:

   ```bash
   pnpm run ci
   ```

## Development Workflow

### Branch from `master`

Create a feature branch for your changes:

```bash
git checkout -b feature/my-change
```

### Code Quality

This project uses [Ultracite](https://github.com/haydenbleasel/ultracite) (powered by oxlint and oxfmt) for formatting and linting. A pre-commit hook runs automatically to format staged files.

To manually check or fix issues:

```bash
# Check for problems
pnpm run check

# Auto-fix formatting and lint issues
pnpm run fix
```

### Testing

All changes should include tests. We use [Vitest](https://vitest.dev/) as the test runner.

```bash
# Run tests once
pnpm test

# Watch mode during development
pnpm test:watch

# Generate coverage report
pnpm test:coverage
```

### Type Checking and Building

`tsconfig.json` type-checks `src` and `test` without emitting; `tsconfig.build.json` emits `dist` from `src`:

```bash
pnpm typecheck
pnpm build
```

### Full CI Check

Before pushing, run the same checks that CI runs:

```bash
pnpm run ci
```

This runs lint checks, type checks, tests, and the build in sequence.

## Submitting a Pull Request

1. Make sure `pnpm run ci` passes locally.
2. Write a clear PR description explaining **what** changed and **why**.
3. Keep PRs focused -- one logical change per PR.
4. If your PR fixes an open issue, reference it in the description (e.g., `Fixes #123`).

## Reporting Bugs

When [opening an issue](https://github.com/johnie/esbuild-coffeescript/issues/new), include:

- Node.js and pnpm versions
- esbuild and esbuild-coffeescript versions
- A [minimal reproduction](https://stackoverflow.com/help/minimal-reproducible-example)
- Expected vs. actual behavior

## Project Structure

```
src/index.ts       # Plugin source code
test/              # Test files
dist/              # Compiled output (git-ignored)
```

The plugin is a single-file esbuild plugin that compiles `.coffee` and `.litcoffee` files using the CoffeeScript compiler.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
