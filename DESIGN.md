# DESIGN.md: Signal glow

Design system for the portfolio of Alexandr Khvostov: one page per project (architecture, rules, decisions), a page listing all projects, interactive diagrams and code.

**Direction.** Near-black blue, clean Geist type, and neon only where systems are drawn. Text and layout stay quiet and readable; diagrams, data flows and product screens carry a cyan and violet signal glow. Chosen by the developer on 2026-11-02 from references they liked: Framer (simple layout that looks expensive through glowing product shots), Brittany Chiang (deep colors, small entrance animations), Josh Comeau (backgrounds with character), Stripe. Rejected: hyper-minimal experimental layouts that hurt usability.

**Built to be repainted.** Every visual value is a token, and a theme is one file that maps raw values to roles. Changing the look means editing tokens, never components. See "Token architecture" first.

---

## 1. Token architecture

Three layers. Each layer may only reference the layer above it.

| Layer               | Prefix           | Lives in                           | Example                        | Who reads it   |
| ------------------- | ---------------- | ---------------------------------- | ------------------------------ | -------------- |
| 1. Primitives       | `--p-`           | `src/styles/tokens/primitives.css` | `--p-night-950: #070a12`       | themes only    |
| 2. Semantic (roles) | none             | `src/styles/themes/<theme>.css`    | `--bg: var(--p-night-950)`     | components     |
| 3. Component        | `--<component>-` | the component's own `<style>`      | `--shot-border: var(--signal)` | that component |

Styling is written with **Tailwind CSS v4**. Tailwind is only a way to write semantic tokens in markup: `src/styles/tailwind.css` resets Tailwind's default palette and registers our roles in `@theme`, so utilities resolve through the active theme.

```css
@import "tailwindcss";
@theme {
  --color-*: initial; /* no bg-red-500: only our roles exist */
  --color-bg: var(--bg);
  --color-ink: var(--ink);
  --color-signal: var(--signal);
  --color-surface-1: var(--surface-1);
  /* ...every semantic color, plus --font-*, --radius-*, --spacing */
}
```

Markup then reads `bg-surface-1 text-ink border-line`. Switching `data-theme` repaints everything without touching a class.

Rules:

- Hex, rgb, hsl and font names appear **only** in `src/styles/tokens/` and `src/styles/fonts.css`. Components never contain a raw color, size, radius, duration or font name.
- No Tailwind arbitrary values (`bg-[#fff]`, `p-[13px]`, `text-[17px]`). If a value is missing, add a token.
- Both rules are enforced by `pnpm check:tokens` (a small tested script), because oxlint does not read `.astro` template markup.
- A **theme** is a selector `:root[data-theme="<name>"]` that sets every semantic token. Dark and light are two themes, not media-query overrides. Dark is the default; `prefers-color-scheme: light` picks light on first visit.
- Themes may also override type, radius, glow and motion tokens, so an experiment is one new file plus one entry in the theme list.
- Component tokens exist only where a component needs a knob (node size, shot padding). Default them from semantic tokens.
- **Lab page** `/lab` (dev only, not linked, `noindex`): every token as a swatch, every component in every state, a theme switcher, and live inputs that rewrite CSS variables at runtime with a "copy as CSS" button. This is where repainting is tried before it is committed.

Files:

```
src/styles/
  tokens/primitives.css    raw palettes, the only hex values
  tokens/scale.css         space, type sizes, radius, motion, glow (theme-independent defaults)
  fonts.css                font imports
  tailwind.css             Tailwind import, palette reset, @theme mapping to roles
  themes/signal-dark.css   :root[data-theme="signal-dark"] (default)
  themes/signal-light.css  :root[data-theme="signal-light"]
  themes/index.ts          list of themes for the switcher and the lab
  global.css               reset, base elements, imports the above
```

---

## 2. Color

### Primitives

