import assert from "node:assert/strict";
import { test } from "node:test";
import { cssTimeToMs } from "./motion.ts";

test("cssTimeToMs reads milliseconds as written in the tokens", () => {
  assert.equal(cssTimeToMs("450ms"), 450);
});

test("cssTimeToMs reads seconds as the minifier writes them", () => {
  assert.equal(cssTimeToMs(".45s"), 450);
  assert.equal(cssTimeToMs(" 0.12s "), 120);
});

test("cssTimeToMs gives 0 for anything that is not a time", () => {
  assert.equal(cssTimeToMs(""), 0);
  assert.equal(cssTimeToMs("450"), 0);
  assert.equal(cssTimeToMs("ease-out"), 0);
});
