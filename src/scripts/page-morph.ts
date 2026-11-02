/**
 * The page-to-page morph (global.css, @view-transition) flies each project title from where it was to
 * where it lands. When a page opens itself again ("All projects" on the home page after "Contact"
 * scrolled it to the footer), the old titles sit above the screen and would fly down from there, so a
 * navigation that stays on the same path skips the morph.
 */
export function initPageMorph(): void {
  window.addEventListener("pageswap", (event) => {
    const target = event.activation?.entry.url;
    if (!event.viewTransition || !target) return;
    if (new URL(target).pathname === location.pathname) event.viewTransition.skipTransition();
  });
}
