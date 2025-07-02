import { readFile } from 'fs/promises';
import coffeescript from 'coffeescript';
import { test, expect } from 'vitest';
import esbuild from 'esbuild';
import coffeeScriptPlugin from '../src/index';

const readCoffeeFile = async (path) => await readFile(path, 'utf8');

test('expects importing CoffeeScript to work', async () => {
  const result = await esbuild.build({
    entryPoints: ['test/input/main.coffee'],
    plugins: [coffeeScriptPlugin({ bare: true })],
    write: false,
  });

  const mainCoffeeFile = await readCoffeeFile('test/input/main.coffee');
  const coffee = coffeescript.compile(mainCoffeeFile, { bare: true });

  expect(result.outputFiles).toHaveLength(1);
  expect(
    String.fromCodePoint(...result.outputFiles[0].contents).replace(/\n/g, '')
  ).toContain(coffee.replace(/\n/g, ''));
});

test('compiles .litcoffee', async () => {
  const entry = 'test/input/main.litcoffee';

  const result = await esbuild.build({
    entryPoints: [entry],
    plugins: [coffeeScriptPlugin({ bare: true, literate: true })],
    write: false,
  });

  expect(String.fromCodePoint(...result.outputFiles[0].contents)).toContain(
    'console.log(`the answer is ${answer}`);'
  );
});

test('works with requires when used with commonjs plugin', async () => {
  const entry = 'test/input/import-class/main.coffee';

  const result = await esbuild.build({
    bundle: true,
    entryPoints: [entry],
    plugins: [coffeeScriptPlugin({ bare: true })],
    write: false,
    format: 'esm',
  });

  expect(String.fromCodePoint(...result.outputFiles[0].contents)).toContain(
    'A2 = class A'
  );
});

test('throw on syntax error', async () => {
  const entry = 'test/input/invalid-coffee.coffee';

  try {
    await esbuild.build({
      bundle: true,
      entryPoints: [entry],
      plugins: [coffeeScriptPlugin({ bare: true })],
      write: false,
      logLevel: 'silent',
    });
  } catch (e) {
    expect(e.message).toContain('Build failed with 1 error:');
  }
});
