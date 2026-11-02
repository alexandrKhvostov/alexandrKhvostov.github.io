import type { Company, DecisionKind, Discipline, Project } from "./types.ts";

export const companyLabels: Record<Company, string> = {
  playme: "PlayMe",
  sysgears: "SysGears",
  side: "Side project",
};

/** Group order on the projects page. */
export const companyOrder: readonly Company[] = ["playme", "sysgears", "side"];

export const disciplineLabels: Record<Discipline, string> = {
  backend: "Backend",
  frontend: "Frontend",
  mobile: "Mobile",
  fullstack: "Full stack",
};

export const decisionKindLabels: Record<DecisionKind, string> = {
  decision: "Decision",
  "trade-off": "Trade-off",
  next: "Planned next",
};

export const aiAgentsLabel = "AI agents";

export interface CompanyGroup<T extends Pick<Project, "company" | "order"> = Project> {
  company: Company;
  label: string;
  projects: T[];
}

/** Projects in page order: company order first, then `order`, then title for a stable tie-break. */
export function sortProjects<T extends Pick<Project, "company" | "order" | "title">>(
  projects: readonly T[],
): T[] {
  return projects.toSorted(
    (a, b) =>
      companyOrder.indexOf(a.company) - companyOrder.indexOf(b.company) ||
      a.order - b.order ||
      a.title.localeCompare(b.title),
  );
}

/** Groups in company order, each sorted by `order`. Companies without projects are left out. */
export function groupByCompany<T extends Pick<Project, "company" | "order" | "title">>(
  projects: readonly T[],
): CompanyGroup<T>[] {
  const sorted = sortProjects(projects);
  return companyOrder
    .map((company) => ({
      company,
      label: companyLabels[company],
      projects: sorted.filter((project) => project.company === company),
    }))
    .filter((group) => group.projects.length > 0);
}

/** The project after `slug` in page order, wrapping to the first. Undefined when there is no other project. */
export function nextProject<T extends Pick<Project, "slug" | "company" | "order" | "title">>(
  slug: string,
  projects: readonly T[],
): T | undefined {
  const sorted = sortProjects(projects);
  const index = sorted.findIndex((project) => project.slug === slug);
  if (index === -1 || sorted.length < 2) return undefined;
  return sorted[(index + 1) % sorted.length];
}
