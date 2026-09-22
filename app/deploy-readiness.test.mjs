import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (path) => readFile(new URL(path, import.meta.url), "utf8");

test("CI compiles and type-checks without CMS access; VPS performs the full build", async () => {
  const workflow = await read("../.github/workflows/deploy.yml");

  assert.match(workflow, /cache-dependency-path:\s*package-lock\.json/);
  assert.doesNotMatch(workflow, /working-directory:\s*lightyar/);
  assert.match(workflow, /npx next typegen/);
  assert.match(workflow, /npx tsc --noEmit/);
  assert.match(workflow, /run:\s*npm run build -- --experimental-build-mode compile/);
  const deploy = await read("../scripts/deploy.sh");
  assert.match(deploy, /^npm run build$/m);
  assert.ok(deploy.indexOf("npm run build") < deploy.lastIndexOf('start_release "$release"'));
});

test("all application responses include the baseline security headers", async () => {
  const config = await read("../next.config.ts");

  for (const header of [
    "Content-Security-Policy",
    "Permissions-Policy",
    "Referrer-Policy",
    "X-Content-Type-Options",
    "X-Frame-Options",
  ]) {
    assert.match(config, new RegExp(header));
  }
  assert.match(config, /source:\s*["']\/:path\*["']/);
});

test("development CSP permits the webpack evaluator without weakening production", async () => {
  const config = await read("../next.config.ts");

  assert.match(
    config,
    /developmentScriptPolicy[\s\S]*?NODE_ENV\s*===\s*["']development["'][\s\S]*?unsafe-eval/,
  );
  assert.match(config, /script-src[^\n]+\$\{developmentScriptPolicy\}/);
  assert.doesNotMatch(config, /["']script-src 'self' 'unsafe-inline' 'unsafe-eval'["']/);
});

test("gift order dialog renders in the document top layer and links its consent policy", async () => {
  const modal = await read("../components/wishlist/gift-order-modal.tsx");
  const css = await read("../components/sections/needs-section.css");

  assert.match(modal, /createPortal/);
  assert.match(modal, /href=["']\/privacy["']/);
  assert.match(css, /\.gift-shell--drawer[\s\S]*?inline-size:\s*100%/);
  assert.match(css, /max-inline-size:\s*100%/);
});

test("footer exposes only real downloadable documents", async () => {
  const footer = await read("../components/sections/footer.tsx");

  assert.doesNotMatch(footer, /href=["']#["']/);
  assert.match(footer, /\/documents\/charity-2024\.docx/);
  assert.match(footer, /\/documents\/minjust-2024\.docx/);
});

test("remote gallery images fail gracefully and thumbnail rail cannot widen the page", async () => {
  const gallery = await read("../components/campaigns/campaign-gallery.tsx");
  const resilientImage = await read("../components/ui/resilient-image.tsx");

  assert.match(gallery, /ResilientImage/);
  assert.doesNotMatch(gallery, /\bpriority=/);
  assert.match(gallery, /fetchPriority=/);
  assert.match(gallery, /!overflow-hidden/);
  assert.match(resilientImage, /onError/);
});

test("pet cards keep the detail link separate from their buttons", async () => {
  const card = await read("../components/pets/pet-card.tsx");

  assert.match(card, /<h2[^>]*><Link href=\{`\/pets\/\$\{pet\.slug \|\| pet\.id\}`\}/);
  assert.match(card, /aria-pressed=\{favorite\}/);
  assert.doesNotMatch(card, /<Link[\s\S]{0,500}<article/);
});

test("pets page paginates in Strapi and loads the quiz only on request", async () => {
  const page = await read("./pets/page.tsx");
  const service = await read("../lib/api/services/pets.ts");

  assert.match(page, /getPetsCollection/);
  const launcher = await read("../components/pets/pets-quiz-launcher.tsx");
  const quizRoute = await read("./api/pets/quiz/route.ts");
  assert.doesNotMatch(page, /getQuizPets|allPets=/);
  assert.match(quizRoute, /getQuizPets/);
  assert.match(launcher, /dynamic\(/);
  assert.match(launcher, /fetch\('\/api\/pets\/quiz'/);
  assert.doesNotMatch(page, /limit:\s*150/);
  assert.match(service, /fields\[0\]=name/);
  assert.match(service, /populate\[photos\]\[fields\]/);
});

test("gift writes require a dedicated Strapi token", async () => {
  const client = await read("../lib/api/client.ts");
  const route = await read("./api/gift-orders/route.ts");
  const env = await read("../.env.example");

  assert.match(client, /STRAPI_READ_TOKEN/);
  assert.match(route, /STRAPI_GIFT_WRITE_TOKEN/);
  assert.match(env, /STRAPI_READ_TOKEN/);
  assert.match(env, /STRAPI_GIFT_WRITE_TOKEN/);
});

test("safe Strapi reads retry transient build-time failures without retrying writes", async () => {
  const client = await read("../lib/api/client.ts");

  assert.match(client, /GET_RETRY_DELAYS_MS/);
  assert.match(client, /method === "GET"/);
  assert.match(client, /RETRYABLE_STATUS_CODES/);
  assert.match(client, /await new Promise/);
});

test("the home page has a semantic main landmark and Next images avoid deprecated priority", async () => {
  const home = await read("../components/home/color-transition-wrapper.tsx");
  const petCard = await read("../components/pets/pet-card.tsx");
  const newsCard = await read("../components/news/news-card.tsx");
  const newsSlider = await read("../components/news/news-slider.tsx");

  assert.match(home, /<motion\.main/);
  assert.match(home, /overflow-x-clip/);
  for (const source of [petCard, newsCard, newsSlider]) {
    assert.doesNotMatch(source, /\bpriority=/);
  }
});

test("page metadata relies on the root title template without repeating the brand", async () => {
  const campaigns = await read("./campaigns/page.tsx");
  const pet = await read("./pets/[id]/page.tsx");
  const campaign = await read("./campaigns/[id]/page.tsx");
  const news = await read("./news/[slug]/page.tsx");
  const about = await read("./about/page.tsx");
  const newsIndex = await read("./news/page.tsx");
  const reports = await read("./reports/page.tsx");

  for (const source of [campaigns, pet, campaign, news]) {
    assert.doesNotMatch(source, /title:\s*[`"'][^\n]*\|\s*Светлый/);
  }
  // The profile owns a full status-specific title; absolute prevents a duplicate root brand.
  assert.match(pet, /title:\s*\{\s*absolute:\s*title\s*\}/);
  assert.match(about, /export const metadata[\s\S]*?title:\s*"О нас"/);
  assert.match(newsIndex, /export async function generateMetadata/);
  assert.match(newsIndex, /Новости и истории спасения/);
  assert.match(newsIndex, /alternates:\s*\{\s*canonical\s*\}/);
  assert.match(reports, /export const metadata[\s\S]*?title:\s*"Отчётность"/);
});

test("known narrow-screen grids and controls can shrink to the viewport", async () => {
  const reports = await read("../components/reports/reports.css");
  const campaigns = await read("../components/campaigns/campaigns.css");
  const about = await read("../components/about/about-narrative.css");

  assert.match(reports, /minmax\(min\(100%,\s*290px\),\s*1fr\)/);
  // Сетка считает колонку от ширины экрана: на 320 она схлопывается в одну,
  // а не выпирает наружу.
  assert.match(campaigns, /minmax\(min\(100%,\s*[\d.]+rem\),\s*1fr\)/);
  // Фильтр и сортировка переносятся, и вкладки внутри фильтра тоже:
  // раньше это держали служебные классы прямо в разметке.
  assert.match(campaigns, /\.camp-controls \{[^}]*flex-wrap:\s*wrap/);
  assert.match(campaigns, /\.camp-tabs \{[^}]*flex-wrap:\s*wrap/);
  // Коллаж режется только по горизонтали. По вертикали поле нарочно открыто:
  // главная вырезка выходит за нижнюю кромку и ложится на следующее поле.
  // hidden по одной оси заставил бы вторую стать auto и срезал бы её.
  assert.match(campaigns, /\.camp-cover \{[\s\S]*?overflow-x:\s*clip/);
  assert.match(campaigns, /\.camp-route \{[\s\S]*?overflow-x:\s*clip/);
  // Поля секций разного цвета: в грамматике референсов цвет меняется от
  // секции к секции, и это не украшение.
  assert.match(campaigns, /\.camp-cover \{[\s\S]*?background:\s*#ece3d2/);
  assert.match(campaigns, /\.camp-route \{[\s\S]*?background:\s*#f3e6cd/);
  assert.match(about, /hyphens:\s*auto/);
  assert.doesNotMatch(about, /\.about-chapter-nav/);
});
