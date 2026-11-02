import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const discipline = z.enum(["backend", "frontend", "mobile", "fullstack"]);

const node = z.object({
  id: z.string(),
  label: z.string(),
});

// One step is one arrow: a message between actors (sequence) or a hand-off between stages (pipeline).
const step = z.object({
  from: z.string(),
  to: z.string(),
  label: z.string(),
  note: z.string(),
});

const diagram = z
  .object({
    type: z.enum(["sequence", "pipeline"]),
    caption: z.string(),
    nodes: z.array(node).min(2),
    steps: z.array(step).min(1),
  })
  .refine(
    (d) => d.steps.every((s) => d.nodes.some((n) => n.id === s.from) && d.nodes.some((n) => n.id === s.to)),
    {
      message: "Every step must go between declared nodes.",
    },
  );

const projects = defineCollection({
  loader: glob({ pattern: "**/[^_]*.yaml", base: "./src/content/projects" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      company: z.enum(["playme", "sysgears", "side"]),
      period: z.string(),
      order: z.number().int(),
      role: z.string(),
      disciplines: z.array(discipline).min(1),
      aiAgents: z.boolean().default(false),
      summary: z.string(),
      glance: z
        .array(z.object({ value: z.string(), label: z.string() }))
        .max(4)
        .default([]),
      stack: z.array(z.string()).min(1),
      overview: z.array(z.string()).min(1),
      diagram,
      // How the code is laid out: a top-level folder tree and why the main parts are split that way.
      structure: z
        .object({
          tree: z.string(),
          notes: z.array(z.object({ path: z.string(), why: z.string() })).min(1),
        })
        .optional(),
      // What a caller can do with the system: MCP tools, endpoints, routes or screens, grouped.
      tools: z
        .object({
          title: z.string().default("Tools"),
          intro: z.string().optional(),
          groups: z
            .array(
              z.object({
                title: z.string(),
                note: z.string().optional(),
                items: z.array(z.object({ name: z.string(), does: z.string() })).min(1),
              }),
            )
            .min(1),
        })
        .optional(),
      // A real result built with the system: phone screens, what the config controls, a config excerpt.
      showcase: z
        .object({
          title: z.string(),
          intro: z.string(),
          link: z.object({ label: z.string(), url: z.url() }).optional(),
          screens: z.array(z.object({ image: image(), alt: z.string(), caption: z.string() })).min(1),
          points: z.array(z.string()).min(1),
          excerpt: z.object({ caption: z.string(), code: z.string() }).optional(),
        })
        .optional(),
      decisions: z
        .array(
          z.object({
            kind: z.enum(["decision", "trade-off", "next"]),
            title: z.string(),
            why: z.string(),
          }),
        )
        .min(1),
      rules: z
        .object({
          items: z
            .array(
              z.object({
                rule: z.string(),
                why: z.string(),
                heldBy: z.array(z.string()).min(1),
              }),
            )
            .min(1),
          agents: z.string().optional(),
        })
        .optional(),
      connections: z.array(z.object({ to: z.string(), label: z.string() })).default([]),
      links: z.array(z.object({ label: z.string(), url: z.url() })).default([]),
    }),
});

export const collections = { projects };
