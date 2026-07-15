# Reports and Managed About Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver Strapi-managed annual reports, a seeded and published 2024 report with both original DOCX files, an editorially managed `/about`, and the distinctive “Свет сквозь архив” frontend at `/reports` and `/reports/[year]`.

**Architecture:** Strapi 5 owns fixed editorial schemas and published content. An explicit, idempotent seed command boots Strapi programmatically, uploads stable seed assets through the upload plugin, and creates documents through Document Service. Next.js Server Components fetch and normalize published content for SEO; small client islands provide the amber scroll beam and reveal motion. Pure domain helpers preserve the distinction between missing values and confirmed zeroes and are tested with Node’s built-in test runner.

**Tech Stack:** Strapi 5.40, PostgreSQL, Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Framer Motion, Node 24 built-in test runner, Playwright-based browser verification.

---

## Execution conventions

- Backend repository: `C:\Development\Crafting\lightyar\lightyar-backend`.
- Frontend repository: `C:\Development\Crafting\lightyar\lightyar`.
- Run every red test before implementation and confirm the stated failure.
- After each task, run the focused tests, review `git diff --check`, and commit only files from that repository.
- Do not delete legacy `site-media` fields in this release. They continue to serve the home page and provide seed-time media references.
- Do not add a chart library or use `dangerouslySetInnerHTML`.
- All optional numerical fields must use `value !== undefined`, never truthiness, so a confirmed `0` remains visible.

## Task 1: Add the Strapi editorial schema contract

**Files:**

- Create: `lightyar-backend/scripts/editorial-content/schema.test.js`
- Create: `lightyar-backend/src/components/reports/financial-summary.json`
- Create: `lightyar-backend/src/components/reports/outcome-metric.json`
- Create: `lightyar-backend/src/components/reports/custom-metric.json`
- Create: `lightyar-backend/src/components/reports/document.json`
- Create: `lightyar-backend/src/components/about/statistic.json`
- Create: `lightyar-backend/src/components/about/team-member.json`
- Create: `lightyar-backend/src/components/about/faq-item.json`
- Create: `lightyar-backend/src/api/annual-report/content-types/annual-report/schema.json`
- Create: `lightyar-backend/src/api/annual-report/controllers/annual-report.ts`
- Create: `lightyar-backend/src/api/annual-report/routes/annual-report.ts`
- Create: `lightyar-backend/src/api/annual-report/services/annual-report.ts`
- Create: `lightyar-backend/src/api/about-page/content-types/about-page/schema.json`
- Create: `lightyar-backend/src/api/about-page/controllers/about-page.ts`
- Create: `lightyar-backend/src/api/about-page/routes/about-page.ts`
- Create: `lightyar-backend/src/api/about-page/services/about-page.ts`
- Modify: `lightyar-backend/package.json`

- [ ] **Step 1: Write the failing schema contract test**

```js
const test = require('node:test');
const assert = require('node:assert/strict');

const annualReport = require('../../src/api/annual-report/content-types/annual-report/schema.json');
const aboutPage = require('../../src/api/about-page/content-types/about-page/schema.json');
const financial = require('../../src/components/reports/financial-summary.json');
const outcome = require('../../src/components/reports/outcome-metric.json');
const document = require('../../src/components/reports/document.json');

test('annual reports are publishable, uniquely keyed by year, and own required documents', () => {
  assert.equal(annualReport.kind, 'collectionType');
  assert.equal(annualReport.options.draftAndPublish, true);
  assert.deepEqual(annualReport.attributes.year, {
    type: 'integer', required: true, unique: true, min: 2000, max: 2100,
  });
  assert.deepEqual(annualReport.attributes.financialSummary, {
    type: 'component', repeatable: false, component: 'reports.financial-summary',
  });
  assert.equal(annualReport.attributes.documents.required, true);
  assert.equal(annualReport.attributes.documents.repeatable, true);
});

test('report components preserve optional money, qualifiers, and file-only documents', () => {
  assert.equal(financial.attributes.income.type, 'decimal');
  assert.equal(financial.attributes.targetExpenses.required, undefined);
  assert.deepEqual(outcome.attributes.qualifier.enum, ['exact', 'atLeast', 'approximately']);
  assert.deepEqual(document.attributes.file.allowedTypes, ['files']);
  assert.equal(document.attributes.file.required, true);
});

test('about page uses a fixed publishable structure', () => {
  assert.equal(aboutPage.kind, 'singleType');
  assert.equal(aboutPage.options.draftAndPublish, true);
  assert.equal(aboutPage.attributes.currentStats.component, 'about.statistic');
  assert.equal(aboutPage.attributes.teamMembers.component, 'about.team-member');
  assert.equal(aboutPage.attributes.faqItems.component, 'about.faq-item');
  assert.equal(aboutPage.attributes.reportsTitle.type, 'string');
  assert.equal(aboutPage.attributes.dynamicZone, undefined);
});
```

- [ ] **Step 2: Run the test and confirm it fails because the schemas do not exist**

```powershell
node --test scripts/editorial-content/schema.test.js
```

Expected: `MODULE_NOT_FOUND` for `annual-report/schema.json`.

- [ ] **Step 3: Add all report component schemas**

Use these exact attribute contracts:

