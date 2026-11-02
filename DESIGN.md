# DESIGN.md: Warm Terminal

Design system for the portfolio of Alexandr Khvostov: architecture case studies, an interactive system map, step timelines, decision cards and code.

**Direction.** A dark developer tool with warmth. Cream paper in light, warm charcoal in dark, one amber accent, IBM Plex for everything, hairlines instead of shadows, calm motion. Patterns studied (not copied): Warp (warm dark, serif italic accent, off-white button), PostHog (cream paper, tinted callouts, dark code inside light cards), Linear (surface ladder, single accent discipline). Notes: `research/design-references.md` (git-ignored).

**Built to be repainted.** Every visual value is a token, and a theme is one file that maps raw values to roles. Changing the look means editing tokens, never components. See "Token architecture" first.

---

## 1. Token architecture

Three layers. Each layer may only reference the layer above it.

| Layer               | Prefix           | Lives in                           | Example                       | Who reads it   |
| ------------------- | ---------------- | ---------------------------------- | ----------------------------- | -------------- |
| 1. Primitives       | `--p-`           | `src/styles/tokens/primitives.css` | `--p-sand-50: #f3f1ea`        | themes only    |
| 2. Semantic (roles) | none             | `src/styles/themes/<theme>.css`    | `--bg: var(--p-sand-50)`      | components     |
| 3. Component        | `--<component>-` | the component's own `<style>`      | `--card-bg: var(--surface-1)` | that component |

Styling is written with **Tailwind CSS v4**. Tailwind is only a way to write semantic tokens in markup: `src/styles/tailwind.css` resets Tailwind's default palette and registers our roles in `@theme`, so utilities resolve through the active theme.

```css
@import "tailwindcss";
@theme {
  --color-*: initial; /* no bg-red-500: only our roles exist */
  --color-bg: var(--bg);
  --color-ink: var(--ink);
  --color-muted: var(--muted);
  --color-accent: var(--accent);
  --color-surface-1: var(--surface-1);
  /* ...every semantic color, plus --font-*, --radius-*, --spacing */
}
```

Markup then reads `bg-surface-1 text-ink border-line`. Switching `data-theme` repaints everything without touching a class.

Rules:

- Hex, rgb, hsl and font names appear **only** in `src/styles/tokens/` and `src/styles/fonts.css`. Components never contain a raw color, size, radius, duration or font name.
- No Tailwind arbitrary values (`bg-[#fff]`, `p-[13px]`, `text-[17px]`). If a value is missing, add a token.
- Both rules are enforced by `pnpm check:tokens` (a small tested script), because oxlint does not read `.astro` template markup.
- A **theme** is a selector `:root[data-theme="<name>"]` that sets every semantic token. Light and dark are two themes, not media-query overrides. `prefers-color-scheme` only picks the default.
- Themes may also override type, radius and motion tokens, so an experiment like "Editorial Dark" (serif headings, glow) is one new file plus one entry in the theme list.
- Component tokens exist only where a component needs a knob (card padding, node size). Default them from semantic tokens.
- **Lab page** `/lab` (dev only, not linked, `noindex`): every token as a swatch, every component in every state, a theme switcher, and live inputs that rewrite CSS variables at runtime with a "copy as CSS" button. This is where repainting is tried before it is committed.

Files:

```
src/styles/
  tokens/primitives.css    raw palettes, the only hex values
  tokens/scale.css         space, type sizes, radius, motion (theme-independent defaults)
  fonts.css                @font-face / font imports
  tailwind.css             Tailwind import, palette reset, @theme mapping to roles
  themes/warm-light.css    :root[data-theme="warm-light"]
  themes/warm-dark.css     :root[data-theme="warm-dark"]
  themes/index.ts          list of themes for the switcher and the lab
  global.css               reset, base elements, imports the above
```

---

## 2. Color

### Primitives (light / dark values used by the two default themes)

