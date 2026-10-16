import { readFile } from "node:fs/promises";
import path from "node:path";

import { compile } from "coffeescript";
import type { Options as CoffeeScriptOptions } from "coffeescript";
import type { OnLoadArgs, OnLoadResult, Plugin } from "esbuild";

export interface Options {
  bare?: boolean;
  header?: boolean;
  inlineMap?: boolean;
  literate?: boolean;
  transpile?: CoffeeScriptOptions["transpile"];
}

// `@types/coffeescript` omits the `literate` compiler option.
type CompileOptions = CoffeeScriptOptions & { literate: boolean };

// CoffeeScript throws a built-in `SyntaxError` with a Jison `location` attached.
// Only the start of the range is guaranteed; `last_column` may be absent.
interface CoffeeScriptSyntaxError extends SyntaxError {
  location: {
    first_column: number;
    first_line: number;
    last_column?: number;
  };
}

const isCoffeeScriptSyntaxError = (
  error: unknown
): error is CoffeeScriptSyntaxError => {
  if (!(error instanceof SyntaxError && "location" in error)) {
    return false;
  }

  const { location } = error;

  return (
    typeof location === "object" &&
    location !== null &&
    "first_line" in location &&
    typeof location.first_line === "number" &&
    "first_column" in location &&
    typeof location.first_column === "number" &&
    (!("last_column" in location) ||
      location.last_column === undefined ||
      typeof location.last_column === "number")
  );
};

const COFFEE_FILTER = /\.(?:coffee|litcoffee)$/;

const coffeeScriptPlugin = (options: Options = {}): Plugin => ({
  name: "coffeescript",
  setup(build) {
    // esbuild re-runs onLoad for every file on each rebuild. Compiling dominates
    // build time, so reuse the output while a file's source is unchanged.
    const cache = new Map<string, { contents: string; source: string }>();

    build.onLoad(
      { filter: COFFEE_FILTER },
      async (args: OnLoadArgs): Promise<OnLoadResult> => {
        const source = await readFile(args.path, "utf-8");
        const cached = cache.get(args.path);

        if (cached?.source === source) {
          return { contents: cached.contents };
        }

        const compileOptions: CompileOptions = {
          ...options,
          filename: path.relative(process.cwd(), args.path),
          literate: options.literate ?? args.path.endsWith(".litcoffee"),
        };

        try {
          const contents = compile(source, compileOptions);

          cache.set(args.path, { contents, source });

          return { contents };
        } catch (error) {
          if (!isCoffeeScriptSyntaxError(error)) {
            throw error;
          }

          const { location } = error;
          const lastColumn = location.last_column ?? location.first_column;

          return {
            errors: [
              {
                location: {
                  column: location.first_column,
                  file: compileOptions.filename,
                  length: lastColumn - location.first_column,
                  line: location.first_line + 1,
                  lineText: source.split("\n")[location.first_line],
                },
                text: error.message,
              },
            ],
          };
        }
      }
    );
  },
});

export default coffeeScriptPlugin;
