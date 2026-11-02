import assert from "node:assert/strict";
import { test } from "node:test";
import {
  arrowHead,
  diagramPresets,
  glyphRatio,
  layoutPipeline,
  layoutSequence,
  type DiagramLayout,
} from "./diagram-layout.ts";
import { pipelineFixture, sequenceFixture } from "./fixtures.ts";

const wideSequence = () =>
  layoutSequence(sequenceFixture.nodes, sequenceFixture.steps, diagramPresets.sequence.wide);
const narrowSequence = () =>
  layoutSequence(sequenceFixture.nodes, sequenceFixture.steps, diagramPresets.sequence.narrow);
const horizontal = () =>
  layoutPipeline(pipelineFixture.nodes, pipelineFixture.steps, diagramPresets.pipeline.wide);
const vertical = () =>
  layoutPipeline(pipelineFixture.nodes, pipelineFixture.steps, diagramPresets.pipeline.narrow);

/** Every number in a path or polygon string. */
const numbers = (text: string): number[] => (text.match(/-?\d+(?:\.\d+)?/g) ?? []).map(Number);

function assertInside(layout: DiagramLayout): void {
  for (const node of layout.nodes) {
    assert.ok(node.x >= 0 && node.x + node.width <= layout.width, `node ${node.id} x`);
    assert.ok(node.y >= 0 && node.y + node.height <= layout.height, `node ${node.id} y`);
  }
  for (const edge of layout.edges) {
    const points = numbers(edge.head);
    for (let i = 0; i < points.length; i += 2) {
      assert.ok(
        points[i]! >= -0.1 && points[i]! <= layout.width + 0.1,
        `edge ${edge.step} head x ${points[i]}`,
      );
      assert.ok(
        points[i + 1]! >= -0.1 && points[i + 1]! <= layout.height + 0.1,
        `edge ${edge.step} head y ${points[i + 1]}`,
      );
    }
    assert.ok(
      edge.badge.x - layout.badgeRadius >= -0.1 && edge.badge.x + layout.badgeRadius <= layout.width + 0.1,
      `edge ${edge.step} badge x`,
    );
    assert.ok(
      edge.badge.y - layout.badgeRadius >= -0.1 && edge.badge.y + layout.badgeRadius <= layout.height + 0.1,
      `edge ${edge.step} badge y`,
    );
  }
}

test("arrowHead puts its tip first and points along the direction", () => {
  assert.equal(arrowHead({ x: 100, y: 50 }, { x: 1, y: 0 }), "100,50 92,54 92,46");
  assert.equal(arrowHead({ x: 100, y: 50 }, { x: -1, y: 0 }), "100,50 108,46 108,54");
  assert.equal(arrowHead({ x: 10, y: 10 }, { x: 0, y: -1 }), "10,10 14,18 6,18");
});

test("sequence: one edge per step, in order, and one lifeline per actor", () => {
  const layout = wideSequence();
  assert.deepEqual(
    layout.edges.map((edge) => edge.step),
    [0, 1, 2, 3, 4, 5],
  );
  assert.deepEqual(
    layout.lifelines.map((line) => line.id),
    ["client", "gateway", "service", "store"],
  );
  assert.deepEqual(
    layout.nodes.map((node) => node.id),
    ["client", "gateway", "service", "store"],
  );
});

test("sequence: actors are spread left to right inside the width and lifelines run under the boxes", () => {
  const layout = wideSequence();
  const centers = layout.nodes.map((node) => node.cx);
  assert.deepEqual(
    centers,
    centers.toSorted((a, b) => a - b),
  );
  assert.equal(layout.width, 800);
  assertInside(layout);
  for (const line of layout.lifelines) {
    const box = layout.nodes.find((node) => node.id === line.id)!;
    assert.equal(line.x, box.cx);
    assert.equal(line.y1, box.y + box.height);
    assert.ok(line.y2 <= layout.height);
  }
});

test("sequence: messages go top to bottom and every message sits below the boxes", () => {
  const layout = wideSequence();
  const ys = layout.edges.map((edge) => edge.badge.y);
  assert.deepEqual(
    ys,
    ys.toSorted((a, b) => a - b),
  );
  assert.ok(ys[0]! > layout.nodes[0]!.height);
  assertInside(layout);
});

