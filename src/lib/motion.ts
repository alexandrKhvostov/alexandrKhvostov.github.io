/**
 * A CSS time in milliseconds: "450ms" → 450, ".45s" → 450. The production CSS minifier rewrites
 * "450ms" as ".45s", so a token read back from getComputedStyle can come in either unit.
 * Anything that is not a time gives 0.
 */
export function cssTimeToMs(value: string): number {
  const match = /^\s*(-?[\d.]+(?:e-?\d+)?)(ms|s)\s*$/i.exec(value);
  if (!match) return 0;
  const amount = Number.parseFloat(match[1] ?? "");
  if (!Number.isFinite(amount)) return 0;
  return match[2]?.toLowerCase() === "s" ? amount * 1000 : amount;
}
