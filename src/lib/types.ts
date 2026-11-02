/** Plain shapes of project data. src/content/load.ts checks that the collection entries fit them. */

export type Company = "playme" | "sysgears" | "side";
export type Discipline = "backend" | "frontend" | "mobile" | "fullstack";
export type DiagramType = "sequence" | "pipeline";
export type DecisionKind = "decision" | "trade-off" | "next";

export interface DiagramNodeData {
  id: string;
  label: string;
}

/** One step is one arrow: a message between actors (sequence) or a hand-off between stages (pipeline). */
export interface DiagramStepData {
  from: string;
  to: string;
  label: string;
  note: string;
}

export interface DiagramData {
  type: DiagramType;
  caption: string;
  nodes: DiagramNodeData[];
  steps: DiagramStepData[];
}

export interface Glance {
  value: string;
  label: string;
}

export interface Decision {
  kind: DecisionKind;
  title: string;
  why: string;
}

export interface Rule {
  rule: string;
  why: string;
  heldBy: string[];
}

export interface Rules {
  items: Rule[];
  agents?: string | undefined;
}

export interface PathNote {
  path: string;
  why: string;
}

export interface Structure {
  /** Plain text, shown as-is in a code block. */
  tree: string;
  notes: PathNote[];
}

export interface ToolItem {
  name: string;
  does: string;
}

export interface ToolGroup {
  title: string;
  note?: string | undefined;
  items: ToolItem[];
}

/** What a caller can do with the system: MCP tools now, later endpoints, routes or screens. */
export interface Tools {
  title: string;
  intro?: string | undefined;
  groups: ToolGroup[];
}

/** What the Astro image helper gives lib: enough to size and name an image, nothing about how it is served. */
export interface ImageSource {
  src: string;
  width: number;
  height: number;
  format: string;
}

export interface ShowcaseScreen {
  image: ImageSource;
  alt: string;
  caption: string;
}

export interface Excerpt {
  caption: string;
  code: string;
}

/** A real result built with the system: screens, what to notice in them, optionally a piece of the data behind. */
export interface Showcase {
  title: string;
  intro: string;
  link?: ProjectLink | undefined;
  screens: ShowcaseScreen[];
  points: string[];
  excerpt?: Excerpt | undefined;
}

export interface Connection {
  to: string;
  label: string;
}

export interface ProjectLink {
  label: string;
  url: string;
}

export interface Project {
  /** The file name without extension; also the URL: /<slug>/. */
  slug: string;
  title: string;
  company: Company;
  period: string;
  order: number;
  role: string;
  disciplines: Discipline[];
  aiAgents: boolean;
  summary: string;
  glance: Glance[];
  stack: string[];
  overview: string[];
  diagram: DiagramData;
  showcase?: Showcase | undefined;
  structure?: Structure | undefined;
  tools?: Tools | undefined;
  decisions: Decision[];
  rules?: Rules | undefined;
  connections: Connection[];
  links: ProjectLink[];
}
