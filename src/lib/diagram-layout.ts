/**
 * Layout maths for the two diagram types. Everything is computed at build time in SVG user units
 * (the viewBox), so the page ships finished coordinates and no layout script.
 *
 * A sequence diagram draws actors as boxes with lifelines and one horizontal message per step.
 * A pipeline draws stages in a row (or a column) with one arrow per step: straight between neighbours,
 * a curve outside the row for a step that goes back or skips a stage, a small loop for a step to itself.
 */
import type { DiagramNodeData, DiagramStepData } from "./types.ts";
import { wrapText } from "./text.ts";

export interface Point {
  x: number;
  y: number;
}

export interface TextLine {
  text: string;
  /** Baseline, in viewBox units. */
  y: number;
}

export interface NodeBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  /** Horizontal centre of the text. */
  cx: number;
  lines: TextLine[];
}

export interface Lifeline {
  id: string;
  x: number;
  y1: number;
  y2: number;
}

export interface EdgeLabel {
  x: number;
  anchor: "start" | "middle";
  lines: TextLine[];
}

export interface EdgeShape {
  /** Index of the step this arrow draws. */
  step: number;
  from: string;
  to: string;
  /** The line itself, ending just before the arrowhead. */
  path: string;
  /** Polygon points of the arrowhead. */
  head: string;
  /** Centre of the numbered badge. */
  badge: Point;
  label?: EdgeLabel;
}

export interface DiagramLayout {
  width: number;
  height: number;
  fontSize: number;
  badgeRadius: number;
  nodes: NodeBox[];
  lifelines: Lifeline[];
  edges: EdgeShape[];
}

/** Width of a monospace glyph relative to the font size; the diagrams are drawn in the mono font. */
export const glyphRatio = 0.6;
const lineRatio = 1.35;
const headLength = 8;
const headHalfWidth = 4;
const badgeRadius = 9;

const round = (value: number): number => Math.round(value * 10) / 10;
const fmt = (point: Point): string => `${round(point.x)} ${round(point.y)}`;

/** Triangle with its tip at `tip`, pointing along the unit vector `dir`. */
export function arrowHead(tip: Point, dir: Point): string {
  const base = { x: tip.x - dir.x * headLength, y: tip.y - dir.y * headLength };
  const side = { x: -dir.y * headHalfWidth, y: dir.x * headHalfWidth };
  return [tip, { x: base.x + side.x, y: base.y + side.y }, { x: base.x - side.x, y: base.y - side.y }]
    .map((point) => `${round(point.x)},${round(point.y)}`)
    .join(" ");
}

/** Baselines for `count` lines of text centred on `centerY`. */
function centeredLines(texts: string[], centerY: number, fontSize: number): TextLine[] {
  const lineHeight = fontSize * lineRatio;
  const first = centerY - ((texts.length - 1) * lineHeight) / 2;
  return texts.map((text, index) => ({ text, y: round(first + index * lineHeight + fontSize * 0.35) }));
}

function indexOfNode(nodes: readonly DiagramNodeData[], id: string): number {
  const index = nodes.findIndex((node) => node.id === id);
  if (index === -1) throw new Error(`Diagram step refers to "${id}", which is not a declared node.`);
  return index;
}

export interface SequenceOptions {
  /** Preferred viewBox width; grows when the actors need more room. */
  width: number;
  fontSize: number;
  /** Message text above each arrow. Off for phones, where the steps list carries the wording. */
  showLabels: boolean;
  /** Narrowest column an actor may get. */
  minColumn: number;
}

