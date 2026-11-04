import type { APIRoute } from "astro";
import { loadProjects } from "@/content/load";
import { llmsTxt } from "@/lib/llms";

/** The site as plain text for AI agents: who, how to reach them, and one Markdown link per project. */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("astro.config `site` is required to build llms.txt.");
  const projects = await loadProjects();
  return new Response(llmsTxt(projects, site.href), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
};