test("sequence: a reply points the other way and a self message loops to the right", () => {
  const layout = wideSequence();
  const [go, back] = [layout.edges[2]!, layout.edges[3]!];
  assert.ok(numbers(go.path)[2]! > numbers(go.path)[0]!, "step 3 runs left to right");
  assert.ok(numbers(back.path)[2]! < numbers(back.path)[0]!, "step 4 runs right to left");
  const self = layout.edges[4]!;
  assert.match(self.path, / h 28 v 18 h -21$/);
  assert.equal(self.label?.anchor, "start");
});

test("sequence: labels sit above their arrow in the wide layout and are absent in the narrow one", () => {
  const wide = wideSequence();
  const first = wide.edges[0]!;
  assert.equal(first.label?.lines[0]?.text, "send request");
  assert.ok(first.label!.lines[0]!.y < first.badge.y);
  assert.equal(first.label?.anchor, "middle");
  const narrow = narrowSequence();
  assert.ok(narrow.edges.every((edge) => edge.label === undefined));
});

test("sequence: a label never reaches the badge or the arrowhead, in either direction", () => {
  const layout = wideSequence();
  const glyph = diagramPresets.sequence.wide.fontSize * glyphRatio;
  for (const edge of layout.edges) {
    const label = edge.label;
    if (!label || label.anchor !== "middle") continue;
    const half = (Math.max(...label.lines.map((line) => line.text.length)) * glyph) / 2;
    const left = label.x - half;
    const right = label.x + half;
    const [x1, , x2] = numbers(edge.path);
    const forward = x2! > x1!;
    const badgeEdge = forward ? edge.badge.x + layout.badgeRadius : edge.badge.x - layout.badgeRadius;
    if (forward) {
      assert.ok(left >= badgeEdge, `step ${edge.step}: label starts at ${left}, badge ends at ${badgeEdge}`);
      assert.ok(right <= x2!, `step ${edge.step}: label ends past the arrow`);
    } else {
      assert.ok(
        right <= badgeEdge,
        `step ${edge.step}: label ends at ${right}, badge starts at ${badgeEdge}`,
      );
      assert.ok(left >= x2!, `step ${edge.step}: label ends past the arrow`);
    }
  }
});

test("sequence: the narrow layout fits 360 units", () => {
  const narrow = narrowSequence();
  assert.equal(narrow.width, 360);
  assertInside(narrow);
});

test("sequence: many actors widen the viewBox instead of crushing the columns", () => {
  const nodes = Array.from({ length: 8 }, (_, index) => ({ id: `n${index}`, label: `Node ${index}` }));
  const steps = [{ from: "n0", to: "n7", label: "x", note: "" }];
  const layout = layoutSequence(nodes, steps, diagramPresets.sequence.narrow);
  assert.equal(layout.width, 8 * 72 + 24);
  assertInside(layout);
});

test("sequence: a long label wraps and makes room", () => {
  const nodes = sequenceFixture.nodes.slice(0, 2);
  const short = layoutSequence(
    nodes,
    [{ from: "client", to: "gateway", label: "go", note: "" }],
    diagramPresets.sequence.wide,
  );
  const long = layoutSequence(
    nodes,
    [
      {
        from: "client",
        to: "gateway",
        label: "a rather long message label that needs several lines to fit",
        note: "",
      },
    ],
    { ...diagramPresets.sequence.wide, width: 300, minColumn: 60 },
  );
  assert.ok(long.edges[0]!.label!.lines.length > 1);
  assert.ok(long.height > short.height);
});

test("sequence: a step to an unknown node throws with the id", () => {
  assert.throws(
    () =>
      layoutSequence(
        sequenceFixture.nodes,
        [{ from: "client", to: "ghost", label: "x", note: "" }],
        diagramPresets.sequence.wide,
      ),
    /"ghost"/,
  );
});