export function layoutSequence(
  nodes: readonly DiagramNodeData[],
  steps: readonly DiagramStepData[],
  options: SequenceOptions,
): DiagramLayout {
  const { fontSize, showLabels } = options;
  const glyph = fontSize * glyphRatio;
  const lineHeight = fontSize * lineRatio;
  const pad = 12;
  const top = 4;
  const count = nodes.length;
  const width = Math.max(options.width, count * options.minColumn + pad * 2);
  const column = (width - pad * 2) / count;
  const centers = nodes.map((_, index) => pad + column * (index + 0.5));

  const boxWidth = Math.min(column - 8, 168);
  const wrapped = nodes.map((node) => wrapText(node.label, (boxWidth - 12) / glyph));
  const boxHeight = Math.max(...wrapped.map((lines) => lines.length)) * lineHeight + 14;
  const boxes: NodeBox[] = nodes.map((node, index) => ({
    id: node.id,
    x: round(centers[index]! - boxWidth / 2),
    y: top,
    width: round(boxWidth),
    height: round(boxHeight),
    cx: round(centers[index]!),
    lines: centeredLines(wrapped[index]!, top + boxHeight / 2, fontSize),
  }));

  const edges: EdgeShape[] = [];
  let y = top + boxHeight;
  let carry = 0;
  steps.forEach((step, index) => {
    const from = indexOfNode(nodes, step.from);
    const to = indexOfNode(nodes, step.to);
    if (from === to) {
      const x = centers[from]!;
      const loop = 18;
      const textLines = showLabels ? wrapText(step.label, (column - 44) / glyph) : [];
      y += 30 + carry;
      carry = Math.max(24, (textLines.length * lineHeight) / 2 + 8);
      const tip = { x, y: y + loop };
      const edge: EdgeShape = {
        step: index,
        from: step.from,
        to: step.to,
        path: `M ${fmt({ x, y })} h 28 v ${loop} h -21`,
        head: arrowHead(tip, { x: -1, y: 0 }),
        badge: { x: round(x + 14), y: round(y) },
      };
      if (textLines.length > 0) {
        edge.label = {
          x: round(x + 38),
          anchor: "start",
          lines: centeredLines(textLines, y + loop / 2, fontSize),
        };
      }
      edges.push(edge);
      return;
    }
    const dir = Math.sign(centers[to]! - centers[from]!);
    // The label gets the part of the arrow between the badge (at the start) and the arrowhead.
    const labelFrom = centers[from]! + dir * (16 + badgeRadius + 6);
    const labelTo = centers[to]! - dir * (headLength + 6);
    const textLines = showLabels ? wrapText(step.label, Math.abs(labelTo - labelFrom) / glyph) : [];
    y += (textLines.length > 0 ? textLines.length * lineHeight + 14 : 30) + carry;
    carry = 0;
    const start = { x: centers[from]!, y };
    const tip = { x: centers[to]!, y };
    const edge: EdgeShape = {
      step: index,
      from: step.from,
      to: step.to,
      path: `M ${fmt(start)} L ${fmt({ x: tip.x - dir * (headLength - 1), y })}`,
      head: arrowHead(tip, { x: dir, y: 0 }),
      badge: { x: round(start.x + dir * 16), y: round(y) },
    };
    if (textLines.length > 0) {
      const lines = textLines.map((text, line) => ({
        text,
        y: round(y - 8 - (textLines.length - 1 - line) * lineHeight),
      }));
      edge.label = { x: round((labelFrom + labelTo) / 2), anchor: "middle", lines };
    }
    edges.push(edge);
  });

  const height = y + carry + 22;
  return {
    width: round(width),
    height: round(height),
    fontSize,
    badgeRadius,
    nodes: boxes,
    lifelines: nodes.map((node, index) => ({
      id: node.id,
      x: round(centers[index]!),
      y1: round(top + boxHeight),
      y2: round(height - 6),
    })),
    edges,
  };
}

export interface PipelineOptions {
  orientation: "horizontal" | "vertical";
  width: number;
  fontSize: number;
}

type StepKind = "forward" | "arc" | "self";

function classify(from: number, to: number): StepKind {
  if (from === to) return "self";
  return to === from + 1 ? "forward" : "arc";
}

const arcBase = 26;
const arcPitch = 24;
const loopReach = 34;
const lanePitch = 12;

/** How far an arc's end sits from the centre of its node; later arcs on the same side step outward. */
const spread = (room: number, slot: number): number => Math.min(room, 8 + slot * 8);

