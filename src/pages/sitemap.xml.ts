import type { APIRoute } from "astro";
import { loadProjects } from "@/content/load";
import { sitemapXml } from "@/lib/seo";
import { homePath, projectPath } from "@/lib/site";

/** Every public page: the projects page and one page per project (the 404 page and /lab stay out). */
export const GET: APIRoute = async ({ site }) => {
  if (!site) throw new Error("astro.config `site` is required to build the sitemap.");
  const projects = await loadProjects();
  const paths = [homePath, ...projects.map((project) => projectPath(project.slug))];
  return new Response(sitemapXml(paths.map((path) => new URL(path, site).href)), {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
