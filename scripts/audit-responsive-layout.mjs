/**
 * Browser-level responsive smoke test.
 *
 * Usage:
 *   node scripts/audit-responsive-layout.mjs [--base http://localhost:3100] [--screenshots]
 */

import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const baseIndex = args.indexOf("--base");
const base = baseIndex >= 0 ? args[baseIndex + 1] : "http://localhost:3100";
const saveScreenshots = args.includes("--screenshots");
const screenshotRoot = path.join("docs", "verification", "responsive-audit");

const summarizeBrowserError = (message) => {
  if (message.startsWith("A tree hydrated")) return "React hydration mismatch";
  if (message.includes("Failed to load resource")) return message.split("\n")[0].slice(0, 180);
  return message.split("\n")[0].slice(0, 180);
};

const routes = ["/", "/about", "/pets", "/campaigns", "/news", "/reports", "/reports/2024"];
const viewports = [
  { width: 320, height: 720 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 900 },
  { width: 1920, height: 1080 },
];

if (saveScreenshots) await mkdir(screenshotRoot, { recursive: true });

const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = [];

const context = await browser.newContext({
  viewport: viewports[0],
  locale: "ru-RU",
  reducedMotion: "reduce",
});

for (const route of routes) {
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") consoleErrors.push(message.text());
  });
  page.on("pageerror", (error) => pageErrors.push(String(error)));

  let status = 0;
  try {
    const response = await page.goto(`${base}${route}`, { waitUntil: "load", timeout: 60_000 });
    status = response?.status() ?? 0;
    await page.waitForLoadState("networkidle", { timeout: 2_500 }).catch(() => {});
    await page.waitForTimeout(350);
  } catch (error) {
    results.push({ route, width: viewports[0].width, navigationError: String(error).split("\n")[0] });
    await page.close();
    continue;
  }

  for (const viewport of viewports) {
    await page.setViewportSize(viewport);
    await page.waitForTimeout(200);

    const layout = await page.evaluate(() => {
      const header = document.querySelector("header");
      const headerBox = header?.getBoundingClientRect();
      const brandLogo = document.querySelector("[data-brand-logo]");
      const logoBox = brandLogo?.getBoundingClientRect();

      return {
        title: document.title,
        overflow: Math.max(0, document.documentElement.scrollWidth - window.innerWidth),
        brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).length,
        h1Count: document.querySelectorAll("h1").length,
        mainCount: document.querySelectorAll("main").length,
        logoCount: document.querySelectorAll("[data-brand-logo]").length,
        overflowSources: [...document.querySelectorAll("body *")]
          .map((element) => {
            const box = element.getBoundingClientRect();
            return {
              element: `${element.tagName.toLowerCase()}${element.id ? `#${element.id}` : ""}${
                typeof element.className === "string" && element.className
                  ? `.${element.className.trim().split(/\s+/).slice(0, 2).join(".")}`
                  : ""
              }`,
              left: Math.round(box.left),
              right: Math.round(box.right),
              width: Math.round(box.width),
              overshoot: Math.round(Math.max(0, box.right - window.innerWidth, -box.left)),
            };
          })
          .filter((item) => item.overshoot > 1)
          .sort((a, b) => b.overshoot - a.overshoot)
          .slice(0, 3),
        header: headerBox
          ? { left: Math.round(headerBox.left), right: Math.round(headerBox.right), width: Math.round(headerBox.width) }
          : null,
        logo: logoBox
          ? { width: Math.round(logoBox.width), height: Math.round(logoBox.height), top: Math.round(logoBox.top) }
          : null,
      };
    });

    if (saveScreenshots && [320, 768, 1440, 1920].includes(viewport.width) && ["/", "/about"].includes(route)) {
      const routeName = route === "/" ? "home" : route.slice(1).replaceAll("/", "-");
      await page.screenshot({
        path: path.join(screenshotRoot, `${routeName}-${viewport.width}.png`),
        fullPage: false,
      });
    }

    results.push({
      route,
      width: viewport.width,
      status,
      ...layout,
      consoleErrorCount: consoleErrors.length,
      consoleErrors: [...new Set(consoleErrors.map(summarizeBrowserError))].slice(0, 3),
      pageErrorCount: pageErrors.length,
      pageErrors: [...new Set(pageErrors.map(summarizeBrowserError))].slice(0, 3),
    });
    process.stderr.write(`checked ${route} at ${viewport.width}px\n`);
  }

  await page.close();
}

await context.close();
await browser.close();

console.log(JSON.stringify(results, null, 2));

const failures = results.filter(
  (result) =>
    result.navigationError ||
    result.status >= 400 ||
    result.overflow > 1 ||
    result.brokenImages > 0 ||
    result.h1Count !== 1 ||
    result.mainCount !== 1 ||
    result.logoCount < 1 ||
    result.consoleErrorCount > 0 ||
    result.pageErrorCount > 0,
);

if (failures.length > 0) {
  console.error(`Responsive audit found ${failures.length} failing viewport-route combinations.`);
  process.exitCode = 1;
}
