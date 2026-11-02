# Conventions

## Content

- Each statement on the page traces to a line in `research/` (per-project notes with sources in the original repos). When a fact is not there, ask the developer; the answer goes into the research notes first, then onto the page.
- Role wording, names and what stays off the page come from the decisions in `research/_synthesis.md`. The repo is public: research text reaches git only as reviewed page copy.
- Copy is plain and specific: what the system does, how, why that way, what comes next. Numbers say what was counted.
- `research/` is git-ignored and exists only on the developer's machine. If it is missing, ask before writing copy.

## Styling

- Markup uses Tailwind utilities that name semantic roles (`bg-surface-1 text-ink border-line`). Raw colors, sizes and font names live only in `src/styles/tokens/` and `src/styles/fonts.css`. Full token model: [DESIGN.md](../DESIGN.md).
- A missing value becomes a new token; a new look becomes a new theme file in `src/styles/themes/` plus an entry in the theme list.
- Every new component, and every state of it, appears on `/lab`.
- Motion uses the duration and easing tokens and respects `prefers-reduced-motion`.

## Code

- TypeScript strict. Import across folders through the `@/` alias; the layer rules in `.oxlintrc.json` match import text, so a relative path slips past them.
- `lib/` stays pure (no Astro, no DOM) and every function in it has a test.
- Client scripts are small, typed, and find their elements through `data-*` attributes.
- Accessibility: interactive things are real buttons or links, focus is visible, every image or diagram has a text equivalent.

## Checks

- oxlint reads TS and the script parts of `.astro` files, not template markup. `check:tokens` covers the markup: raw colors and fonts outside tokens, and Tailwind arbitrary values. When it fails, add a token rather than an exception.
- A task is done when `pnpm check` is green: lint, format, types, tokens, tests and build, in that order. The single commands are in `package.json`.
- The dev server runs through the editor's preview or the developer's terminal (`pnpm dev`, port 4321); `/lab` exists only there.

## Git

- Branch from `main` named `<type>/<task>`; Conventional Commits; one logical step per commit.
- Commits, PRs and descriptions carry the developer as the only author, with no agent attribution lines.
