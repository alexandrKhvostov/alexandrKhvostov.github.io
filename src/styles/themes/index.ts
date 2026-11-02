export type ThemeId = "signal-dark" | "signal-light";

export interface Theme {
  id: ThemeId;
  label: string;
  /** Which `prefers-color-scheme` value picks this theme by default. */
  scheme: "light" | "dark";
}

/** Every theme file in this folder, in switcher order. A new theme = one CSS file + one entry here. */
export const themes: readonly Theme[] = [
  { id: "signal-dark", label: "Dark", scheme: "dark" },
  { id: "signal-light", label: "Light", scheme: "light" },
];

export const defaultThemeForScheme: Record<"light" | "dark", ThemeId> = {
  light: "signal-light",
  dark: "signal-dark",
};

/** Dark is the default; light is picked on first visit only when the system asks for it. */
export const defaultTheme: ThemeId = defaultThemeForScheme.dark;

export const themeStorageKey = "theme";
