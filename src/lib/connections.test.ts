import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assertValidProjects,
  incomingConnections,
  outgoingConnections,
  validateProjects,
} from "./connections.ts";
import { fixtureProjects } from "./fixtures.ts";

const only = (slug: string) => fixtureProjects.filter((project) => project.slug === slug);

test("validateProjects passes the fixture projects", () => {
  assert.deepEqual(validateProjects(fixtureProjects), []);
});

test("validateProjects flags a slug that is not a project node, naming the file", () => {
  const problems = validateProjects([{ slug: "random-name", title: "X", connections: [] }]);
  assert.equal(problems.length, 1);
  assert.match(problems[0]!, /random-name\.yaml/);
  assert.match(problems[0]!, /src\/lib\/nodes\.ts/);
});

test("validateProjects flags a map-only id used as a slug", () => {
  assert.equal(validateProjects([{ slug: "s3", title: "X", connections: [] }]).length, 1);
});

test("validateProjects flags a connection to an unknown id and names both ends", () => {
  const problems = validateProjects([
    { slug: "auth-service", title: "X", connections: [{ to: "ghost", label: "talks to" }] },
  ]);
  assert.equal(problems.length, 1);
  assert.match(problems[0]!, /"auth-service".*"ghost"/);
});

test("validateProjects flags a connection to itself and collects every problem", () => {
  const problems = validateProjects([
    { slug: "auth-service", title: "X", connections: [{ to: "auth-service", label: "me" }] },
    { slug: "nope", title: "Y", connections: [{ to: "ghost", label: "x" }] },
  ]);
  assert.equal(problems.length, 3);
});

test("assertValidProjects throws one error that lists the problems, and is silent when valid", () => {
  assert.doesNotThrow(() => assertValidProjects(fixtureProjects));
  assert.throws(
    () => assertValidProjects([{ slug: "nope", title: "Y", connections: [{ to: "ghost", label: "x" }] }]),
    /Invalid project data[\s\S]*nope\.yaml[\s\S]*ghost/,
  );
});

test("outgoingConnections links to a project that has a file", () => {
  const out = outgoingConnections("auth-service", fixtureProjects);
  const builder = out.find((view) => view.id === "quiz-builder");
  assert.equal(builder?.href, "/quiz-builder/");
  assert.equal(builder?.label, "Quiz builder MCP");
  assert.equal(builder?.edgeLabel, "issues tokens for");
});

test("outgoingConnections is plain text for a planned project without a file and for map-only nodes", () => {
  const out = outgoingConnections("quiz-builder", fixtureProjects);
  const planned = out.find((view) => view.id === "media-storage");
  assert.equal(planned?.href, undefined);
  assert.equal(planned?.kind, "project");
  const mapOnly = outgoingConnections("auth-service", fixtureProjects).find((view) => view.id === "s3");
  assert.equal(mapOnly?.href, undefined);
  assert.equal(mapOnly?.kind, "storage");
});

test("outgoingConnections of an unknown or unconnected project is empty", () => {
  assert.deepEqual(outgoingConnections("missing", fixtureProjects), []);
  assert.deepEqual(outgoingConnections("dualio-app", fixtureProjects), []);
});

test("incomingConnections lists projects that point here, as links with their own title", () => {
  const incoming = incomingConnections("auth-service", fixtureProjects);
  assert.equal(incoming.length, 1);
  assert.deepEqual(incoming[0], {
    id: "quiz-builder",
    label: "Sample builder",
    kind: "project",
    edgeLabel: "asks for tokens from",
    href: "/quiz-builder/",
  });
});

test("incomingConnections is empty when nothing points here, and ignores self", () => {
  assert.deepEqual(incomingConnections("dualio-app", fixtureProjects), []);
  assert.deepEqual(incomingConnections("auth-service", only("auth-service")), []);
});
