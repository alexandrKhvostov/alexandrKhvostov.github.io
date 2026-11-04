/**
 * Search-engine data built from site and project facts: schema.org JSON-LD and the sitemap. Absolute URLs
 * come in from the caller (Astro.site), so this module stays pure.
 */
import { contactLinks, siteCity, siteCountry, siteIntro, siteName, siteRole, siteSkills } from "./site.ts";

type JsonLd = Record<string, unknown>;

/** The site owner as a schema.org Person; `sameAs` ties the site to the LinkedIn and GitHub profiles. */
export function personJsonLd(siteUrl: string): JsonLd {
  const email = contactLinks.find((link) => link.url.startsWith("mailto:"))?.url;
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${siteUrl}#person`,
    name: siteName,
    jobTitle: siteRole,
    description: siteIntro,
    knowsAbout: [...siteSkills],
    url: siteUrl,
    ...(email ? { email } : {}),
    address: { "@type": "PostalAddress", addressLocality: siteCity, addressCountry: siteCountry },
    sameAs: contactLinks.filter((link) => link.url.startsWith("https://")).map((link) => link.url),
  };
}

export interface ProjectPageData {
  title: string;
  summary: string;
  url: string;
  image: string;
}

/** A project page as a schema.org TechArticle written by the Person above. */
export function projectJsonLd(page: ProjectPageData, siteUrl: string): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: page.title,
    description: page.summary,
    url: page.url,
    image: page.image,
    author: { "@id": `${siteUrl}#person`, "@type": "Person", name: siteName },
  };
}

/** JSON for a <script type="application/ld+json">; `<` is escaped so text can never close the tag. */
export function serializeJsonLd(data: JsonLd): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

function escapeXml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** A sitemap.xml listing the given absolute URLs in order. */
export function sitemapXml(urls: readonly string[]): string {
  const entries = urls.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
