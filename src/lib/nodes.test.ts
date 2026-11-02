import assert from "node:assert/strict";
import { test } from "node:test";
import { isNodeId, isProjectNode, nodeInfo, nodeLabel, nodes } from "./nodes.ts";

test("registry holds eleven project nodes and five map-only nodes", () => {
  const kinds = Object.values(nodes).map((node) => node.kind);
  assert.equal(kinds.filter((kind) => kind === "project").length, 11);
  assert.equal(kinds.filter((kind) => kind !== "project").length, 5);
});

test("isNodeId knows registered ids only, not inherited object keys", () => {
  assert.equal(isNodeId("auth-service"), true);
  assert.equal(isNodeId("s3"), true);
  assert.equal(isNodeId("nope"), false);
  assert.equal(isNodeId("toString"), false);
});

test("isProjectNode separates pages from map-only nodes", () => {
  assert.equal(isProjectNode("quiz-builder"), true);
  assert.equal(isProjectNode("cloudfront"), false);
  assert.equal(isProjectNode("unknown"), false);
});

test("nodeInfo returns label and kind, or undefined", () => {
  assert.deepEqual(nodeInfo("ai-clients"), { label: "AI clients", kind: "client" });
  assert.equal(nodeInfo("unknown"), undefined);
});

test("nodeLabel returns the label and throws with the registry path for an unknown id", () => {
  assert.equal(nodeLabel("voice-journaling"), "Voice journaling platform");
  assert.throws(() => nodeLabel("nope"), /"nope".*src\/lib\/nodes\.ts/);
});
