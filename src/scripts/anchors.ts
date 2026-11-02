/**
 * Section anchors: a click on a heading's `#` link keeps the normal jump and also copies the full URL.
 * Markup: <a data-anchor href="#id">, and optionally [data-anchor-status] (a live region) for the confirmation.
 * After a copy the anchor carries data-copied for COPIED_MS, so its own styles can show the confirmation.
 */
const COPIED_MS = 1400;

export function initAnchors(): void {
  const timers = new WeakMap<HTMLElement, number>();
  const status = document.querySelector("[data-anchor-status]");
  for (const anchor of document.querySelectorAll<HTMLAnchorElement>("[data-anchor]")) {
    anchor.addEventListener("click", async () => {
      const url = new URL(anchor.getAttribute("href") ?? "", location.href).href;
      try {
        await navigator.clipboard.writeText(url);
        if (status) status.textContent = "Link copied";
        window.clearTimeout(timers.get(anchor));
        anchor.setAttribute("data-copied", "");
        timers.set(
          anchor,
          window.setTimeout(() => anchor.removeAttribute("data-copied"), COPIED_MS),
        );
      } catch {
        if (status) status.textContent = "";
      }
    });
  }
}
