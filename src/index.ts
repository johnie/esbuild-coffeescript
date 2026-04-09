import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { compile } from 'coffeescript';
import type { OnLoadArgs, OnLoadResult, PartialMessage, Plugin } from 'esbuild';

export interface Options {
  ast?: boolean;
  bare?: boolean;
  filename?: string;
  header?: boolean;
  inlineMap?: boolean;
  literate?: boolean;
  transpile?: Record<string, unknown>;
}

interface CoffeeScriptError extends Error {
  code?: string;
  filename?: string;
  location: {
    first_line: number;
    first_column: number;
    last_line: number;
    last_column: number;
  };
}

const convertMessage = (e: CoffeeScriptError): PartialMessage => {
  const location = {
    file: e.filename,
    line: e.location.first_line,
    column: e.location.first_column,
    length: e.location.last_column - e.location.first_column,
    lineText: e.code?.split('\n')[e.location.first_line],
  };
  return { text: e.message, location };
};

const COFFEE_FILTER = /\.(coffee|litcoffee)$/;

const coffeeScriptPlugin = (options: Options = {}): Plugin => ({
  name: 'coffeescript',
  setup(build) {
    build.onLoad(
      { filter: COFFEE_FILTER },
      async (args: OnLoadArgs): Promise<OnLoadResult> => {
        const source = await readFile(args.path, 'utf8');
        const filename = relative(process.cwd(), args.path);
        const literate = options.literate ?? args.path.endsWith('.litcoffee');

        try {
          const contents = compile(
            source,
            // @types/coffeescript is incomplete: missing `literate`
            {
              filename,
              ...options,
              literate,
            } as Parameters<typeof compile>[1]
          );
          return { contents };
        } catch (e) {
          if (e instanceof Error && 'location' in e) {
            return {
              errors: [convertMessage(e as CoffeeScriptError)],
            };
          }
          throw e;
        }
      }
    );
  },
});

export default coffeeScriptPlugin;
