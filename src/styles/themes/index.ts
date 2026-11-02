export type ThemeId = "warm-light" | "warm-dark";

export interface Theme {
  id: ThemeId;
  label: string;
  /** Which `prefers-color-scheme` value picks this theme by default. */
  scheme: "light" | "dark";
}

/** Every theme file in this folder, in switcher order. A new theme = one CSS file + one entry here. */
export const themes: readonly Theme[] = [
  { id: "warm-light", label: "Warm light", scheme: "light" },
  { id: "warm-dark", label: "Warm dark", scheme: "dark" },
];

export const defaultThemeForScheme: Record<"light" | "dark", ThemeId> = {
  light: "warm-light",
  dark: "warm-dark",
};

export const themeStorageKey = "theme";
