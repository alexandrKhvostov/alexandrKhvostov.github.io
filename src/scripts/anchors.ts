/**
 * Section anchors: a click on a heading's `#` link keeps the normal jump and also copies the full URL.
 * Markup: <a data-anchor href="#id">, and optionally [data-anchor-status] (a live region) for the confirmation.
 */
export function initAnchors(): void {
  const status = document.querySelector("[data-anchor-status]");
  for (const anchor of document.querySelectorAll<HTMLAnchorElement>("[data-anchor]")) {
    anchor.addEventListener("click", async () => {
      const url = new URL(anchor.getAttribute("href") ?? "", location.href).href;
      try {
        await navigator.clipboard.writeText(url);
        if (status) status.textContent = "Link copied";
      } catch {
        if (status) status.textContent = "";
      }
    });
  }
}
