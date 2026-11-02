# Architecture

A static Astro site. Cases are data, pages are templates over that data, and the system map is computed from the data at build time. Nothing runs on a server; the browser gets HTML, CSS and a few small scripts.

## Folders

```
src/
  content/
    projects/       one YAML file per project (the file name is the slug)
    load.ts         loadProjects(): the collection as plain objects, checked against the node registry
  content.config.ts the Zod schema of the projects collection (source of truth for fields)
  lib/              pure TypeScript, unit-tested: types, node registry, grouping, filters, connections,
                    diagram layout maths, text wrapping, list folding, SEO data (JSON-LD, sitemap),
                    site constants and contacts, fixtures for tests and /lab
  components/
    ui/             primitives: Button, Badge, Chip, Link, ThemeSwitch
    blocks/         ProjectRow, GlanceStrip, SectionHeading, ScreenFrame, SequenceDiagram, PipelineDiagram,
                    DiagramCanvas, DiagramSteps, ShowcaseStrip, CodeBlock, ToolList, Fold, DecisionLog, RuleList,
                    ContactLinks
    sections/       ProjectList, ProjectHeader, ProjectOverview, ProjectArchitecture, ProjectShowcase, ProjectStructure,
                    ProjectTools, ProjectDecisions, ProjectRules, ProjectConnections, SiteFooter: composed from blocks
  layouts/          BaseLayout (head, meta, JSON-LD, top bar, footer, theme bootstrap), ProjectLayout (contents column, sections)
  pages/            index (all projects), [slug] (one project), 404, sitemap.xml, _lab (dev only)
  scripts/          client-side behaviour: filters, diagram, reveal, anchors, theme, lab
  styles/           tokens, themes, tailwind.css, fonts.css, diagram.css (see DESIGN.md)
public/             favicon.ico, app icons, site.webmanifest, robots.txt, og.jpg (home link preview),
                    og/<slug>.jpg (one link preview per project)
```

## Layers

Imports flow one way:

```
pages → layouts → sections → blocks → ui
  ↓        ↓          ↓         ↓
              lib, content (types), styles
```

- `content` and `lib` know nothing about UI. `lib` is plain functions over plain data, so it is tested without Astro. It defines its own input types (`lib/types.ts`); `content/load.ts` assigns the collection entries to them, so a schema change that `lib` does not know about fails the type check.
- `scripts` are loaded by the components that need them and talk to the DOM only through `data-*` attributes the component renders. Each script header lists its attribute contract.
- The direction is enforced by oxlint `no-restricted-imports` overrides per folder; imports use the `@/` alias so the rule can see them. Inside `lib` siblings import each other with a relative `./x.ts` path, because the tests run under Node's type stripping, which does not know the alias.
- `lib/*.test.ts` run with `pnpm test` (node:test). They are left out of `astro check`, because the repository has no `@types/node`.

## Content model

One collection, `projects`, one YAML file per project in `src/content/projects/`; files whose name starts with `_` are ignored. The file name is the slug and the URL (`/auth-service/`). The schema in `src/content.config.ts` is the source of truth; in short, a project has:

