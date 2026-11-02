import assert from "node:assert/strict";
import { test } from "node:test";
import { foldGroups, foldList } from "./fold.ts";
import type { ToolGroup } from "./types.ts";

function group(title: string, size: number): ToolGroup {
  return {
    title,
    note: `${title} note`,
    items: Array.from({ length: size }, (_, i) => ({ name: `${title}${i}`, does: "" })),
  };
}

test("foldList leaves a short list alone", () => {
  assert.deepEqual(foldList([1, 2, 3, 4], 3, 4), { shown: [1, 2, 3, 4], hidden: [] });
});

test("foldList keeps the first items of a long list", () => {
  assert.deepEqual(foldList([1, 2, 3, 4, 5], 3, 4), { shown: [1, 2, 3], hidden: [4, 5] });
});

test("foldGroups leaves a short set of groups alone", () => {
  const folded = foldGroups([group("a", 3), group("b", 3)], 5, 8);
  assert.equal(folded.shown.length, 2);
  assert.equal(folded.hiddenCount, 0);
});

test("foldGroups shows whole groups until enough items show", () => {
  const folded = foldGroups([group("a", 2), group("b", 4), group("c", 3), group("d", 2)], 5, 8);
  assert.deepEqual(
    folded.shown.map((g) => g.title),
    ["a", "b"],
  );
  assert.deepEqual(
    folded.hidden.map((g) => g.title),
    ["c", "d"],
  );
  assert.equal(folded.hiddenCount, 5);
});

test("foldGroups splits a first group longer than the threshold and drops the note from its rest", () => {
  const folded = foldGroups([group("a", 10), group("b", 2)], 5, 8);
  assert.equal(folded.shown[0]?.items.length, 5);
  assert.equal(folded.hidden[0]?.title, "a");
  assert.equal(folded.hidden[0]?.note, undefined);
  assert.equal(folded.hidden[0]?.items.length, 5);
  assert.equal(folded.hiddenCount, 7);
});
