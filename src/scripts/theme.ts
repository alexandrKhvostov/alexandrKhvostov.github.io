import { defaultTheme, themes, themeStorageKey, type ThemeId } from "@/styles/themes/index";

const root = document.documentElement;

function isThemeId(value: string | null | undefined): value is ThemeId {
  return themes.some((theme) => theme.id === value);
}

/** The theme currently applied to the page. */
export function currentTheme(): ThemeId {
  const applied = root.dataset.theme;
  return isThemeId(applied) ? applied : defaultTheme;
}

/** The theme after `id` in the list; wraps around. */
export function nextTheme(id: ThemeId): ThemeId {
  const index = themes.findIndex((theme) => theme.id === id);
  return themes[(index + 1) % themes.length]!.id;
}

export function applyTheme(id: ThemeId): void {
  root.dataset.theme = id;
  try {
    localStorage.setItem(themeStorageKey, id);
  } catch {
    // Storage can be blocked; the choice then lasts for this page only.
  }
  document.dispatchEvent(new CustomEvent("themechange", { detail: { id } }));
}

function renderSwitch(button: HTMLElement): void {
  const current = themes.find((theme) => theme.id === currentTheme());
  const next = themes.find((theme) => theme.id === nextTheme(currentTheme()));
  const label = button.querySelector("[data-theme-label]");
  if (label && current) label.textContent = current.label;
  if (current && next) {
    button.setAttribute("aria-label", `Theme: ${current.label}. Switch to ${next.label}`);
  }
}

/** Wires every `[data-theme-switch]` button: click cycles the theme, labels follow `themechange`. */
export function initThemeSwitches(): void {
  const buttons = document.querySelectorAll<HTMLElement>("[data-theme-switch]");
  const renderAll = () => buttons.forEach(renderSwitch);
  buttons.forEach((button) => {
    button.addEventListener("click", () => applyTheme(nextTheme(currentTheme())));
  });
  document.addEventListener("themechange", renderAll);
  renderAll();
}