```json
{
  "reports.financial-summary": {
    "currency": { "type": "enumeration", "enum": ["RUB"], "default": "RUB", "required": true },
    "income": { "type": "decimal" },
    "targetExpenses": { "type": "decimal" },
    "operatingExpenses": { "type": "decimal" },
    "bankFees": { "type": "decimal" },
    "closingBalance": { "type": "decimal" },
    "note": { "type": "text" }
  },
  "reports.outcome-metric": {
    "kind": { "type": "enumeration", "enum": ["dogsInCare", "catsInCare", "rescued", "treated", "adopted", "volunteers"], "required": true },
    "value": { "type": "decimal", "required": true },
    "qualifier": { "type": "enumeration", "enum": ["exact", "atLeast", "approximately"], "default": "exact", "required": true },
    "note": { "type": "text" },
    "order": { "type": "integer", "default": 0 }
  },
  "reports.custom-metric": {
    "label": { "type": "string", "required": true },
    "value": { "type": "decimal", "required": true },
    "qualifier": { "type": "enumeration", "enum": ["exact", "atLeast", "approximately"], "default": "exact", "required": true },
    "unit": { "type": "string" },
    "note": { "type": "text" },
    "order": { "type": "integer", "default": 0 }
  },
  "reports.document": {
    "title": { "type": "string", "required": true },
    "documentType": { "type": "enumeration", "enum": ["ministryReport", "charityReport", "financialStatement", "audit", "other"], "required": true },
    "file": { "type": "media", "multiple": false, "required": true, "allowedTypes": ["files"] },
    "note": { "type": "text" },
    "order": { "type": "integer", "default": 0 }
  }
}
```

Each file uses the normal Strapi component envelope with `collectionName`, Russian `displayName`, empty `options`, and its listed `attributes`. Use collection names `components_reports_financial_summaries`, `components_reports_outcome_metrics`, `components_reports_custom_metrics`, and `components_reports_documents`.

- [ ] **Step 4: Add all about component schemas**

```json
{
  "about.statistic": {
    "label": { "type": "string", "required": true },
    "value": { "type": "decimal", "required": true },
    "qualifier": { "type": "enumeration", "enum": ["exact", "atLeast", "approximately"], "default": "exact", "required": true },
    "unit": { "type": "string" },
    "order": { "type": "integer", "default": 0 }
  },
  "about.team-member": {
    "name": { "type": "string", "required": true },
    "role": { "type": "string", "required": true },
    "city": { "type": "string" },
    "bio": { "type": "text" },
    "quote": { "type": "text" },
    "photo": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "order": { "type": "integer", "default": 0 }
  },
  "about.faq-item": {
    "question": { "type": "string", "required": true },
    "answer": { "type": "text", "required": true },
    "order": { "type": "integer", "default": 0 }
  }
}
```

Use collection names `components_about_statistics`, `components_about_team_members`, and `components_about_faq_items`.

- [ ] **Step 5: Add the annual-report content type**

```json
{
  "kind": "collectionType",
  "collectionName": "annual_reports",
  "info": {
    "singularName": "annual-report",
    "pluralName": "annual-reports",
    "displayName": "Годовой отчёт",
    "description": "Публичная отчётность организации по годам"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": {},
  "attributes": {
    "year": { "type": "integer", "required": true, "unique": true, "min": 2000, "max": 2100 },
    "title": { "type": "string", "required": true },
    "summary": { "type": "text", "required": true },
    "body": { "type": "text" },
    "coverImage": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "financialSummary": { "type": "component", "repeatable": false, "component": "reports.financial-summary" },
    "outcomes": { "type": "component", "repeatable": true, "component": "reports.outcome-metric" },
    "customMetrics": { "type": "component", "repeatable": true, "component": "reports.custom-metric" },
    "documents": { "type": "component", "repeatable": true, "required": true, "component": "reports.document" }
  }
}
```

- [ ] **Step 6: Add the fixed about-page content type**

```json
{
  "kind": "singleType",
  "collectionName": "about_pages",
  "info": {
    "singularName": "about-page",
    "pluralName": "about-pages",
    "displayName": "Страница «О нас»",
    "description": "Редактируемый контент страницы об организации"
  },
  "options": { "draftAndPublish": true },
  "pluginOptions": {},
  "attributes": {
    "heroTitle": { "type": "string" },
    "heroIntro": { "type": "text" },
    "heroVideo": { "type": "media", "multiple": false, "allowedTypes": ["videos"] },
    "heroPoster": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "missionTitle": { "type": "string" },
    "missionBody": { "type": "text" },
    "directionsImage": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "historyTitle": { "type": "string" },
    "historyBody": { "type": "text" },
    "historyImage": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "currentStats": { "type": "component", "repeatable": true, "component": "about.statistic" },
    "teamMembers": { "type": "component", "repeatable": true, "component": "about.team-member" },
    "resultsTitle": { "type": "string" },
    "resultsBody": { "type": "text" },
    "resultsImage": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "volunteerTitle": { "type": "string" },
    "volunteerBody": { "type": "text" },
    "volunteerVideo": { "type": "media", "multiple": false, "allowedTypes": ["videos"] },
    "volunteerPoster": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "faqItems": { "type": "component", "repeatable": true, "component": "about.faq-item" },
    "faqImage": { "type": "media", "multiple": false, "allowedTypes": ["images"] },
    "reportsTitle": { "type": "string" },
    "reportsBody": { "type": "text" }
  }
}
```

