import assert from "node:assert/strict";
import { test } from "node:test";
import { homePath, pageTitle, projectPath, siteName } from "./site.ts";

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
