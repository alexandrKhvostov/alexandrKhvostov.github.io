/**
 * Greedy word wrap for text drawn inside an SVG, where the browser cannot wrap for us.
 * A word longer than `maxChars` is first split after its hyphens; a piece that is still too long stays whole
 * (it overflows a little instead of losing letters).
 */
export function wrapText(text: string, maxChars: number): string[] {
  const limit = Math.max(1, Math.floor(maxChars));
  const pieces = text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .flatMap((word) => (word.length > limit ? (word.match(/[^-]+-?|-/g) ?? [word]) : [word]));
  const lines: string[] = [];
  let line = "";
  let glue = " ";
  for (const piece of pieces) {
    const joined = line === "" ? piece : `${line}${glue}${piece}`;
    if (line !== "" && joined.length > limit) {
      lines.push(line);
      line = piece;
    } else {
      line = joined;
    }
    glue = piece.endsWith("-") ? "" : " ";
  }
  if (line !== "") lines.push(line);
  return lines;
}
