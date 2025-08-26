import { readFile } from 'node:fs/promises';
import * as path from 'node:path';
import * as coffeescript from 'coffeescript';
import type { OnLoadArgs, OnLoadResult, PartialMessage, Plugin } from 'esbuild';

interface Options {
  inlineMap?: boolean;
  filename?: string;
  bare?: boolean;
  header?: boolean;
  transpile?: object;
  ast?: boolean;
  literate?: boolean;
}

interface CoffeeScriptError extends Error {
  location: {
    first_line: number;
    first_column: number;
    last_line: number;
    last_column: number;
  };
  code?: string;
  filename?: string;
}

const omit = <T extends object, K extends keyof T>(
  obj: T,
  keys: K[],
): Omit<T, K> => {
  return Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as K)),
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

const coffeeScriptPlugin = (options: Options = {}): Plugin => ({
  name: 'coffeescript',
  setup(build) {
    build.onLoad(
      { filter: /\.(coffee|litcoffee)$/ },
      async (args: OnLoadArgs): Promise<OnLoadResult> => {
        const source = await readFile(args.path, 'utf8');
        const filename = path.relative(process.cwd(), args.path);
        const opt = omit(options, ['inlineMap']);

        try {
          const contents = coffeescript.compile(source, {
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
      },
    );
  },
});

export default coffeeScriptPlugin;