- [ ] **Step 7: Add standard Strapi factories and the focused test script**

Each controller, route, and service exports the matching core factory, for example:

```ts
import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::annual-report.annual-report');
```

Use `createCoreRouter` and `createCoreService` for the other files and `api::about-page.about-page` for the single type. Add:

```json
"test:editorial-content": "node --test scripts/editorial-content/*.test.js"
```

- [ ] **Step 8: Run schema tests and Strapi build**

```powershell
node --test scripts/editorial-content/schema.test.js
npm run build
git diff --check
```

Expected: tests pass; Strapi admin and server compile without schema errors.

- [ ] **Step 9: Commit the backend schema**

```powershell
git add package.json scripts/editorial-content/schema.test.js src/components src/api/annual-report src/api/about-page
git commit -m "feat: add editorial report and about schemas"
```

## Task 2: Build the repeatable 2024 and about seed command

**Files:**

- Create: `lightyar-backend/scripts/editorial-content/content.js`
- Create: `lightyar-backend/scripts/editorial-content/content.test.js`
- Create: `lightyar-backend/scripts/editorial-content/seed.js`
- Create: `lightyar-backend/scripts/editorial-content/assets/minjust-2024.docx`
- Create: `lightyar-backend/scripts/editorial-content/assets/charity-2024.docx`
- Modify: `lightyar-backend/package.json`

- [ ] **Step 1: Write failing seed-payload tests**

```js
const test = require('node:test');
const assert = require('node:assert/strict');
const { buildReport2024, buildAboutPage, SEED_FILE_CAPTIONS } = require('./content');

test('2024 payload contains only verified report facts', () => {
  const report = buildReport2024({ ministryFileId: 11, charityFileId: 12 });
  assert.equal(report.year, 2024);
  assert.equal(report.financialSummary.income, 20509.71);
  assert.equal(report.financialSummary.targetExpenses, 0);
  assert.equal(report.financialSummary.bankFees, 60.75);
  assert.equal(report.financialSummary.closingBalance, 20448.96);
  assert.equal(report.outcomes.length, 0);
  assert.deepEqual(report.documents.map((item) => item.file), [11, 12]);
});

test('about payload preserves the old-page facts and organization statistics', () => {
  const about = buildAboutPage({});
  assert.match(about.heroIntro, /создана, чтобы помогать бездомным/);
  assert.match(about.historyBody, /октябре 2024 года/);
  assert.deepEqual(about.currentStats.map((item) => item.value), [60, 25]);
  assert.deepEqual(about.currentStats.map((item) => item.qualifier), ['atLeast', 'exact']);
  assert.deepEqual(about.teamMembers.map((item) => item.name), [
    'Марина Морозова', 'Светлана Клюкина', 'Андрей Синицин',
  ]);
});

test('seed file markers are stable across reruns', () => {
  assert.deepEqual(SEED_FILE_CAPTIONS, {
    ministry: 'seed:annual-report:2024:ministry',
    charity: 'seed:annual-report:2024:charity',
  });
});
```

- [ ] **Step 2: Run the test and confirm the module is missing**

```powershell
node --test scripts/editorial-content/content.test.js
```

Expected: `MODULE_NOT_FOUND` for `./content`.

- [ ] **Step 3: Implement immutable seed payload builders**

`buildReport2024` must return:

```js
{
  year: 2024,
  title: 'Первый год открытой отчётности',
  summary: 'Публикуем документы о деятельности АНБО «Светлый» и показываем движение средств без скрытых допущений.',
  body: [
    'В 2024 году организация начала официальную работу в Ярославле. Основной вид деятельности — охрана окружающей среды и защита животных.',
    'Имущество сформировано за счёт целевых поступлений от граждан Российской Федерации. Руководящий орган — собрание учредителей: Марина Морозова, Светлана Клюкина и Андрей Синицин.',
  ].join('\n\n'),
  financialSummary: {
    currency: 'RUB', income: 20509.71, targetExpenses: 0,
    bankFees: 60.75, closingBalance: 20448.96,
    note: 'В проверенных документах целевые расходы не заявлены; отражена комиссия банка.',
  },
  outcomes: [],
  customMetrics: [],
  documents: [
    { title: 'Отчёт в Министерство юстиции за 2024 год', documentType: 'ministryReport', file: ministryFileId, order: 10 },
    { title: 'Отчёт о благотворительной деятельности за 2024 год', documentType: 'charityReport', file: charityFileId, order: 20 },
  ],
}
```

`buildAboutPage(media)` must preserve the full old-page paragraph in `heroIntro`, the October 2024 and experienced-volunteer history in `historyBody`, current statistics `60+ собак` and `25 кошек`, existing team and FAQ copy from `components/about/about-narrative.tsx`, and this transparency chapter:

```js
{
  reportsTitle: 'Помощь должна быть видимой',
  reportsBody: 'Мы публикуем годовые документы и подтверждённые показатели, чтобы каждый мог увидеть, как устроена работа АНБО «Светлый».',
}
```

Map only media IDs that exist in `media`; omit absent optional media instead of writing `null`.

- [ ] **Step 4: Copy the two verified source documents into seed assets**

```powershell
Copy-Item ..\.tmp-source-docs\minjust-2024.docx scripts\editorial-content\assets\minjust-2024.docx
Copy-Item ..\.tmp-source-docs\charity-2024.docx scripts\editorial-content\assets\charity-2024.docx
```

