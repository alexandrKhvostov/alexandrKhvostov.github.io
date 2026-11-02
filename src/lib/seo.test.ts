import assert from "node:assert/strict";
import { test } from "node:test";
import { personJsonLd, projectJsonLd, serializeJsonLd, sitemapXml } from "./seo.ts";
import { siteName } from "./site.ts";

const site = "https://example.test/";

test("personJsonLd names the owner and links only https profiles in sameAs", () => {
  const person = personJsonLd(site);
  assert.equal(person["@type"], "Person");
  assert.equal(person.name, siteName);
  assert.equal(person["@id"], "https://example.test/#person");
  for (const url of person.sameAs as string[]) assert.match(url, /^https:\/\//);
});

test("projectJsonLd points its author at the person", () => {
  const page = {
    title: "Auth service",
    summary: "OAuth server.",
    url: `${site}auth-service/`,
    image: `${site}og/auth-service.jpg`,
  };
  const article = projectJsonLd(page, site);
  assert.equal(article.headline, "Auth service");
  assert.deepEqual(article.author, {
    "@id": "https://example.test/#person",
    "@type": "Person",
    name: siteName,
  });
});

test("serializeJsonLd cannot close the script tag", () => {
  assert.equal(serializeJsonLd({ text: "</script>" }), '{"text":"\\u003c/script>"}');
});

test("sitemapXml lists every url and escapes ampersands", () => {
  const xml = sitemapXml([`${site}`, `${site}a/?x=1&y=2`]);
  assert.match(xml, /<loc>https:\/\/example\.test\/<\/loc>/);
  assert.match(xml, /x=1&amp;y=2/);
  assert.equal((xml.match(/<url>/g) ?? []).length, 2);
});
