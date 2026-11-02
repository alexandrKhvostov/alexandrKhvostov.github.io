/** Lower sections fade in once when they scroll into view. Mark them [data-reveal]; nothing re-animates. */
export function initReveal(): void {
  const targets = document.querySelectorAll<HTMLElement>("[data-reveal]");
  const showAll = () => targets.forEach((target) => target.setAttribute("data-revealed", ""));
  if (!("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    showAll();
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-revealed", "");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -10% 0px" },
  );
  targets.forEach((target) => observer.observe(target));
}