Expected byte sizes: `23089` and `13033`.

- [ ] **Step 5: Implement the programmatic Strapi seed runner**

Use this lifecycle exactly:

```js
const { compileStrapi, createStrapi } = require('@strapi/core');

async function main() {
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();
  try {
    await seedEditorialContent(app);
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error('[editorial-seed] failed', error);
  process.exitCode = 1;
});
```

Inside `seedEditorialContent`:

1. Find an annual report for `year: 2024` in draft and published status. If either exists, log `report 2024: skipped` and do not upload report files.
2. Otherwise, find each upload asset by its stable `caption` using `strapi.db.query('plugin::upload.file').findOne({ where: { caption } })`.
3. Upload a missing asset with `strapi.plugin('upload').service('upload').upload({ data: { fileInfo: { name, caption } }, files: { filepath, originalFilename: name, mimetype: DOCX_MIME, size } })`.
4. Create and publish the report with `strapi.documents('api::annual-report.annual-report').create({ data: buildReport2024(ids), status: 'published' })`.
5. Find `about-page` in draft and published status. If absent, read the legacy `site-media` single type with `populate: '*'`, map available media IDs, and create the about page with `status: 'published'`.
6. Emit one concise line for every `created`, `reused`, or `skipped` action.

The DOCX MIME constant is `application/vnd.openxmlformats-officedocument.wordprocessingml.document`. Use `fs.statSync`, `path.join(__dirname, 'assets', filename)`, and no HTTP calls.

- [ ] **Step 6: Add and run the explicit seed script tests**

Add:

```json
"seed:editorial-content": "node scripts/editorial-content/seed.js"
```

Run:

```powershell
npm run test:editorial-content
git diff --check
```

Expected: schema and payload tests pass.

- [ ] **Step 7: Run the seed twice against the configured development database**

```powershell
npm run seed:editorial-content
npm run seed:editorial-content
```

Expected first run: creates or reuses the two media assets, report 2024, and about page. Expected second run: both documents are skipped and media counts do not change.

- [ ] **Step 8: Verify persisted content**

Use a short read-only Strapi console query or the admin panel to confirm:

- one published annual report with `year = 2024`;
- two document components with downloadable DOCX assets;
- one published about page;
- correct money decimals and `targetExpenses = 0`.

- [ ] **Step 9: Commit the seed command and binary assets**

```powershell
git add package.json scripts/editorial-content
git commit -m "feat: seed 2024 report and managed about content"
```

## Task 3: Add frontend domain models, normalization, and fallback tests

**Files:**

- Create: `lightyar/lib/reports/report-domain.ts`
- Create: `lightyar/lib/reports/report-domain.test.ts`
- Create: `lightyar/lib/reports/normalize-report.ts`
- Create: `lightyar/lib/about/about-content.ts`
- Create: `lightyar/lib/about/about-content.test.ts`
- Create: `lightyar/lib/about/normalize-about-page.ts`
- Modify: `lightyar/lib/api/types.ts`
- Modify: `lightyar/package.json`

- [ ] **Step 1: Write failing pure report-domain tests**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseOptionalNumber, formatQualifiedValue, sortByOrder, sortReportsNewestFirst,
} from './report-domain.ts';

test('optional money distinguishes missing values, zero, and decimal strings', () => {
  assert.equal(parseOptionalNumber(undefined), undefined);
  assert.equal(parseOptionalNumber(null), undefined);
  assert.equal(parseOptionalNumber(''), undefined);
  assert.equal(parseOptionalNumber('0.00'), 0);
  assert.equal(parseOptionalNumber('20509.71'), 20509.71);
  assert.equal(parseOptionalNumber('not-a-number'), undefined);
});

test('qualifiers are visible and deterministic', () => {
  assert.equal(formatQualifiedValue(60, 'atLeast'), '60+');
  assert.equal(formatQualifiedValue(25, 'exact'), '25');
  assert.equal(formatQualifiedValue(100, 'approximately'), '≈100');
});

test('orders are stable and years are newest first', () => {
  assert.deepEqual(sortByOrder([{ order: 20 }, { order: 10 }]).map((x) => x.order), [10, 20]);
  assert.deepEqual(sortReportsNewestFirst([{ year: 2023 }, { year: 2025 }]).map((x) => x.year), [2025, 2023]);
});
```

- [ ] **Step 2: Write the failing about fallback test**

```ts
import test from 'node:test';
import assert from 'node:assert/strict';
import { ABOUT_FALLBACK, mergeAboutContent } from './about-content.ts';

test('missing CMS content falls back without erasing provided fields or confirmed zeroes', () => {
  const result = mergeAboutContent({ heroTitle: 'Новый заголовок', currentStats: [{ label: 'Тест', value: 0, qualifier: 'exact', order: 1 }] });
  assert.equal(result.heroTitle, 'Новый заголовок');
  assert.equal(result.missionBody, ABOUT_FALLBACK.missionBody);
  assert.equal(result.currentStats[0].value, 0);
  assert.ok(result.faqItems.length > 0);
});
```

- [ ] **Step 3: Run and confirm the missing-module failures**

```powershell
node --experimental-strip-types --test lib/reports/report-domain.test.ts lib/about/about-content.test.ts
```

Expected: `ERR_MODULE_NOT_FOUND` for both implementation modules.

- [ ] **Step 4: Implement pure domain helpers**

```ts
export type Qualifier = 'exact' | 'atLeast' | 'approximately';

