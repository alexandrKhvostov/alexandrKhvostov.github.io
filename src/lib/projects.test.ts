import assert from "node:assert/strict";
import { test } from "node:test";
import { fixtureProjects } from "./fixtures.ts";
import { companyLabels, companyOrder, groupByCompany, nextProject, sortProjects } from "./projects.ts";

const slugs = (list: readonly { slug: string }[]) => list.map((item) => item.slug);

test("labels and group order follow the brief", () => {
  assert.deepEqual(companyOrder, ["playme", "sysgears", "side"]);
  assert.equal(companyLabels.playme, "PlayMe");
  assert.equal(companyLabels.sysgears, "SysGears");
  assert.equal(companyLabels.side, "Side project");
});

test("sortProjects orders by company, then order, regardless of input order", () => {
  const shuffled = [fixtureProjects[3]!, fixtureProjects[1]!, fixtureProjects[2]!, fixtureProjects[0]!];
  assert.deepEqual(slugs(sortProjects(shuffled)), [
    "auth-service",
    "quiz-builder",
    "dualio-app",
    "family-budget",
  ]);
});

test("sortProjects does not change its input", () => {
  const input = [fixtureProjects[3]!, fixtureProjects[0]!];
  sortProjects(input);
  assert.deepEqual(slugs(input), ["family-budget", "auth-service"]);
});

test("sortProjects breaks ties by title", () => {
  const a = { company: "side", order: 1, title: "B" } as const;
  const b = { company: "side", order: 1, title: "A" } as const;
  assert.deepEqual(
    sortProjects([a, b]).map((item) => item.title),
    ["A", "B"],
  );
});

test("groupByCompany returns groups in company order with sorted projects and labels", () => {
  const groups = groupByCompany(fixtureProjects);
  assert.deepEqual(
    groups.map((group) => group.label),
    ["PlayMe", "SysGears", "Side project"],
  );
  assert.deepEqual(slugs(groups[0]!.projects), ["auth-service", "quiz-builder"]);
});

test("groupByCompany leaves out companies without projects", () => {
  const groups = groupByCompany(fixtureProjects.filter((project) => project.company !== "sysgears"));
  assert.deepEqual(
    groups.map((group) => group.company),
    ["playme", "side"],
  );
  assert.deepEqual(groupByCompany([]), []);
});

test("nextProject follows page order and wraps to the first", () => {
  assert.equal(nextProject("auth-service", fixtureProjects)?.slug, "quiz-builder");
  assert.equal(nextProject("quiz-builder", fixtureProjects)?.slug, "dualio-app");
  assert.equal(nextProject("family-budget", fixtureProjects)?.slug, "auth-service");
});

test("nextProject is undefined for a lone or unknown project", () => {
  assert.equal(nextProject("auth-service", [fixtureProjects[0]!]), undefined);
  assert.equal(nextProject("missing", fixtureProjects), undefined);
});
