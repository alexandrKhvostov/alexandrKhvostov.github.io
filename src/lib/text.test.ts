import assert from "node:assert/strict";
import { test } from "node:test";
import { wrapText } from "./text.ts";

test("short text stays on one line", () => {
  assert.deepEqual(wrapText("Auth service", 20), ["Auth service"]);
});

test("wraps on spaces without exceeding the limit", () => {
  assert.deepEqual(wrapText("Quiz builder MCP", 10), ["Quiz", "builder", "MCP"]);
  assert.deepEqual(wrapText("one two three four", 9), ["one two", "three", "four"]);
});

test("splits a long word after its hyphens", () => {
  assert.deepEqual(wrapText("auth-service-core", 8), ["auth-", "service-", "core"]);
});

test("a long piece without a hyphen stays whole", () => {
  assert.deepEqual(wrapText("infrastructure", 5), ["infrastructure"]);
});

test("empty text gives no lines and extra spaces are ignored", () => {
  assert.deepEqual(wrapText("", 10), []);
  assert.deepEqual(wrapText("  a   b ", 10), ["a b"]);
});

test("a limit below one still works", () => {
  assert.deepEqual(wrapText("a b", 0), ["a", "b"]);
});
