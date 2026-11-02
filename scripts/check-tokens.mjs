// Enforces the two styling rules from DESIGN.md that oxlint cannot see in .astro markup:
//   (a) no raw colors or font family names outside src/styles/tokens/ and src/styles/fonts.css;
//   (b) no Tailwind arbitrary values (bg-[#fff], p-[13px], [mask:...], [&>*]:p-2).
// No dependencies. Exit code 1 and file:line messages on any violation.
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const EXTENSIONS = [".astro", ".ts", ".js", ".mjs", ".css"];

/** Paths (posix, relative to the repository root) where raw values are allowed. */
const RAW_VALUE_ALLOWED = ["src/styles/tokens/", "src/styles/fonts.css"];

const FONT_NAMES = ["IBM Plex", "Instrument Serif", "ibm-plex", "instrument-serif"];

/** [rule id, message, regex]. The hex rule skips private class members (`this.#abc`, `#abc = 1`) and word-glued hashes. */
const RAW_VALUE_RULES = [
  [
    "raw-color",
    "raw color literal; use a semantic token",
    /(?<![\w.&])#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})(?![\w-])(?!\s*[=(])|\b(?:rgba?|hsla?|hwb|oklch|oklab|lch|lab)\(/g,
  ],
  [
    "raw-font",
    "font family name; use the --font-* token",
    new RegExp(FONT_NAMES.map((name) => name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|"), "gi"),
  ],
];

/** A Tailwind arbitrary value written as `utility-[value]` anywhere in the file (css, ts, js, astro). */
const ARBITRARY_VALUE = /(?<![\w\]])(?:[\w:!&>*()-]+)?-\[[^\]\s]+\]/g;
/** Arbitrary property or variant at the start of a class token: `[mask:url(x)]`, `[&>*]:p-2`. */
const ARBITRARY_BRACKET = /(?<=["'`\s])\[(?:[&\w-]+:[^\]\s"'`]*|&[^\]\s"'`]*)\](?=[:\s"'`]|$)/g;
/** `class="..."`, `class='...'`, `class={...}`, `class:list={...}`, `className=...` in markup. */
const CLASS_ATTRIBUTE =
  /\b(?:class|className|class:list)\s*=\s*(?:"([^"]*)"|'([^']*)'|\{((?:[^{}]|\{[^{}]*\})*)\})/g;

export function isAllowedForRawValues(path) {
  const posix = path.split(sep).join("/");
  return RAW_VALUE_ALLOWED.some((allowed) =>
    allowed.endsWith("/") ? posix.startsWith(allowed) : posix === allowed,
  );
}

function lineOf(text, index) {
  let line = 1;
  for (let i = 0; i < index; i += 1) if (text.charCodeAt(i) === 10) line += 1;
  return line;
}

/**
 * Checks one file.
 * @param {string} path posix-style path relative to the repository root
 * @param {string} text file contents
 * @returns {{ file: string, line: number, rule: string, message: string, match: string }[]}
 */
export function checkFile(path, text) {
  const violations = [];
  const seen = new Set();
  const add = (index, rule, message, match) => {
    const key = `${rule}:${index}`;
    if (seen.has(key)) return;
    seen.add(key);
    violations.push({ file: path, line: lineOf(text, index), rule, message, match });
  };

  if (!isAllowedForRawValues(path)) {
    for (const [rule, message, pattern] of RAW_VALUE_RULES) {
      for (const found of text.matchAll(pattern)) add(found.index, rule, message, found[0]);
    }
  }

  for (const found of text.matchAll(ARBITRARY_VALUE)) {
    add(found.index, "arbitrary-value", "Tailwind arbitrary value; add a token instead", found[0]);
  }
  for (const found of text.matchAll(ARBITRARY_BRACKET)) {
    add(
      found.index,
      "arbitrary-value",
      "Tailwind arbitrary property or variant; add a token instead",
      found[0],
    );
  }
  if (path.endsWith(".astro")) {
    for (const attribute of text.matchAll(CLASS_ATTRIBUTE)) {
      const quoted = attribute[1] ?? attribute[2];
      // class="..." is one string; class={...} may hold several string literals around JS syntax.
      const strings =
        quoted !== undefined
          ? [{ value: quoted, offset: attribute[0].indexOf(quoted) }]
          : [...attribute[3].matchAll(/"([^"]*)"|'([^']*)'|`([^`]*)`/g)].map((literal) => ({
              value: literal[1] ?? literal[2] ?? literal[3],
              offset: attribute[0].indexOf(attribute[3]) + literal.index + 1,
            }));
      for (const { value, offset } of strings) {
        for (const token of value.matchAll(/\S*\[\S*\]\S*/g)) {
          add(
            attribute.index + offset + token.index,
            "arbitrary-value",
            "Tailwind arbitrary value in a class attribute; add a token instead",
            token[0],
          );
        }
      }
    }
  }

  return violations.toSorted((a, b) => a.line - b.line);
}

function* walk(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const full = join(directory, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (EXTENSIONS.some((extension) => entry.name.endsWith(extension))) yield full;
  }
}

export function checkTree(root) {
  const violations = [];
  for (const file of walk(join(root, "src"))) {
    const path = relative(root, file).split(sep).join("/");
    violations.push(...checkFile(path, readFileSync(file, "utf8")));
  }
  return violations;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = process.cwd();
  const violations = checkTree(root);
  for (const v of violations) console.error(`${v.file}:${v.line}  [${v.rule}] ${v.message}: ${v.match}`);
  if (violations.length) {
    console.error(
      `\ncheck:tokens failed: ${violations.length} violation(s). Add a token instead of an exception.`,
    );
    process.exit(1);
  }
  console.log("check:tokens ok");
}
