/** Site-wide constants and the small helpers that build titles and paths. */

export const siteName = "Alexandr Khvostov";
export const siteRole = "Senior Full Stack Developer / Engineering Lead";

export const siteIntro =
  "9+ years in web and mobile. I design and build products in TypeScript, React, React Native and Node.js, and the MCP servers and agent setups that let AI agents work on them.";
export const siteLocation = "Based in Bucharest, Romania. Open to remote work.";
/** Skills for schema.org `knowsAbout`, picked by hand from the stacks of the project pages. */
export const siteSkills: readonly string[] = [
  "TypeScript",
  "React",
  "React Native",
  "Next.js",
  "Expo",
  "Node.js",
  "NestJS",
  "Express",
  "PostgreSQL",
  "AWS",
  "Docker",
  "Kubernetes (Helm)",
  "MCP servers",
  "AI agents",
];
export const siteCity = "Bucharest";
export const siteCountry = "RO";

export interface ContactLink {
  label: string;
  url: string;
}

/** Shown in the home hero and the footer of every page. */
export const contactLinks: readonly ContactLink[] = [
  { label: "Email", url: "mailto:xemylian@gmail.com" },
  { label: "LinkedIn", url: "https://www.linkedin.com/in/alexandr-khvostov-6a1182100/" },
  { label: "GitHub", url: "https://github.com/alexanderKhvostov" },
];

/** The footer holds the contacts, so the "Contact" link in the top bar jumps there on every page. */
export const contactId = "contact";

export const homeTitle = `${siteName} | ${siteRole}`;
export const homeDescription = `${siteRole} with 9+ years in web and mobile. Architecture and key decisions behind the systems I designed, built or led.`;

/** The Open Graph preview image, served from public/. */
export const ogImagePath = "/og.jpg";
export const ogImageAlt = `${siteName}, ${siteRole}`;

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

/** The URL path of a project as plain Markdown, for agents. */
export function projectMarkdownPath(slug: string): string {
  return `/${slug}.md`;
}

/** The plain-text index of the site for agents (the llms.txt convention). */
export const llmsTxtPath = "/llms.txt";

/** A project's own link preview in public/og/, rendered from its title and summary. */
export function projectOgImagePath(slug: string): string {
  return `/og/${slug}.jpg`;
}
