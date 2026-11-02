import { getCollection } from "astro:content";
import { assertValidProjects } from "@/lib/connections";
import type { Project } from "@/lib/types";

/**
 * Every project as a plain object (the file name becomes the slug), checked against the node registry.
 * Throws, and so fails the build, when a file name is not a registered project id or a connection points
 * at an id that is not in src/lib/nodes.ts. Assigning the entries to `Project` also makes the type checker
 * flag a schema change that lib does not know about.
 */
export async function loadProjects(): Promise<Project[]> {
  const entries = await getCollection("projects");
  const projects: Project[] = entries.map((entry) => Object.assign({ slug: entry.id }, entry.data));
  assertValidProjects(projects);
  return projects;
}
