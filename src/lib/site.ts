/** Site-wide constants and the small helpers that build titles and paths. */

export const siteName = "Alexandr Khvostov";
export const siteRole = "Senior Full Stack Developer / Engineering Lead";

/** Where the "Contact" link in the top bar goes. While undefined the link is not rendered. */
export const contactUrl: string | undefined = undefined;

export const homeTitle = `Projects | ${siteName}`;
export const homeLead = "Systems I designed, built or led.";
export const homeDescription = `${homeLead} Architecture, decisions and rules behind each project, by ${siteName}.`;

/** "<page> | Alexandr Khvostov"; the bare name when there is no page title. */
export function pageTitle(title?: string): string {
  return title ? `${title} | ${siteName}` : siteName;
}

/** The projects page. */
export const homePath = "/";

/** The URL path of a project page. The site lives at the root of its domain. */
export function projectPath(slug: string): string {
  return `/${slug}/`;
}
