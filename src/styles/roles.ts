/** Names of the semantic tokens, grouped for /lab and checked against the CSS by scripts/roles.test.mjs. */

export interface ColorRole {
  /** CSS variable without the leading dashes. */
  name: string;
  group: "canvas" | "line" | "text" | "signal" | "code" | "company";
  /** Literal background class, so Tailwind sees it. */
  swatch: string;
  use: string;
}

export const colorRoles: readonly ColorRole[] = [
  { name: "bg", group: "canvas", swatch: "bg-bg", use: "page canvas" },
  { name: "surface-1", group: "canvas", swatch: "bg-surface-1", use: "panels, project rows, code frames" },
  { name: "surface-2", group: "canvas", swatch: "bg-surface-2", use: "diagram nodes, chips, hover" },
  { name: "line", group: "line", swatch: "bg-line", use: "hairlines, dividers" },
  { name: "line-strong", group: "line", swatch: "bg-line-strong", use: "inputs, focused frames" },
  { name: "ink", group: "text", swatch: "bg-ink", use: "text, headings" },
  { name: "muted", group: "text", swatch: "bg-muted", use: "secondary text" },
  {
    name: "signal",
    group: "signal",
    swatch: "bg-signal",
    use: "links, focus ring, active node, running signal",
  },
  { name: "signal-2", group: "signal", swatch: "bg-signal-2", use: "second hue in glows and gradients" },
  { name: "signal-glow", group: "signal", swatch: "bg-signal-glow", use: "glow hue, decorative only" },
  { name: "code-bg", group: "code", swatch: "bg-code-bg", use: "code blocks (always dark)" },
  { name: "code-ink", group: "code", swatch: "bg-code-ink", use: "text in code blocks" },
  { name: "code-key", group: "code", swatch: "bg-code-key", use: "keys in code blocks" },
  { name: "company-playme", group: "company", swatch: "bg-company-playme", use: "PlayMe line" },
  { name: "company-sysgears", group: "company", swatch: "bg-company-sysgears", use: "SysGears line" },
  { name: "company-side", group: "company", swatch: "bg-company-side", use: "side projects" },
];

/** Roles a theme sets that are not colors. */
export const otherThemeRoles = ["glow-strength"] as const;

export const typeRoles = [
  { name: "display", cls: "text-display", use: "projects page title" },
  { name: "h1", cls: "text-h1", use: "project title" },
  { name: "h2", cls: "text-h2", use: "section" },
  { name: "h3", cls: "text-h3", use: "rule, decision, row title" },
  { name: "lead", cls: "text-lead", use: "the one-sentence what it is" },
  { name: "body", cls: "text-body", use: "prose" },
  { name: "small", cls: "text-small", use: "captions, row descriptions" },
  { name: "mono", cls: "text-mono font-mono", use: "code, chips" },
] as const;

export const fontRoles = [
  { name: "sans", cls: "font-sans", use: "headings, body, UI" },
  { name: "mono", cls: "font-mono", use: "code, stack chips, file names" },
] as const;

export const radiusRoles = [
  { name: "sm", cls: "rounded-sm", use: "chips, nodes, buttons" },
  { name: "md", cls: "rounded-md", use: "project rows, code" },
  { name: "lg", cls: "rounded-lg", use: "the screen frame" },
  { name: "pill", cls: "rounded-pill", use: "filters, theme switch" },
] as const;

/** Glow tokens: the shadow utility that shows each one. */
export const glowRoles = [
  { name: "node", cls: "shadow-glow-node", use: "active diagram node" },
  { name: "shot", cls: "shadow-glow-shot", use: "screen frame" },
  { name: "row", cls: "shadow-glow-row", use: "project row on hover" },
] as const;

export const spaceRoles = [
  { step: 1, cls: "w-1" },
  { step: 2, cls: "w-2" },
  { step: 3, cls: "w-3" },
  { step: 4, cls: "w-4" },
  { step: 5, cls: "w-5" },
  { step: 6, cls: "w-6" },
  { step: 7, cls: "w-7" },
  { step: 8, cls: "w-8" },
  { step: 9, cls: "w-9" },
] as const;

export const motionRoles = [
  { name: "fast", cls: "duration-fast", use: "hover, press" },
  { name: "base", cls: "duration-base", use: "panels, theme switch" },
  { name: "enter", cls: "duration-enter", use: "entrance of a block" },
] as const;
