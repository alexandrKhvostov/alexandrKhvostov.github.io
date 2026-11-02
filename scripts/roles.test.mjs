// Keeps src/styles/roles.ts (used by /lab) in step with the theme files and the Tailwind registration.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { colorRoles, otherThemeRoles, typeRoles } from "../src/styles/roles.ts";
import { themes } from "../src/styles/themes/index.ts";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
const declares = (css, name) => new RegExp(`^\\s*--${name}:`, "m").test(css);

test("every theme in the list has a file that sets every color and non-color role", () => {
  for (const theme of themes) {
    const css = read(`src/styles/themes/${theme.id}.css`);
    assert.ok(css.includes(`:root[data-theme="${theme.id}"]`), `${theme.id}: selector`);
    for (const name of [...colorRoles.map((role) => role.name), ...otherThemeRoles]) {
      assert.ok(declares(css, name), `${theme.id} is missing --${name}`);
    }
  }
});

test("every color role is registered in tailwind.css and points at its role", () => {
  const css = read("src/styles/tailwind.css");
  for (const { name } of colorRoles) {
    assert.ok(css.includes(`--color-${name}: var(--${name});`), `tailwind.css is missing --color-${name}`);
  }
});

test("every type role has a size and line height in scale.css and in tailwind.css", () => {
  const scale = read("src/styles/tokens/scale.css");
  const tailwind = read("src/styles/tailwind.css");
  for (const { name } of typeRoles) {
    for (const suffix of ["", "--line-height"]) {
      assert.ok(declares(scale, `text-${name}${suffix}`), `scale.css is missing --text-${name}${suffix}`);
      assert.ok(
        declares(tailwind, `text-${name}${suffix}`),
        `tailwind.css is missing --text-${name}${suffix}`,
      );
    }
  }
});

test("themes set only roles and read only primitives for colors", () => {
  for (const theme of themes) {
    const css = read(`src/styles/themes/${theme.id}.css`);
    for (const [, name, value] of css.matchAll(/^\s*--([\w-]+):\s*([^;]+);/gm)) {
      assert.ok(
        /var\(--(p-|shadow-pop-shape)/.test(value) || value.trim() === "none",
        `${theme.id}: --${name} is ${value}`,
      );
    }
  }
});
