import assert from "node:assert/strict";
import { test } from "node:test";
import {
  contactLinks,
  homePath,
  llmsTxtPath,
  pageTitle,
  projectMarkdownPath,
  projectOgImagePath,
  projectPath,
  siteName,
  siteSkills,
} from "./site.ts";

test("pageTitle appends the site name", () => {
  assert.equal(pageTitle("Auth service"), "Auth service | Alexandr Khvostov");
});

test("pageTitle without a title is the bare name", () => {
  assert.equal(pageTitle(), siteName);
  assert.equal(pageTitle(""), siteName);
});

test("projectPath is a short root path with a trailing slash", () => {
  assert.equal(projectPath("auth-service"), "/auth-service/");
});

test("homePath is the root", () => {
  assert.equal(homePath, "/");
});

test("every contact link is mailto or https", () => {
  assert.ok(contactLinks.length > 0);
  for (const link of contactLinks) assert.match(link.url, /^(mailto:|https:\/\/)/);
});

test("projectOgImagePath points into public/og", () => {
  assert.equal(projectOgImagePath("auth-service"), "/og/auth-service.jpg");
});

test("projectMarkdownPath is the project slug with .md", () => {
  assert.equal(projectMarkdownPath("auth-service"), "/auth-service.md");
});

test("llmsTxtPath is a root file", () => {
  assert.equal(llmsTxtPath, "/llms.txt");
});

test("siteSkills lists the stack the intro states", () => {
  assert.ok(siteSkills.includes("TypeScript"));
  assert.ok(siteSkills.includes("AI agents"));
});
