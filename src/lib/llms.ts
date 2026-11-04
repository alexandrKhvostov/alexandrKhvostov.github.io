/**
 * Plain-text versions of the site for AI agents, written from the same data the pages use: /llms.txt (an index
 * in the llms.txt convention) and one Markdown file per project. Absolute URLs come in from the caller
 * (Astro.site), so this module stays pure.
 */
import { incomingConnections, outgoingConnections, type ConnectionView } from "./connections.ts";
import { nodeLabel } from "./nodes.ts";
import {
  aiAgentsLabel,
  companyLabels,
  decisionKindLabels,
  disciplineLabels,
  groupByCompany,
} from "./projects.ts";
import {
  contactLinks,
  projectMarkdownPath,
  projectPath,
  siteIntro,
  siteLocation,
  siteName,
  siteRole,
} from "./site.ts";
import type { Project, Showcase } from "./types.ts";

type IndexProject = Pick<Project, "slug" | "title" | "summary" | "company" | "order">;

/** A project as the Markdown needs it: showcase screens only need their text, not the image. */
export type MarkdownProject = Omit<Project, "showcase"> & {
  showcase?: (Omit<Showcase, "screens"> & { screens: { alt: string; caption: string }[] }) | undefined;
};

function absolute(path: string, siteUrl: string): string {
  return new URL(path, siteUrl).href;
}

/** The body of /llms.txt: name, role, intro, contacts, then every project under its company group. */
export function llmsTxt(projects: readonly IndexProject[], siteUrl: string): string {
  const lines = [
    `# ${siteName}`,
    "",
    `> ${siteRole}`,
    "",
    siteIntro,
    siteLocation,
    "",
    "## Contacts",
    "",
    ...contactLinks.map((link) => `- [${link.label}](${link.url})`),
  ];
  for (const group of groupByCompany(projects)) {
    lines.push("", `## ${group.label}`, "");
    for (const project of group.projects) {
      const url = absolute(projectMarkdownPath(project.slug), siteUrl);
      lines.push(`- [${project.title}](${url}): ${project.summary}`);
    }
  }
  return `${lines.join("\n")}\n`;
}

function list(items: readonly string[]): string {
  return `[${items.map((item) => JSON.stringify(item)).join(", ")}]`;
}

function frontmatter(project: MarkdownProject, siteUrl: string): string[] {
  const disciplines = project.disciplines.map((discipline) => disciplineLabels[discipline]);
  if (project.aiAgents) disciplines.push(aiAgentsLabel);
  return [
    "---",
    `title: ${JSON.stringify(project.title)}`,
    `company: ${JSON.stringify(companyLabels[project.company])}`,
    `period: ${JSON.stringify(project.period)}`,
    `role: ${JSON.stringify(project.role)}`,
    `disciplines: ${list(disciplines)}`,
    `stack: ${list(project.stack)}`,
    `url: ${JSON.stringify(absolute(projectPath(project.slug), siteUrl))}`,
    "---",
  ];
}

/** The node's name, as a link to its Markdown file when it has a page. */
function connectionName(view: ConnectionView, siteUrl: string): string {
  return view.href ? `[${view.label}](${absolute(projectMarkdownPath(view.id), siteUrl)})` : view.label;
}

/**
 * One project as Markdown. `all` is the whole collection: connections are derived from it the same way the
 * page does, so a target with a page gets a link and a map-only node stays plain text.
 */
export function projectMarkdown(
  project: MarkdownProject,
  all: readonly Pick<Project, "slug" | "title" | "connections">[],
  siteUrl: string,
): string {
  const out: string[] = [...frontmatter(project, siteUrl), "", `# ${project.title}`, "", project.summary];

  if (project.glance.length > 0) {
    out.push("", ...project.glance.map((fact) => `- ${fact.value} ${fact.label}`));
  }

  out.push("", "## Overview", "", project.overview.join("\n\n"));

  const { diagram } = project;
  const labelOf = (id: string) => diagram.nodes.find((node) => node.id === id)?.label ?? nodeLabel(id);
  out.push("", "## Architecture", "", diagram.caption, "");
  diagram.steps.forEach((step, index) => {
    const line = `${index + 1}. ${labelOf(step.from)} → ${labelOf(step.to)}: ${step.label}`;
    out.push(step.note ? `${line}. ${step.note}` : line);
  });

  const { showcase } = project;
  if (showcase) {
    out.push("", `## ${showcase.title}`, "", showcase.intro);
    if (showcase.link) out.push("", `[${showcase.link.label}](${showcase.link.url})`);
    if (showcase.screens.length > 0) {
      out.push("", ...showcase.screens.map((screen) => `- ${screen.caption}: ${screen.alt}`));
    }
    if (showcase.points.length > 0) out.push("", ...showcase.points.map((point) => `- ${point}`));
    if (showcase.excerpt) out.push("", showcase.excerpt.caption, "", "```", showcase.excerpt.code, "```");
  }

  const { structure } = project;
  if (structure) {
    out.push("", "## Code structure", "", "```", structure.tree, "```");
    if (structure.notes.length > 0) {
      out.push("", ...structure.notes.map((note) => `- \`${note.path}\`: ${note.why}`));
    }
  }

  const { tools } = project;
  if (tools) {
    out.push("", `## ${tools.title}`);
    if (tools.intro) out.push("", tools.intro);
    for (const group of tools.groups) {
      out.push("", `### ${group.title}`);
      if (group.note) out.push("", group.note);
      out.push("", ...group.items.map((item) => `- \`${item.name}\`: ${item.does}`));
    }
  }

  out.push("", "## Decision log", "");
  for (const decision of project.decisions) {
    out.push(`- ${decisionKindLabels[decision.kind]}: ${decision.title}. ${decision.why}`);
  }

  const { rules } = project;
  if (rules) {
    out.push("", "## Rules and agents", "");
    for (const item of rules.items) {
      out.push(`- ${item.rule}. ${item.why} Held by: ${item.heldBy.join(", ")}.`);
    }
    if (rules.agents) out.push("", rules.agents);
  }

  const outgoing = outgoingConnections(project.slug, all);
  const incoming = incomingConnections(project.slug, all);
  if (outgoing.length + incoming.length > 0) {
    out.push("", "## Connected projects", "");
    for (const view of outgoing) {
      out.push(`- ${project.title} ${view.edgeLabel} ${connectionName(view, siteUrl)}`);
    }
    for (const view of incoming) {
      out.push(`- ${connectionName(view, siteUrl)} ${view.edgeLabel} ${project.title}`);
    }
  }

  return `${out.join("\n")}\n`;
}
