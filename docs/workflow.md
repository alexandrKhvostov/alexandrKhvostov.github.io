# Workflow with agents

The orchestrating session plans, dispatches agents, makes design calls and talks to the developer. Agents get a narrow task and return a short report; the orchestrator checks their result before telling the developer it is done.

## Roles

| Role         | Model                         | Does                                                                                                            |
| ------------ | ----------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Orchestrator | Opus (the main session)       | plans steps, writes briefs, design and architecture calls, merges results, walks the developer through the work |
| Implementer  | Sonnet                        | one code task until the full check is green                                                                     |
| Copywriter   | Sonnet                        | drafts one case's YAML from its research notes and the decisions in `_synthesis.md`                             |
| Fact-checker | Sonnet, fresh context         | checks every claim of a case against `research/` and lists the ones without a source                            |
| Reviewer     | Sonnet or Opus, fresh context | reads a larger diff against `docs/` and DESIGN.md; used for the map, the case template and the first case       |

## Code loop

1. Explain the step to the developer: what, where, why, how we will see it working. Start after they agree.
2. The implementer does the task.
3. The full check is green (see [conventions](conventions.md#checks)).
4. Visual check in the built-in browser: light and dark theme, phone width, the component on `/lab`.
5. Reviewer for large pieces.
6. Walk the developer through the code; commit when they say so.

## Content loop (one case)

1. Copywriter drafts `src/content/projects/<slug>.yaml`.
2. The draft goes through the `humanizer:humanizer` skill, which rewrites AI tells into plain prose without changing meaning.
3. Fact-checker marks every claim as sourced or unsourced, on the humanized text, so a rewrite cannot slip in an unsourced claim.
4. The developer edits the wording: it is their voice and they defend it in interviews.
5. Render and look at it in the browser together.

When this loop has run twice, turn it into an `add-case` skill.

## Milestones

Run the `web-review` skill after the skeleton, after the first case and before publishing.

## Mentor mode

- The developer builds this to learn and to defend every decision. Explain before each step and wait for agreement.
- Decisions that are expensive to reverse (framework, tooling, content model, design direction) come as 2–3 options with trade-offs; record the choice in `docs/` or DESIGN.md.
- After a finished piece, walk through the code and the reasons behind it.