| Primitive                | Value                 | Note                         |
| ------------------------ | --------------------- | ---------------------------- |
| `--p-sand-50`            | `#f3f1ea`             | cream canvas                 |
| `--p-sand-0`             | `#ffffff`             | cards on cream               |
| `--p-sand-100`           | `#eae7de`             | sunken, inline code          |
| `--p-sand-200`           | `#e0dcd1`             | pressed, selected            |
| `--p-sand-300`           | `#d6d1c4`             | hairline                     |
| `--p-sand-400`           | `#bdb6a6`             | strong hairline              |
| `--p-sand-600`           | `#5f584d`             | muted text on cream          |
| `--p-sand-900`           | `#23201b`             | ink                          |
| `--p-char-900`           | `#1c1916`             | warm charcoal canvas         |
| `--p-char-800`           | `#24201c`             | surface 1                    |
| `--p-char-700`           | `#2d2823`             | surface 2                    |
| `--p-char-600`           | `#38322c`             | surface 3                    |
| `--p-char-200`           | `#b3aa9c`             | muted text on charcoal       |
| `--p-char-50`            | `#f2ede4`             | off-white ink                |
| `--p-amber-700`          | `#a84d08`             | accent text on cream (5.0:1) |
| `--p-amber-400`          | `#e8a33d`             | accent fill                  |
| `--p-amber-300`          | `#f0b05a`             | accent on charcoal (9:1)     |
| `--p-blue-600` / `-300`  | `#2f5bd3` / `#8fadff` | tone: AI authoring           |
| `--p-teal-600` / `-300`  | `#0b7a73` / `#63d3c6` | tone: runtime                |
| `--p-plum-600` / `-300`  | `#8a3e9e` / `#dba3ea` | tone: infrastructure         |
| `--p-olive-600` / `-300` | `#5e7a1f` / `#b5d46a` | tone: product and people     |

### Semantic roles

| Token                                 | Role                              | warm-light          | warm-dark                 |
| ------------------------------------- | --------------------------------- | ------------------- | ------------------------- |
| `--bg`                                | page canvas                       | sand-50             | char-900                  |
| `--surface-1`                         | cards, panels, map frame          | sand-0              | char-800                  |
| `--surface-2`                         | sunken areas, inline code, hover  | sand-100            | char-700                  |
| `--surface-3`                         | selected, pressed                 | sand-200            | char-600                  |
| `--line`                              | hairlines, dividers               | sand-300            | `rgb(242 237 228 / 0.10)` |
| `--line-strong`                       | inputs, focused frames            | sand-400            | `rgb(242 237 228 / 0.18)` |
| `--ink`                               | body text, headings               | sand-900            | char-50                   |
| `--muted`                             | secondary text, captions          | sand-600 (6.2:1)    | char-200 (7.6:1)          |
| `--accent`                            | links, focus ring, active nav     | amber-700           | amber-300                 |
| `--accent-fill`                       | highlight marks, the one CTA chip | amber-400           | amber-300                 |
| `--on-accent`                         | text on accent fill               | sand-900            | char-900                  |
| `--code-bg` / `--code-ink`            | code blocks (always dark)         | `#1f1c19` / char-50 | char-800 / char-50        |
| `--tone-author/runtime/infra/product` | map categories, rails, dots       | `-600` values       | `-300` values             |
| `--tone-tint`                         | tone background strength          | 12 %                | 16 %                      |

Use of color:

- **One accent.** Amber marks links, focus and the current section. It is never a large fill and never a gradient.
- **Tones are categories, not decoration.** They color system-map nodes, the left rail of decision cards, status dots and legends. Backgrounds use `color-mix(in oklab, var(--tone-x) var(--tone-tint), var(--surface-1))`. Tones never fill buttons.
- Text contrast: 4.5:1 minimum for body and muted text in both themes; every new theme is checked in the lab.
- Never pure black or pure white canvas.

---

## 3. Typography

| Token           | Value                    | Use                                                          |
| --------------- | ------------------------ | ------------------------------------------------------------ |
| `--font-sans`   | IBM Plex Sans            | headings, body, UI                                           |
| `--font-mono`   | IBM Plex Mono            | code, eyebrows, stack badges, numbers in facts               |
| `--font-accent` | Instrument Serif, italic | one emphasized word or phrase per page, never a full heading |

Fonts are self-hosted (Fontsource) so no request goes to Google from the page.

| Token            | Size / line height              | Weight                       | Use                              |
| ---------------- | ------------------------------- | ---------------------------- | -------------------------------- |
| `--text-display` | clamp(2.5rem, 6vw, 4rem) / 1.05 | 600, tracking -0.025em       | hero only                        |
| `--text-h1`      | clamp(2rem, 4.5vw, 3rem) / 1.1  | 600, -0.02em                 | case title                       |
| `--text-h2`      | 1.75rem / 1.2                   | 600, -0.015em                | section                          |
| `--text-h3`      | 1.25rem / 1.3                   | 600                          | subsection, card title           |
| `--text-lead`    | 1.25rem / 1.55                  | 400                          | intro paragraphs                 |
| `--text-body`    | 1.0625rem / 1.65                | 400                          | prose (17px)                     |
| `--text-small`   | 0.9375rem / 1.5                 | 400                          | captions, card text              |
| `--text-eyebrow` | 0.8125rem / 1.4                 | 500 mono, uppercase, +0.06em | section labels, map column heads |