| Primitive        | Value     | Note                                          |
| ---------------- | --------- | --------------------------------------------- |
| `--p-night-950`  | `#070a12` | dark canvas, near-black with blue             |
| `--p-night-900`  | `#0b101c` | code blocks in dark                           |
| `--p-night-850`  | `#0e1320` | surface 1 in dark                             |
| `--p-night-800`  | `#121a2b` | surface 2 in dark, diagram nodes              |
| `--p-night-700`  | `#1b2234` | hairline in dark                              |
| `--p-night-600`  | `#283049` | strong hairline in dark                       |
| `--p-mist-400`   | `#949bb0` | muted text in dark                            |
| `--p-mist-50`    | `#eef1f8` | ink in dark                                   |
| `--p-day-50`     | `#f6f7fb` | light canvas                                  |
| `--p-day-0`      | `#ffffff` | surface 1 in light                            |
| `--p-day-100`    | `#eef0f6` | surface 2 in light                            |
| `--p-day-200`    | `#e2e5ee` | hairline in light                             |
| `--p-day-300`    | `#cdd2df` | strong hairline in light                      |
| `--p-slate-600`  | `#535a6e` | muted text in light                           |
| `--p-slate-950`  | `#0a0d16` | ink in light, code blocks in light            |
| `--p-cyan-400`   | `#3de8ff` | signal in dark                                |
| `--p-cyan-500`   | `#0098b3` | signal glow in light (decorative only, 3.2:1) |
| `--p-cyan-700`   | `#00758c` | signal as text in light                       |
| `--p-violet-400` | `#9b6bff` | second signal in dark                         |
| `--p-violet-600` | `#6b3fe0` | second signal in light                        |

### Semantic roles

| Token                                      | Role                                                                   | signal-dark                           | signal-light           |
| ------------------------------------------ | ---------------------------------------------------------------------- | ------------------------------------- | ---------------------- |
| `--bg`                                     | page canvas                                                            | night-950                             | day-50                 |
| `--surface-1`                              | panels, project rows, code frames                                      | night-850                             | day-0                  |
| `--surface-2`                              | diagram nodes, chips, hover                                            | night-800                             | day-100                |
| `--line`                                   | hairlines, dividers                                                    | night-700                             | day-200                |
| `--line-strong`                            | inputs, focused frames                                                 | night-600                             | day-300                |
| `--ink`                                    | text, headings                                                         | mist-50 (17.5:1)                      | slate-950 (18.1:1)     |
| `--muted`                                  | secondary text                                                         | mist-400 (7.1:1)                      | slate-600 (6.4:1)      |
| `--signal`                                 | links, focus ring, active diagram node, running signal                 | cyan-400 (13.4:1)                     | cyan-700 (5.0:1)       |
| `--signal-2`                               | the second signal hue in glows and gradients                           | violet-400 (5.6:1)                    | violet-600 (5.8:1)     |
| `--signal-glow`                            | glow color, never text                                                 | cyan-400                              | cyan-500               |
| `--code-bg` / `--code-ink`                 | code blocks (always dark)                                              | night-900 / mist-50                   | slate-950 / mist-50    |
| `--code-key`                               | keys and highlights inside code                                        | cyan-400                              | cyan-400               |
| `--company-playme` / `-sysgears` / `-side`    | one color per company line on the projects page and in project headers | cyan / teal / amber, tuned in the lab | same, darker for light |
| `--kind-decision` / `-trade-off` / `-next` | the small square before each entry of a decision log                   | cyan / amber / violet                 | same, darker for light |

Use of color:

- **Neon belongs to systems.** Cyan and violet appear on diagrams, data flows, product screens and the focus ring. Text, headings and layout never glow.
- One signal for interaction (`--signal`); `--signal-2` only inside gradients and glows, never as a text color for links.
- Text contrast 4.5:1 minimum in both themes; decorative glow colors are exempt but never carry text.
- Never pure black or pure white canvas.

### Glow tokens

| Token            | Value (dark)                                           | Use                                                              |
| ---------------- | ------------------------------------------------------ | ---------------------------------------------------------------- |
| `--glow-node`    | `0 0 14px` of `--signal` at 50 %                       | active diagram node                                              |
| `--glow-shot`    | two soft shadows, `--signal` and `--signal-2`, 35–40 % | the "screen" frame around a project's main diagram or screenshot |
| `--glow-ambient` | a blurred radial of `--signal-2` → `--signal`          | one slow drifting glow in a page corner, behind content          |

Every glow is multiplied by `--glow-strength`, set per theme: 1 in dark, 0.34 in light. `--glow-row` is the softer glow on a hovered project row.

---

## 3. Typography

| Token         | Value      | Use                            |
| ------------- | ---------- | ------------------------------ |
| `--font-sans` | Geist      | everything: headings, body, UI |
| `--font-mono` | Geist Mono | code, stack chips, file names  |

One family with its mono sibling, self-hosted through Fontsource (no request to Google from the page).

