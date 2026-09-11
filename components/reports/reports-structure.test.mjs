import fs from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (relative) => fs.readFileSync(new URL(relative, import.meta.url), "utf8");

const page = read("../../app/reports/page.tsx");
const detail = read("../../app/reports/[year]/page.tsx");
const hero = read("./reports-hero.tsx");
const archive = read("./report-archive.tsx");
const finance = read("./financial-flow.tsx");
const documents = read("./document-stack.tsx");
const census = read("./pet-census.tsx");
const treemap = read("./intake-treemap.tsx");
const css = read("./reports.css");
const reveal = read("./report-reveal.tsx");

test("reports overview is a semantic archive, not a table", () => {
  assert.match(page, /id="main-content"/);
  assert.match(hero, /<(?:motion\.)?h1\b/);
  assert.match(archive, /aria-label="Архив годовых отчётов"/);
  assert.match(archive, /<ol/);
  assert.doesNotMatch(`${page}\n${archive}`, /<table/);
});

test("report detail validates routing and exposes finance and documents accessibly", () => {
  assert.match(detail, /generateMetadata/);
  assert.match(detail, /notFound\(\)/);
  assert.match(finance, /aria-label="Движение средств"/);
  assert.match(documents, /download/);
  assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
});

test("every page keeps a single visible focus style and one h1", () => {
  assert.match(css, /:focus-visible/);
  assert.equal((hero.match(/<(?:motion\.)?h1\b/g) || []).length, 1);
  assert.doesNotMatch(page, /<h1/, "на общей странице заголовок первого уровня только в герое");
  assert.equal((read("./report-opening.tsx").match(/<h1/g) || []).length, 1);
});

test("numbers come from the data layer, never hardcoded totals", () => {
  // страница считает показатели из сервисов; захардкоженные итоги были причиной
  // расхождения прежних прототипов с базой
  assert.match(page, /petStatsService/);
  assert.match(page, /reportsService/);
  assert.doesNotMatch(treemap, /\b(79|85|72)\b/, "числа в тримапе должны приходить пропсами");
});

test("treemap area is proportional to the value it claims to show", () => {
  // ширины колонок задаются в fr по числу поступивших, высота общая —
  // иначе подпись «площадь равна числу» перестаёт быть правдой
  assert.match(treemap, /\$\{slice\.intake\}fr/);
  assert.match(treemap, /gridTemplateColumns/);
  assert.match(css, /\.reports-treemap\s*\{[^}]*grid-auto-rows/s);
});

test("confirmed zero is shown, not hidden", () => {
  const outcomes = read("./outcome-list.tsx");
  assert.match(outcomes, /value === 0/);
  assert.match(outcomes, /tile\.zero \? "ink"/);
  assert.match(css, /\.reports-curio\[data-tone="ink"\]/);
});

test("bar reveal animates clip-path, never layout properties", () => {
  assert.match(finance, /clipPath/);
  assert.doesNotMatch(finance, /animate=\{\{\s*width/);
  assert.doesNotMatch(css, /transition:[^;]*\b(width|height|margin|padding)\b/);
});

test("scroll motion is one shared island that respects reduced motion", () => {
  assert.match(reveal, /useInView/);
  assert.match(reveal, /once: true/);
  assert.match(census, /"use client"/);
  // Настройку движения читает общий хук: прямой useReducedMotion давал
  // разные стили на сервере и на клиенте, и React сообщал о расхождении
  // гидратации, которое «не будет исправлено».
  const preference = read("./use-motion-preference.ts");
  assert.match(preference, /useReducedMotion/);
  assert.match(preference, /mounted && reduced === true/);
  for (const source of [reveal, hero, finance]) {
    assert.match(source, /useMotionPreference/);
    assert.doesNotMatch(source, /useReducedMotion/);
  }
});

test("year slices parse dates by format, not by Number()", () => {
  const yearReport = read("../../lib/reports/year-report.ts");
  // Пустая дата давала Number("") === 0, и подопечные без даты пристройства
  // считались уехавшими в нулевом году: разбор идёт по формату.
  assert.ok(yearReport.includes("/^") && yearReport.includes("d{4}$/.test(head)"), "год разбирается по формату");
  assert.ok(!yearReport.includes("Number.isInteger(year) ? year : undefined"), "наивный разбор не вернулся");
});

test("census links every animal to its own page", () => {
  assert.match(census, /\/pets\/\$\{pet\.documentId\}/);
  // Выбор разреза взаимоисключающий, поэтому переключатель, а не набор
  // независимых кнопок: скринридер объявляет «такой-то из шести».
  assert.match(census, /role="radiogroup"/);
  assert.match(census, /role="radio"/);
  assert.match(census, /aria-checked=\{checked\}/);
  assert.doesNotMatch(census, /aria-pressed/);
});

/**
 * Подсветку разреза делает CSS по data-атрибутам обёртки: React меняет один
 * атрибут вместо перерисовки восьми десятков кружков с фотографиями.
 */
test("census dims by CSS attributes instead of re-rendering the grid", () => {
  assert.match(census, /const CensusField = memo\(function CensusField\(/);
  assert.match(census, /data-status=\{pet\.status\}/);
  assert.match(census, /data-lens=\{lens\}/);
  assert.doesNotMatch(census, /reports-face--dimmed/);
  assert.doesNotMatch(census, /const isHighlighted/);
  // Сортировка годов без компаратора сравнивает их как строки.
  assert.match(census, /toSorted\(\(left, right\) => left - right\)/);
  assert.doesNotMatch(census, /\)\]\.sort\(\),/);
  // Битое фото не оставляет пустой кружок: показываем букву имени.
  assert.match(census, /onError=\{\(\) => onFail\(pet\.documentId\)\}/);
});

test("deleted prototypes leave no dangling imports", () => {
  const all = `${page}\n${detail}\n${archive}\n${hero}\n${finance}\n${documents}`;
  assert.doesNotMatch(all, /reports-2|reports-3|report-content|ReportBeam|ReportCover/);
});