export function parseOptionalNumber(value: unknown): number | undefined {
  if (value === null || value === undefined || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function formatQualifiedValue(value: number, qualifier: Qualifier): string {
  const formatted = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 2 }).format(value);
  if (qualifier === 'atLeast') return `${formatted}+`;
  if (qualifier === 'approximately') return `≈${formatted}`;
  return formatted;
}

export function sortByOrder<T extends { order?: number | null }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

export function sortReportsNewestFirst<T extends { year: number }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => b.year - a.year);
}
```

- [ ] **Step 5: Define Strapi DTOs and normalized view models**

Add explicit types for media (`id`, `documentId`, `name`, `ext`, `mime`, `size`, `url`), the four report components, `StrapiAnnualReport`, the three about components, and `StrapiAboutPage`. Define normalized models with numeric optional money, resolved absolute media URLs, ordered arrays, and document fields `format` and `sizeLabel`.

`normalizeReport` must:

- parse every decimal through `parseOptionalNumber`;
- drop a document whose `file.url` is absent;
- sort outcomes, custom metrics, and documents by `order`;
- keep a confirmed zero;
- resolve all media through the provided `resolveMediaUrl` callback;
- split no body HTML; keep plain strings for server rendering.

- [ ] **Step 6: Implement and test the full about fallback**

Move the existing hardcoded hero, mission, history, team, statistics, volunteer, and FAQ copy from `about-narrative.tsx` into `ABOUT_FALLBACK`. Add the exact old-site organization paragraph to `heroIntro`. `mergeAboutContent` uses nullish/empty-string fallback for scalar text, preserves provided arrays when non-empty, sorts components by `order`, and resolves optional media without requiring it.

- [ ] **Step 7: Add the frontend test script and run it**

```json
"test": "node --experimental-strip-types --test lib/reports/report-domain.test.ts lib/about/about-content.test.ts components/ui/cursor-context.test.mjs"
```

```powershell
npm test
npm run lint
git diff --check
```

Expected: all unit and existing cursor-context tests pass; ESLint has no new errors.

- [ ] **Step 8: Commit the domain layer**

```powershell
git add package.json lib/api/types.ts lib/reports lib/about
git commit -m "feat: normalize report and about editorial content"
```

## Task 4: Add Strapi services and server page data boundaries

**Files:**

- Create: `lightyar/lib/api/services/reports.ts`
- Create: `lightyar/lib/api/services/about-page.ts`
- Create: `lightyar/app/reports/error.tsx`
- Create: `lightyar/app/reports/loading.tsx`
- Create: `lightyar/app/reports/[year]/not-found.tsx`
- Modify: `lightyar/app/about/page.tsx`

- [ ] **Step 1: Add source-contract tests for published-only requests and safe fallbacks**

Create `lightyar/lib/api/services/editorial-services.test.mjs` that reads the two service sources and asserts:

```js
assert.match(reportsSource, /status=published/);
assert.match(reportsSource, /filters\[year\]\[\$eq\]/);
assert.match(reportsSource, /populate\[financialSummary\]/);
assert.match(reportsSource, /populate\[documents\]\[populate\]\[file\]/);
assert.match(aboutSource, /\/about-page\?/);
assert.match(aboutSource, /status=published/);
```

Add this file to the `test` script, run the test, and expect `ENOENT` before implementation.

- [ ] **Step 2: Implement the report service**

`ReportsService extends StrapiClient` and exposes:

```ts
getReports(): Promise<AnnualReport[]>
getReportByYear(year: number): Promise<AnnualReport | null>
getReportYears(): Promise<number[]>
```

Use one common query string:

```ts
const REPORT_POPULATE = [
  'populate[coverImage]=true',
  'populate[financialSummary]=true',
  'populate[outcomes]=true',
  'populate[customMetrics]=true',
  'populate[documents][populate][file]=true',
].join('&');
```

Append `status=published`, `sort[0]=year:desc`, and `pagination[limit]=100`. `getReportByYear` adds an encoded integer filter and returns the first normalized item. Use `{ next: { revalidate: 60 } }`. `getReports` throws on API failure; `getReportYears` catches, logs, and returns `[]` for sitemap resilience.

- [ ] **Step 3: Implement the about-page service**

Fetch `/about-page?status=published&populate[heroVideo]=true&...` with every direct media field and nested `teamMembers.photo`. Normalize and merge with `ABOUT_FALLBACK`. On failure, log once and return the local fallback so `/about` stays useful.

- [ ] **Step 4: Switch `/about` to the new content boundary**

```tsx
export default async function AboutPage() {
  const content = await aboutPageService.getAboutPage();
  return (
    <div className="min-h-screen bg-[#e8e4dc] text-[#1c1c1c]">
      <HomeHeader />
      <main id="main-content">
        <AboutNarrative content={content} />
      </main>
    </div>
  );
}
```

Remove the `/about` dependency on `siteMediaService`; do not delete that service.

- [ ] **Step 5: Add route states**

- `loading.tsx`: static dark/paper skeleton with `aria-label="Загрузка отчётности"` and no looping animation under reduced motion.
- `error.tsx`: client component with calm copy “Отчётность временно недоступна” and a retry button calling `reset()`.
- `[year]/not-found.tsx`: links to `/reports` and explains that the requested published report is absent.

- [ ] **Step 6: Run tests, lint, and commit**

```powershell
npm test
npm run lint
git diff --check
git add app/about/page.tsx app/reports lib/api/services package.json
git commit -m "feat: load published editorial content from Strapi"
```

## Task 5: Build the “Свет сквозь архив” reports overview

**Files:**

- Create: `lightyar/app/reports/page.tsx`
- Create: `lightyar/components/reports/reports-hero.tsx`
- Create: `lightyar/components/reports/report-archive.tsx`
- Create: `lightyar/components/reports/report-beam.tsx`
- Create: `lightyar/components/reports/report-empty-state.tsx`
- Create: `lightyar/components/reports/reports.css`

- [ ] **Step 1: Write a structural accessibility test before components exist**

Create `components/reports/reports-structure.test.mjs` and assert that overview source includes:

```js
assert.match(page, /id="main-content"/);
assert.match(page, /<h1/);
assert.match(archive, /aria-label="Архив годовых отчётов"/);
assert.match(archive, /<ol/);
assert.match(archive, /focus-visible/);
assert.doesNotMatch(page, /<table/);
```

Add the test to `npm test`; run and expect `ENOENT`.

- [ ] **Step 2: Implement the server-rendered overview page**

Metadata:

```ts
export const metadata: Metadata = {
  title: 'Отчётность | АНБО «Светлый»',
  description: 'Годовые документы и подтверждённые показатели работы АНБО «Светлый».',
  alternates: { canonical: '/reports' },
};
```

Fetch `reportsService.getReports()` in a `try/catch`. Render the dark hero and archive when data exists; render `ReportEmptyState` with the API-unavailable message on failure. The primary content stays in Server Components and the page contains no table.

- [ ] **Step 3: Implement the visual direction**

Use CSS custom properties scoped to `.reports-experience`:

```css
--archive-black: #0a0a0a;
--paper: #e8e4dc;
--sheet: #f7f4ee;
--amber: #f59e0b;
--result-green: #6f7569;
--technical: #b7aea2;
```

The hero is at least `min-height: min(860px, 90svh)`, uses no raster LCP image, places the thesis “Помощь должна быть видимой” across a restrained asymmetric grid, and reveals a single vertical amber beam. The archive is an `<ol>` of large years with summary, only available metrics, and document count. Desktop may use sticky year navigation; at `max-width: 767px` it becomes normal document flow.

- [ ] **Step 4: Implement the client beam island**

`ReportBeam` is the only overview client island. Use `useScroll` and `useSpring` from Framer Motion to map section progress to beam scale. With `useReducedMotion()`, render the final fully visible beam without animation. Set `aria-hidden="true"` and `pointer-events: none`.

- [ ] **Step 5: Verify responsive semantics and commit**

```powershell
npm test
npm run lint
npm run build
git diff --check
git add app/reports components/reports package.json
git commit -m "feat: build the annual reports archive"
```

Expected: server build contains `/reports`; tests prove semantic list, focus styling, and absence of tables.

## Task 6: Build the annual report detail and document experience

**Files:**

- Create: `lightyar/app/reports/[year]/page.tsx`
- Create: `lightyar/components/reports/report-cover.tsx`
- Create: `lightyar/components/reports/financial-flow.tsx`
- Create: `lightyar/components/reports/financial-flow-motion.tsx`
- Create: `lightyar/components/reports/outcome-list.tsx`
- Create: `lightyar/components/reports/document-stack.tsx`
- Create: `lightyar/components/reports/report-neighbors.tsx`

- [ ] **Step 1: Add detail structural tests**

Extend `reports-structure.test.mjs`:

```js
assert.match(detail, /generateMetadata/);
assert.match(detail, /notFound\(\)/);
assert.match(finance, /aria-label="Движение средств"/);
assert.match(finance, /financialSummary\.income !== undefined/);
assert.match(documents, /download/);
assert.match(documents, /focus-visible/);
assert.doesNotMatch(detail, /dangerouslySetInnerHTML/);
```

Run and expect missing files.

- [ ] **Step 2: Implement validated dynamic routing and metadata**

Use `PageProps<'/reports/[year]'>`; await `params`, accept only `/^\d{4}$/`, require `2000 <= year <= 2100`, and call `notFound()` otherwise. `generateMetadata` fetches the report and returns unique title, summary description, and canonical `/reports/${year}`. The page fetches the report and all years, derives adjacent published years, and never manufactures missing data.

- [ ] **Step 3: Implement the financial flow**

Render only defined fields in this semantic order: income → target expenses → operating expenses → bank fees → closing balance. For 2024 the visible line reads:

`20 509,71 ₽ → комиссия 60,75 ₽ → остаток 20 448,96 ₽`

Show confirmed `targetExpenses = 0` as explanatory copy, not a fake-width bar. Use an inline SVG path for the line, with a visible `<dl>` containing all values as the accessible equivalent. `FinancialFlowMotion` animates `pathLength` once in view and immediately shows the final path for reduced motion.

- [ ] **Step 4: Implement outcomes and body copy**

Hide the outcomes section when both outcome arrays are empty. When present, render an editorial list instead of KPI cards. Format qualifiers as `60+`, `≈100`, or exact values. Render body paragraphs through:

```tsx
report.body?.split(/\n\s*\n/).filter(Boolean).map((paragraph) => <p key={paragraph}>{paragraph}</p>)
```

- [ ] **Step 5: Implement the document stack**

Render documents as overlapping paper sheets with deterministic transforms from the item index. Each sheet shows title, type label, uppercase extension, size, and note. Provide both “Открыть” (`target="_blank"`, `rel="noreferrer"`) and “Скачать” (`download`) links with 44px targets and explicit accessible names containing the document title. Hide actions only when the normalized URL is absent; such documents should already be filtered out.

- [ ] **Step 6: Implement neighboring-year navigation**

At the page end, link to only actual adjacent published years and `/about`. When only 2024 exists, show the archive link and about link without empty previous/next placeholders.

- [ ] **Step 7: Run the full frontend checks and commit**

```powershell
npm test
npm run lint
npm run build
git diff --check
git add app/reports/[year] components/reports package.json
git commit -m "feat: add annual report detail experience"
```

## Task 7: Make the cinematic `/about` component fully content-driven

**Files:**

- Modify: `lightyar/components/about/about-narrative.tsx`
- Modify: `lightyar/components/about/about-narrative.css`
- Create: `lightyar/components/about/about-structure.test.mjs`

- [ ] **Step 1: Write a source contract that rejects old hardcoded data ownership**

```js
const fs = require('node:fs');
const test = require('node:test');
const assert = require('node:assert/strict');
const source = fs.readFileSync(new URL('./about-narrative.tsx', import.meta.url), 'utf8');

