import type { APIRoute, GetStaticPaths } from "astro";
import { loadProjects } from "@/content/load";
import { projectMarkdown } from "@/lib/llms";
import type { Project } from "@/lib/types";

export const getStaticPaths = (async () => {
  const projects = await loadProjects();
  return projects.map((project) => ({ params: { slug: project.slug }, props: { project, projects } }));
}) satisfies GetStaticPaths;

/** One project as Markdown for AI agents, at /<slug>.md next to the HTML page. */
export const GET: APIRoute = ({ props, site }) => {
  if (!site) throw new Error("astro.config `site` is required to build project Markdown.");
  const { project, projects } = props as { project: Project; projects: Project[] };
  return new Response(projectMarkdown(project, projects, site.href), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
};