| Token            | Size / line height                | Weight, tracking | Use                           |
| ---------------- | --------------------------------- | ---------------- | ----------------------------- |
| `--text-display` | clamp(2.6rem, 6vw, 4.2rem) / 1.03 | 700, -0.035em    | projects page title           |
| `--text-h1`      | clamp(2.2rem, 5vw, 3.2rem) / 1.05 | 700, -0.03em     | project title                 |
| `--text-h2`      | 1.75rem / 1.15                    | 700, -0.02em     | section                       |
| `--text-h3`      | 1.15rem / 1.35                    | 600              | rule, decision, row title     |
| `--text-lead`    | 1.2rem / 1.55                     | 400              | the one-sentence "what it is" |
| `--text-body`    | 1rem / 1.65                       | 400              | prose (16px)                  |
| `--text-small`   | 0.9rem / 1.5                      | 400              | captions, row descriptions    |
| `--text-mono`    | 0.8rem / 1.55                     | 400 mono         | code, chips                   |

Prose width 68ch. Weights in use: 400, 600, 700. Labels are sentence case; no uppercase eyebrows.

---

## 4. Space, layout, shape

- **Space scale (4px base):** `--space-1` 4, `-2` 8, `-3` 12, `-4` 16, `-5` 24, `-6` 32, `-7` 48, `-8` 64, `-9` 96. Tailwind's spacing is replaced by this scale, so `p-5` is 24px (not Tailwind's default 20px) and only steps 1–9 exist.
- **Rhythm:** sections `--space-9` apart on desktop, `--space-8` on mobile. Page width 1120px, gutter 16px on phones and 20px above.
- **Project page:** sticky contents column on the left (200px) from 900px up; content column with prose at 68ch; diagrams may use the full content width.
- **Radius:** `--radius-sm` 6 (chips, nodes, buttons), `--radius-md` 10 (project rows, code), `--radius-lg` 12 (the "screen" frame), `--radius-pill` 999 (filters, theme switch).
- **Depth:** hairlines for structure; glow tokens only for diagrams and screens. No grey drop shadows.

---

## 5. Motion

| Token           | Value                            | Use                                  |
| --------------- | -------------------------------- | ------------------------------------ |
| `--dur-fast`    | 150ms                            | hover, press, color changes          |
| `--dur-base`    | 220ms                            | panels, theme switch                 |
| `--dur-enter`   | 500ms                            | entrance of a block                  |
| `--stagger`     | 40ms                             | delay between blocks in one entrance |
| `--dur-signal`  | 2400ms                           | one signal run along a diagram edge  |
| `--ease-out`    | cubic-bezier(.2, .7, .2, 1)      | almost everything                    |
| `--dur-press`   | 120ms                            | a control sinking on press           |
| `--dur-move`    | 250ms                            | a note or list opening, rows gliding |
| `--dur-theme`   | 450ms                            | the theme circle from its switch     |
| `--dur-trace`   | 900ms                            | one run of the signal around a row   |
| `--ease-press`  | cubic-bezier(.25, .46, .45, .94) | press feedback                       |
| `--ease-move`   | cubic-bezier(.25, 1, .5, 1)      | opening, sliding, gliding            |
| `--ease-enter`  | cubic-bezier(.22, 1, .36, 1)     | the theme circle, the Copied label   |
| `--press-scale` | 0.97                             | how far a pressed control sinks      |
| `--enter-shift` | 10px                             | upward drift on entrance             |

- **Entrance, once per page:** the header and the first screen of blocks fade and rise in sequence (`--stagger`). Lower sections appear once when scrolled into view. Nothing re-animates on scroll back.
- **Signal:** on diagrams, a light runs along each active edge from source to target, showing the direction of data. It pauses when the diagram is off screen.
- **Ambient glow:** one blurred glow drifts slowly in the page corner (9s, alternate). One per page.
- **Answers to actions:** selecting a diagram step lights its message and node and opens its note while the last one closes; hovering or focusing a project row lights its border as a `--signal` → `--signal-2` ring whose bright point runs once around the row, with a soft glow. Buttons, chips, steps and toggles use the `pressable` utility and sink to `--press-scale` on press (a wide step button only to 0.99). "Show all" opens the rest of a list to its height. Copying a section link turns `#` into a check with "Copied" beside it.
- **View transitions in the page:** filtering the list glides the remaining rows to their places; switching the theme reveals the new one as a circle from the switch. Both run only where the browser supports them and motion is not reduced (`scripts/view-transition.ts`).
- **Left out on purpose:** counting-up glance numbers (the header already has its entrance), lifting rows on hover (hovered too often), parallax, motion in the top bar or the contents column.
- `prefers-reduced-motion: reduce` sets durations to 0, stops the signal and the ambient drift, and shows everything in place.