test('about narrative consumes managed content and links to reports', () => {
  assert.match(source, /AboutPageContent/);
  assert.match(source, /content\.heroTitle/);
  assert.match(source, /content\.teamMembers/);
  assert.match(source, /content\.faqItems/);
  assert.match(source, /href="\/reports"/);
  assert.doesNotMatch(source, /const faqData =/);
  assert.doesNotMatch(source, /const stats =/);
});
```

Add to `npm test`; run and expect failures for the current hardcoded constants.

- [ ] **Step 2: Replace media-only props with normalized content**

Change the signature to:

```tsx
export function AboutNarrative({ content }: { content: AboutPageContent })
```

Build the chapter presentation metadata from `content` at render time. Keep chapter IDs, layout, observer logic, stage transitions, and animation structure in code. Replace text, statistics, team, FAQ, image, video, and poster lookups with corresponding normalized content fields.

- [ ] **Step 3: Preserve existing interaction quality**

Keep accordion button/panel ARIA links, keyboard behavior, `focus-visible`, sticky desktop stage, and the existing mobile fallback. Ensure no optional media produces a broken `<Image>` or `<video>` source; render a calm paper/charcoal backdrop instead.

- [ ] **Step 4: Add the transparency chapter**

Insert a chapter after results and before FAQ with:

- `content.reportsTitle` and `content.reportsBody`;
- a large `/reports` link reading “Открыть отчётность”;
- the same amber beam motif, used once and without duplicating the reports hero;
- an accessible focus state and 44px minimum target.

- [ ] **Step 5: Remove obsolete hardcoded data and verify**

Delete `chaptersData`, `faqData`, local hardcoded `stats`, and `SiteMedia` lookup maps only after every usage has moved to `content`. Preserve purely presentational constants and variants.

```powershell
npm test
npm run lint
npm run build
git diff --check
git add components/about package.json
git commit -m "feat: drive about experience from Strapi content"
```

## Task 8: Integrate navigation, sitemap, SEO, and global accessibility

**Files:**

- Modify: `lightyar/components/layout/menu-overlay.tsx`
- Modify: `lightyar/app/sitemap.ts`
- Modify: `lightyar/app/layout.tsx`
- Modify: `lightyar/app/globals.css`
- Create: `lightyar/app/navigation-contract.test.mjs`

- [ ] **Step 1: Add failing navigation and sitemap tests**

Assert exact source contracts:

```js
assert.match(menu, /Отчётность/);
assert.match(menu, /href: "\/reports"/);
assert.match(sitemap, /reportsService\.getReportYears/);
assert.match(sitemap, /`\$\{baseUrl\}\/reports\/\$\{year\}`/);
assert.match(layout, /href="#main-content"/);
assert.match(globals, /prefers-reduced-motion: reduce/);
```

Add to `npm test`; run and confirm missing assertions.

- [ ] **Step 2: Add the menu item and skip link**

Add `{ label: "Отчётность", href: "/reports" }` directly after “О фонде”. Add a first-focusable skip link in the root layout. Style it off-screen until focus and move it visibly to the top-left on focus.

- [ ] **Step 3: Add published report routes to sitemap**

Load report years in the existing `Promise.all`, catching and logging failures like other dynamic services. Add static `/reports` with monthly change frequency and priority `0.7`. Add each `/reports/${year}` with yearly change frequency and priority `0.65`. Only the published-only service supplies years.

- [ ] **Step 4: Consolidate motion and document focus rules**

In `globals.css`, ensure reduced motion disables long transitions, smooth scrolling, and nonessential keyframes while leaving content visible. Add global `:focus-visible` offset rules that remain visible on black, paper, and amber surfaces.

- [ ] **Step 5: Run all frontend checks and commit**

```powershell
npm test
npm run lint
npm run build
git diff --check
git add app components/layout package.json
git commit -m "feat: integrate reports navigation and discovery"
```

## Task 9: Verify Strapi permissions and production data flow

**Files:**

- Modify if needed: `lightyar-backend/README.md`
- Modify if needed: `lightyar/.env.example`

- [ ] **Step 1: Start backend and frontend using the configured environment**

Use the project’s configured database and S3/local upload settings. Do not echo secrets. Run backend and frontend in separate background terminals.

```powershell
npm run develop
npm run dev
```

- [ ] **Step 2: Configure public read permissions in Strapi admin**

Enable public `find` and `findOne` for `annual-report`, and `find` for the `about-page` single type. Do not expose create, update, delete, or seed routes. If production relies exclusively on `REST_API_KEY`, confirm the frontend token role has these read permissions instead and document that choice.

- [ ] **Step 3: Verify API payloads directly**

Request the exact URLs used by the frontend and confirm:

- status 200;
- only published content;
- populated document file URLs;
- `targetExpenses` remains `0`;
- about team photos and video fields may be absent without a 500;
- document URLs return the DOCX MIME type and nonzero content length.

- [ ] **Step 4: Document the editorial workflow**

Add concise README instructions:

1. create a draft annual report;
2. fill the year, summary, optional indicators, and ordered documents;
3. publish it;
4. edit and publish the single “Страница «О нас»” entry;
5. use `npm run seed:editorial-content` only for initial/missing canonical content;
6. rerunning the seed is safe but never overwrites editorial changes.

- [ ] **Step 5: Re-run backend checks**

```powershell
npm run test:editorial-content
npm run build
git diff --check
```

Commit documentation only if it changed:

```powershell
git add README.md
git commit -m "docs: explain editorial report publishing"
```

## Task 10: Browser verification and visual refinement

**Files:**

- Inspect and, when a verification check fails, modify: `lightyar/components/reports/*.tsx`
- Inspect and, when a verification check fails, modify: `lightyar/components/reports/reports.css`
- Inspect and, when a verification check fails, modify: `lightyar/components/about/about-narrative.tsx`
- Inspect and, when a verification check fails, modify: `lightyar/components/about/about-narrative.css`
- Save evidence: `lightyar/docs/verification/reports-desktop.png`
- Save evidence: `lightyar/docs/verification/reports-mobile.png`
- Save evidence: `lightyar/docs/verification/report-2024-desktop.png`
- Save evidence: `lightyar/docs/verification/about-transparency.png`

- [ ] **Step 1: Load the webapp-testing skill and inspect all three routes**

Use browser automation against `/reports`, `/reports/2024`, and `/about`. Capture console errors and network failures before judging visuals.

- [ ] **Step 2: Verify desktop at 1440px**

Confirm hierarchy, single amber beam, dark-to-paper transition, visible 2024 facts, both document sheets, no table-like grid, no horizontal overflow, and legible focus states. Save screenshots.

- [ ] **Step 3: Verify tablet at 768px and mobile at 390px**

Confirm archive flow becomes non-sticky when needed, year typography does not clip, document actions remain 44px, content order is logical, and the about sticky stage degrades cleanly. Save the required mobile screenshot.

- [ ] **Step 4: Verify interactions and accessibility**

- Tab from the skip link through menu, archive, document open/download actions, neighbors, about transparency link, and FAQ.
- Confirm Enter and Space operate buttons.
- Emulate `prefers-reduced-motion: reduce`; content must be fully visible and beam/path animations must jump to final state.
- Open and download both DOCX files; compare downloaded byte sizes to `23089` and `13033` when no storage-layer transformation is configured.
- Request `/reports/1999`, `/reports/not-a-year`, and an unpublished year; each must show the not-found experience.

- [ ] **Step 5: Perform one deliberate visual simplification pass**

Remove at least one decorative element that does not clarify archive, flow, or document meaning. Keep the single beam as the signature gesture. Re-check screenshots after the removal.

- [ ] **Step 6: Run the complete verification matrix**

Backend:

```powershell
npm run test:editorial-content
npm run build
git status --short
```

Frontend:

```powershell
npm test
npm run lint
npm run build
git diff --check
git status --short
```

Expected: every command exits `0`; only intentional screenshot evidence or final visual refinements remain uncommitted.

- [ ] **Step 7: Commit final visual fixes and evidence**

```powershell
git add app components lib docs/verification
git commit -m "fix: refine responsive reports experience"
```

## Final acceptance checklist

- [ ] Strapi editors can create, edit, order, and publish reports without code changes.
- [ ] Structured money and outcomes are optional, and confirmed zeroes remain visible.
- [ ] The explicit seed command creates one published 2024 report and both verified DOCX files without duplicates on rerun.
- [ ] `/reports` is a modern vertical archive, not a table.
- [ ] `/reports/2024` shows `20 509,71 ₽ → 60,75 ₽ → 20 448,96 ₽` and both original documents.
- [ ] `/about` receives its text, statistics, team, FAQ, and media from Strapi with a reliable local text fallback.
- [ ] The about experience includes a clear transparency chapter linking to reports.
- [ ] Menu, sitemap, metadata, not-found, loading, and API-unavailable states work.
- [ ] Server-rendered HTML contains the meaningful content and text equivalents for visuals.
- [ ] Keyboard, focus-visible, 44px targets, reduced motion, 1440/768/390 layouts, and DOCX downloads are verified.
- [ ] Backend tests/build and frontend tests/lint/build all pass.
