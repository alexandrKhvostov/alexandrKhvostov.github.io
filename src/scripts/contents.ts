/**
 * Marks the section in view in the contents column. Markup contract:
 *   [data-contents]       the nav
 *   [data-contents-link]  a link inside it whose href is #<section id>
 * A section is the element labelled by that id (aria-labelledby), so a long section stays current
 * for its whole length. The link of the topmost section in the reading band gets aria-current="true".
 * Without this script nothing is highlighted.
 */
export function initContents(): void {
  const nav = document.querySelector("[data-contents]");
  if (!nav || !("IntersectionObserver" in window)) return;

  const entries = [...nav.querySelectorAll<HTMLAnchorElement>("[data-contents-link]")].flatMap((link) => {
    const id = decodeURIComponent(link.hash.slice(1));
    const section = document.querySelector(`[aria-labelledby="${CSS.escape(id)}"]`);
    return section ? [{ link, section }] : [];
  });
  if (entries.length === 0) return;

  const visible = new Set<Element>();
  const update = (): void => {
    // Document order decides: the first visible section wins. With none in the band, the last choice stays.
    const current = entries.find((entry) => visible.has(entry.section));
    if (!current) return;
    for (const entry of entries) {
      if (entry === current) entry.link.setAttribute("aria-current", "true");
      else entry.link.removeAttribute("aria-current");
    }
  };

  // The band starts under the sticky top bar and covers the upper part of the screen.
  const observer = new IntersectionObserver(
    (changes) => {
      for (const change of changes) {
        if (change.isIntersecting) visible.add(change.target);
        else visible.delete(change.target);
      }
      update();
    },
    { rootMargin: "-96px 0px -55% 0px" },
  );
  entries.forEach((entry) => observer.observe(entry.section));
}
