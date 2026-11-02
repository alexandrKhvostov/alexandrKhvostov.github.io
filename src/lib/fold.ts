/**
 * Long reference lists (tools, path notes) show a few entries and fold the rest behind a "Show more" toggle,
 * so a page reads as a case study first. Short lists are never folded: a toggle that hides one row costs more
 * than it saves.
 */
import type { ToolGroup } from "./types.ts";

export interface Folded<T> {
  shown: T[];
  hidden: T[];
}

/** The first `keep` items stay visible once the list is longer than `threshold`. */
export function foldList<T>(items: readonly T[], keep: number, threshold: number): Folded<T> {
  if (items.length <= threshold) return { shown: [...items], hidden: [] };
  return { shown: items.slice(0, keep), hidden: items.slice(keep) };
}

export interface FoldedGroups {
  shown: ToolGroup[];
  hidden: ToolGroup[];
  /** Items behind the toggle, across all hidden groups. */
  hiddenCount: number;
}

function countItems(groups: readonly ToolGroup[]): number {
  return groups.reduce((sum, group) => sum + group.items.length, 0);
}

/**
 * Keeps whole groups visible until at least `keep` items show. When even the first group is longer than
 * `threshold`, it is split after `keep` items and its rest opens the hidden part without repeating the note.
 */
export function foldGroups(groups: readonly ToolGroup[], keep: number, threshold: number): FoldedGroups {
  if (countItems(groups) <= threshold) return { shown: [...groups], hidden: [], hiddenCount: 0 };
  const [first, ...rest] = groups;
  if (!first) return { shown: [], hidden: [], hiddenCount: 0 };
  if (first.items.length > threshold) {
    const head = { ...first, items: first.items.slice(0, keep) };
    const tail = { title: first.title, items: first.items.slice(keep) };
    const hidden = [tail, ...rest];
    return { shown: [head], hidden, hiddenCount: countItems(hidden) };
  }
  const shown: ToolGroup[] = [];
  let index = 0;
  while (index < groups.length && countItems(shown) < keep) {
    shown.push(groups[index]!);
    index += 1;
  }
  const hidden = groups.slice(index);
  return { shown, hidden, hiddenCount: countItems(hidden) };
}
