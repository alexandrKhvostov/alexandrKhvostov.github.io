import { isProjectNode, nodeInfo, type NodeKind } from "./nodes.ts";
import { projectPath } from "./site.ts";
import type { Project } from "./types.ts";

/** A connection ready to render: where it points, what to call it, and whether it can be a link. */
export interface ConnectionView {
  id: string;
  label: string;
  kind: NodeKind;
  /** What the connection means; the same text on both ends. */
  edgeLabel: string;
  /** Set only when the node is a project that has a page. */
  href?: string;
}

type ProjectLike = Pick<Project, "slug" | "title" | "connections">;

/**
 * Build-time checks on the project files. Returns one message per problem; empty when everything is fine.
 * A project's slug (its file name) must be a registered project node, and every connection must point at
 * a registered node other than the project itself.
 */
export function validateProjects(projects: readonly ProjectLike[]): string[] {
  const problems: string[] = [];
  for (const project of projects) {
    if (!isProjectNode(project.slug)) {
      problems.push(
        `Project file "${project.slug}.yaml" is not a project node. Rename it to a registered project id or add the id to src/lib/nodes.ts.`,
      );
    }
    for (const connection of project.connections) {
      if (!nodeInfo(connection.to)) {
        problems.push(
          `Project "${project.slug}" connects to "${connection.to}", which is not in the node registry (src/lib/nodes.ts).`,
        );
      } else if (connection.to === project.slug) {
        problems.push(`Project "${project.slug}" connects to itself.`);
      }
    }
  }
  return problems;
}

/** Throws one error listing every problem found by validateProjects. */
export function assertValidProjects(projects: readonly ProjectLike[]): void {
  const problems = validateProjects(projects);
  if (problems.length > 0) {
    throw new Error(`Invalid project data:\n- ${problems.join("\n- ")}`);
  }
}

/** Where this project points. A link only when the target project has a file. */
export function outgoingConnections(slug: string, projects: readonly ProjectLike[]): ConnectionView[] {
  const project = projects.find((candidate) => candidate.slug === slug);
  if (!project) return [];
  const withPage = new Set(projects.map((candidate) => candidate.slug));
  return project.connections.flatMap((connection): ConnectionView[] => {
    const info = nodeInfo(connection.to);
    if (!info) return [];
    const view: ConnectionView = {
      id: connection.to,
      label: info.label,
      kind: info.kind,
      edgeLabel: connection.label,
    };
    if (info.kind === "project" && withPage.has(connection.to)) view.href = projectPath(connection.to);
    return [view];
  });
}

/** Other projects that point at this one. They have files by definition, so every entry links. */
export function incomingConnections(slug: string, projects: readonly ProjectLike[]): ConnectionView[] {
  return projects.flatMap((project): ConnectionView[] => {
    if (project.slug === slug) return [];
    return project.connections
      .filter((connection) => connection.to === slug)
      .map((connection) => ({
        id: project.slug,
        label: project.title,
        kind: "project",
        edgeLabel: connection.label,
        href: projectPath(project.slug),
      }));
  });
}
