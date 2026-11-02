/**
 * Same-document view transitions for a few chosen state changes (filtering the list, switching the theme).
 * While one runs, <html data-vt="<kind>"> lets global.css time that kind on its own. Where the API is
 * missing, or the visitor asks for reduced motion, the update simply runs.
 */
import { cssTimeToMs } from "@/lib/motion";

const root = document.documentElement;

export function runViewTransition(kind: string, update: () => void): ViewTransition | undefined {
  if (!("startViewTransition" in document) || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    update();
    return undefined;
  }
  root.dataset.vt = kind;
  const transition = document.startViewTransition(update);
  transition.finished.finally(() => {
    if (root.dataset.vt === kind) delete root.dataset.vt;
  });
  return transition;
}

/** A motion token from :root, in milliseconds (`--dur-theme: 450ms` → 450, also after minifying to `.45s`). */
export function durationToken(name: string): number {
  return cssTimeToMs(getComputedStyle(root).getPropertyValue(name));
}

export function easingToken(name: string): string {
  return getComputedStyle(root).getPropertyValue(name).trim() || "ease-out";
}
