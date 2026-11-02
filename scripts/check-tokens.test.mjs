import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { checkFile, checkTree, isAllowedForRawValues } from "./check-tokens.mjs";

const rules = (path, text) => checkFile(path, text).map((v) => v.rule);

test("raw colors are reported with the line number", () => {
  const css = ".a {\n  color: #fff;\n}\n";
  assert.deepEqual(
    checkFile("src/styles/global.css", css).map(({ line, rule }) => ({ line, rule })),
    [{ line: 2, rule: "raw-color" }],
  );
});

test("hex in 3, 4, 6 and 8 digit forms, rgb(a), hsl(a) and oklch are raw colors", () => {
  for (const value of [
    "#abc",
    "#abcd",
    "#aabbcc",
    "#aabbccdd",
    "rgb(0 0 0)",
    "rgba(0,0,0,.5)",
    "hsl(0 0% 0%)",
    "hsla(0,0%,0%,.5)",
    "oklch(60% 0.1 40)",
  ]) {
    assert.deepEqual(rules("src/components/ui/X.astro", `<i style="color: ${value}">`), ["raw-color"], value);
  }
});

test("hash links, ids and private fields are not colors", () => {
  assert.deepEqual(
    rules("src/pages/index.astro", `<a href="#main">x</a><a href="#lab-components">y</a>`),
    [],
  );
  assert.deepEqual(rules("src/scripts/x.ts", "class A { #add = 1; get() { return this.#add; } }"), []);
});

test("font family names are reported outside the allowed paths", () => {
  assert.deepEqual(rules("src/pages/index.astro", `<p style="font-family: 'Geist Variable'">`), ["raw-font"]);
  assert.deepEqual(rules("src/layouts/L.astro", `import "@fontsource-variable/geist-mono";`), ["raw-font"]);
  assert.deepEqual(rules("src/styles/global.css", `font-family: "Geist Mono Variable";`), ["raw-font"]);
});

test("raw colors and font names are allowed in src/styles/tokens/ and src/styles/fonts.css only", () => {
  const text = `:root { --p-x: #aabbcc; --p-y: rgb(1 2 3 / 0.5); --font-sans: "Geist Variable"; }`;
  assert.deepEqual(rules("src/styles/tokens/primitives.css", text), []);
  assert.deepEqual(rules("src/styles/tokens/scale.css", text), []);
  assert.deepEqual(rules("src/styles/fonts.css", text), []);
  assert.notDeepEqual(rules("src/styles/themes/signal-light.css", text), []);
  assert.notDeepEqual(rules("src/styles/tailwind.css", text), []);
  assert.notDeepEqual(rules("src/styles/fonts.css.bak.css", text), []);
  assert.equal(isAllowedForRawValues("src/styles/tokens/deep/nested.css"), true);
  assert.equal(isAllowedForRawValues("src/styles/tokens.css"), false);
});

test("arbitrary values in class attributes are reported", () => {
  for (const className of [
    "bg-[#fff]",
    "p-[13px]",
    "[mask:url(x)]",
    "[&>*]:p-2",
    "data-[state=open]:flex",
    "w-[calc(100%-1rem)]",
  ]) {
    const rule = checkFile("src/components/ui/X.astro", `<div class="flex ${className} gap-2"></div>`).some(
      (v) => v.rule === "arbitrary-value",
    );
    assert.equal(rule, true, className);
  }
});

test("arbitrary values inside class:list and class={} string literals are reported, array syntax is not", () => {
  const astro = `<div class:list={["flex", cond && "p-[13px]", { "gap-2": ok }]} />`;
  assert.deepEqual(
    checkFile("src/components/ui/X.astro", astro).map((v) => v.rule),
    ["arbitrary-value"],
  );
  assert.deepEqual(
    rules("src/components/ui/X.astro", `<div class:list={["flex", cond && "p-4", items[0]]} />`),
    [],
  );
});

test("arbitrary values in ts, js and css are reported", () => {
  assert.deepEqual(rules("src/scripts/x.ts", `el.classList.add("min-w-[40rem]");`), ["arbitrary-value"]);
  assert.deepEqual(rules("src/styles/global.css", `.x { @apply mt-[7px]; }`), ["arbitrary-value"]);
});

test("a clean file has no violations", () => {
  const astro = `---
const items = ["a", "b"];
const first = items[0];
---
<section class="mx-auto flex max-w-page flex-col gap-5 rounded-md border border-line bg-surface-1 p-5 text-ink">
  <a href="#top" class="text-signal hover:decoration-2">{first}</a>
  <input type="text" aria-label="x [y]" />
</section>
<style>
  .x { color: var(--ink); background: color-mix(in oklab, var(--ink), var(--bg) 8%); }
  input[type="text"] { border: 0; }
</style>
`;
  assert.deepEqual(checkFile("src/components/ui/Clean.astro", astro), []);
});

test("checkTree walks src and uses repo-relative paths", () => {
  const root = mkdtempSync(join(tmpdir(), "check-tokens-"));
  try {
    mkdirSync(join(root, "src/styles/tokens"), { recursive: true });
    mkdirSync(join(root, "src/components"), { recursive: true });
    writeFileSync(join(root, "src/styles/tokens/p.css"), ":root { --p-a: #aabbcc; }\n");
    writeFileSync(join(root, "src/components/Bad.astro"), `<p class="bg-[#fff]">x</p>\n`);
    const found = checkTree(root).map((v) => `${v.file}:${v.line}:${v.rule}`);
    assert.deepEqual(
      found.toSorted(),
      ["src/components/Bad.astro:1:arbitrary-value", "src/components/Bad.astro:1:raw-color"].toSorted(),
    );
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
