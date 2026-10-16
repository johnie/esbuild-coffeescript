import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { compile } from "coffeescript";
import esbuild from "esbuild";
import { describe, expect, it } from "vitest";

import coffeeScriptPlugin from "../src/index.js";

const LITERATE_OUTPUT = `console.log(\`the answer is \${answer}\`);`;

const decode = (result: esbuild.BuildResult) =>
  new TextDecoder().decode(result.outputFiles?.[0].contents);

describe(coffeeScriptPlugin, () => {
  it("expects importing CoffeeScript to work", async () => {
    const result = await esbuild.build({
      entryPoints: ["test/input/main.coffee"],
      plugins: [coffeeScriptPlugin({ bare: true })],
      write: false,
    });

    const mainCoffeeFile = await readFile("test/input/main.coffee", "utf-8");
    const coffee = compile(mainCoffeeFile, { bare: true });

    expect(result.outputFiles).toHaveLength(1);
    expect(decode(result).replaceAll("\n", "")).toContain(
      coffee.replaceAll("\n", "")
    );
  });

  it("compiles .litcoffee", async () => {
    const result = await esbuild.build({
      entryPoints: ["test/input/main.litcoffee"],
      plugins: [coffeeScriptPlugin({ bare: true, literate: true })],
      write: false,
    });

    expect(decode(result)).toContain(LITERATE_OUTPUT);
  });

  it("works with requires when used with commonjs plugin", async () => {
    const result = await esbuild.build({
      bundle: true,
      entryPoints: ["test/input/import-class/main.coffee"],
      format: "esm",
      plugins: [coffeeScriptPlugin({ bare: true })],
      write: false,
    });

    expect(decode(result)).toContain("A2 = class A");
  });

  it("throw on syntax error", async () => {
    await expect(
      esbuild.build({
        bundle: true,
        entryPoints: ["test/input/invalid-coffee.coffee"],
        logLevel: "silent",
        plugins: [coffeeScriptPlugin({ bare: true })],
        write: false,
      })
    ).rejects.toThrow("Build failed with 1 error");
  });

  it("compiles with default options (no args)", async () => {
    const result = await esbuild.build({
      entryPoints: ["test/input/main.coffee"],
      plugins: [coffeeScriptPlugin()],
      write: false,
    });

    expect(decode(result)).toContain("(function() {");
  });

  it("inlineMap: true produces source map in output", async () => {
    const result = await esbuild.build({
      entryPoints: ["test/input/main.coffee"],
      plugins: [coffeeScriptPlugin({ bare: true, inlineMap: true })],
      sourcemap: "inline",
      write: false,
    });

    expect(decode(result)).toContain(
      "//# sourceMappingURL=data:application/json;base64,"
    );
  });

  it("compiles .litcoffee without explicit literate option", async () => {
    const result = await esbuild.build({
      entryPoints: ["test/input/main.litcoffee"],
      plugins: [coffeeScriptPlugin({ bare: true })],
      write: false,
    });

    expect(decode(result)).toContain(LITERATE_OUTPUT);
  });

  it("error contains accurate location information", async () => {
    await expect(
      esbuild.build({
        entryPoints: ["test/input/invalid-coffee.coffee"],
        logLevel: "silent",
        plugins: [coffeeScriptPlugin()],
        write: false,
      })
    ).rejects.toMatchObject({
      errors: [
        {
          location: {
            column: 8,
            file: "test/input/invalid-coffee.coffee",
            line: 3,
            lineText: "hello . 8",
          },
        },
      ],
    });
  });

  it("recompiles a changed file on rebuild", async () => {
    const dir = await mkdtemp(path.join(tmpdir(), "esbuild-coffeescript-"));
    const entry = path.join(dir, "entry.coffee");

    await writeFile(entry, "console.log 'first'\n");

    const context = await esbuild.context({
      entryPoints: [entry],
      plugins: [coffeeScriptPlugin({ bare: true })],
      write: false,
    });

    try {
      expect(decode(await context.rebuild())).toContain('"first"');

      await writeFile(entry, "console.log 'second'\n");

      expect(decode(await context.rebuild())).toContain('"second"');
    } finally {
      await context.dispose();
      await rm(dir, { force: true, recursive: true });
    }
  });
});
