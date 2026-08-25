/**
 * Замер метрик страниц на продакшен-сборке.
 *
 * Гоняет системный Chrome через playwright-core: качать отдельный браузер
 * не нужно. Каждая страница открывается в чистом контексте, чтобы кэш
 * предыдущего прогона не занижал следующий.
 *
 *   node scripts/measure-pages.mjs [--base http://localhost:3100] [--mobile]
 */

import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const BASE = baseIndex !== -1 ? args[baseIndex + 1] : "http://localhost:3100";
const MOBILE = args.includes("--mobile");

const PAGES = [
  ["Главная", "/"],
  ["О фонде", "/about"],
  ["Питомцы", "/pets"],
  ["Карточка питомца", "/pets/n0l50cvtpi7w8dkwnkfmp9uj"],
  ["Сборы", "/campaigns"],
  ["Карточка сбора", "/campaigns/s56ockpbylc39sz9dbjvsoc6"],
  ["Новости", "/news"],
  ["Новость", "/news/vperedi-vykhodnye-priezzhayte-znakomitsya-i-gulyat-s-sobakami-6221"],
  ["Отчётность", "/reports"],
  ["Отчёт за год", "/reports/2024"],
];

const kb = (bytes) => Math.round(bytes / 1024);

async function measure(browser, label, path) {
  const context = await browser.newContext(
    MOBILE
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true }
      : { viewport: { width: 1440, height: 900 } },
  );
  const page = await context.newPage();

  const errors = [];
  page.on("console", (msg) => msg.type() === "error" && errors.push(msg.text().slice(0, 120)));
  page.on("pageerror", (err) => errors.push(`pageerror: ${String(err).slice(0, 120)}`));

  const resources = [];
  page.on("response", async (response) => {
    try {
      const headers = response.headers();
      resources.push({
        type: response.request().resourceType(),
        status: response.status(),
        size: Number(headers["content-length"] || 0),
        url: response.url(),
      });
    } catch {}
  });

  const started = Date.now();
  let status = 0;
  try {
    const response = await page.goto(`${BASE}${path}`, { waitUntil: "load", timeout: 60_000 });
    status = response?.status() ?? 0;
  } catch (error) {
    return { label, path, error: String(error).split("\n")[0].slice(0, 120) };
  }

  // даём отработать ленивым картинкам и наблюдателям вида
  await page.waitForTimeout(2500);

  const vitals = await page.evaluate(() => {
    return new Promise((resolve) => {
      const out = { lcp: 0, cls: 0, longTasks: 0, longTaskMs: 0 };
      try {
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          out.lcp = Math.round(entries[entries.length - 1].startTime);
        }).observe({ type: "largest-contentful-paint", buffered: true });

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) if (!entry.hadRecentInput) out.cls += entry.value;
        }).observe({ type: "layout-shift", buffered: true });

        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            out.longTasks += 1;
            out.longTaskMs += entry.duration;
          }
        }).observe({ type: "longtask", buffered: true });
      } catch {}

      setTimeout(() => {
        const nav = performance.getEntriesByType("navigation")[0] || {};
        const paints = performance.getEntriesByType("paint");
        resolve({
          ...out,
          cls: Number(out.cls.toFixed(4)),
          longTaskMs: Math.round(out.longTaskMs),
          ttfb: Math.round(nav.responseStart || 0),
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd || 0),
          load: Math.round(nav.loadEventEnd || 0),
          fcp: Math.round(paints.find((p) => p.name === "first-contentful-paint")?.startTime || 0),
          domNodes: document.getElementsByTagName("*").length,
          images: document.images.length,
          brokenImages: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
        });
      }, 400);
    });
  });

  // размер по content-length бывает нулевым при сжатии — добираем из Resource Timing
  const transfer = await page.evaluate(() =>
    performance.getEntriesByType("resource").reduce(
      (acc, r) => {
        const size = r.transferSize || 0;
        acc.total += size;
        const kind = r.initiatorType === "img" ? "image" : r.name.endsWith(".js") ? "script" : r.name.endsWith(".css") ? "style" : "other";
        acc[kind] = (acc[kind] || 0) + size;
        acc.count += 1;
        return acc;
      },
      { total: 0, count: 0 },
    ),
  );

  await context.close();

  return {
    label,
    path,
    status,
    wall: Date.now() - started,
    ...vitals,
    requests: transfer.count,
    weightKb: kb(transfer.total),
    scriptKb: kb(transfer.script || 0),
    imageKb: kb(transfer.image || 0),
    styleKb: kb(transfer.style || 0),
    errors: errors.slice(0, 3),
    errorCount: errors.length,
    failed: resources.filter((r) => r.status >= 400).length,
  };
}

const browser = await chromium.launch({ channel: "chrome" });
const results = [];
for (const [label, path] of PAGES) {
  const row = await measure(browser, label, path);
  results.push(row);
  process.stdout.write(`${row.error ? "✗" : "✓"} ${label}\n`);
}
await browser.close();

console.log(`\n=== ${MOBILE ? "МОБИЛЬНЫЙ 390×844" : "ДЕСКТОП 1440×900"} ===`);
console.log(JSON.stringify(results, null, 1));
