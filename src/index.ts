import { readFile } from 'node:fs/promises';
import { relative } from 'node:path';
import { compile } from 'coffeescript';
import type { OnLoadArgs, OnLoadResult, PartialMessage, Plugin } from 'esbuild';

interface Options {
  ast?: boolean;
  bare?: boolean;
  filename?: string;
  header?: boolean;
  inlineMap?: boolean;
  literate?: boolean;
  transpile?: object;
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

const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K))
  ) as Omit<T, K>;
};

const convertMessage = (e: CoffeeScriptError): PartialMessage => {
  const location = {
    file: e.filename,
    line: e.location.first_line,
    column: e.location.first_column,
    length: e.location.last_column - e.location.first_column,
    lineText: e.code,
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
        const opt = omit(options, ['inlineMap']);

        try {
          const contents = compile(source, {
            filename,
            ...opt,
            sourceMap: options.inlineMap,
          });
          return { contents };
        } catch (e) {
          return {
            errors: [convertMessage(e as CoffeeScriptError)],
          };
        }
      }
    );
  },
});

export default coffeeScriptPlugin;
