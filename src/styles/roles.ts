/** Names of the semantic tokens, grouped for /lab and checked against the CSS by scripts/roles.test.mjs. */

export interface ColorRole {
  /** CSS variable without the leading dashes. */
  name: string;
  group: "canvas" | "line" | "text" | "accent" | "code" | "tone";
  /** Literal background class, so Tailwind sees it. */
  swatch: string;
  use: string;
}

export const colorRoles: readonly ColorRole[] = [
  { name: "bg", group: "canvas", swatch: "bg-bg", use: "page canvas" },
  { name: "surface-1", group: "canvas", swatch: "bg-surface-1", use: "cards, panels" },
  { name: "surface-2", group: "canvas", swatch: "bg-surface-2", use: "sunken, inline code, hover" },
  { name: "surface-3", group: "canvas", swatch: "bg-surface-3", use: "selected, pressed" },
  { name: "line", group: "line", swatch: "bg-line", use: "hairlines, dividers" },
  { name: "line-strong", group: "line", swatch: "bg-line-strong", use: "inputs, focused frames" },
  { name: "ink", group: "text", swatch: "bg-ink", use: "body text, headings" },
  { name: "muted", group: "text", swatch: "bg-muted", use: "secondary text, captions" },
  { name: "accent", group: "accent", swatch: "bg-accent", use: "links, focus ring, active nav" },
  {
    name: "accent-fill",
    group: "accent",
    swatch: "bg-accent-fill",
    use: "highlight marks, the one CTA chip",
  },
  { name: "on-accent", group: "accent", swatch: "bg-on-accent", use: "text on accent fill" },
  { name: "code-bg", group: "code", swatch: "bg-code-bg", use: "code blocks (always dark)" },
  { name: "code-ink", group: "code", swatch: "bg-code-ink", use: "text in code blocks" },
  { name: "tone-author", group: "tone", swatch: "bg-tone-author", use: "AI authoring" },
  { name: "tone-runtime", group: "tone", swatch: "bg-tone-runtime", use: "runtime" },
  { name: "tone-infra", group: "tone", swatch: "bg-tone-infra", use: "infrastructure" },
  { name: "tone-product", group: "tone", swatch: "bg-tone-product", use: "product and people" },
];

/** Roles a theme sets that are not colors. */
export const otherThemeRoles = ["tone-tint", "shadow-pop"] as const;

export const typeRoles = [
  { name: "display", cls: "text-display", use: "hero only" },
  { name: "h1", cls: "text-h1", use: "case title" },
  { name: "h2", cls: "text-h2", use: "section" },
  { name: "h3", cls: "text-h3", use: "subsection, card title" },
  { name: "lead", cls: "text-lead", use: "intro paragraphs" },
  { name: "body", cls: "text-body", use: "prose" },
  { name: "small", cls: "text-small", use: "captions, card text" },
  { name: "eyebrow", cls: "text-eyebrow", use: "section labels" },
] as const;

export const fontRoles = [
  { name: "sans", cls: "font-sans", use: "headings, body, UI" },
  { name: "mono", cls: "font-mono", use: "code, eyebrows, badges" },
  { name: "accent", cls: "font-accent", use: "one emphasized phrase per page" },
] as const;

export const radiusRoles = [
  { name: "sm", cls: "rounded-sm", use: "badges, inputs, buttons" },
  { name: "md", cls: "rounded-md", use: "cards, code" },
  { name: "lg", cls: "rounded-lg", use: "map frame, large panels" },
  { name: "pill", cls: "rounded-pill", use: "tabs, theme switch" },
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
  { name: "slow", cls: "duration-slow", use: "map edges, timeline" },
] as const;
