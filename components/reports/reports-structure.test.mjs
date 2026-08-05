import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const page = fs.readFileSync(new URL("../../app/reports/page.tsx", import.meta.url), "utf8");
const hero = fs.readFileSync(new URL("./reports-hero.tsx", import.meta.url), "utf8");
const archive = fs.readFileSync(new URL("./report-archive.tsx", import.meta.url), "utf8");
const detail = fs.readFileSync(new URL("../../app/reports/[year]/page.tsx", import.meta.url), "utf8");
const finance = fs.readFileSync(new URL("./financial-flow.tsx", import.meta.url), "utf8");
const documents = fs.readFileSync(new URL("./document-stack.tsx", import.meta.url), "utf8");

test("reports overview is a semantic archive, not a table", () => {
  assert.match(page, /id="main-content"/);
  assert.match(hero, /<h1/);
  assert.match(archive, /aria-label="Архив годовых отчётов"/);
  assert.match(archive, /<ol/);
  assert.match(archive, /focus-visible/);
  assert.doesNotMatch(`${page}\n${archive}`, /<table/);
});

test("report detail validates routing and exposes finance and documents accessibly", () => {
  assert.match(detail, /generateMetadata/);
  assert.match(detail, /notFound\(\)/);
  assert.match(finance, /aria-label="Движение средств"/);
  assert.match(finance, /financialSummary\.income !== undefined/);
  assert.match(documents, /download/);
  assert.match(documents, /focus-visible/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
});