Prose width 68ch. Weights in use: 400, 500, 600. Headings never above 600.

---

## 4. Space, layout, shape

- **Space scale (4px base):** `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 24, `-6` 32, `-7` 48, `-8` 64, `-9` 96. Tailwind's spacing is replaced by this scale, so `p-5` is 24px (not Tailwind's default 20px) and only steps 1–9 exist.
- **Rhythm:** sections `--space-9` apart on desktop, `--space-8` on mobile. Page width 1180px, gutter 16px on phones and 20px above.
- **Grid:** case pages use a 12-column grid; prose spans 7, side material (timeline, code, facts) spans 5; single column below 980px.
- **Radius:** `--radius-sm` 6 (badges, inputs, buttons), `--radius-md` 8 (cards, code), `--radius-lg` 12 (map frame, large panels), `--radius-pill` 999 (tabs, theme switch).
- **Depth:** hairlines only. One shadow token, `--shadow-pop`, for popovers and the map detail panel in light theme; `none` in dark theme.

---

## 5. Motion

| Token            | Value                       | Use                                  |
| ---------------- | --------------------------- | ------------------------------------ |
| `--dur-fast`     | 140ms                       | hover, press, color changes          |
| `--dur-base`     | 220ms                       | panels, theme switch                 |
| `--dur-slow`     | 480ms                       | map edges drawing, timeline progress |
| `--ease-out`     | cubic-bezier(.2, .7, .2, 1) | almost everything                    |
| `--reveal-shift` | 12px                        | upward drift for reveals             |

- Reveal on scroll happens **once** per element (IntersectionObserver), opacity plus `--reveal-shift`.
- System map: edges draw with a stroke-dash animation on first view and when a node is selected; non-neighbours fade to 40 %.
- Page-to-page: Astro View Transitions, case cards morph into the case header.
- `prefers-reduced-motion: reduce` sets every duration to 0 and `--reveal-shift` to 0. Nothing loops; nothing moves without a reason.

---

## 6. Components

All states use semantic tokens. Focus is always a 2px `--accent` ring with 2px offset.

- **Button, primary:** `--ink` fill with `--bg` text (off-white button in dark). Hover: 8 % lighter/darker via `color-mix`. One per view.
- **Button, secondary:** transparent, 1px `--line-strong`, `--ink` text. Hover: `--surface-2`.
- **Button, quiet:** text only, `--muted`, hover `--ink`.
- **Link:** `--accent`, underline offset 3px, thickness 1px, 2px on hover.
- **Top nav:** sticky, `--bg` with a bottom hairline, brand left, section links in `--muted`, current one in `--ink` with an amber underline, theme switch (pill) at the right.
- **Case card** (home): `--surface-1`, hairline, `--radius-md`; eyebrow with company and years, title, one-line outcome, stack badges. Hover lifts to `--surface-2` and the tone rail appears.
- **Decision card:** `--surface-1`, 3px left rail in the case's tone, title in 600, "why" in `--muted`. Variants by rail tone: decision, trade-off, risk, next step.
- **Step timeline:** numbered circles in the tone color, 2px `--line` connector; current step filled when scrolled into view.
- **System map node:** button, tone tint background, 1.5px tone border, `--radius-sm`; selected = tone fill with `--surface-1` text; detail panel below in `--surface-1`.
- **Code block:** always dark (`--code-bg`), `--radius-md`, mono 0.85rem; optional window header with file name in `--text-eyebrow`. Inline code uses `--surface-2`.
- **Stack badge:** mono `--text-eyebrow` without uppercase, hairline, `--radius-sm`.
- **Fact strip:** big number in mono 600, label in `--muted`.
- **Footer:** hairline on top, contact links as secondary buttons.

---

## 7. Imagery and icons

- **Icons:** Lucide, 1.5px stroke, 16 or 20px, `currentColor`. No emoji as icons.
- **Diagrams** are the main imagery: inline SVG drawn with tokens (`--line`, tone colors), so they repaint with the theme.
- **Screenshots** only for public products (Dualio, Luvea), in a `--surface-1` frame with a hairline and `--radius-lg`.
- No stock photos, no generated illustrations, no mascots.

---

## 8. Avoid

Purple-blue gradients, gradient text, glassmorphism, glow everywhere (a glow is allowed only in an experimental theme), three identical feature cards in a row, centered everything, emoji icons, tone colors as button fills, any raw value inside a component.
