import assert from "node:assert/strict";
import { test } from "node:test";
import { fixtureProjects } from "./fixtures.ts";
import {
  filterOptions,
  filterParam,
  filterToParam,
  isFilterKey,
  matchesFilter,
  parseFilter,
  projectFilterKeys,
} from "./filters.ts";

test("parseFilter accepts known keys and falls back to all", () => {
  assert.equal(parseFilter("backend"), "backend");
  assert.equal(parseFilter("mobile"), "mobile");
  assert.equal(parseFilter("devops"), "all");
  assert.equal(parseFilter(""), "all");
  assert.equal(parseFilter(null), "all");
  assert.equal(parseFilter(undefined), "all");
});

test("isFilterKey rejects non-strings and unknown values", () => {
  assert.equal(isFilterKey("all"), true);
  assert.equal(isFilterKey("Backend"), false);
  assert.equal(isFilterKey(3), false);
});

test("projectFilterKeys lists disciplines in chip order and counts AI agents as backend", () => {
  assert.deepEqual(projectFilterKeys({ disciplines: ["fullstack", "frontend"], aiAgents: false }), [
    "frontend",
    "fullstack",
  ]);
  assert.deepEqual(projectFilterKeys({ disciplines: ["frontend"], aiAgents: true }), ["backend", "frontend"]);
  assert.deepEqual(projectFilterKeys({ disciplines: ["backend"], aiAgents: true }), ["backend"]);
});

test("matchesFilter: all matches everything, others match their discipline", () => {
  const mobile = { disciplines: ["mobile" as const], aiAgents: false };
  assert.equal(matchesFilter(mobile, "all"), true);
  assert.equal(matchesFilter(mobile, "mobile"), true);
  assert.equal(matchesFilter(mobile, "backend"), false);
  assert.equal(matchesFilter({ disciplines: ["frontend" as const], aiAgents: true }, "backend"), true);
});

test("filterOptions has All first, the agreed labels and only disciplines that exist", () => {
  const options = filterOptions(fixtureProjects);
  assert.deepEqual(
    options.map((option) => option.key),
    ["all", "backend", "frontend", "mobile", "fullstack"],
  );
  assert.deepEqual(
    options.map((option) => option.label),
    ["All", "Backend & AI agents", "Frontend", "Mobile", "Fullstack"],
  );
  const onlyBackend = filterOptions([{ disciplines: ["backend"], aiAgents: false }]);
  assert.deepEqual(
    onlyBackend.map((option) => option.key),
    ["all", "backend"],
  );
});

test("filterOptions of nothing is just All", () => {
  assert.deepEqual(
    filterOptions([]).map((option) => option.key),
    ["all"],
  );
});

test("filterToParam drops all from the URL", () => {
  assert.equal(filterParam, "f");
  assert.equal(filterToParam("all"), null);
  assert.equal(filterToParam("frontend"), "frontend");
});
