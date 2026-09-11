import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const reportsSource = fs.readFileSync(new URL("./reports.ts", import.meta.url), "utf8");
const aboutSource = fs.readFileSync(new URL("./about-page.ts", import.meta.url), "utf8");
const donationsSource = fs.readFileSync(new URL("./donations.ts", import.meta.url), "utf8");

test("reports service requests only published and fully populated entries", () => {
  assert.match(reportsSource, /status=published/);
  assert.match(reportsSource, /filters\[year\]\[\$eq\]/);
  assert.match(reportsSource, /populate\[financialSummary\]/);
  assert.match(reportsSource, /populate\[documents\]\[populate\]\[file\]/);
});

test("about service requests the published single type", () => {
  assert.match(aboutSource, /\/about-page\?/);
  assert.match(aboutSource, /status=published/);
});

test("donations service distinguishes empty data from an unavailable backend", () => {
  assert.match(donationsSource, /status:\s*"ready"/);
  assert.match(donationsSource, /status:\s*"empty"/);
  assert.match(donationsSource, /status:\s*"unavailable"/);
  assert.doesNotMatch(donationsSource, /catch[\s\S]*?return\s*\[\s*\]/);
});
