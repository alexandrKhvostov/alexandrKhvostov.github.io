/**
 * Discipline filters on the projects page. Markup contract:
 *   [data-filters]         the chip bar, hidden in the markup so that without scripting nothing is filtered
 *   [data-filter]          a button, value = filter key, aria-pressed shows the chosen one
 *   [data-project]         a project row, data-filter-keys lists the keys it belongs to (space separated)
 *   [data-company-group]   a group of rows under a company heading; hidden when no row of it matches
 *   [data-filter-count]    optional text that says how many projects are shown
 * The choice lives in the URL as ?f=<key> (history.replaceState), so a filtered view can be shared.
 */
import { filterParam, filterToParam, parseFilter, type FilterKey } from "@/lib/filters";
import { runViewTransition } from "@/scripts/view-transition";

function apply(key: FilterKey): void {
  const rows = [...document.querySelectorAll<HTMLElement>("[data-project]")];
  let shown = 0;
  for (const row of rows) {
    const keys = (row.dataset.filterKeys ?? "").split(" ");
    const visible = key === "all" || keys.includes(key);
    row.hidden = !visible;
    if (visible) shown += 1;
  }
  for (const group of document.querySelectorAll<HTMLElement>("[data-company-group]")) {
    group.hidden = !group.querySelector("[data-project]:not([hidden])");
  }
  for (const button of document.querySelectorAll<HTMLElement>("[data-filter]")) {
    button.setAttribute("aria-pressed", String(button.dataset.filter === key));
  }
  const count = document.querySelector("[data-filter-count]");
  if (count) count.textContent = `${shown} ${shown === 1 ? "project" : "projects"}`;
}

/**
 * Rows and company groups get a view-transition name only for the length of one filter change, so the
 * rows that stay glide to their new places and the others fade, instead of the list jumping.
 */
function glide(update: () => void): void {
  const moving = [
    ...document.querySelectorAll<HTMLElement>("[data-project]"),
    ...document.querySelectorAll<HTMLElement>("[data-company-group]"),
  ];
  moving.forEach((element, index) => {
    element.style.viewTransitionName = `filter-${index}`;
  });
  const clear = () => moving.forEach((element) => element.style.removeProperty("view-transition-name"));
  const transition = runViewTransition("filter", update);
  if (transition) transition.finished.finally(clear);
  else clear();
}

function writeUrl(key: FilterKey): void {
  const url = new URL(location.href);
  const param = filterToParam(key);
  if (param) url.searchParams.set(filterParam, param);
  else url.searchParams.delete(filterParam);
  history.replaceState(history.state, "", url);
}

export function initFilters(): void {
  const bar = document.querySelector<HTMLElement>("[data-filters]");
  if (!bar) return;
  const buttons = [...bar.querySelectorAll<HTMLElement>("[data-filter]")];
  const available = new Set(buttons.map((button) => button.dataset.filter));

  const fromUrl = parseFilter(new URLSearchParams(location.search).get(filterParam));
  apply(available.has(fromUrl) ? fromUrl : "all");
  bar.hidden = false;

  for (const button of buttons) {
    button.addEventListener("click", () => {
      const key = parseFilter(button.dataset.filter);
      glide(() => apply(key));
      writeUrl(key);
    });
  }
}