- identity: `title`, `company` (`playme`, `sysgears`, `side`), `period`, `order` (sort inside a company group), `role` (the agreed wording);
- `disciplines` (`backend`, `frontend`, `mobile`, `fullstack`) and `aiAgents` (a badge, and it also puts the project under the "Backend & AI agents" filter);
- `summary`: the one-sentence lead and the meta description;
- `glance`: 0 to 4 counted facts (`value`, `label`);
- `stack`: stack chips; `overview`: prose paragraphs;
- `diagram`: `type` (`sequence` or `pipeline`), `caption`, `nodes` (`id`, `label`) and `steps` (`from`, `to`, `label`, `note`). One step is one arrow. A sequence draws nodes as actors with lifelines and steps as messages top to bottom; a pipeline draws nodes as stages left to right (top to bottom on phones) and steps as hand-offs, which may go backwards, skip a stage or point at the same stage;
- optional `showcase`: a real result built with the system: `title`, `intro`, optional `link`, `screens` (`image`, `alt`, `caption`; images live in `src/assets/projects/<slug>/` and go through the schema's `image()` helper), `points` and an optional `excerpt` (`caption`, `code`). It sits right after Architecture and is hidden when absent;
- optional `structure`: `tree` (a top-level folder tree as plain text, shown as-is in a code block) and `notes` (`path`, `why`: why the code is split that way); the section "Code structure" is hidden when absent;
- optional `tools`: `title` (default "Tools"), optional `intro`, and `groups` (`title`, optional `note`, `items` with `name` and `does`): what a caller can do with the system. The title is configurable because later projects list endpoints, routes or screens instead of MCP tools; the section is hidden when absent;
- `decisions`: `kind` (`decision`, `trade-off`, `next`), `title`, `why`;
- optional `rules`: `items` (`rule`, `why`, `heldBy[]`) and an optional `agents` paragraph; the section is hidden when absent;
- `connections`: `to` (a node id) and `label`; the label reads as a phrase between two names ("<this project> <label> <target>");
- optional `links` (`label`, `url`; public product URLs only).

### Node registry

`lib/nodes.ts` lists every id a connection may point to, each with a label and a kind. Kind `project` is a project slug (planned or built); the other kinds (`client`, `storage`, `cdn`, `backend`, `service`) exist only on the system map and never get a page. `content/load.ts` fails the build, with a message that names the file and the id, when

- a project file's slug is not a `project` node, or
- a connection points at an id that is not in the registry (or at its own project).

A connection to a project that has a file renders as a link; a connection to a planned project without a file yet, or to a map-only node, renders as plain text. Incoming connections (projects that point at this one) are computed from the other files and shown in the same section.

## Diagrams

`lib/diagram-layout.ts` computes every coordinate at build time: node boxes, lifelines, arrow paths, arrowheads, badge positions and wrapped text. Each diagram is drawn twice as inline SVG, a wide drawing and a narrow one, and CSS container queries on the screen frame show one of them. The narrow sequence drawing drops the message text (the steps list carries it) and the narrow pipeline stacks its stages vertically. Colors come only from semantic tokens (`styles/diagram.css`), so a diagram repaints with the theme. `scripts/diagram.ts` moves the active step (`data-active` on the arrow, both nodes and the list item); the signal runs along the active arrow and pauses while the frame is off screen. Without the script the first step is active and every note is readable.

## System map

The full system map, a graph of every node and connection, is a later step. For now connections render only on project pages, from the registry and each project's `connections`. When the map is built, `lib` gets the graph function and a block draws it; the data already holds everything it needs.

## Pages

- `/`: a hero with the name, role and contacts, then all projects, grouped by company, with discipline filters written to the URL (`?f=backend`) by `scripts/filters.ts`. Without scripting everything is shown and the chips stay hidden.
- `/[slug]`: one page per project from `ProjectLayout`, at a short root URL meant to be shared on its own (`/auth-service/`). Sections run Overview, Architecture, Showcase, Code structure, Tools, Decision log, Rules and agents, Connected projects; the optional ones appear only when the project has the field, and the contents column follows. A sticky contents column sits on the left from 900px up; prose is 68ch and diagrams use the full content width. The bottom of the page links back to all projects and on to the next one.
- `/404`: GitHub Pages serves it for any unknown path; kept out of search results.
- `/sitemap.xml`: the home page and every project page, built from the collection.
- Every page has a footer with the contacts (`#contact`, linked from the top bar). The head carries Open Graph tags with a 1200x630 preview: `og.jpg` on the home page, `og/<slug>.jpg` on a project page. The home page adds schema.org `Person` JSON-LD and each project page a `TechArticle` written by that person (`lib/seo.ts`).
- The icons and previews in `public/` are compressed images made from the developer's originals, which stay in `research/images/` with the scripts that render them. A changed project title or summary means rendering its preview again.
- `/lab`: every token and component in every state, a theme switcher and live token inputs, built from invented data in `lib/fixtures.ts`. Never linked. The file is `src/pages/_lab.astro` (the underscore keeps the router from building it) and a small integration in `astro.config.mjs` injects the `/lab` route only under `astro dev`, so a build contains neither the page nor its script.

Page-to-page navigation uses native cross-document view transitions (`@view-transition { navigation: auto; }` in `styles/global.css`, off under `prefers-reduced-motion`): the project title carries a `view-transition-name` in the row and in the header, so it morphs from one to the other. A navigation that stays on the same path ("All projects" on the home page) skips the morph in `pageswap` (`scripts/page-morph.ts`), since the titles would fly in from where the scrolled page left them. There is no client-side router.

## Deployment

`astro build` produces `dist/`. The repository is `alexandrKhvostov.github.io` in the `alexandrKhvostov` organization (GitHub serves `<owner>.github.io` only from a repo named after its owner), so Pages serves it at the domain root and `astro.config.mjs` needs no `base`. `.github/workflows/site.yml` runs `pnpm check` on every pull request and push to `main`; a push to `main` then uploads `dist/` and deploys it to GitHub Pages (Settings → Pages → Source: GitHub Actions). The GitHub profile README lives in the separate `alexanderKhvostov/alexanderKhvostov` repository and links here.
