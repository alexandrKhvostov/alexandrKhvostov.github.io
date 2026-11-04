import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fixtureProjects,
  rulesFixture,
  showcaseFixture,
  structureFixture,
  toolsFixture,
} from "./fixtures.ts";
import { llmsTxt, projectMarkdown, type MarkdownProject } from "./llms.ts";
import { contactLinks, siteIntro, siteLocation, siteRole } from "./site.ts";

const site = "https://example.test/";

test("llmsTxt opens with the name, role, intro and location", () => {
  const lines = llmsTxt(fixtureProjects, site).split("\n");
  assert.equal(lines[0], "# Alexandr Khvostov");
  assert.equal(lines[2], `> ${siteRole}`);
  assert.equal(lines[4], siteIntro);
  assert.equal(lines[5], siteLocation);
});

test("llmsTxt lists every contact", () => {
  const text = llmsTxt(fixtureProjects, site);
  for (const link of contactLinks) assert.ok(text.includes(`- [${link.label}](${link.url})`));
});

test("llmsTxt groups projects by company in page order with absolute .md links", () => {
  const text = llmsTxt(fixtureProjects, site);
  const headings = text.split("\n").filter((line) => line.startsWith("## "));
  assert.deepEqual(headings, ["## Contacts", "## PlayMe", "## SysGears", "## Side project"]);
  assert.ok(
    text.includes(
      "- [Sample identity service](https://example.test/auth-service.md): A sample project used to try the layout.",
    ),
  );
  assert.ok(text.indexOf("auth-service.md") < text.indexOf("quiz-builder.md"));
});

test("projectMarkdown writes frontmatter, title, summary and glance facts", () => {
  const md = projectMarkdown(fixtureProjects[0]!, fixtureProjects, site);
  assert.match(md, /^---\ntitle: "Sample identity service"\ncompany: "PlayMe"\nperiod: "2024"\n/);
  assert.match(md, /disciplines: \["Backend", "AI agents"\]/);
  assert.match(md, /stack: \["TypeScript", "Postgres"\]/);
  assert.match(md, /url: "https:\/\/example\.test\/auth-service\/"\n---\n\n# Sample identity service\n/);
  assert.match(md, /\n- 3 sample facts\n/);
  assert.match(md, /## Overview\n\nFirst sample paragraph\.\n\nSecond sample paragraph\./);
});

test("projectMarkdown numbers diagram steps with node labels and notes", () => {
  const md = projectMarkdown(fixtureProjects[0]!, fixtureProjects, site);
  assert.match(md, /A sample request passing through three services\./);
  assert.match(md, /1\. Client → Gateway: send request\. The client sends a request with a credential\./);
  assert.match(md, /5\. Sample service → Sample service: validate\./);
});

test("projectMarkdown skips optional sections the project lacks", () => {
  const md = projectMarkdown(fixtureProjects[2]!, fixtureProjects, site);
  for (const heading of ["Code structure", "Tools", "Rules and agents", "Connected projects"]) {
    assert.ok(!md.includes(`## ${heading}`), heading);
  }
  assert.ok(md.includes("## Decision log"));
});

test("projectMarkdown writes the optional sections when present", () => {
  const full: MarkdownProject = {
    ...fixtureProjects[0]!,
    showcase: showcaseFixture,
    structure: structureFixture,
    tools: toolsFixture,
    rules: rulesFixture,
  };
  const md = projectMarkdown(full, fixtureProjects, site);
  assert.match(md, /## A sample result\n\nA sample paragraph/);
  assert.match(md, /\[Open the sample\]\(https:\/\/example\.com\/\)/);
  assert.match(md, /- A loading step: Placeholder screen with a ring in the middle/);
  assert.match(md, /## Code structure\n\n```\nsample-service\//);
  assert.match(md, /- `src\/domain\/`: Rules live here/);
  assert.match(md, /## Tools\n\nA sample intro paragraph/);
  assert.match(md, /### Read\n\nThese calls change nothing\.\n\n- `list_samples`: Returns/);
  assert.match(md, /- Decision: Sample decision\. The reason/);
  assert.match(
    md,
    /- Sample rule that a tool enforces\. Why the rule exists.* Held by: lint rule, CI check\./,
  );
  assert.match(md, /A sample paragraph on how agents are set up/);
});

test("projectMarkdown writes outgoing and incoming connections, linking only targets with a page", () => {
  const md = projectMarkdown(fixtureProjects[0]!, fixtureProjects, site);
  assert.match(
    md,
    /- Sample identity service issues tokens for \[Quiz builder MCP\]\(https:\/\/example\.test\/quiz-builder\.md\)\n/,
  );
  assert.match(md, /- Sample identity service stores files in S3 bucket\n/);
  assert.match(
    md,
    /- \[Sample builder\]\(https:\/\/example\.test\/quiz-builder\.md\) asks for tokens from Sample identity service\n/,
  );
});

test("projectMarkdown leaves a planned project without a page as plain text", () => {
  const md = projectMarkdown(fixtureProjects[1]!, fixtureProjects, site);
  assert.match(md, /- Sample builder uploads through Media storage MCP\n/);
});