---

## 6. Components

All states use semantic tokens. Focus is always a 2px `--signal` ring with 2px offset.

- **Top bar (every page):** name and role on the left, "All projects", theme switch and "Contact" on the right (Contact only once `contactUrl` in `lib/site.ts` is set); 64px high, sticky, `--bg` with a bottom hairline. A project page must make sense to someone who arrived by a shared link.
- **Button, primary:** `--ink` fill with `--bg` text. **Secondary:** transparent, 1px `--line-strong`. **Quiet:** text only.
- **Filter chip:** pill, 1px `--line`; pressed = `--ink` fill. The chosen filter is written to the URL (`?f=backend`).
- **Project row:** `--surface-1`, hairline, `--radius-md`; the whole row is one link; title, period, one sentence, role, discipline chips and the AI agents badge. The company color lives in the dot of the group heading, not on the row. An arrow → at the end of the chips line says the row opens, since touch has no hover to say it; it turns `--signal` and moves 4px on hover, focus and press. A press sinks the row to 0.99 and lights the ring at once (iOS needs a passive `touchstart` listener for `:active`). Hover (real hover only) and keyboard focus: a conic gradient ring over the hairline, its bright point running once around the row over `--dur-trace`, then lit with `--glow-row`; reduced motion shows the ring without the run.
- **Stack chip:** Geist Mono, `--surface-1`, 1px `--line`, `--radius-sm`.
- **Screen frame:** the main diagram or screenshot of a project sits in a `--radius-lg` frame with a 1px gradient border (`--signal` → transparent → `--signal-2`) and `--glow-shot`.
- **Diagram node:** `--surface-2`, 1px `--line-strong`; active = `--signal` border, text and `--glow-node`. **Edge:** 2px, the muted text color softened (hairline tokens are too faint to carry meaning), numbered with a step badge; the active edge turns `--signal` and carries the running signal.
- **Sequence and pipeline diagrams + steps:** the numbered steps list sits under the diagram, which stays in view (sticky) on screens tall enough while the list scrolls; selecting a step (click, or arrow keys in the list) lights its arrow and both nodes and opens its note, and the list is plain text without scripting. Each diagram has a wide drawing and a narrow one; on phones a sequence drops the message text and a pipeline runs top to bottom.
- **Rule row:** rule (h3), why (muted), "held by" chips; when only a convention holds it, the chip says so.
- **Decision log:** kind (decision, trade-off, planned next) with a small colored square, then title and reason.
- **Code block:** always dark (`--code-bg`), `--radius-md`, Geist Mono; keys in `--signal`.
- **Showcase strip:** phone screenshots in slim screen frames (`--radius-lg`, gradient hairline, `--glow-shot`) with the caption under each, in one row that scrolls inside itself with scroll-snap on every width (about 70% of the screen on phones so the next one peeks, 240px from 640px up); the scroller is focusable and labelled. Points follow as hairline rows, then an optional excerpt in the code block.
- **Code structure:** the folder tree in a code block (always dark, scrolls inside itself on a narrow screen, never widens the page), then notes as a hairline-separated list: path in mono, the reason as body text.
- **Tools list:** a group is an h3 with an optional note, then hairline-separated rows: name in mono, what it does beside it from 640px up and below it on phones. A list, not a grid of cards.
- **Section anchor:** `#` beside each section heading, visible on hover and focus, copies a link to the section.

---

## 7. Imagery and icons

- **Icons:** Lucide, 1.5px stroke, 16 or 20px, `currentColor`. No emoji as icons.
- **Diagrams** are the main imagery: inline SVG drawn with tokens, so they repaint with the theme and can carry the signal.
- **Screenshots** only for public products (Dualio, Luvea), inside the screen frame.
- No stock photos, no generated illustrations, no mascots.

---

## 8. Avoid

Glow on text or on whole cards, more than one ambient glow per page, gradient text, glassmorphism, uppercase eyebrows, identical feature-card grids, emoji icons, any raw value inside a component.
