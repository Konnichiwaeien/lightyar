import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const page = fs.readFileSync(new URL("../../app/reports/page.tsx", import.meta.url), "utf8");
const hero = fs.readFileSync(new URL("./reports-hero.tsx", import.meta.url), "utf8");
const archive = fs.readFileSync(new URL("./report-archive.tsx", import.meta.url), "utf8");

test("reports overview is a semantic archive, not a table", () => {
  assert.match(page, /id="main-content"/);
  assert.match(hero, /<h1/);
  assert.match(archive, /aria-label="Архив годовых отчётов"/);
  assert.match(archive, /<ol/);
  assert.match(archive, /focus-visible/);
  assert.doesNotMatch(`${page}\n${archive}`, /<table/);
});
