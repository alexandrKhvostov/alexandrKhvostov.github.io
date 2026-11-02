# Architecture

A static Astro site. Cases are data, pages are templates over that data, and the system map is computed from the data at build time. Nothing runs on a server; the browser gets HTML, CSS and a few small scripts.

## Folders

```
src/
  content/        case data (YAML) and the Zod schemas that validate it
  lib/            pure TypeScript: the map graph, helpers; unit-tested
  components/
    ui/           primitives: Button, Badge, Link, ThemeSwitch
    blocks/       DecisionCard, StepTimeline, CodeBlock, FactStrip, SystemMap
    sections/     CaseHeader, CaseBody, CaseNext, composed from blocks
  layouts/        BaseLayout (head, nav, theme bootstrap), CaseLayout
  pages/          index, cases/[slug], lab (dev only)
  scripts/        client-side behaviour: reveal on scroll, theme switch, map interaction
  styles/         tokens, themes, tailwind.css, fonts.css (see DESIGN.md)
```

## Layers

Imports flow one way:

```
pages → layouts → sections → blocks → ui
  ↓        ↓          ↓         ↓
              lib, content (types), styles
```

- `content` and `lib` know nothing about UI. `lib` is plain functions over plain data, so it is tested without Astro.
- `scripts` are loaded by components that need them and talk to the DOM only through `data-*` attributes the component renders.
- The direction is enforced by oxlint `no-restricted-imports` overrides per folder; imports use the `@/` alias so the rule can see them.

## Content model

One collection, `cases`, one YAML file per case in `src/content/cases/`. The schema in `src/content.config.ts` is the source of truth for fields; in short, a case has:

- identity: `slug`, `title`, `company`, `period`, `tone` (one of the four DESIGN.md tones), `order`;
- `role`: the agreed wording;
- `summary`, `stack`, optional `facts` (number + label);
- `flow`: ordered steps (title, note) rendered as a timeline;
- `decisions`: title, why, and a kind (decision, trade-off, risk, next);
- `next`: what would come next;
- `connections`: slugs of other cases or map-only nodes, with a label for the edge;
- optional `links` (public product URLs only).

The build fails when a field is missing or a connection points to a node that does not exist.

## System map

`lib/graph.ts` reads every case's `connections` plus a short list of map-only nodes (storage, CDN, people) and returns nodes grouped into columns and a list of edges. `SystemMap` renders them as buttons and an SVG layer; `scripts/map.ts` draws edges, highlights neighbours and fills the detail panel. Adding a case adds its node and edges with no change to the map code.

## Pages

- `/`: hero, system map, case cards ordered by `order`, the pet project section.
- `/cases/[slug]`: one page per case from `CaseLayout`.
- `/lab`: every token and component in every state, a theme switcher and live token inputs. Never linked. The file is `src/pages/_lab.astro` (the underscore keeps the router from building it) and a small integration in `astro.config.mjs` injects the `/lab` route only under `astro dev`, so a build contains neither the page nor its script.

Page-to-page navigation uses Astro View Transitions, so a case card morphs into the case header.

## Deployment

`astro build` produces `dist/`; a GitHub Actions workflow publishes it to GitHub Pages on push to `main`.
