/**
 * Diagram behaviour. Markup contract (rendered by the diagram blocks and DiagramSteps):
 *   [data-diagram]          root that holds the drawings and the steps list
 *   [data-edge]             one arrow per drawing, with data-step, data-from, data-to
 *   [data-node]             one actor or stage per drawing, value = node id
 *   [data-lifeline]         the dashed line under a sequence actor, value = node id
 *   [data-step-item]        a list item, value = step index; [data-step-button] and [data-step-note] inside
 *   [data-signal-diagram]   a frame whose running signal pauses while it is off screen
 * Without this script the first step stays active and every note stays visible.
 */

function indexOf(value: string | undefined): number {
  return value === undefined ? -1 : Number(value);
}

function setActive(root: HTMLElement, index: number): void {
  const edges = [...root.querySelectorAll<HTMLElement>("[data-edge]")];
  const active = edges.find((edge) => indexOf(edge.dataset.step) === index);
  const ends = new Set<string>();
  if (active?.dataset.from) ends.add(active.dataset.from);
  if (active?.dataset.to) ends.add(active.dataset.to);

  for (const edge of edges) edge.toggleAttribute("data-active", indexOf(edge.dataset.step) === index);
  for (const node of root.querySelectorAll<HTMLElement>("[data-node]")) {
    node.toggleAttribute("data-active", ends.has(node.dataset.node ?? ""));
  }
  for (const line of root.querySelectorAll<HTMLElement>("[data-lifeline]")) {
    line.toggleAttribute("data-active", ends.has(line.dataset.lifeline ?? ""));
  }
  for (const item of root.querySelectorAll<HTMLElement>("[data-step-item]")) {
    const on = indexOf(item.dataset.stepItem) === index;
    item.toggleAttribute("data-active", on);
    item.querySelector("[data-step-button]")?.setAttribute("aria-expanded", String(on));
  }
}

function initDiagram(root: HTMLElement): void {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-step-button]")];
  const count = buttons.length;
  if (count === 0) return;
  root.setAttribute("data-enhanced", "");
  // Start from the step the markup marked active (the first one, unless a page says otherwise).
  let current = Math.max(
    0,
    buttons.findIndex((button) => button.closest("[data-step-item]")?.hasAttribute("data-active")),
  );

  const select = (index: number, moveFocus = false): void => {
    current = Math.min(count - 1, Math.max(0, index));
    setActive(root, current);
    if (moveFocus) buttons[current]?.focus();
  };

  buttons.forEach((button, index) => {
    button.addEventListener("click", () => select(index));
    button.addEventListener("keydown", (event) => {
      const moves: Record<string, number> = {
        ArrowDown: index + 1,
        ArrowUp: index - 1,
        Home: 0,
        End: count - 1,
      };
      const target = moves[event.key];
      if (target === undefined) return;
      event.preventDefault();
      select(target, true);
    });
  });

  for (const edge of root.querySelectorAll<HTMLElement>("[data-edge]")) {
    edge.addEventListener("click", () => select(indexOf(edge.dataset.step)));
  }

  select(current);
}

/** The running signal pauses while its diagram is off screen (DESIGN.md, motion). */
export function initSignalPause(): void {
  if (!("IntersectionObserver" in window)) return;
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) entry.target.toggleAttribute("data-paused", !entry.isIntersecting);
  });
  document.querySelectorAll("[data-signal-diagram]").forEach((frame) => observer.observe(frame));
}

export function initDiagrams(): void {
  document.querySelectorAll<HTMLElement>("[data-diagram]").forEach(initDiagram);
  initSignalPause();
}
