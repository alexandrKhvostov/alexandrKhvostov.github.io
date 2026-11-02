import type { Discipline, Project } from "./types.ts";

export type FilterKey = "all" | Discipline;

export interface FilterOption {
  key: FilterKey;
  label: string;
}

const filterLabels: Record<FilterKey, string> = {
  all: "All",
  backend: "Backend and AI",
  frontend: "Frontend",
  mobile: "Mobile",
  fullstack: "Full stack",
};

const filterOrder: readonly FilterKey[] = ["all", "backend", "frontend", "mobile", "fullstack"];

/** Name of the query parameter that holds the chosen filter: ?f=backend. */
export const filterParam = "f";

export function isFilterKey(value: unknown): value is FilterKey {
  return typeof value === "string" && filterOrder.includes(value as FilterKey);
}

/** An unknown or missing value means "all". */
export function parseFilter(value: string | null | undefined): FilterKey {
  return isFilterKey(value) ? value : "all";
}

/** The discipline filters a project belongs to. An AI-agents project also counts as backend. */
export function projectFilterKeys(project: Pick<Project, "disciplines" | "aiAgents">): Discipline[] {
  const keys = new Set<Discipline>(project.disciplines);
  if (project.aiAgents) keys.add("backend");
  return filterOrder.filter((key): key is Discipline => key !== "all" && keys.has(key));
}

export function matchesFilter(project: Pick<Project, "disciplines" | "aiAgents">, key: FilterKey): boolean {
  return key === "all" || projectFilterKeys(project).includes(key);
}

/** "All" plus every discipline that at least one project has, so no chip leads to an empty page. */
export function filterOptions(
  projects: readonly Pick<Project, "disciplines" | "aiAgents">[],
): FilterOption[] {
  return filterOrder
    .filter((key) => key === "all" || projects.some((project) => matchesFilter(project, key)))
    .map((key) => ({ key, label: filterLabels[key] }));
}

/** The value the URL carries: nothing for "all". */
export function filterToParam(key: FilterKey): string | null {
  return key === "all" ? null : key;
}
