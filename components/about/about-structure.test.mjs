import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const source = fs.readFileSync(new URL("./about-narrative.tsx", import.meta.url), "utf8");

test("about narrative consumes managed content and links to reports", () => {
  assert.match(source, /AboutPageContent/);
  assert.match(source, /content\.heroTitle/);
  assert.match(source, /content\.teamMembers/);
  assert.match(source, /content\.faqItems/);
  assert.match(source, /href="\/reports"/);
  assert.doesNotMatch(source, /const faqData =/);
  assert.doesNotMatch(source, /const\s+stats\s*=/);
});
