import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const menu = fs.readFileSync(new URL("../components/layout/menu-overlay.tsx", import.meta.url), "utf8");
const sitemap = fs.readFileSync(new URL("./sitemap.ts", import.meta.url), "utf8");
const layout = fs.readFileSync(new URL("./layout.tsx", import.meta.url), "utf8");
const globals = fs.readFileSync(new URL("./globals.css", import.meta.url), "utf8");

test("reports are discoverable and global accessibility safeguards remain present", () => {
  assert.match(menu, /Отчётность/);
  assert.match(menu, /href: "\/reports"/);
  assert.match(sitemap, /reportsService\.getReportYears/);
  assert.match(sitemap, /`\$\{baseUrl\}\/reports\/\$\{year\}`/);
  assert.match(layout, /href="#main-content"/);
  assert.match(globals, /prefers-reduced-motion: reduce/);
});