export function layoutPipeline(
  nodes: readonly DiagramNodeData[],
  steps: readonly DiagramStepData[],
  options: PipelineOptions,
): DiagramLayout {
  const { fontSize, orientation } = options;
  const horizontal = orientation === "horizontal";
  const glyph = fontSize * glyphRatio;
  const lineHeight = fontSize * lineRatio;
  const pad = 12;
  const top = 4;
  const count = nodes.length;

  const indexed = steps.map((step, index) => {
    const from = indexOfNode(nodes, step.from);
    const to = indexOfNode(nodes, step.to);
    return { step, index, from, to, kind: classify(from, to) };
  });
  const hasSelf = indexed.some((entry) => entry.kind === "self");

  // Arcs get one lane each, shortest first, so inner curves sit inside outer ones.
  const arcs = indexed
    .filter((entry) => entry.kind === "arc")
    .toSorted((a, b) => Math.abs(a.to - a.from) - Math.abs(b.to - b.from) || a.index - b.index);
  const depthOf = new Map(arcs.map((entry, lane) => [entry.index, arcBase + lane * arcPitch]));
  const maxDepth = arcs.length > 0 ? arcBase + (arcs.length - 1) * arcPitch : 0;

  // Where each node sits along the main axis (x when horizontal, y when vertical) and across it.
  let width = options.width;
  let mainSize: number;
  let gap: number;
  let crossStart: number;
  let crossSize: number;
  let nodeLines: string[][];
  if (horizontal) {
    gap = 44;
    mainSize = (width - pad * 2 - (count - 1) * gap) / count;
    while (mainSize < 76 && gap > 28) {
      gap -= 4;
      mainSize = (width - pad * 2 - (count - 1) * gap) / count;
    }
    if (mainSize < 60) {
      mainSize = 60;
      width = count * mainSize + (count - 1) * gap + pad * 2;
    }
    nodeLines = nodes.map((node) => wrapText(node.label, (mainSize - 12) / glyph));
    crossSize = Math.max(...nodeLines.map((lines) => lines.length)) * lineHeight + 16;
    crossStart = hasSelf ? loopReach + top : top;
  } else {
    gap = 48;
    const sideSpace = (hasSelf ? loopReach : 0) + (arcs.length > 0 ? maxDepth + 14 : 0);
    const decorated = hasSelf || arcs.length > 0;
    crossSize = Math.min(220, width - pad * 2 - sideSpace);
    crossStart = decorated ? pad + (hasSelf ? loopReach : 0) : (width - crossSize) / 2;
    nodeLines = nodes.map((node) => wrapText(node.label, (crossSize - 12) / glyph));
    mainSize = Math.max(36, Math.max(...nodeLines.map((lines) => lines.length)) * lineHeight + 16);
  }
  const mainStart = horizontal ? pad : top;
  const mainOf = (index: number): number => mainStart + index * (mainSize + gap);
  const mainCenter = (index: number): number => mainOf(index) + mainSize / 2;
  const crossCenter = crossStart + crossSize / 2;
  const crossEdge = crossStart + crossSize;

  const at = (main: number, cross: number): Point =>
    horizontal ? { x: main, y: cross } : { x: cross, y: main };
  const dirOf = (main: number, cross: number): Point =>
    horizontal ? { x: main, y: cross } : { x: cross, y: main };

  const boxes: NodeBox[] = nodes.map((node, index) => {
    const origin = at(mainOf(index), crossStart);
    const boxWidth = horizontal ? mainSize : crossSize;
    const boxHeight = horizontal ? crossSize : mainSize;
    return {
      id: node.id,
      x: round(origin.x),
      y: round(origin.y),
      width: round(boxWidth),
      height: round(boxHeight),
      cx: round(origin.x + boxWidth / 2),
      lines: centeredLines(nodeLines[index]!, origin.y + boxHeight / 2, fontSize),
    };
  });

  // Straight arrows between neighbours share the gap side by side when there are several.
  const forwardCount = new Map<number, number>();
  for (const entry of indexed) {
    if (entry.kind === "forward") forwardCount.set(entry.from, (forwardCount.get(entry.from) ?? 0) + 1);
  }
  const forwardSeen = new Map<number, number>();
  const arcSlots = new Map<string, number>();
  const room = (horizontal ? mainSize : Math.min(mainSize, crossSize)) / 2 - 8;

  const edges: EdgeShape[] = indexed.map((entry) => {
    const { step, index, from, to, kind } = entry;
    const shape = (path: string, head: string, badge: Point): EdgeShape => ({
      step: index,
      from: step.from,
      to: step.to,
      path,
      head,
      badge: { x: round(badge.x), y: round(badge.y) },
    });
    if (kind === "forward") {
      const seen = forwardSeen.get(from) ?? 0;
      forwardSeen.set(from, seen + 1);
      const offset = (seen - ((forwardCount.get(from) ?? 1) - 1) / 2) * lanePitch;
      const a = mainOf(from) + mainSize;
      const b = mainOf(to);
      const cross = crossCenter + offset;
      // A lone arrow keeps its line clear: the badge sits beside it, not on it.
      const single = (forwardCount.get(from) ?? 1) === 1;
      return shape(
        `M ${fmt(at(a, cross))} L ${fmt(at(b - (headLength - 1), cross))}`,
        arrowHead(at(b, cross), dirOf(1, 0)),
        at((a + b) / 2, single ? cross - (badgeRadius + 5) : cross),
      );
    }
    if (kind === "self") {
      const m = mainCenter(from);
      const tip = at(m + 10, crossStart);
      const peak = 0.75 * loopReach;
      return shape(
        `M ${fmt(at(m - 10, crossStart))} C ${fmt(at(m - 10, crossStart - loopReach))} ${fmt(at(m + 10, crossStart - loopReach))} ${fmt(at(m + 10, crossStart - (headLength - 1)))}`,
        arrowHead(tip, dirOf(0, 1)),
        at(m, crossStart - peak),
      );
    }
    const side = Math.sign(to - from);
    const slotOf = (node: number): number => {
      const key = `${node}:${side}`;
      const slot = arcSlots.get(key) ?? 0;
      arcSlots.set(key, slot + 1);
      return slot;
    };
    const m1 = mainCenter(from) + side * spread(room, slotOf(from));
    const m2 = mainCenter(to) - side * spread(room, slotOf(to));
    const depth = depthOf.get(index) ?? arcBase;
    const reach = depth / 0.75;
    return shape(
      `M ${fmt(at(m1, crossEdge))} C ${fmt(at(m1, crossEdge + reach))} ${fmt(at(m2, crossEdge + reach))} ${fmt(at(m2, crossEdge + (headLength - 1)))}`,
      arrowHead(at(m2, crossEdge), dirOf(0, -1)),
      at((m1 + m2) / 2, crossEdge + depth),
    );
  });

  const arcRoom = arcs.length > 0 ? maxDepth + 14 : 8;
  const height = horizontal ? crossEdge + arcRoom : mainStart + count * mainSize + (count - 1) * gap + 8;

  return {
    width: round(width),
    height: round(height),
    fontSize,
    badgeRadius,
    nodes: boxes,
    lifelines: [],
    edges,
  };
}

/** The layouts a diagram needs: a wide one and a narrow one, switched by CSS on the container width. */
export const diagramPresets = {
  sequence: {
    wide: { width: 800, fontSize: 13, showLabels: true, minColumn: 96 },
    narrow: { width: 360, fontSize: 12, showLabels: false, minColumn: 72 },
  },
  pipeline: {
    wide: { orientation: "horizontal", width: 800, fontSize: 13 },
    narrow: { orientation: "vertical", width: 360, fontSize: 13 },
  },
} as const satisfies {
  sequence: Record<"wide" | "narrow", SequenceOptions>;
  pipeline: Record<"wide" | "narrow", PipelineOptions>;
};
