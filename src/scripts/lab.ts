import { applyTheme, currentTheme } from "@/scripts/theme";
import type { ThemeId } from "@/styles/themes/index";

const root = document.documentElement;

/** Role name -> value the user typed with the picker. */
const edits = new Map<string, string>();
/** Role name -> alpha of the theme's own value, kept when the picker changes the color. */
const alphas = new Map<string, number>();

function hexPair(channel: number): string {
  return Math.round(Math.min(255, Math.max(0, channel)))
    .toString(16)
    .padStart(2, "0");
}

/** Resolves a CSS variable to [r, g, b, a] through a probe element. */
function resolve(name: string): [number, number, number, number] | null {
  const probe = document.createElement("span");
  probe.style.backgroundColor = `var(--${name})`;
  document.body.append(probe);
  const value = getComputedStyle(probe).backgroundColor;
  probe.remove();
  const numbers = value.match(/-?\d*\.?\d+/g)?.map(Number);
  if (!numbers || numbers.length < 3) return null;
  // `color(srgb 0.1 0.2 0.3)` uses 0..1; rgb notation uses 0..255.
  const scale = value.startsWith("color(") ? 255 : 1;
  return [numbers[0]! * scale, numbers[1]! * scale, numbers[2]! * scale, numbers[3] ?? 1];
}

function toHex([r, g, b]: [number, number, number, number], alpha: number): string {
  const base = `#${hexPair(r)}${hexPair(g)}${hexPair(b)}`;
  return alpha < 1 ? `${base}${hexPair(alpha * 255)}` : base;
}

function items(): HTMLElement[] {
  return [...document.querySelectorAll<HTMLElement>("[data-lab-role]")];
}

function syncInputs(): void {
  for (const item of items()) {
    const name = item.dataset.labRole!;
    const input = item.querySelector<HTMLInputElement>("[data-lab-input]")!;
    const readout = item.querySelector("[data-lab-value]")!;
    const color = resolve(name);
    if (!color) continue;
    alphas.set(name, color[3]);
    input.value = toHex(color, 1);
    readout.textContent = toHex(color, color[3]);
  }
}

function renderOutput(): string {
  const lines = [...edits].map(([name, value]) => `  --${name}: ${value};`);
  return lines.length ? `:root[data-theme="${currentTheme()}"] {\n${lines.join("\n")}\n}` : "";
}

function refreshOutput(): void {
  const output = document.querySelector("[data-lab-output]")!;
  output.textContent = renderOutput() || "No edits yet.";
}

function clearEdits(): void {
  for (const name of edits.keys()) root.style.removeProperty(`--${name}`);
  edits.clear();
}

function say(message: string): void {
  const status = document.querySelector("[data-lab-status]");
  if (status) status.textContent = message;
}

export function initLab(): void {
  for (const item of items()) {
    const name = item.dataset.labRole!;
    const input = item.querySelector<HTMLInputElement>("[data-lab-input]")!;
    const readout = item.querySelector("[data-lab-value]")!;
    input.addEventListener("input", () => {
      const alpha = alphas.get(name) ?? 1;
      const value = alpha < 1 ? `${input.value}${hexPair(alpha * 255)}` : input.value;
      edits.set(name, value);
      root.style.setProperty(`--${name}`, value);
      readout.textContent = value;
      refreshOutput();
    });
  }

  document.querySelectorAll<HTMLElement>("[data-lab-theme]").forEach((button) => {
    button.addEventListener("click", () => applyTheme(button.dataset.labTheme as ThemeId));
  });

  document.querySelector("[data-lab-reset]")?.addEventListener("click", () => {
    clearEdits();
    syncInputs();
    refreshOutput();
    say("Edits cleared.");
  });

  document.querySelector("[data-lab-copy]")?.addEventListener("click", async () => {
    const css = renderOutput();
    if (!css) {
      say("Nothing to copy: change a color first.");
      return;
    }
    try {
      await navigator.clipboard.writeText(css);
      say("Copied.");
    } catch {
      say("Clipboard is blocked: select the block above and copy it by hand.");
    }
  });

  document.addEventListener("themechange", () => {
    clearEdits();
    syncInputs();
    refreshOutput();
    say("");
  });

  syncInputs();
}
