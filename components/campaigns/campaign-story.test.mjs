import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { createRequire } from "node:module";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const source = fs.readFileSync(new URL("./campaign-story.tsx", import.meta.url), "utf8");
const output = ts.transpileModule(source, { compilerOptions: {
  module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX,
} }).outputText;
const exports = {};
new Function("require", "exports", output)(createRequire(import.meta.url), exports);
const render = text => renderToStaticMarkup(createElement(exports.CampaignStory, { text }));

test("campaign copy retains paragraph breaks, headings, lists and emphasis", () => {
  const html = render("Первый абзац\nпродолжение\n\n## Что нужно\n- **Корм**\n- *Лекарства*\n\n1. Купить\n2. Доставить");
  assert.match(html, /<p>Первый абзац<br\/>продолжение<\/p>/);
  assert.match(html, /<h3>Что нужно<\/h3>/);
  assert.match(html, /<ul><li><strong>Корм<\/strong><\/li><li><em>Лекарства<\/em><\/li><\/ul>/);
  assert.match(html, /<ol><li>Купить<\/li><li>Доставить<\/li><\/ol>/);
});

test("CMS HTML remains escaped text", () => {
  const html = render('<script>alert(1)</script>\n<img src=x onerror="alert(1)">');
  assert.doesNotMatch(html, /<(script|img)\b/);
  assert.match(html, /&lt;script&gt;/);
});