test("pipeline horizontal: stages sit in a row, left to right, equal size", () => {
  const layout = horizontal();
  assert.equal(layout.lifelines.length, 0);
  const xs = layout.nodes.map((node) => node.x);
  assert.deepEqual(
    xs,
    xs.toSorted((a, b) => a - b),
  );
  assert.equal(new Set(layout.nodes.map((node) => node.y)).size, 1);
  assert.equal(new Set(layout.nodes.map((node) => node.width)).size, 1);
  assert.equal(layout.edges.length, pipelineFixture.steps.length);
  assertInside(layout);
});

test("pipeline horizontal: neighbours get a straight arrow, a retry and a skip curve below, a self step loops above", () => {
  const layout = horizontal();
  const [forward, , retry, , skip, self] = layout.edges;
  assert.doesNotMatch(forward!.path, /C/);
  assert.match(retry!.path, /C/);
  assert.match(skip!.path, /C/);
  const rowBottom = layout.nodes[0]!.y + layout.nodes[0]!.height;
  assert.ok(retry!.badge.y > rowBottom, "retry badge below the row");
  assert.ok(skip!.badge.y > rowBottom, "skip badge below the row");
  assert.ok(self!.badge.y < layout.nodes[0]!.y, "self badge above the row");
});

test("pipeline: arcs get separate depths, the longer one deeper", () => {
  const layout = horizontal();
  const retry = layout.edges[2]!;
  const skip = layout.edges[4]!;
  assert.ok(skip.badge.y > retry.badge.y);
});

test("pipeline horizontal: two arrows between the same neighbours do not overlap", () => {
  const nodes = [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
  ];
  const steps = [
    { from: "a", to: "b", label: "one", note: "" },
    { from: "a", to: "b", label: "two", note: "" },
  ];
  const layout = layoutPipeline(nodes, steps, diagramPresets.pipeline.wide);
  assert.notEqual(layout.edges[0]!.badge.y, layout.edges[1]!.badge.y);
});

test("pipeline vertical: stages stack top to bottom, arcs go to the right, the loop to the left", () => {
  const layout = vertical();
  const ys = layout.nodes.map((node) => node.y);
  assert.deepEqual(
    ys,
    ys.toSorted((a, b) => a - b),
  );
  assert.equal(new Set(layout.nodes.map((node) => node.x)).size, 1);
  assert.equal(layout.width, 360);
  assertInside(layout);
  const node = layout.nodes[0]!;
  const [retry, skip, self] = [layout.edges[2]!, layout.edges[4]!, layout.edges[5]!];
  assert.ok(retry.badge.x > node.x + node.width);
  assert.ok(skip.badge.x > retry.badge.x);
  assert.ok(self.badge.x < node.x);
});

test("pipeline vertical: without arcs or loops the column is centred", () => {
  const nodes = [
    { id: "a", label: "A" },
    { id: "b", label: "B" },
    { id: "c", label: "C" },
  ];
  const steps = [
    { from: "a", to: "b", label: "x", note: "" },
    { from: "b", to: "c", label: "y", note: "" },
  ];
  const layout = layoutPipeline(nodes, steps, diagramPresets.pipeline.narrow);
  const node = layout.nodes[0]!;
  assert.equal(node.x + node.width / 2, layout.width / 2);
  assertInside(layout);
});

test("pipeline horizontal: many stages widen the viewBox rather than shrink below the minimum", () => {
  const nodes = Array.from({ length: 12 }, (_, index) => ({ id: `n${index}`, label: `Stage ${index}` }));
  const steps = [{ from: "n0", to: "n1", label: "x", note: "" }];
  const layout = layoutPipeline(nodes, steps, diagramPresets.pipeline.wide);
  assert.ok(layout.width > 800);
  assertInside(layout);
});

test("pipeline: a step to an unknown node throws with the id", () => {
  assert.throws(
    () =>
      layoutPipeline(
        pipelineFixture.nodes,
        [{ from: "intake", to: "ghost", label: "x", note: "" }],
        diagramPresets.pipeline.wide,
      ),
    /"ghost"/,
  );
});

test("pipeline: node text is centred on its box", () => {
  const layout = horizontal();
  for (const node of layout.nodes) {
    assert.equal(node.cx, Math.round((node.x + node.width / 2) * 10) / 10);
    assert.ok(node.lines.every((line) => line.y > node.y && line.y < node.y + node.height));
  }
});
